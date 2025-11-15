import { Request, Response } from 'express';
import { changeAdminUsername, changeAdminPassword } from '../services/adminService';

export async function handleChangeUsername(req: Request, res: Response): Promise<void> {
  if (req.session.userType !== 'admin' || !req.session.userId) {
    return res.redirect('/admin-login');
  }

  const { newUsername } = req.body as { newUsername?: string };

  const result = await changeAdminUsername(req.session.userId, newUsername || '');

  if (result.success) {
    res.redirect('/admin/settings?success=Username updated successfully');
  } else {
    res.redirect(`/admin/settings?error=${encodeURIComponent(result.error || 'Failed to update username')}`);
  }
}

export async function handleChangePassword(req: Request, res: Response): Promise<void> {
  if (req.session.userType !== 'admin' || !req.session.userId) {
    return res.redirect('/admin-login');
  }

  const { currentPassword, newPassword } = req.body as { currentPassword?: string; newPassword?: string };

  const result = await changeAdminPassword(req.session.userId, currentPassword || '', newPassword || '');

  if (result.success) {
    res.redirect('/admin/settings?success=Password updated successfully');
  } else {
    res.redirect(`/admin/settings?error=${encodeURIComponent(result.error || 'Failed to update password')}`);
  }
}