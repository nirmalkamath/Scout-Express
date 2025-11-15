import { pingDatabase } from '../db/mysql';

export async function checkDatabaseHealth(): Promise<boolean> {
  return pingDatabase();
}
