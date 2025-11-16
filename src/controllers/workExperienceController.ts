import { Request, Response } from 'express';
import { z } from 'zod';
import { getCandidateWorkExperience, saveCandidateWorkExperience } from '../services/workExperienceService';

declare module 'express-session' {
  interface SessionData {
    candidateId?: number;
    workExperience?: Array<{
      company: string;
      position: string;
      start_date: string;
      end_date?: string;
      description: string;
      currently_working?: string;
    }>;
  }
}

const workExperienceSchema = z.object({
  work_experience: z.array(z.object({
    company: z.string().min(1, 'Company name is required'),
    position: z.string().min(1, 'Position is required'),
    start_date: z.string().min(1, 'Start date is required'),
    end_date: z.string().optional(),
    description: z.string().min(1, 'Job description is required'),
    currently_working: z.string().optional()
  })).min(1, 'At least one work experience is required')
});

interface WorkExperience {
  job_title: string;
  company_name: string;
  job_start_date: string;
  job_end_date: string | null;
  job_description: string;
  currently_work: number;
}

export async function renderWorkExperience(req: Request, res: Response): Promise<void> {
  const success = req.query.success === '1' ? 'You basic information has been saved successfully! Please provide your work experience details.' : null;

  const candidateId = req.session.candidateId;
  const existingExperience = candidateId ? await getCandidateWorkExperience(candidateId) : [];

  res.render('work-experience', {
    existingExperience,
    success,
    error: null
  });
}

export async function handleWorkExperience(req: Request, res: Response): Promise<void> {
  try {
    // Validate work experience data
    const validationResult = workExperienceSchema.safeParse(req.body);

    if (!validationResult.success) {
      const errorMsg = validationResult.error.issues.map((issue: any) => issue.message).join('<br>');
      res.status(400).render('work-experience', { error: errorMsg });
      return;
    }

    const candidateId = req.session.candidateId;
    if (!candidateId) {
      res.status(400).render('work-experience', { error: 'Session expired. Please start registration again.' });
      return;
    }

    // Save work experience using service
    await saveCandidateWorkExperience(candidateId, validationResult.data.work_experience);

    // Redirect to next step: education
    res.redirect('/education?success=1');

  } catch (error) {
    console.error('Work experience processing failed:', error);
    res.status(500).render('work-experience', { error: 'Failed to save work experience. Please try again.' });
  }
}