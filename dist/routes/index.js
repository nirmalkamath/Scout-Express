"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
/// <reference path="../types.d.ts" />
const express_1 = require("express");
const healthController_1 = require("../controllers/healthController");
const authController_1 = require("../controllers/authController");
const mdAuthController_1 = require("../controllers/mdAuthController");
const adminController_1 = require("../controllers/adminController");
const adminService_1 = require("../services/adminService");
const candidateManagementService_1 = require("../services/candidateManagementService");
const noCache_1 = require("../middlewares/noCache");
const adminRoles_1 = require("../middlewares/adminRoles");
const mdAuth_1 = require("../middlewares/mdAuth");
const homeController_1 = require("../controllers/homeController");
const workExperienceController_1 = require("../controllers/workExperienceController");
const educationController_1 = require("../controllers/educationController");
const skillsController_1 = require("../controllers/skillsController");
const jobPreferencesController_1 = require("../controllers/jobPreferencesController");
const upload_1 = __importDefault(require("../middlewares/upload"));
const router = (0, express_1.Router)();
router.get('/', homeController_1.renderHome);
router.get('/health/db', healthController_1.getDatabaseHealth);
router.get('/login', authController_1.renderLogin);
router.post('/login', authController_1.handleLogin);
router.get('/admin-login', noCache_1.noCache, (req, res) => res.render('admin/admin-login'));
router.post('/admin-login', authController_1.handleAdminLogin);
router.get('/md-login', noCache_1.noCache, (req, res) => res.render('md/md-login'));
router.post('/md-login', mdAuthController_1.handleMDLogin);
router.get('/admin-dashboard', noCache_1.adminAuth, async (req, res) => {
    let totalCandidates = 0;
    try {
        totalCandidates = await candidateManagementService_1.candidateManagementService.getTotalCandidates();
    }
    catch (e) {
        // eslint-disable-next-line no-console
        console.error('Failed to load total candidates:', e);
    }
    res.render('admin/admin-dashboard', {
        success: req.query.success,
        error: req.query.error,
        totalCandidates
    });
});
router.get('/admin/settings', noCache_1.adminAuth, async (req, res) => {
    const adminDetails = await (0, adminService_1.getAdminDetails)(req.session.userId);
    res.render('admin/admin-settings', {
        success: req.query.success,
        error: req.query.error,
        currentUsername: adminDetails?.username || ''
    });
});
router.get('/md-dashboard', mdAuth_1.mdAuth, async (req, res) => {
    let totalCandidates = 0;
    try {
        totalCandidates = await candidateManagementService_1.candidateManagementService.getTotalCandidates();
    }
    catch (e) {
        // eslint-disable-next-line no-console
        console.error('Failed to load total candidates:', e);
    }
    res.render('md/md-dashboard', {
        success: req.query.success,
        error: req.query.error,
        totalCandidates
    });
});
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
router.post('/admin/change-username', adminController_1.handleChangeUsername);
router.post('/admin/change-password', adminController_1.handleChangePassword);
router.get('/admin/admins', noCache_1.adminAuth, adminRoles_1.requireSuperAdmin, adminController_1.renderAdminUsers);
router.post('/admin/admins/create', noCache_1.adminAuth, adminRoles_1.requireSuperAdmin, adminController_1.handleCreateAdmin);
router.post('/admin/admins/:id/role', noCache_1.adminAuth, adminRoles_1.requireSuperAdmin, adminController_1.handleUpdateAdminRole);
router.post('/admin/admins/:id/delete', noCache_1.adminAuth, adminRoles_1.requireSuperAdmin, adminController_1.handleDeleteAdmin);
router.get('/signup', authController_1.renderSignup);
router.post('/signup', upload_1.default.fields([
    { name: 'photo', maxCount: 1 },
    { name: 'resume', maxCount: 1 }
]), authController_1.handleSignup);
const requireCandidateSession_1 = require("../middlewares/requireCandidateSession");
router.get('/work-experience', requireCandidateSession_1.requireCandidateSession, workExperienceController_1.renderWorkExperience);
router.post('/work-experience', requireCandidateSession_1.requireCandidateSession, workExperienceController_1.handleWorkExperience);
router.get('/education', requireCandidateSession_1.requireCandidateSession, educationController_1.renderEducation);
router.post('/education', requireCandidateSession_1.requireCandidateSession, educationController_1.handleEducation);
router.get('/skills', requireCandidateSession_1.requireCandidateSession, skillsController_1.renderSkills);
router.post('/skills', requireCandidateSession_1.requireCandidateSession, skillsController_1.handleSkills);
router.get('/job-preferences', requireCandidateSession_1.requireCandidateSession, jobPreferencesController_1.renderJobPreferences);
router.post('/job-preferences', requireCandidateSession_1.requireCandidateSession, jobPreferencesController_1.handleJobPreferences);
router.get('/success', (req, res) => res.render('registration-complete'));
router.get('/registration-complete', (req, res) => res.render('registration-complete'));
exports.default = router;
