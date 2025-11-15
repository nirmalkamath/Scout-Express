import { Request, Response } from 'express';
import { z } from 'zod';
import { mysqlPool } from '../db/mysql';

const jobPreferencesSchema = z.object({
  expected_salary: z.string().min(1, 'Expected salary is required'),
  availability: z.string().min(1, 'Availability is required')
});

export async function renderJobPreferences(req: Request, res: Response): Promise<void> {
  let existingPreferences: any = {};
  const candidateId = req.session.candidateId;
  if (candidateId) {
    try {
      const [rows] = await mysqlPool.execute(
        'SELECT expected_salary, availability FROM candidate_preferences WHERE candidate_id = ?',
        [candidateId]
      );
      if ((rows as any[]).length > 0) {
        existingPreferences = (rows as any[])[0];
      }
    } catch (error) {
      console.error('Error fetching job preferences:', error);
    }
  }

  res.render('job-preferences', { existingPreferences });
}

export async function handleJobPreferences(req: Request, res: Response): Promise<void> {
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

    // Insert or update job preferences
    const insertSql = `
      INSERT INTO candidate_preferences
      (candidate_id, expected_salary, availability)
      VALUES (?, ?, ?)
      ON DUPLICATE KEY UPDATE
      expected_salary = VALUES(expected_salary),
      availability = VALUES(availability)
    `;

    await mysqlPool.execute(insertSql, [
      candidateId,
      validationResult.data.expected_salary,
      validationResult.data.availability
    ]);

    // Redirect to registration complete
    res.redirect('/registration-complete');

  } catch (error) {
    console.error('Job preferences processing failed:', error);
    res.status(500).render('job-preferences', {
      error: 'Something went wrong while processing your job preferences. Please try again later.'
    });
  }
}