"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.renderEducation = renderEducation;
exports.handleEducation = handleEducation;
const zod_1 = require("zod");
const mysql_1 = require("../db/mysql");
const educationSchema = zod_1.z.object({
    education: zod_1.z.array(zod_1.z.object({
        degree: zod_1.z.string().min(1, 'Degree is required'),
        institution: zod_1.z.string().min(1, 'Institution is required'),
        graduation_year: zod_1.z.string().min(1, 'Graduation year is required'),
        grade: zod_1.z.string().min(1, 'Grade is required')
    })).min(1, 'At least one education entry is required')
});
async function renderEducation(req, res) {
    let existingEducation = [];
    const candidateId = req.session.candidateId;
    if (candidateId) {
        try {
            const [rows] = await mysql_1.mysqlPool.execute('SELECT degree, institution, graduation_year, grade FROM candidate_education WHERE candidate_id = ? ORDER BY graduation_year DESC', [candidateId]);
            existingEducation = rows.map(edu => ({
                degree: edu.degree,
                institution: edu.institution,
                graduation_year: edu.graduation_year,
                grade: edu.grade
            }));
        }
        catch (error) {
            console.error('Error fetching education:', error);
        }
    }
    res.render('education', { existingEducation });
}
async function handleEducation(req, res) {
    try {
        // Validate education data
        const validationResult = educationSchema.safeParse(req.body);
        if (!validationResult.success) {
            const errorMsg = validationResult.error.issues.map((issue) => issue.message).join('<br>');
            res.status(400).render('education', { error: errorMsg });
            return;
        }
        const candidateId = req.session.candidateId;
        if (!candidateId) {
            res.status(400).render('education', { error: 'Session expired. Please start registration again.' });
            return;
        }
        // Delete existing education and insert new ones
        await mysql_1.mysqlPool.execute('DELETE FROM candidate_education WHERE candidate_id = ?', [candidateId]);
        const insertSql = `
      INSERT INTO candidate_education
      (candidate_id, degree, institution, graduation_year, grade)
      VALUES (?, ?, ?, ?, ?)
    `;
        for (const edu of validationResult.data.education) {
            await mysql_1.mysqlPool.execute(insertSql, [
                candidateId,
                edu.degree,
                edu.institution,
                edu.graduation_year,
                edu.grade
            ]);
        }
        // Redirect to next step: skills
        res.redirect('/skills');
    }
    catch (error) {
        console.error('Education processing failed:', error);
        res.status(500).render('education', {
            error: 'Something went wrong while processing your education details. Please try again later.'
        });
    }
}
