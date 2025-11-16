import { Request, Response } from 'express';
import { z } from 'zod';
import { getCandidateSkills, saveCandidateSkills } from '../services/skillsService';

const skillsSchema = z.object({
  skills: z.array(z.object({
    skill_name: z.string().min(1, 'Skill name is required')
  })).min(1, 'At least one skill is required')
});

export async function renderSkills(req: Request, res: Response): Promise<void> {
  const candidateId = req.session.candidateId;
  const existingSkills = candidateId ? await getCandidateSkills(candidateId) : [];

  res.render('skills', {
    existingSkills,
    error: null
  });
}

export async function handleSkills(req: Request, res: Response): Promise<void> {
  try {
    // Validate skills data
    const validationResult = skillsSchema.safeParse(req.body);

    if (!validationResult.success) {
      const errorMsg = validationResult.error.issues.map((issue: any) => issue.message).join('<br>');
      res.status(400).render('skills', { error: errorMsg });
      return;
    }

    const candidateId = req.session.candidateId;
    if (!candidateId) {
      res.status(400).render('skills', { error: 'Session expired. Please start registration again.' });
      return;
    }

    // Save skills using service
    await saveCandidateSkills(candidateId, validationResult.data.skills);

    // Redirect to next step: job preferences
    res.redirect('/job-preferences');

  } catch (error) {
    console.error('Skills processing failed:', error);
    res.status(500).render('skills', { error: 'Failed to save skills. Please try again.' });
  }
}