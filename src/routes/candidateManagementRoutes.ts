import { Router } from 'express';
import {
  listCandidates,
  viewCandidate,
  editCandidateForm,
  updateCandidate,
  updateCandidateStatus,
  deleteCandidate,
  exportCandidates
} from '../controllers/candidateManagementController';
import { adminAuth } from '../middlewares/noCache';
import { requireAdminWrite } from '../middlewares/adminRoles';

const router = Router();

// Apply admin authentication to all routes
router.use(adminAuth);

// Candidate list with search and filters
router.get('/', listCandidates);

// Export candidates to CSV
router.get('/export', exportCandidates);

// View candidate details
router.get('/:id', viewCandidate);

// Edit candidate form
router.get('/:id/edit', editCandidateForm);

// Update candidate
router.post('/:id/update', requireAdminWrite, updateCandidate);

// Update candidate status (enable/disable)
router.put('/:id/status', requireAdminWrite, updateCandidateStatus);

// Delete candidate
router.delete('/:id', requireAdminWrite, deleteCandidate);

export default router;
