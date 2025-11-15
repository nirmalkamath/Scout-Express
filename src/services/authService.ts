import bcrypt from 'bcryptjs';
import { mysqlPool } from '../db/mysql';

interface AuthenticationResult {
  valid: boolean;
  error?: string;
  user?: any;
}

export async function authenticateAdmin(username: string, password: string): Promise<AuthenticationResult> {
  if (!username || !password) {
    return {
      valid: false,
      error: 'Please enter username and password.'
    };
  }

  try {
    const [rows] = await mysqlPool.execute(
      'SELECT * FROM admin WHERE username = ?',
      [username]
    );

    if ((rows as any[]).length === 0) {
      return { valid: false, error: 'Invalid credentials.' };
    }

    const user = (rows as any[])[0];
    const isValidPassword = await bcrypt.compare(password, user.password);

    if (!isValidPassword) {
      return { valid: false, error: 'Invalid credentials.' };
    }

    return { valid: true, user };
  } catch (error) {
    console.error('Admin authentication error:', error);
    return { valid: false, error: 'Authentication failed.' };
  }
}

export async function authenticateMD(username: string, password: string): Promise<AuthenticationResult> {
  if (!username || !password) {
    return {
      valid: false,
      error: 'Please enter username and password.'
    };
  }

  try {
    const [rows] = await mysqlPool.execute(
      'SELECT * FROM director WHERE username = ?',
      [username]
    );

    if ((rows as any[]).length === 0) {
      return { valid: false, error: 'Invalid credentials.' };
    }

    const user = (rows as any[])[0];
    const isValidPassword = await bcrypt.compare(password, user.password);

    if (!isValidPassword) {
      return { valid: false, error: 'Invalid credentials.' };
    }

    return { valid: true, user };
  } catch (error) {
    console.error('MD authentication error:', error);
    return { valid: false, error: 'Authentication failed.' };
  }
}

export function authenticateUser(email?: string, password?: string): AuthenticationResult {
  if (!email || !password) {
    return {
      valid: false,
      error: 'Please enter email and password.'
    };
  }

  return { valid: true };
}
