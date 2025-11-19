import { Request, Response } from 'express';
import { changeMDUsername, changeMDPassword, getMDDetails } from '../services/mdService';

export async function renderMDSettings(req: Request, res: Response): Promise<void> {
  if (req.session.userType !== 'md' || !req.session.userId) {
    return res.redirect('/md-login');
  }
  const mdDetails = await getMDDetails(req.session.userId!);
  res.render('md/md-settings', {
    success: req.query.success,
    error: req.query.error,
    currentUsername: mdDetails?.username || ''
  });
}

export async function handleMDChangeUsername(req: Request, res: Response): Promise<void> {
  if (req.session.userType !== 'md' || !req.session.userId) {
    return res.redirect('/md-login');
  }
  const { newUsername } = req.body as { newUsername?: string };
  const result = await changeMDUsername(req.session.userId!, newUsername || '');
  if (result.success) {
    res.redirect('/md-settings?success=Username%20updated%20successfully');
  } else {
    res.redirect(`/md-settings?error=${encodeURIComponent(result.error || 'Failed to update username')}`);
  }
}

export async function handleMDChangePassword(req: Request, res: Response): Promise<void> {
  if (req.session.userType !== 'md' || !req.session.userId) {
    return res.redirect('/md-login');
  }
  const { currentPassword, newPassword } = req.body as { currentPassword?: string; newPassword?: string };
  const result = await changeMDPassword(req.session.userId!, currentPassword || '', newPassword || '');
  if (result.success) {
    res.redirect('/md-settings?success=Password%20updated%20successfully');
  } else {
    res.redirect(`/md-settings?error=${encodeURIComponent(result.error || 'Failed to update password')}`);
  }
}