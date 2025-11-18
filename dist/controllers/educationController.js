"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.renderEducation = renderEducation;
exports.handleEducation = handleEducation;
const zod_1 = require("zod");
const educationService_1 = require("../services/educationService");
const educationSchema = zod_1.z.object({
    education: zod_1.z.array(zod_1.z.object({
        degree: zod_1.z.string().min(1, 'Degree is required'),
        institution: zod_1.z.string().min(1, 'Institution is required'),
        graduation_year: zod_1.z.string().min(1, 'Graduation year is required'),
        grade: zod_1.z.string().min(1, 'Grade is required')
    })).min(1, 'At least one education entry is required')
});
async function renderEducation(req, res) {
    const candidateId = req.session.candidateId;
    const existingEducation = candidateId ? await (0, educationService_1.getCandidateEducation)(candidateId) : [];
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
        // Save education using service
        await (0, educationService_1.saveCandidateEducation)(candidateId, validationResult.data.education);
        // Redirect to next step: skills
        res.redirect('/skills');
    }
    catch (error) {
        console.error('Education processing failed:', error);
        res.status(500).render('education', { error: 'Failed to save education. Please try again.' });
    }
}
