"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCandidateSkills = getCandidateSkills;
exports.saveCandidateSkills = saveCandidateSkills;
const mysql_1 = require("../db/mysql");
async function getCandidateSkills(candidateId) {
    try {
        const [rows] = await mysql_1.mysqlPool.execute('SELECT skill_name FROM candidate_skills WHERE candidate_id = ? ORDER BY created_at ASC', [candidateId]);
        return rows.map(skill => ({
            skill_name: skill.skill_name
        }));
    }
    catch (error) {
        console.error('Error fetching skills:', error);
        return [];
    }
}
async function saveCandidateSkills(candidateId, skills) {
    try {
        // Delete existing records
        await mysql_1.mysqlPool.execute('DELETE FROM candidate_skills WHERE candidate_id = ?', [candidateId]);
        // Insert new records
        const insertSql = `
      INSERT INTO candidate_skills
      (candidate_id, skill_name)
      VALUES (?, ?)
    `;
        for (const skill of skills) {
            await mysql_1.mysqlPool.execute(insertSql, [
                candidateId,
                skill.skill_name
            ]);
        }
    }
    catch (error) {
        console.error('Error saving skills:', error);
        throw error;
    }
}
