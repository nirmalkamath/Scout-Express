"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.listCandidates = listCandidates;
exports.viewCandidate = viewCandidate;
exports.editCandidateForm = editCandidateForm;
exports.updateCandidate = updateCandidate;
exports.deleteCandidate = deleteCandidate;
exports.updateCandidateStatus = updateCandidateStatus;
exports.exportCandidates = exportCandidates;
const mysql_1 = require("../db/mysql");
const candidateManagementService_1 = require("../services/candidateManagementService");
// List all candidates
async function listCandidates(req, res) {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const search = req.query.search || '';
        const result = await candidateManagementService_1.candidateManagementService.getCandidates(page, limit, search);
        res.render('admin/candidate-management/candidate-list', {
            pageTitle: 'Candidate Management',
            candidates: result.candidates,
            pagination: result.pagination,
            search,
            activePage: 'candidates',
            layout: 'admin-layout'
        });
    }
    catch (error) {
        console.error('Error fetching candidates:', error);
        res.status(500).render('admin/candidate-management/error', {
            pageTitle: 'Error',
            message: 'Failed to fetch candidates',
            activePage: 'candidates'
        });
    }
}
// View candidate details
async function viewCandidate(req, res) {
    try {
        const candidateId = parseInt(req.params.id);
        if (isNaN(candidateId)) {
            res.status(400).render('admin/candidate-management/error', {
                pageTitle: 'Error',
                message: 'Invalid candidate ID',
                activePage: 'candidates'
            });
            return;
        }
        const candidate = await candidateManagementService_1.candidateManagementService.getCandidateById(candidateId);
        if (!candidate) {
            res.status(404).render('admin/candidate-management/error', {
                pageTitle: 'Not Found',
                message: 'Candidate not found',
                activePage: 'candidates'
            });
            return;
        }
        res.render('admin/candidate-management/candidate-view', {
            pageTitle: 'Candidate Details',
            candidate,
            activePage: 'candidates'
        });
    }
    catch (error) {
        console.error('Error viewing candidate:', error);
        res.status(500).render('admin/candidate-management/error', {
            pageTitle: 'Error',
            message: 'Failed to fetch candidate details',
            activePage: 'candidates'
        });
    }
}
// Edit candidate form
async function editCandidateForm(req, res) {
    try {
        const candidateId = parseInt(req.params.id);
        if (isNaN(candidateId)) {
            res.status(400).render('admin/candidate-management/error', {
                pageTitle: 'Error',
                message: 'Invalid candidate ID',
                activePage: 'candidates'
            });
            return;
        }
        const candidate = await candidateManagementService_1.candidateManagementService.getCandidateById(candidateId);
        if (!candidate) {
            res.status(404).render('admin/candidate-management/error', {
                pageTitle: 'Not Found',
                message: 'Candidate not found',
                activePage: 'candidates'
            });
            return;
        }
        res.render('admin/candidate-management/candidate-edit', {
            pageTitle: 'Edit Candidate',
            candidate,
            activePage: 'candidates'
        });
    }
    catch (error) {
        console.error('Error loading edit form:', error);
        res.status(500).render('admin/candidate-management/error', {
            pageTitle: 'Error',
            message: 'Failed to load edit form',
            activePage: 'candidates'
        });
    }
}
// Update candidate
async function updateCandidate(req, res) {
    try {
        const candidateId = parseInt(req.params.id);
        if (isNaN(candidateId)) {
            if (req.xhr || req.headers.accept?.includes('application/json')) {
                res.status(400).json({
                    success: false,
                    message: 'Invalid candidate ID'
                });
                return;
            }
            res.redirect(`/admin/candidates/${req.params.id}/edit`);
            return;
        }
        const updateData = req.body || {};
        if (updateData.experience && !Array.isArray(updateData.experience)) {
            updateData.experience = Object.values(updateData.experience);
        }
        if (updateData.education && !Array.isArray(updateData.education)) {
            updateData.education = Object.values(updateData.education);
        }
        if (updateData.skills && !Array.isArray(updateData.skills)) {
            updateData.skills = Object.values(updateData.skills);
        }
        const result = await candidateManagementService_1.candidateManagementService.updateCandidate(candidateId, updateData);
        if (result.success) {
            if (req.xhr || req.headers.accept?.includes('application/json')) {
                res.json({ success: true, redirectUrl: `/admin/candidates/${candidateId}` });
                return;
            }
            res.redirect(`/admin/candidates/${candidateId}`);
        }
        else {
            if (req.xhr || req.headers.accept?.includes('application/json')) {
                res.status(400).json({ success: false, message: result.message });
                return;
            }
            res.redirect(`/admin/candidates/${candidateId}/edit`);
        }
    }
    catch (error) {
        console.error('Error updating candidate:', error);
        if (req.xhr || req.headers.accept?.includes('application/json')) {
            res.status(500).json({ success: false, message: 'Failed to update candidate' });
            return;
        }
        res.redirect(`/admin/candidates/${req.params.id}/edit`);
    }
}
// Delete candidate
async function deleteCandidate(req, res) {
    try {
        const candidateId = parseInt(req.params.id);
        if (isNaN(candidateId)) {
            res.status(400).json({
                success: false,
                message: 'Invalid candidate ID'
            });
            return;
        }
        const result = await candidateManagementService_1.candidateManagementService.deleteCandidate(candidateId);
        if (result.success) {
            if (req.xhr || req.headers.accept?.includes('application/json')) {
                res.json({ success: true, redirectUrl: '/admin/candidates' });
                return;
            }
            res.redirect('/admin/candidates');
        }
        else {
            if (req.xhr || req.headers.accept?.includes('application/json')) {
                res.status(400).json({ success: false, message: result.message });
                return;
            }
            res.redirect('/admin/candidates');
        }
    }
    catch (error) {
        console.error('Error deleting candidate:', error);
        if (req.xhr || req.headers.accept?.includes('application/json')) {
            res.status(500).json({ success: false, message: 'Failed to delete candidate' });
            return;
        }
        res.redirect('/admin/candidates');
    }
}
// Update candidate status (enable/disable)
async function updateCandidateStatus(req, res) {
    try {
        const candidateId = parseInt(req.params.id);
        if (isNaN(candidateId)) {
            res.status(400).json({
                success: false,
                message: 'Invalid candidate ID'
            });
            return;
        }
        const { is_disabled } = req.body;
        if (is_disabled === undefined || is_disabled === null) {
            res.status(400).json({
                success: false,
                message: 'is_disabled field is required'
            });
            return;
        }
        const query = 'UPDATE candidates SET is_disabled = ? WHERE id = ?';
        await mysql_1.mysqlPool.execute(query, [is_disabled ? 1 : 0, candidateId]);
        res.json({ success: true });
    }
    catch (error) {
        console.error('Error updating candidate status:', error);
        res.status(500).json({ success: false, message: 'Failed to update candidate status' });
    }
}
// Export candidates to CSV
async function exportCandidates(req, res) {
    try {
        const search = req.query.search || '';
        const csvData = await candidateManagementService_1.candidateManagementService.exportToCSV(search);
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', 'attachment; filename=candidates.csv');
        res.send(csvData);
    }
    catch (error) {
        console.error('Error exporting candidates:', error);
        res.status(500).render('admin/candidate-management/error', {
            pageTitle: 'Error',
            message: 'Failed to export candidates',
            activePage: 'candidates'
        });
    }
}
