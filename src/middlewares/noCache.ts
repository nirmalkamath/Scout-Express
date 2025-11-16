import { Request, Response, NextFunction } from 'express';

/**
 * Middleware to prevent browser caching of sensitive pages
 * Sets cache-control headers to ensure pages are not stored in browser cache
 */
export const noCache = (req: Request, res: Response, next: NextFunction) => {
  // Set headers to prevent caching
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');
  res.setHeader('Surrogate-Control', 'no-store');
  res.setHeader('ETag', ''); // Clear ETag to prevent 304 responses
  
  next();
};

/**
 * Middleware specifically for admin routes that combines authentication check with cache prevention
 */
export const adminAuth = (req: Request, res: Response, next: NextFunction) => {
  // First check if user is authenticated as admin
  if (!req.session.userId || req.session.userType !== 'admin') {
    return res.redirect('/admin-login');
  }
  
  // Apply no-cache headers
  noCache(req, res, next);
};
