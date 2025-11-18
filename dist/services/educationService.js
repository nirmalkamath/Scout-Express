"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCandidateEducation = getCandidateEducation;
exports.saveCandidateEducation = saveCandidateEducation;
const mysql_1 = require("../db/mysql");
async function getCandidateEducation(candidateId) {
    try {
        const [rows] = await mysql_1.mysqlPool.execute('SELECT degree, institution, graduation_year, grade FROM candidate_education WHERE candidate_id = ? ORDER BY graduation_year ASC', [candidateId]);
        return rows.map(edu => ({
            degree: edu.degree,
            institution: edu.institution,
            graduation_year: edu.graduation_year,
            grade: edu.grade
        }));
    }
    catch (error) {
        console.error('Error fetching education:', error);
        return [];
    }
}
async function saveCandidateEducation(candidateId, education) {
    try {
        // Delete existing records
        await mysql_1.mysqlPool.execute('DELETE FROM candidate_education WHERE candidate_id = ?', [candidateId]);
        // Insert new records
        const insertSql = `
      INSERT INTO candidate_education
      (candidate_id, degree, institution, graduation_year, grade)
      VALUES (?, ?, ?, ?, ?)
    `;
        for (const edu of education) {
            await mysql_1.mysqlPool.execute(insertSql, [
                candidateId,
                edu.degree,
                edu.institution,
                edu.graduation_year,
                edu.grade
            ]);
        }
    }
    catch (error) {
        console.error('Error saving education:', error);
        throw error;
    }
}
