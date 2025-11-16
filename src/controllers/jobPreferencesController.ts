import { Request, Response } from 'express';
import { z } from 'zod';
import { getCandidateJobPreferences, saveCandidateJobPreferences } from '../services/jobPreferencesService';

const jobPreferencesSchema = z.object({
  expected_salary: z.string().min(1, 'Expected salary is required'),
  availability: z.string().min(1, 'Availability is required')
});

export async function renderJobPreferences(req: Request, res: Response): Promise<void> {
  const candidateId = req.session.candidateId;
  const existingPreferences = candidateId ? await getCandidateJobPreferences(candidateId) : {};

  res.render('job-preferences', {
    existingPreferences,
    error: null
  });
}

export async function handleJobPreferences(req: Request, res: Response): Promise<void> {
  try {
    // Validate job preferences data
    const validationResult = jobPreferencesSchema.safeParse(req.body);

    if (!validationResult.success) {
      const errorMsg = validationResult.error.issues.map((issue: any) => issue.message).join('<br>');
      res.status(400).render('job-preferences', { error: errorMsg });
      return;
    }

    const candidateId = req.session.candidateId;
    if (!candidateId) {
      res.status(400).render('job-preferences', { error: 'Session expired. Please start registration again.' });
      return;
    }

    // Save job preferences using service
    await saveCandidateJobPreferences(candidateId, validationResult.data);

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

  } catch (error) {
    console.error('Job preferences processing failed:', error);
    res.status(500).render('job-preferences', { error: 'Failed to save job preferences. Please try again.' });
  }
}