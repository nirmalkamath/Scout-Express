"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleChangeUsername = handleChangeUsername;
exports.handleChangePassword = handleChangePassword;
const adminService_1 = require("../services/adminService");
async function handleChangeUsername(req, res) {
    if (req.session.userType !== 'admin' || !req.session.userId) {
        return res.redirect('/admin-login');
    }
    const { newUsername } = req.body;
    const result = await (0, adminService_1.changeAdminUsername)(req.session.userId, newUsername || '');
    if (result.success) {
        res.redirect('/admin/settings?success=Username updated successfully');
    }
    else {
        res.redirect(`/admin/settings?error=${encodeURIComponent(result.error || 'Failed to update username')}`);
    }
}
async function handleChangePassword(req, res) {
    if (req.session.userType !== 'admin' || !req.session.userId) {
        return res.redirect('/admin-login');
    }
    const { currentPassword, newPassword, confirmPassword } = req.body;
    if (newPassword !== confirmPassword) {
        return res.redirect('/admin/settings?error=New password and confirmation do not match');
    }
    const result = await (0, adminService_1.changeAdminPassword)(req.session.userId, currentPassword || '', newPassword || '');
    if (result.success) {
        res.redirect('/admin/settings?success=Password updated successfully');
    }
    else {
        res.redirect(`/admin/settings?error=${encodeURIComponent(result.error || 'Failed to update password')}`);
    }
}
