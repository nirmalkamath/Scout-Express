"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.renderLogin = renderLogin;
exports.renderSignup = renderSignup;
exports.handleAdminLogin = handleAdminLogin;
exports.handleLogin = handleLogin;
exports.handleSignup = handleSignup;
const authService_1 = require("../services/authService");
const candidateService_1 = require("../services/candidateService");
const mysql_1 = require("../db/mysql");
function renderLogin(req, res) {
    res.render('login');
}
async function renderSignup(req, res) {
    let existingData = {};
    const candidateId = req.session.candidateId;
    if (candidateId) {
        try {
            const [rows] = await mysql_1.mysqlPool.execute('SELECT full_name, professional_headline, professional_summary, phone_number, country, state, district, city, pin_code, email FROM candidates WHERE id = ?', [candidateId]);
            if (rows.length > 0) {
                existingData = rows[0];
                // Split phone number if it contains ISD code
                if (existingData.phone_number && existingData.phone_number.length > 10) {
                    // Phone number is stored as ISD + 10-digit phone, so split by taking last 10 digits as phone
                    existingData.isd_code = existingData.phone_number.substring(0, existingData.phone_number.length - 10);
                    existingData.phone_number = existingData.phone_number.substring(existingData.phone_number.length - 10);
                }
            }
        }
        catch (error) {
            console.error('Error fetching signup data:', error);
        }
    }
    res.render('signup', { existingData });
}
async function handleAdminLogin(req, res) {
    const { username, password, loginType } = req.body;
    try {
        let result;
        let redirectPath = '/';
        if (loginType === 'admin') {
            result = await (0, authService_1.authenticateAdmin)(username || '', password || '');
            if (result.valid && result.user) {
                req.session.userType = 'admin';
                req.session.userId = result.user.id;
                redirectPath = '/admin-dashboard';
            }
        }
        else if (loginType === 'md') {
            result = await (0, authService_1.authenticateMD)(username || '', password || '');
            if (result.valid && result.user) {
                req.session.userType = 'md';
                req.session.userId = result.user.id;
                redirectPath = '/md-dashboard';
            }
        }
        else {
            result = { valid: false, error: 'Invalid login type.' };
        }
        if (!result.valid) {
            res.status(401).render('admin-login', { error: result.error });
            return;
        }
        req.session.save((err) => {
            if (err) {
                console.error('Session save error:', err);
                res.status(500).render('admin-login', { error: 'Session error. Please try again.' });
                return;
            }
            res.redirect(redirectPath);
        });
    }
    catch (error) {
        console.error('Admin login failed:', error);
        res.status(500).render('admin-login', { error: 'Login failed. Please try again.' });
    }
}
async function handleLogin(req, res) {
    const { email, username, password, loginType } = req.body;
    const credential = loginType === 'admin' || loginType === 'md' ? username : email;
    if (!credential || !password) {
        const view = loginType === 'admin' || loginType === 'md' ? 'admin-login' : 'login';
        const fieldName = loginType === 'admin' || loginType === 'md' ? 'username' : 'email';
        res.status(400).render(view, { error: `Please enter ${fieldName} and password.` });
        return;
    }
    try {
        let user = null;
        let redirectPath = '/';
        if (loginType === 'admin') {
            const [rows] = await mysql_1.mysqlPool.execute('SELECT * FROM admin WHERE username = ? AND password = ?', [username, password]);
            if (rows.length > 0) {
                user = rows[0];
                req.session.userType = 'admin';
                req.session.userId = user.id;
                redirectPath = '/admin-dashboard';
            }
        }
        else if (loginType === 'md') {
            const [rows] = await mysql_1.mysqlPool.execute('SELECT * FROM director WHERE username = ? AND password = ?', [username, password]);
            if (rows.length > 0) {
                user = rows[0];
                req.session.userType = 'md';
                req.session.userId = user.id;
                redirectPath = '/md-dashboard';
            }
        }
        else {
            // For other login types, use the existing authenticateUser or implement later
            const result = (0, authService_1.authenticateUser)(email, password);
            if (!result.valid) {
                res.status(400).render('login', { error: result.error });
                return;
            }
            req.session.userType = loginType;
            // For now, redirect to home
        }
        if (!user && (loginType === 'admin' || loginType === 'md')) {
            const view = loginType === 'admin' || loginType === 'md' ? 'admin-login' : 'login';
            res.status(401).render(view, { error: 'Invalid credentials.' });
            return;
        }
        req.session.save((err) => {
            if (err) {
                console.error('Session save error:', err);
                const view = loginType === 'admin' || loginType === 'md' ? 'admin-login' : 'login';
                res.status(500).render(view, { error: 'Session error. Please try again.' });
                return;
            }
            res.redirect(redirectPath);
        });
    }
    catch (error) {
        console.error('Login failed:', error);
        const view = loginType === 'admin' || loginType === 'md' ? 'admin-login' : 'login';
        res.status(500).render(view, { error: 'Login failed. Please try again.' });
    }
}
async function handleSignup(req, res) {
    try {
        let candidateId = req.session.candidateId;
        if (candidateId) {
            // Update existing candidate
            await (0, candidateService_1.updateCandidate)(candidateId, req.body, req.files);
        }
        else {
            // Register new candidate
            candidateId = await (0, candidateService_1.registerCandidate)(req.body, req.files);
            req.session.candidateId = candidateId;
        }
        req.session.save((err) => {
            if (err) {
                console.error('Session save error:', err);
                res.status(500).render('signup', { error: 'Session error. Please try again.' });
                return;
            }
            res.redirect('/work-experience?success=1');
        });
    }
    catch (error) {
        if (error instanceof candidateService_1.ServiceError) {
            res.status(error.statusCode).render('signup', { error: error.message });
            return;
        }
        console.error('Signup failed:', error);
        res.status(500).render('signup', {
            error: 'Something went wrong while processing your signup. Please try again later.'
        });
    }
}
