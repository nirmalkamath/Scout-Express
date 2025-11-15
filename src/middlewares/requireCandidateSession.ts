import { Request, Response, NextFunction } from "express";

export function requireCandidateSession(req: Request, res: Response, next: NextFunction) {
  if (!req.session || !req.session.candidateId) {
    return res.redirect('/login?error=session_expired');
  }
  next();
}
