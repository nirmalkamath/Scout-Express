"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCandidateJobPreferences = getCandidateJobPreferences;
exports.saveCandidateJobPreferences = saveCandidateJobPreferences;
const mysql_1 = require("../db/mysql");
async function getCandidateJobPreferences(candidateId) {
    try {
        const [rows] = await mysql_1.mysqlPool.execute('SELECT expected_salary, availability FROM candidate_preferences WHERE candidate_id = ?', [candidateId]);
        if (rows.length > 0) {
            return rows[0];
        }
        return null;
    }
    catch (error) {
        console.error('Error fetching job preferences:', error);
        return null;
    }
}
async function saveCandidateJobPreferences(candidateId, preferences) {
    try {
        const insertSql = `
      INSERT INTO candidate_preferences
      (candidate_id, expected_salary, availability)
      VALUES (?, ?, ?)
    `;
        await mysql_1.mysqlPool.execute(insertSql, [
            candidateId,
            preferences.expected_salary,
            preferences.availability
        ]);
    }
    catch (error) {
        console.error('Error saving job preferences:', error);
        throw error;
    }
}
