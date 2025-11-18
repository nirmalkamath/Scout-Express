// This file provides server integration for candidate management
// Import this in your main server file to mount the candidate management routes

import candidateManagementRouter from '../routes/candidateManagementRoutes';
import { Express } from 'express';

export function setupCandidateManagement(app: Express): void {
  // Mount candidate management routes under /admin
  app.use('/admin/candidates', candidateManagementRouter);
}

// Export the router directly if you prefer to mount it manually
export { candidateManagementRouter };
