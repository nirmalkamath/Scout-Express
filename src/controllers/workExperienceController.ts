import { Request, Response } from 'express';
import { z } from 'zod';
import { mysqlPool } from '../db/mysql';

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

  let existingExperience: any[] = [];
  const candidateId = req.session.candidateId;
  if (candidateId) {
    try {
      const [rows] = await mysqlPool.execute(
        'SELECT job_title, company_name, job_start_date, job_end_date, job_description, currently_work FROM candidate_experience WHERE candidate_id = ? ORDER BY id ASC',
        [candidateId]
      );
      existingExperience = (rows as any[]).map(exp => ({
        position: exp.job_title,
        company: exp.company_name,
        start_date: exp.job_start_date ? new Date(exp.job_start_date).toISOString().split('T')[0] : '',
        end_date: exp.job_end_date ? new Date(exp.job_end_date).toISOString().split('T')[0] : '',
        description: exp.job_description,
        currently_working: exp.currently_work ? 'on' : 'off'
      }));
    } catch (error) {
      console.error('Error fetching work experience:', error);
    }
  }

  res.render('work-experience', { success, existingExperience });
}

export async function handleWorkExperience(req: Request, res: Response): Promise<void> {
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

    // Delete existing work experiences and insert new ones
    await mysqlPool.execute('DELETE FROM candidate_experience WHERE candidate_id = ?', [candidateId]);

    const insertSql = `
      INSERT INTO candidate_experience
      (candidate_id, job_title, company_name, job_start_date, job_end_date, job_description, currently_work)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `;

    for (const exp of validationResult.data.work_experience) {
      const endDate = exp.currently_working === 'on' ? null : (exp.end_date || null);
      const currentlyWork = exp.currently_working === 'on' ? 1 : 0;
      await mysqlPool.execute(insertSql, [
        candidateId,
        exp.position,
        exp.company,
        exp.start_date,
        endDate,
        exp.description,
        currentlyWork
      ]);
    }

    // Redirect to next step: education
    res.redirect('/education');

  } catch (error) {
    console.error('Work experience processing failed:', error);
    res.status(500).render('work-experience', {
      error: 'Something went wrong while processing your work experience. Please try again later.'
    });
  }
}