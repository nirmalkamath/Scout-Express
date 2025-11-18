"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.renderLogin = renderLogin;
exports.renderSignup = renderSignup;
exports.handleAdminLogin = handleAdminLogin;
exports.handleLogin = handleLogin;
exports.handleSignup = handleSignup;
const authService_1 = require("../services/authService");
const candidateService_1 = require("../services/candidateService");
/**
 * --------------------------
 * RENDER LOGIN VIEW
 * --------------------------
 */
function renderLogin(req, res) {
    res.render('login');
}
/**
 * --------------------------
 * RENDER SIGNUP VIEW
 * --------------------------
 */
async function renderSignup(req, res) {
    const candidateId = req.session.candidateId || null;
    let existingData = {};
    if (candidateId) {
        existingData = await (0, candidateService_1.getCandidateBasicInfo)(candidateId) || {};
        // Extract ISD code if phone number contains it
        if (existingData.phone_number && existingData.phone_number.length > 10) {
            existingData.isd_code = existingData.phone_number.slice(0, existingData.phone_number.length - 10);
            existingData.phone_number = existingData.phone_number.slice(-10);
        }
        else {
            existingData.isd_code = '+91';
        }
    }
    const hasResume = Boolean(existingData.resume);
    res.render('signup', {
        existingData,
        candidateId,
        hasResume
    });
}
/**
 * --------------------------
 * ADMIN + MD LOGIN
 * --------------------------
 */
async function handleAdminLogin(req, res) {
    const { username, password, loginType } = req.body;
    if (!username || !password) {
        return res.status(400).render('admin/admin-login', {
            error: 'Please enter username and password.'
        });
    }
    try {
        let authResult;
        authResult = await (0, authService_1.authenticateAdmin)(username, password);
        if (!authResult.valid || !authResult.user) {
            return res.status(401).render('admin/admin-login', {
                error: authResult.error || 'Invalid credentials.'
            });
        }
        req.session.userType = loginType;
        req.session.userId = authResult.user.id;
        req.session.adminRole = authResult.user.role || 'super_admin';
        req.session.save(err => {
            if (err) {
                return res.status(500).render('admin/admin-login', {
                    error: 'Session error. Please try again.'
                });
            }
            const redirectPath = '/admin-dashboard';
            res.redirect(redirectPath);
        });
    }
    catch (error) {
        console.error('Admin login failed:', error);
        res.status(500).render('admin/admin-login', {
            error: 'Login failed. Please try again.'
        });
    }
}
/**
 * --------------------------
 * GENERAL LOGIN
 * --------------------------
 */
async function handleLogin(req, res) {
    const { email, username, password, loginType } = req.body;
    const credential = loginType === 'admin' ? username : email;
    if (!credential || !password) {
        const view = loginType === 'admin' ? 'admin/admin-login' : 'login';
        const fieldName = loginType === 'admin' ? 'username' : 'email';
        return res.status(400).render(view, {
            error: `Please enter ${fieldName} and password.`
        });
    }
    try {
        let user = null;
        let redirectPath = '/';
        if (loginType === 'admin') {
            const result = await (0, authService_1.authenticateAdmin)(username, password);
            if (!result.valid || !result.user) {
                return res.status(401).render('admin/admin-login', { error: result.error });
            }
            user = result.user;
            req.session.userType = 'admin';
            req.session.userId = user.id;
            req.session.adminRole = user.role || 'super_admin';
            redirectPath = '/admin-dashboard';
        }
        req.session.save(err => {
            if (err) {
                const view = loginType === 'admin' ? 'admin/admin-login' : 'login';
                return res.status(500).render(view, {
                    error: 'Session error. Please try again.'
                });
            }
            res.redirect(redirectPath);
        });
    }
    catch (error) {
        console.error('Login failed:', error);
        const view = loginType === 'admin' ? 'admin/admin-login' : 'login';
        res.status(500).render(view, { error: 'Login failed. Please try again.' });
    }
}
/**
 * --------------------------
 * SIGNUP & CANDIDATE UPDATE
 * --------------------------
 */
async function handleSignup(req, res) {
    let candidateId = req.session.candidateId;
    let existingData = req.body || {};
    try {
        if (candidateId) {
            await (0, candidateService_1.updateCandidate)(candidateId, req.body, req.files);
        }
        else {
            candidateId = await (0, candidateService_1.registerCandidate)(req.body, req.files);
            req.session.candidateId = candidateId;
        }
        req.session.save(err => {
            if (err) {
                return res.status(500).render('signup', {
                    error: 'Session error. Please try again.',
                    existingData,
                    candidateId,
                    hasResume: false
                });
            }
            res.redirect('/work-experience?success=1');
        });
    }
    catch (error) {
        console.error('Signup failed:', error);
        if (error instanceof candidateService_1.ServiceError) {
            return res.status(error.statusCode).render('signup', {
                error: error.message,
                existingData,
                candidateId,
                hasResume: false
            });
        }
        res.status(500).render('signup', {
            error: 'Something went wrong while processing your signup. Please try again later.',
            existingData,
            candidateId,
            hasResume: false
        });
    }
}
