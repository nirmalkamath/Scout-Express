"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireCandidateSession = requireCandidateSession;
function requireCandidateSession(req, res, next) {
    if (!req.session || !req.session.candidateId) {
        return res.redirect('/login?error=session_expired');
    }
    next();
}
