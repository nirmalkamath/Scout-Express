import { Request, Response } from 'express';
import { checkDatabaseHealth } from '../services/healthService';

export async function getDatabaseHealth(req: Request, res: Response): Promise<void> {
  const ok = await checkDatabaseHealth();
  if (ok) {
    res.json({ status: 'ok' });
    return;
  }

  res.status(500).json({ status: 'error' });
}
