"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleMDLogin = void 0;
const authService_1 = require("../services/authService");
/**
 * Handle MD login authentication
 */
const handleMDLogin = async (req, res) => {
    const { username, password } = req.body;
    try {
        const result = await (0, authService_1.authenticateMD)(username, password);
        if (!result.valid || !result.user) {
            return res.status(401).render('md/md-login', {
                error: result.error || 'Invalid MD credentials'
            });
        }
        const user = result.user;
        req.session.userId = user.id;
        req.session.userType = 'md';
        req.session.username = username;
        req.session.save(err => {
            if (err) {
                return res.status(500).render('md/md-login', {
                    error: 'Session error. Please try again.'
                });
            }
            res.redirect('/md-dashboard');
        });
    }
    catch (error) {
        console.error('MD login error:', error);
        res.status(500).render('md/md-login', {
            error: 'Login failed. Please try again.'
        });
    }
};
exports.handleMDLogin = handleMDLogin;
