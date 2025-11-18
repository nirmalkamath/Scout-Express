"use strict";
// This file provides server integration for candidate management
// Import this in your main server file to mount the candidate management routes
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.candidateManagementRouter = void 0;
exports.setupCandidateManagement = setupCandidateManagement;
const candidateManagementRoutes_1 = __importDefault(require("../routes/candidateManagementRoutes"));
exports.candidateManagementRouter = candidateManagementRoutes_1.default;
function setupCandidateManagement(app) {
    // Mount candidate management routes under /admin
    app.use('/admin/candidates', candidateManagementRoutes_1.default);
}
