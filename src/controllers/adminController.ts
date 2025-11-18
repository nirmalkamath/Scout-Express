import { Request, Response } from 'express';
import { changeAdminUsername, changeAdminPassword, listAdmins, createAdmin, updateAdminRole, deleteAdmin } from '../services/adminService';
import { requireSuperAdmin } from '../middlewares/adminRoles';

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

export async function renderAdminUsers(req: Request, res: Response): Promise<void> {
  if (req.session.userType !== 'admin' || !req.session.userId) {
    return res.redirect('/admin-login');
  }
  if (req.session.adminRole !== 'super_admin') {
    return res.redirect('/admin-dashboard?error=Access%20denied');
  }
  const admins = await listAdmins();
  res.render('admin/admin-users', { admins, success: req.query.success, error: req.query.error });
}

export async function handleCreateAdmin(req: Request, res: Response): Promise<void> {
  if (req.session.adminRole !== 'super_admin') {
    return res.redirect('/admin-dashboard?error=Access%20denied');
  }
  const { username, password, role } = req.body as { username?: string; password?: string; role?: string };
  const result = await createAdmin(username || '', password || '', role || 'admin');
  if (result.success) {
    return res.redirect('/admin/admins?success=Admin%20created');
  }
  return res.redirect(`/admin/admins?error=${encodeURIComponent(result.error || 'Failed to create admin')}`);
}

export async function handleUpdateAdminRole(req: Request, res: Response): Promise<void> {
  if (req.session.adminRole !== 'super_admin') {
    return res.redirect('/admin-dashboard?error=Access%20denied');
  }
  const { id } = req.params;
  const { role } = req.body as { role?: string };
  const result = await updateAdminRole(Number(id), role || 'admin');
  if (result.success) {
    return res.redirect('/admin/admins?success=Role%20updated');
  }
  return res.redirect(`/admin/admins?error=${encodeURIComponent(result.error || 'Failed to update role')}`);
}

export async function handleDeleteAdmin(req: Request, res: Response): Promise<void> {
  if (req.session.adminRole !== 'super_admin') {
    return res.redirect('/admin-dashboard?error=Access%20denied');
  }
  const { id } = req.params;
  const result = await deleteAdmin(Number(id));
  if (result.success) {
    return res.redirect('/admin/admins?success=Admin%20deleted');
  }
  return res.redirect(`/admin/admins?error=${encodeURIComponent(result.error || 'Failed to delete admin')}`);
}