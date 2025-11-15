/// <reference path="../types.d.ts" />
import { Router } from 'express';
import { getDatabaseHealth } from '../controllers/healthController';
import { handleLogin, handleAdminLogin, handleSignup, renderLogin, renderSignup } from '../controllers/authController';
import { handleChangeUsername, handleChangePassword } from '../controllers/adminController';
import { getAdminDetails } from '../services/adminService';
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
router.get('/admin-login', (req, res) => res.render('admin-login'));
router.post('/admin-login', handleAdminLogin);
router.get('/admin-dashboard', (req, res) => {
  if (req.session.userType !== 'admin') {
    return res.redirect('/admin-login');
  }
  res.render('admin-dashboard', {
    success: req.query.success,
    error: req.query.error
  });
});
router.get('/admin/settings', (req, res) => {
  if (req.session.userType !== 'admin') {
    return res.redirect('/admin-login');
  }
  res.render('admin-settings', {
    success: req.query.success,
    error: req.query.error
  });
});
router.get('/md-dashboard', (req, res) => {
  if (req.session.userType !== 'md') {
    return res.redirect('/admin-login');
  }
  res.render('md-dashboard');
});
router.post('/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error('Logout error:', err);
    }
    res.redirect('/');
  });
});
router.post('/admin/change-username', handleChangeUsername);
router.post('/admin/change-password', handleChangePassword);
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
router.get('/registration-complete', (req, res) => res.render('registration-complete'));

export default router;
