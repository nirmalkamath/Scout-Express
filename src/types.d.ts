import 'express-session';

declare module 'express-session' {
  interface SessionData {
    candidateId?: number;
    userType?: string;
    userId?: number;
    adminRole?: string;
  }
}