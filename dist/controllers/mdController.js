"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.renderMDSettings = renderMDSettings;
exports.handleMDChangeUsername = handleMDChangeUsername;
exports.handleMDChangePassword = handleMDChangePassword;
const mdService_1 = require("../services/mdService");
async function renderMDSettings(req, res) {
    if (req.session.userType !== 'md' || !req.session.userId) {
        return res.redirect('/md-login');
    }
    const mdDetails = await (0, mdService_1.getMDDetails)(req.session.userId);
    res.render('md/md-settings', {
        success: req.query.success,
        error: req.query.error,
        currentUsername: mdDetails?.username || ''
    });
}
async function handleMDChangeUsername(req, res) {
    if (req.session.userType !== 'md' || !req.session.userId) {
        return res.redirect('/md-login');
    }
    const { newUsername } = req.body;
    const result = await (0, mdService_1.changeMDUsername)(req.session.userId, newUsername || '');
    if (result.success) {
        res.redirect('/md-settings?success=Username%20updated%20successfully');
    }
    else {
        res.redirect(`/md-settings?error=${encodeURIComponent(result.error || 'Failed to update username')}`);
    }
}
async function handleMDChangePassword(req, res) {
    if (req.session.userType !== 'md' || !req.session.userId) {
        return res.redirect('/md-login');
    }
    const { currentPassword, newPassword } = req.body;
    const result = await (0, mdService_1.changeMDPassword)(req.session.userId, currentPassword || '', newPassword || '');
    if (result.success) {
        res.redirect('/md-settings?success=Password%20updated%20successfully');
    }
    else {
        res.redirect(`/md-settings?error=${encodeURIComponent(result.error || 'Failed to update password')}`);
    }
}
