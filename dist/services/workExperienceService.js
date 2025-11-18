"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCandidateWorkExperience = getCandidateWorkExperience;
exports.saveCandidateWorkExperience = saveCandidateWorkExperience;
const mysql_1 = require("../db/mysql");
async function getCandidateWorkExperience(candidateId) {
    try {
        const [rows] = await mysql_1.mysqlPool.execute('SELECT job_title, company_name, job_start_date, job_end_date, job_description, currently_work FROM candidate_experience WHERE candidate_id = ? ORDER BY id ASC', [candidateId]);
        return rows.map(exp => ({
            position: exp.job_title,
            company: exp.company_name,
            start_date: exp.job_start_date ? new Date(exp.job_start_date).toISOString().split('T')[0] : '',
            end_date: exp.job_end_date ? new Date(exp.job_end_date).toISOString().split('T')[0] : '',
            description: exp.job_description,
            currently_working: exp.currently_work ? 'on' : undefined
        }));
    }
    catch (error) {
        console.error('Error fetching work experience:', error);
        return [];
    }
}
async function saveCandidateWorkExperience(candidateId, workExperience) {
    try {
        // Delete existing records
        await mysql_1.mysqlPool.execute('DELETE FROM candidate_experience WHERE candidate_id = ?', [candidateId]);
        // Insert new records
        const insertSql = `
      INSERT INTO candidate_experience
      (candidate_id, job_title, company_name, job_start_date, job_end_date, job_description, currently_work)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `;
        for (const exp of workExperience) {
            const endDate = exp.currently_working === 'on' ? null : (exp.end_date || null);
            const currentlyWork = exp.currently_working ? (exp.currently_working === 'on' ? 1 : 0) : 0;
            await mysql_1.mysqlPool.execute(insertSql, [
                candidateId,
                exp.position,
                exp.company,
                exp.start_date,
                endDate,
                exp.description,
                currentlyWork
            ]);
        }
    }
    catch (error) {
        console.error('Error saving work experience:', error);
        throw error;
    }
}
