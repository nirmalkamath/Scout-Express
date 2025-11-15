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

export interface AdminDetails {
  id: number;
  username: string;
}

export async function changeAdminUsername(adminId: number, newUsername: string): Promise<ChangeUsernameResult> {
  if (!newUsername || !newUsername.trim()) {
    return { success: false, error: 'Invalid username' };
  }

  try {
    // Check if username already exists
    const [existing] = await mysqlPool.execute(
      'SELECT id FROM admin WHERE username = ? AND id != ?',
      [newUsername.trim(), adminId]
    );

    if ((existing as any[]).length > 0) {
      return { success: false, error: 'Username already exists' };
    }

    // Update username
    await mysqlPool.execute(
      'UPDATE admin SET username = ? WHERE id = ?',
      [newUsername.trim(), adminId]
    );

    return { success: true };
  } catch (error) {
    console.error('Change username error:', error);
    return { success: false, error: 'Failed to update username' };
  }
}

export async function getAdminDetails(adminId: number): Promise<AdminDetails | null> {
  try {
    const [rows] = await mysqlPool.execute(
      'SELECT id, username FROM admin WHERE id = ?',
      [adminId]
    );

    if ((rows as any[]).length === 0) {
      return null;
    }

    return (rows as any[])[0] as AdminDetails;
  } catch (error) {
    console.error('Get admin details error:', error);
    return null;
  }
}

export async function changeAdminPassword(adminId: number, currentPassword: string, newPassword: string): Promise<ChangePasswordResult> {
  if (!currentPassword || !newPassword || newPassword.length < 6) {
    return { success: false, error: 'Invalid password' };
  }

  try {
    // Verify current password
    const [rows] = await mysqlPool.execute(
      'SELECT password FROM admin WHERE id = ?',
      [adminId]
    );

    if ((rows as any[]).length === 0) {
      return { success: false, error: 'Admin not found' };
    }

    const isValidPassword = await bcrypt.compare(currentPassword, (rows as any[])[0].password);

    if (!isValidPassword) {
      return { success: false, error: 'Current password is incorrect' };
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update password
    await mysqlPool.execute(
      'UPDATE admin SET password = ? WHERE id = ?',
      [hashedPassword, adminId]
    );

    return { success: true };
  } catch (error) {
    console.error('Change password error:', error);
    return { success: false, error: 'Failed to update password' };
  }
}