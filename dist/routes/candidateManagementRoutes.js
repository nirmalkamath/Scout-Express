"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const candidateManagementController_1 = require("../controllers/candidateManagementController");
const noCache_1 = require("../middlewares/noCache");
const router = (0, express_1.Router)();
// Apply admin authentication to all routes
router.use(noCache_1.adminAuth);
// Candidate list with search and filters
router.get('/', candidateManagementController_1.listCandidates);
// Export candidates to CSV
router.get('/export', candidateManagementController_1.exportCandidates);
// View candidate details
router.get('/:id', candidateManagementController_1.viewCandidate);
// Edit candidate form
router.get('/:id/edit', candidateManagementController_1.editCandidateForm);
// Update candidate
router.post('/:id/update', candidateManagementController_1.updateCandidate);
// Update candidate status (enable/disable)
router.put('/:id/status', candidateManagementController_1.updateCandidateStatus);
// Delete candidate
router.delete('/:id', candidateManagementController_1.deleteCandidate);
exports.default = router;
