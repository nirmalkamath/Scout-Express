"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleChangeUsername = handleChangeUsername;
exports.handleChangePassword = handleChangePassword;
exports.renderAdminUsers = renderAdminUsers;
exports.handleCreateAdmin = handleCreateAdmin;
exports.handleUpdateAdminRole = handleUpdateAdminRole;
exports.handleDeleteAdmin = handleDeleteAdmin;
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
    const { currentPassword, newPassword } = req.body;
    const result = await (0, adminService_1.changeAdminPassword)(req.session.userId, currentPassword || '', newPassword || '');
    if (result.success) {
        res.redirect('/admin/settings?success=Password updated successfully');
    }
    else {
        res.redirect(`/admin/settings?error=${encodeURIComponent(result.error || 'Failed to update password')}`);
    }
}
async function renderAdminUsers(req, res) {
    if (req.session.userType !== 'admin' || !req.session.userId) {
        return res.redirect('/admin-login');
    }
    if (req.session.adminRole !== 'super_admin') {
        return res.redirect('/admin-dashboard?error=Access%20denied');
    }
    const admins = await (0, adminService_1.listAdmins)();
    res.render('admin/admin-users', { admins, success: req.query.success, error: req.query.error });
}
async function handleCreateAdmin(req, res) {
    if (req.session.adminRole !== 'super_admin') {
        return res.redirect('/admin-dashboard?error=Access%20denied');
    }
    const { username, password, role } = req.body;
    const result = await (0, adminService_1.createAdmin)(username || '', password || '', role || 'admin');
    if (result.success) {
        return res.redirect('/admin/admins?success=Admin%20created');
    }
    return res.redirect(`/admin/admins?error=${encodeURIComponent(result.error || 'Failed to create admin')}`);
}
async function handleUpdateAdminRole(req, res) {
    if (req.session.adminRole !== 'super_admin') {
        return res.redirect('/admin-dashboard?error=Access%20denied');
    }
    const { id } = req.params;
    const { role } = req.body;
    const result = await (0, adminService_1.updateAdminRole)(Number(id), role || 'admin');
    if (result.success) {
        return res.redirect('/admin/admins?success=Role%20updated');
    }
    return res.redirect(`/admin/admins?error=${encodeURIComponent(result.error || 'Failed to update role')}`);
}
async function handleDeleteAdmin(req, res) {
    if (req.session.adminRole !== 'super_admin') {
        return res.redirect('/admin-dashboard?error=Access%20denied');
    }
    const { id } = req.params;
    const result = await (0, adminService_1.deleteAdmin)(Number(id));
    if (result.success) {
        return res.redirect('/admin/admins?success=Admin%20deleted');
    }
    return res.redirect(`/admin/admins?error=${encodeURIComponent(result.error || 'Failed to delete admin')}`);
}
