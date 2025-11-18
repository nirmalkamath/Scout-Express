"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.adminAuth = exports.noCache = void 0;
/**
 * Middleware to prevent browser caching of sensitive pages
 * Sets cache-control headers to ensure pages are not stored in browser cache
 */
const noCache = (req, res, next) => {
    // Set headers to prevent caching
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    res.setHeader('Surrogate-Control', 'no-store');
    res.setHeader('ETag', ''); // Clear ETag to prevent 304 responses
    next();
};
exports.noCache = noCache;
/**
 * Middleware specifically for admin routes that combines authentication check with cache prevention
 */
const adminAuth = (req, res, next) => {
    // First check if user is authenticated as admin
    if (!req.session.userId || req.session.userType !== 'admin') {
        return res.redirect('/admin-login');
    }
    // Apply no-cache headers
    (0, exports.noCache)(req, res, next);
};
exports.adminAuth = adminAuth;
