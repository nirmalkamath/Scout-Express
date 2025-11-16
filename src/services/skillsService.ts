import { mysqlPool } from '../db/mysql';

export interface Skill {
  skill_name: string;
}

export async function getCandidateSkills(candidateId: number): Promise<Skill[]> {
  try {
    const [rows] = await mysqlPool.execute(
      'SELECT skill_name FROM candidate_skills WHERE candidate_id = ? ORDER BY created_at ASC',
      [candidateId]
    );
    
    return (rows as any[]).map(skill => ({
      skill_name: skill.skill_name
    }));
  } catch (error) {
    console.error('Error fetching skills:', error);
    return [];
  }
}

export async function saveCandidateSkills(candidateId: number, skills: Skill[]): Promise<void> {
  try {
    // Delete existing records
    await mysqlPool.execute('DELETE FROM candidate_skills WHERE candidate_id = ?', [candidateId]);

    // Insert new records
    const insertSql = `
      INSERT INTO candidate_skills
      (candidate_id, skill_name)
      VALUES (?, ?)
    `;

    for (const skill of skills) {
      await mysqlPool.execute(insertSql, [
        candidateId,
        skill.skill_name
      ]);
    }
  } catch (error) {
    console.error('Error saving skills:', error);
    throw error;
  }
}
