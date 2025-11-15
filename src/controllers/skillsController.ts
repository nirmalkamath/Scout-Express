import { Request, Response } from 'express';
import { z } from 'zod';
import { mysqlPool } from '../db/mysql';

const skillsSchema = z.object({
  skills: z.array(z.object({
    skill_name: z.string().min(1, 'Skill name is required')
  })).min(1, 'At least one skill is required')
});

export async function renderSkills(req: Request, res: Response): Promise<void> {
  let existingSkills: any[] = [];
  const candidateId = req.session.candidateId;
  if (candidateId) {
    try {
      const [rows] = await mysqlPool.execute(
        'SELECT skill_name FROM candidate_skills WHERE candidate_id = ? ORDER BY created_at ASC',
        [candidateId]
      );
      existingSkills = (rows as any[]).map(skill => ({
        skill_name: skill.skill_name
      }));
    } catch (error) {
      console.error('Error fetching skills:', error);
    }
  }

  res.render('skills', { existingSkills });
}

export async function handleSkills(req: Request, res: Response): Promise<void> {
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

    // Delete existing skills and insert new ones
    await mysqlPool.execute('DELETE FROM candidate_skills WHERE candidate_id = ?', [candidateId]);

    const insertSql = `
      INSERT INTO candidate_skills
      (candidate_id, skill_name)
      VALUES (?, ?)
    `;

    for (const skill of validationResult.data.skills) {
      await mysqlPool.execute(insertSql, [
        candidateId,
        skill.skill_name
      ]);
    }

    // Redirect to next step: job preferences
    res.redirect('/job-preferences');

  } catch (error) {
    console.error('Skills processing failed:', error);
    res.status(500).render('skills', {
      error: 'Something went wrong while processing your skills. Please try again later.'
    });
  }
}