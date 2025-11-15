"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
/// <reference path="../types.d.ts" />
const express_1 = require("express");
const healthController_1 = require("../controllers/healthController");
const authController_1 = require("../controllers/authController");
const adminController_1 = require("../controllers/adminController");
const adminService_1 = require("../services/adminService");
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
router.get('/admin-login', (req, res) => res.render('admin-login'));
router.post('/admin-login', authController_1.handleAdminLogin);
router.get('/admin-dashboard', (req, res) => {
    if (req.session.userType !== 'admin') {
        return res.redirect('/admin-login');
    }
    res.render('admin-dashboard', {
        success: req.query.success,
        error: req.query.error
    });
});
router.get('/admin/settings', async (req, res) => {
    if (req.session.userType !== 'admin' || !req.session.userId) {
        return res.redirect('/admin-login');
    }
    const adminDetails = await (0, adminService_1.getAdminDetails)(req.session.userId);
    res.render('admin-settings', {
        success: req.query.success,
        error: req.query.error,
        currentUsername: adminDetails?.username || ''
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
router.post('/admin/change-username', adminController_1.handleChangeUsername);
router.post('/admin/change-password', adminController_1.handleChangePassword);
router.get('/signup', authController_1.renderSignup);
router.post('/signup', upload_1.default.fields([
    { name: 'photo', maxCount: 1 },
    { name: 'resume', maxCount: 1 }
]), authController_1.handleSignup);
router.get('/work-experience', workExperienceController_1.renderWorkExperience);
router.post('/work-experience', workExperienceController_1.handleWorkExperience);
router.get('/education', educationController_1.renderEducation);
router.post('/education', educationController_1.handleEducation);
router.get('/skills', skillsController_1.renderSkills);
router.post('/skills', skillsController_1.handleSkills);
router.get('/job-preferences', jobPreferencesController_1.renderJobPreferences);
router.post('/job-preferences', jobPreferencesController_1.handleJobPreferences);
router.get('/registration-complete', (req, res) => res.render('registration-complete'));
exports.default = router;
