import { mysqlPool } from '../db/mysql';

export interface Education {
  degree: string;
  institution: string;
  graduation_year: string;
  grade: string;
}

export async function getCandidateEducation(candidateId: number): Promise<Education[]> {
  try {
    const [rows] = await mysqlPool.execute(
      'SELECT degree, institution, graduation_year, grade FROM candidate_education WHERE candidate_id = ? ORDER BY graduation_year ASC',
      [candidateId]
    );
    
    return (rows as any[]).map(edu => ({
      degree: edu.degree,
      institution: edu.institution,
      graduation_year: edu.graduation_year,
      grade: edu.grade
    }));
  } catch (error) {
    console.error('Error fetching education:', error);
    return [];
  }
}

export async function saveCandidateEducation(candidateId: number, education: Education[]): Promise<void> {
  try {
    // Delete existing records
    await mysqlPool.execute('DELETE FROM candidate_education WHERE candidate_id = ?', [candidateId]);

    // Insert new records
    const insertSql = `
      INSERT INTO candidate_education
      (candidate_id, degree, institution, graduation_year, grade)
      VALUES (?, ?, ?, ?, ?)
    `;

    for (const edu of education) {
      await mysqlPool.execute(insertSql, [
        candidateId,
        edu.degree,
        edu.institution,
        edu.graduation_year,
        edu.grade
      ]);
    }
  } catch (error) {
    console.error('Error saving education:', error);
    throw error;
  }
}
