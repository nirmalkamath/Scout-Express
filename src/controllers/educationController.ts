import { Request, Response } from 'express';
import { z } from 'zod';
import { getCandidateEducation, saveCandidateEducation } from '../services/educationService';

const educationSchema = z.object({
  education: z.array(z.object({
    degree: z.string().min(1, 'Degree is required'),
    institution: z.string().min(1, 'Institution is required'),
    graduation_year: z.string().min(1, 'Graduation year is required'),
    grade: z.string().min(1, 'Grade is required')
  })).min(1, 'At least one education entry is required')
});

export async function renderEducation(req: Request, res: Response): Promise<void> {
  const candidateId = req.session.candidateId;
  const existingEducation = candidateId ? await getCandidateEducation(candidateId) : [];

  res.render('education', { existingEducation });
}

export async function handleEducation(req: Request, res: Response): Promise<void> {
  try {
    // Validate education data
    const validationResult = educationSchema.safeParse(req.body);

    if (!validationResult.success) {
      const errorMsg = validationResult.error.issues.map((issue: any) => issue.message).join('<br>');
      res.status(400).render('education', { error: errorMsg });
      return;
    }

    const candidateId = req.session.candidateId;
    if (!candidateId) {
      res.status(400).render('education', { error: 'Session expired. Please start registration again.' });
      return;
    }

    // Save education using service
    await saveCandidateEducation(candidateId, validationResult.data.education);

    // Redirect to next step: skills
    res.redirect('/skills');

  } catch (error) {
    console.error('Education processing failed:', error);
    res.status(500).render('education', { error: 'Failed to save education. Please try again.' });
  }
}