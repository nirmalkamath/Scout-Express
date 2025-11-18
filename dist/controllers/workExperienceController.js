"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.renderWorkExperience = renderWorkExperience;
exports.handleWorkExperience = handleWorkExperience;
const zod_1 = require("zod");
const workExperienceService_1 = require("../services/workExperienceService");
const workExperienceSchema = zod_1.z.object({
    work_experience: zod_1.z.array(zod_1.z.object({
        company: zod_1.z.string().min(1, 'Company name is required'),
        position: zod_1.z.string().min(1, 'Position is required'),
        start_date: zod_1.z.string().min(1, 'Start date is required'),
        end_date: zod_1.z.string().optional(),
        description: zod_1.z.string().min(1, 'Job description is required'),
        currently_working: zod_1.z.string().optional()
    })).min(1, 'At least one work experience is required')
});
async function renderWorkExperience(req, res) {
    const success = req.query.success === '1' ? 'You basic information has been saved successfully! Please provide your work experience details.' : null;
    const candidateId = req.session.candidateId;
    const existingExperience = candidateId ? await (0, workExperienceService_1.getCandidateWorkExperience)(candidateId) : [];
    res.render('work-experience', {
        existingExperience,
        success,
        error: null
    });
}
async function handleWorkExperience(req, res) {
    try {
        // Validate work experience data
        const validationResult = workExperienceSchema.safeParse(req.body);
        if (!validationResult.success) {
            const errorMsg = validationResult.error.issues.map((issue) => issue.message).join('<br>');
            res.status(400).render('work-experience', { error: errorMsg });
            return;
        }
        const candidateId = req.session.candidateId;
        if (!candidateId) {
            res.status(400).render('work-experience', { error: 'Session expired. Please start registration again.' });
            return;
        }
        // Save work experience using service
        await (0, workExperienceService_1.saveCandidateWorkExperience)(candidateId, validationResult.data.work_experience);
        // Redirect to next step: education
        res.redirect('/education?success=1');
    }
    catch (error) {
        console.error('Work experience processing failed:', error);
        res.status(500).render('work-experience', { error: 'Failed to save work experience. Please try again.' });
    }
}
