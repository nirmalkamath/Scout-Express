"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.candidateManagementService = exports.CandidateManagementService = void 0;
const mysql_1 = require("../db/mysql");
class CandidateManagementService {
    // Get candidates with pagination and filtering
    async getCandidates(page = 1, limit = 10, search = '') {
        try {
            const offset = (page - 1) * limit;
            // Build WHERE clause
            let whereClause = 'WHERE 1=1';
            const params = [];
            if (search) {
                whereClause += ' AND (c.full_name LIKE ? OR c.email LIKE ? OR c.professional_headline LIKE ?)';
                params.push(`%${search}%`, `%${search}%`, `%${search}%`);
            }
            // Get total count
            const countQuery = `
        SELECT COUNT(*) as total 
        FROM candidates c 
        ${whereClause}
      `;
            const [countResult] = await mysql_1.mysqlPool.execute(countQuery, params);
            const total = countResult[0].total;
            // Get candidates
            const query = `
        SELECT 
          c.id, c.full_name, c.email, c.phone_number, c.professional_headline, 
          c.city, c.state, c.district, c.country, c.pin_code, c.photo, c.created_at, c.is_disabled,
          COUNT(DISTINCT e.id) as education_count,
          COUNT(DISTINCT we.id) as work_experience_count,
          COUNT(DISTINCT s.id) as skills_count
        FROM candidates c
        LEFT JOIN candidate_education e ON c.id = e.candidate_id
        LEFT JOIN candidate_experience we ON c.id = we.candidate_id
        LEFT JOIN candidate_skills s ON c.id = s.candidate_id
        ${whereClause}
        GROUP BY c.id
        ORDER BY c.id DESC
        LIMIT ? OFFSET ?
      `;
            const [candidates] = await mysql_1.mysqlPool.execute(query, [...params, limit, offset]);
            return {
                candidates: candidates,
                pagination: {
                    current: page,
                    total: Math.ceil(total / limit),
                    limit,
                    totalItems: total
                }
            };
        }
        catch (error) {
            console.error('Error fetching candidates:', error);
            throw error;
        }
    }
    // Get candidate by ID with all related data
    async getCandidateById(id) {
        try {
            // Get basic candidate info
            const candidateQuery = `
        SELECT * FROM candidates WHERE id = ?
      `;
            const [candidateResult] = await mysql_1.mysqlPool.execute(candidateQuery, [id]);
            const candidate = candidateResult[0];
            if (!candidate) {
                return null;
            }
            // Get education
            const educationQuery = `
        SELECT * FROM candidate_education WHERE candidate_id = ? ORDER BY graduation_year ASC
      `;
            const [educationResult] = await mysql_1.mysqlPool.execute(educationQuery, [id]);
            candidate.education = educationResult;
            // Get work experience
            const workExperienceQuery = `
        SELECT 
          id,
          job_title as position,
          company_name as company,
          job_start_date as start_date,
          job_end_date as end_date,
          currently_work as currently_working,
          job_description as description
        FROM candidate_experience 
        WHERE candidate_id = ? 
        ORDER BY id ASC
      `;
            const [workExperienceResult] = await mysql_1.mysqlPool.execute(workExperienceQuery, [id]);
            candidate.work_experience = workExperienceResult;
            // Get skills
            const skillsQuery = `
        SELECT * FROM candidate_skills WHERE candidate_id = ? ORDER BY id ASC
      `;
            const [skillsResult] = await mysql_1.mysqlPool.execute(skillsQuery, [id]);
            candidate.skills = skillsResult;
            // Get preferences
            const preferencesQuery = `
        SELECT * FROM candidate_preferences WHERE candidate_id = ?
      `;
            const [preferencesResult] = await mysql_1.mysqlPool.execute(preferencesQuery, [id]);
            candidate.job_preferences = preferencesResult[0] || null;
            return candidate;
        }
        catch (error) {
            console.error('Error fetching candidate by ID:', error);
            throw error;
        }
    }
    // Get total candidates count
    async getTotalCandidates() {
        try {
            const [rows] = await mysql_1.mysqlPool.execute('SELECT COUNT(*) as total FROM candidates');
            return rows[0].total;
        }
        catch (error) {
            console.error('Error fetching total candidates:', error);
            throw error;
        }
    }
    // Update candidate
    async updateCandidate(id, data) {
        try {
            const connection = await mysql_1.mysqlPool.getConnection();
            await connection.beginTransaction();
            try {
                // Update basic candidate info
                const updateFields = [];
                const updateValues = [];
                // Basic info
                if (data.full_name) {
                    updateFields.push('full_name = ?');
                    updateValues.push(data.full_name);
                }
                if (data.email) {
                    updateFields.push('email = ?');
                    updateValues.push(data.email);
                }
                if (data.phone_number) {
                    updateFields.push('phone_number = ?');
                    updateValues.push(data.phone_number);
                }
                if (data.professional_headline) {
                    updateFields.push('professional_headline = ?');
                    updateValues.push(data.professional_headline);
                }
                if (data.professional_summary) {
                    updateFields.push('professional_summary = ?');
                    updateValues.push(data.professional_summary);
                }
                // Location info
                if (data.city) {
                    updateFields.push('city = ?');
                    updateValues.push(data.city);
                }
                if (data.district) {
                    updateFields.push('district = ?');
                    updateValues.push(data.district);
                }
                if (data.state) {
                    updateFields.push('state = ?');
                    updateValues.push(data.state);
                }
                if (data.country) {
                    updateFields.push('country = ?');
                    updateValues.push(data.country);
                }
                if (data.pin_code) {
                    updateFields.push('pin_code = ?');
                    updateValues.push(data.pin_code);
                }
                updateValues.push(id);
                if (updateFields.length > 0) { // If there are fields to update
                    const updateQuery = `
            UPDATE candidates 
            SET ${updateFields.join(', ')}
            WHERE id = ?
          `;
                    await connection.execute(updateQuery, updateValues);
                }
                // Update work experience
                if (data.experience && Array.isArray(data.experience)) {
                    // Delete existing work experience
                    await connection.execute('DELETE FROM candidate_experience WHERE candidate_id = ?', [id]);
                    // Insert new work experience
                    for (const we of data.experience) {
                        if (we.company_name && we.job_title) {
                            const weQuery = `
                INSERT INTO candidate_experience 
                (candidate_id, company_name, job_title, job_start_date, job_end_date, currently_work, job_description)
                VALUES (?, ?, ?, ?, ?, ?, ?)
              `;
                            const currently = Boolean(we.currently_work);
                            const endDate = currently ? null : (we.job_end_date || null);
                            await connection.execute(weQuery, [
                                id,
                                we.company_name,
                                we.job_title,
                                we.job_start_date || null,
                                endDate,
                                currently ? 1 : 0,
                                we.job_description || ''
                            ]);
                        }
                    }
                }
                // Update education
                if (data.education && Array.isArray(data.education)) {
                    // Delete existing education
                    await connection.execute('DELETE FROM candidate_education WHERE candidate_id = ?', [id]);
                    // Insert new education
                    for (const edu of data.education) {
                        if (edu.institution_name && edu.degree) {
                            const eduQuery = `
                INSERT INTO candidate_education 
                (candidate_id, institution, degree, graduation_year, grade)
                VALUES (?, ?, ?, ?, ?)
              `;
                            await connection.execute(eduQuery, [
                                id,
                                edu.institution_name,
                                edu.degree,
                                edu.graduation_year || null,
                                edu.grade || null
                            ]);
                        }
                    }
                }
                // Update skills
                if (data.skills && Array.isArray(data.skills)) {
                    // Delete existing skills
                    await connection.execute('DELETE FROM candidate_skills WHERE candidate_id = ?', [id]);
                    // Insert new skills
                    for (const skill of data.skills) {
                        if (skill.skill_name) {
                            const skillQuery = `
                INSERT INTO candidate_skills 
                (candidate_id, skill_name)
                VALUES (?, ?)
              `;
                            await connection.execute(skillQuery, [
                                id,
                                skill.skill_name
                            ]);
                        }
                    }
                }
                // Update job preferences
                if (data.preferences) {
                    const jp = data.preferences;
                    // Check if job preferences exist
                    const [jpCheck] = await connection.execute('SELECT id FROM candidate_preferences WHERE candidate_id = ?', [id]);
                    if (jpCheck.length > 0) {
                        // Update existing
                        const jpUpdateQuery = `
              UPDATE candidate_preferences 
              SET 
                expected_salary = ?, availability = ?
              WHERE candidate_id = ?
            `;
                        await connection.execute(jpUpdateQuery, [
                            jp.expected_salary || null,
                            jp.availability || null,
                            id
                        ]);
                    }
                    else {
                        // Insert new
                        const jpInsertQuery = `
              INSERT INTO candidate_preferences 
              (candidate_id, expected_salary, availability)
              VALUES (?, ?, ?)
            `;
                        await connection.execute(jpInsertQuery, [
                            id,
                            jp.expected_salary || null,
                            jp.availability || null
                        ]);
                    }
                }
                await connection.commit();
                return { success: true };
            }
            catch (error) {
                await connection.rollback();
                throw error;
            }
            finally {
                connection.release();
            }
        }
        catch (error) {
            console.error('Error updating candidate:', error);
            return { success: false, message: 'Failed to update candidate' };
        }
    }
    // Delete candidate
    async deleteCandidate(id) {
        try {
            const connection = await mysql_1.mysqlPool.getConnection();
            await connection.beginTransaction();
            try {
                // Delete related records first (they have ON DELETE CASCADE but being explicit)
                await connection.execute('DELETE FROM candidate_preferences WHERE candidate_id = ?', [id]);
                await connection.execute('DELETE FROM candidate_skills WHERE candidate_id = ?', [id]);
                await connection.execute('DELETE FROM candidate_experience WHERE candidate_id = ?', [id]);
                await connection.execute('DELETE FROM candidate_education WHERE candidate_id = ?', [id]);
                // Delete candidate
                await connection.execute('DELETE FROM candidates WHERE id = ?', [id]);
                await connection.commit();
                return { success: true };
            }
            catch (error) {
                await connection.rollback();
                throw error;
            }
            finally {
                connection.release();
            }
        }
        catch (error) {
            console.error('Error deleting candidate:', error);
            return { success: false, message: 'Failed to delete candidate' };
        }
    }
    // Export candidates to CSV
    async exportToCSV(search = '') {
        try {
            // Build WHERE clause
            let whereClause = 'WHERE 1=1';
            const params = [];
            if (search) {
                whereClause += ' AND (c.full_name LIKE ? OR c.email LIKE ? OR c.professional_headline LIKE ?)';
                params.push(`%${search}%`, `%${search}%`, `%${search}%`);
            }
            const query = `
        SELECT 
          c.id, c.full_name, c.email, c.phone_number,
          c.professional_headline, c.professional_summary,
          c.city, c.state, c.district, c.country, c.pin_code, c.created_at
        FROM candidates c
        ${whereClause}
        ORDER BY c.id DESC
      `;
            const [candidates] = await mysql_1.mysqlPool.execute(query, params);
            // Convert to CSV
            const csvHeaders = [
                'ID', 'Full Name', 'Email', 'Phone',
                'Professional Headline', 'Professional Summary',
                'City', 'State', 'District', 'Country', 'Pin Code',
                'Created At'
            ];
            const csvRows = candidates.map(candidate => [
                candidate.id,
                candidate.full_name,
                candidate.email,
                candidate.phone_number,
                candidate.professional_headline,
                candidate.professional_summary,
                candidate.city,
                candidate.state,
                candidate.district,
                candidate.country,
                candidate.pin_code,
                candidate.created_at
            ]);
            // Escape CSV values
            const escapeCsv = (value) => {
                if (value === null || value === undefined)
                    return '';
                const str = String(value);
                if (str.includes(',') || str.includes('"') || str.includes('\n')) {
                    return `"${str.replace(/"/g, '""')}"`;
                }
                return str;
            };
            return [
                csvHeaders.map(escapeCsv).join(','),
                ...csvRows.map(row => row.map(escapeCsv).join(','))
            ].join('\n');
        }
        catch (error) {
            console.error('Error exporting to CSV:', error);
            throw error;
        }
    }
}
exports.CandidateManagementService = CandidateManagementService;
// Export a singleton instance
exports.candidateManagementService = new CandidateManagementService();
