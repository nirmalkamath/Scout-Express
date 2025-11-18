"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.renderJobPreferences = renderJobPreferences;
exports.handleJobPreferences = handleJobPreferences;
const zod_1 = require("zod");
const jobPreferencesService_1 = require("../services/jobPreferencesService");
const jobPreferencesSchema = zod_1.z.object({
    expected_salary: zod_1.z.string().min(1, 'Expected salary is required'),
    availability: zod_1.z.string().min(1, 'Availability is required')
});
async function renderJobPreferences(req, res) {
    const candidateId = req.session.candidateId;
    const existingPreferences = candidateId ? await (0, jobPreferencesService_1.getCandidateJobPreferences)(candidateId) : {};
    res.render('job-preferences', {
        existingPreferences,
        error: null
    });
}
async function handleJobPreferences(req, res) {
    try {
        // Validate job preferences data
        const validationResult = jobPreferencesSchema.safeParse(req.body);
        if (!validationResult.success) {
            const errorMsg = validationResult.error.issues.map((issue) => issue.message).join('<br>');
            res.status(400).render('job-preferences', { error: errorMsg });
            return;
        }
        const candidateId = req.session.candidateId;
        if (!candidateId) {
            res.status(400).render('job-preferences', { error: 'Session expired. Please start registration again.' });
            return;
        }
        // Save job preferences using service
        await (0, jobPreferencesService_1.saveCandidateJobPreferences)(candidateId, validationResult.data);
        // Clear session and redirect to success page
        req.session.candidateId = undefined;
        req.session.destroy(err => {
            if (err) {
                console.error("Session destroy error:", err);
                res.status(500).render('job-preferences', { error: 'Failed to complete registration. Please try again.' });
                return;
            }
            res.redirect('/success');
        });
    }
    catch (error) {
        console.error('Job preferences processing failed:', error);
        res.status(500).render('job-preferences', { error: 'Failed to save job preferences. Please try again.' });
    }
}
