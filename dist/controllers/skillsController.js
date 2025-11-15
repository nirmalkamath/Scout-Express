"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.renderSkills = renderSkills;
exports.handleSkills = handleSkills;
const zod_1 = require("zod");
const mysql_1 = require("../db/mysql");
const skillsSchema = zod_1.z.object({
    skills: zod_1.z.array(zod_1.z.object({
        skill_name: zod_1.z.string().min(1, 'Skill name is required')
    })).min(1, 'At least one skill is required')
});
async function renderSkills(req, res) {
    let existingSkills = [];
    const candidateId = req.session.candidateId;
    if (candidateId) {
        try {
            const [rows] = await mysql_1.mysqlPool.execute('SELECT skill_name FROM candidate_skills WHERE candidate_id = ? ORDER BY created_at ASC', [candidateId]);
            existingSkills = rows.map(skill => ({
                skill_name: skill.skill_name
            }));
        }
        catch (error) {
            console.error('Error fetching skills:', error);
        }
    }
    res.render('skills', { existingSkills });
}
async function handleSkills(req, res) {
    try {
        // Validate skills data
        const validationResult = skillsSchema.safeParse(req.body);
        if (!validationResult.success) {
            const errorMsg = validationResult.error.issues.map((issue) => issue.message).join('<br>');
            res.status(400).render('skills', { error: errorMsg });
            return;
        }
        const candidateId = req.session.candidateId;
        if (!candidateId) {
            res.status(400).render('skills', { error: 'Session expired. Please start registration again.' });
            return;
        }
        // Delete existing skills and insert new ones
        await mysql_1.mysqlPool.execute('DELETE FROM candidate_skills WHERE candidate_id = ?', [candidateId]);
        const insertSql = `
      INSERT INTO candidate_skills
      (candidate_id, skill_name)
      VALUES (?, ?)
    `;
        for (const skill of validationResult.data.skills) {
            await mysql_1.mysqlPool.execute(insertSql, [
                candidateId,
                skill.skill_name
            ]);
        }
        // Redirect to next step: job preferences
        res.redirect('/job-preferences');
    }
    catch (error) {
        console.error('Skills processing failed:', error);
        res.status(500).render('skills', {
            error: 'Something went wrong while processing your skills. Please try again later.'
        });
    }
}
