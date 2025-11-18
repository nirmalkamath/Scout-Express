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
  role?: string;
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
      'SELECT id, username, role FROM admin WHERE id = ?',
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

export async function listAdmins(): Promise<{ id: number; username: string; role: string | null }[]> {
  const [rows] = await mysqlPool.execute('SELECT id, username, role FROM admin ORDER BY id ASC');
  return rows as any[];
}

export async function createAdmin(username: string, password: string, role: string): Promise<{ success: boolean; error?: string }> {
  if (!username || !password || !role) {
    return { success: false, error: 'Invalid input' };
  }
  const [existing] = await mysqlPool.execute('SELECT id FROM admin WHERE username = ?', [username]);
  if ((existing as any[]).length > 0) {
    return { success: false, error: 'Username already exists' };
  }
  const hashed = await bcrypt.hash(password, 10);
  await mysqlPool.execute('INSERT INTO admin (username, password, role) VALUES (?, ?, ?)', [username, hashed, role]);
  return { success: true };
}

export async function updateAdminRole(adminId: number, role: string): Promise<{ success: boolean; error?: string }> {
  if (!adminId || !role) {
    return { success: false, error: 'Invalid input' };
  }
  await mysqlPool.execute('UPDATE admin SET role = ? WHERE id = ?', [role, adminId]);
  return { success: true };
}

export async function deleteAdmin(adminId: number): Promise<{ success: boolean; error?: string }> {
  if (!adminId) {
    return { success: false, error: 'Invalid input' };
  }
  await mysqlPool.execute('DELETE FROM admin WHERE id = ?', [adminId]);
  return { success: true };
}