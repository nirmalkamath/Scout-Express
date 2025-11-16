import { mysqlPool } from '../db/mysql';

export interface JobPreferences {
  expected_salary: string;
  availability: string;
}

export async function getCandidateJobPreferences(candidateId: number): Promise<JobPreferences | null> {
  try {
    const [rows] = await mysqlPool.execute(
      'SELECT expected_salary, availability FROM candidate_preferences WHERE candidate_id = ?',
      [candidateId]
    );
    
    if ((rows as any[]).length > 0) {
      return (rows as any[])[0];
    }
    return null;
  } catch (error) {
    console.error('Error fetching job preferences:', error);
    return null;
  }
}

export async function saveCandidateJobPreferences(candidateId: number, preferences: JobPreferences): Promise<void> {
  try {
    const insertSql = `
      INSERT INTO candidate_preferences
      (candidate_id, expected_salary, availability)
      VALUES (?, ?, ?)
    `;

    await mysqlPool.execute(insertSql, [
      candidateId,
      preferences.expected_salary,
      preferences.availability
    ]);
  } catch (error) {
    console.error('Error saving job preferences:', error);
    throw error;
  }
}
