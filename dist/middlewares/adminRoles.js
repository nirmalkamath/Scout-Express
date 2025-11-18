"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireSuperAdmin = requireSuperAdmin;
exports.requireAdminWrite = requireAdminWrite;
function requireSuperAdmin(req, res, next) {
    if (!req.session.userId || req.session.userType !== 'admin') {
        return res.redirect('/admin-login');
    }
    if (req.session.adminRole !== 'super_admin') {
        return res.redirect('/admin-dashboard?error=Access%20denied');
    }
    next();
}
function requireAdminWrite(req, res, next) {
    if (!req.session.userId || req.session.userType !== 'admin') {
        return res.redirect('/admin-login');
    }
    const role = req.session.adminRole || 'viewer';
    if (role === 'super_admin' || role === 'admin') {
        return next();
    }
    if (req.xhr || req.headers.accept?.includes('application/json')) {
        return res.status(403).json({ success: false, message: 'Forbidden' });
    }
    return res.redirect('/admin-dashboard?error=Access%20denied');
}
