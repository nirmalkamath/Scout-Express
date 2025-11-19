/// <reference path="../types.d.ts" />
import { Router } from 'express';
import { getDatabaseHealth } from '../controllers/healthController';
import { handleLogin, handleAdminLogin, handleSignup, renderLogin, renderSignup } from '../controllers/authController';
import { handleMDLogin } from '../controllers/mdAuthController';
import { renderMDSettings, handleMDChangeUsername, handleMDChangePassword } from '../controllers/mdController';
import { handleChangeUsername, handleChangePassword, renderAdminUsers, handleCreateAdmin, handleUpdateAdminRole, handleDeleteAdmin } from '../controllers/adminController';
import { getAdminDetails } from '../services/adminService';
import { candidateManagementService } from '../services/candidateManagementService';
import { noCache, adminAuth } from '../middlewares/noCache';
import { requireSuperAdmin } from '../middlewares/adminRoles';
import { mdAuth } from '../middlewares/mdAuth';
import { renderHome } from '../controllers/homeController';
import { handleWorkExperience, renderWorkExperience } from '../controllers/workExperienceController';
import { handleEducation, renderEducation } from '../controllers/educationController';
import { handleSkills, renderSkills } from '../controllers/skillsController';
import { handleJobPreferences, renderJobPreferences } from '../controllers/jobPreferencesController';
import upload from '../middlewares/upload';

const router = Router();

router.get('/', renderHome);
router.get('/health/db', getDatabaseHealth);
router.get('/login', renderLogin);
router.post('/login', handleLogin);
router.get('/admin-login', noCache, (req, res) => res.render('admin/admin-login'));
router.post('/admin-login', handleAdminLogin);
router.get('/md-login', noCache, (req, res) => res.render('md/md-login'));
router.post('/md-login', handleMDLogin);
router.get('/admin-dashboard', adminAuth, async (req, res) => {
  let totalCandidates = 0;
  try {
    totalCandidates = await candidateManagementService.getTotalCandidates();
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error('Failed to load total candidates:', e);
  }
  res.render('admin/admin-dashboard', {
    success: req.query.success,
    error: req.query.error,
    totalCandidates
  });
});
router.get('/admin/settings', adminAuth, async (req, res) => {
  const adminDetails = await getAdminDetails(req.session.userId!);
  res.render('admin/admin-settings', {
    success: req.query.success,
    error: req.query.error,
    currentUsername: adminDetails?.username || ''
  });
});
router.get('/md-dashboard', mdAuth, async (req, res) => {
  let totalCandidates = 0;
  try {
    totalCandidates = await candidateManagementService.getTotalCandidates();
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error('Failed to load total candidates:', e);
  }
  res.render('md/md-dashboard', {
    success: req.query.success,
    error: req.query.error,
    totalCandidates
  });
});
router.get('/md-settings', mdAuth, renderMDSettings);
router.post('/md/change-username', mdAuth, handleMDChangeUsername);
router.post('/md/change-password', mdAuth, handleMDChangePassword);
router.post('/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error('Logout error:', err);
    }
    res.redirect('/');
  });
});
router.post('/admin_logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error('Logout error:', err);
    }
    res.redirect('/admin-login');
  });
});
router.post('/md_logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error('Logout error:', err);
    }
    res.redirect('/md-login');
  });
});
router.post('/admin/change-username', handleChangeUsername);
router.post('/admin/change-password', handleChangePassword);
router.get('/admin/admins', adminAuth, requireSuperAdmin, renderAdminUsers);
router.post('/admin/admins/create', adminAuth, requireSuperAdmin, handleCreateAdmin);
router.post('/admin/admins/:id/role', adminAuth, requireSuperAdmin, handleUpdateAdminRole);
router.post('/admin/admins/:id/delete', adminAuth, requireSuperAdmin, handleDeleteAdmin);
router.get('/signup', renderSignup);
router.post(
  '/signup',
  upload.fields([
    { name: 'photo', maxCount: 1 },
    { name: 'resume', maxCount: 1 }
  ]),
  handleSignup
);

import { requireCandidateSession } from "../middlewares/requireCandidateSession";

router.get('/work-experience', requireCandidateSession, renderWorkExperience);
router.post('/work-experience', requireCandidateSession, handleWorkExperience);
router.get('/education', requireCandidateSession, renderEducation);
router.post('/education', requireCandidateSession, handleEducation);
router.get('/skills', requireCandidateSession, renderSkills);
router.post('/skills', requireCandidateSession, handleSkills);
router.get('/job-preferences', requireCandidateSession, renderJobPreferences);
router.post('/job-preferences', requireCandidateSession, handleJobPreferences);
router.get('/success', (req, res) => res.render('registration-complete'));
router.get('/registration-complete', (req, res) => res.render('registration-complete'));

export default router;
