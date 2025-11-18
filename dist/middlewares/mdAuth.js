"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.mdAuth = void 0;
/**
 * Middleware specifically for MD routes that combines authentication check with cache prevention
 */
const mdAuth = (req, res, next) => {
    // First check if user is authenticated as MD
    if (!req.session.userId || req.session.userType !== 'md') {
        return res.redirect('/admin-login');
    }
    // Apply no-cache headers (reuse from noCache middleware logic)
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    res.setHeader('Surrogate-Control', 'no-store');
    res.setHeader('ETag', ''); // Clear ETag to prevent 304 responses
    next();
};
exports.mdAuth = mdAuth;
