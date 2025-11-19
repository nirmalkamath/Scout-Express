import bcrypt from 'bcryptjs';
import { mysqlPool } from '../db/mysql';

export interface ChangeUsernameResult {
  success: boolean;
  error?: string;
}

export interface ChangePasswordResult {
  success: boolean;
  error?: string;
}

export interface MDDetails {
  id: number;
  username: string;
}

export async function getMDDetails(mdId: number): Promise<MDDetails | null> {
  try {
    const [rows] = await mysqlPool.execute(
      'SELECT id, username FROM director WHERE id = ?',
      [mdId]
    );
    if ((rows as any[]).length === 0) {
      return null;
    }
    return (rows as any[])[0] as MDDetails;
  } catch (error) {
    console.error('Get MD details error:', error);
    return null;
  }
}

export async function changeMDUsername(mdId: number, newUsername: string): Promise<ChangeUsernameResult> {
  if (!newUsername || !newUsername.trim()) {
    return { success: false, error: 'Invalid username' };
  }
  try {
    const [existing] = await mysqlPool.execute(
      'SELECT id FROM director WHERE username = ? AND id != ?',
      [newUsername.trim(), mdId]
    );
    if ((existing as any[]).length > 0) {
      return { success: false, error: 'Username already exists' };
    }
    await mysqlPool.execute(
      'UPDATE director SET username = ? WHERE id = ?',
      [newUsername.trim(), mdId]
    );
    return { success: true };
  } catch (error) {
    console.error('Change MD username error:', error);
    return { success: false, error: 'Failed to update username' };
  }
}

export async function changeMDPassword(mdId: number, currentPassword: string, newPassword: string): Promise<ChangePasswordResult> {
  if (!currentPassword || !newPassword || newPassword.length < 6) {
    return { success: false, error: 'Invalid password' };
  }
  try {
    const [rows] = await mysqlPool.execute(
      'SELECT password FROM director WHERE id = ?',
      [mdId]
    );
    if ((rows as any[]).length === 0) {
      return { success: false, error: 'MD not found' };
    }
    const isValidPassword = await bcrypt.compare(currentPassword, (rows as any[])[0].password);
    if (!isValidPassword) {
      return { success: false, error: 'Current password is incorrect' };
    }
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await mysqlPool.execute(
      'UPDATE director SET password = ? WHERE id = ?',
      [hashedPassword, mdId]
    );
    return { success: true };
  } catch (error) {
    console.error('Change MD password error:', error);
    return { success: false, error: 'Failed to update password' };
  }
}