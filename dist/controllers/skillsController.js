"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.renderSkills = renderSkills;
exports.handleSkills = handleSkills;
const zod_1 = require("zod");
const skillsService_1 = require("../services/skillsService");
const skillsSchema = zod_1.z.object({
    skills: zod_1.z.array(zod_1.z.object({
        skill_name: zod_1.z.string().min(1, 'Skill name is required')
    })).min(1, 'At least one skill is required')
});
async function renderSkills(req, res) {
    const candidateId = req.session.candidateId;
    const existingSkills = candidateId ? await (0, skillsService_1.getCandidateSkills)(candidateId) : [];
    res.render('skills', {
        existingSkills,
        error: null
    });
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
        // Save skills using service
        await (0, skillsService_1.saveCandidateSkills)(candidateId, validationResult.data.skills);
        // Redirect to next step: job preferences
        res.redirect('/job-preferences');
    }
    catch (error) {
        console.error('Skills processing failed:', error);
        res.status(500).render('skills', { error: 'Failed to save skills. Please try again.' });
    }
}
