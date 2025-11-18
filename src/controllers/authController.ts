import { Request, Response } from 'express';
import { authenticateUser, authenticateAdmin, authenticateMD } from '../services/authService';
import { getCandidateBasicInfo, updateCandidate, registerCandidate, SignupFiles, ServiceError } from '../services/candidateService';

/**
 * --------------------------
 * RENDER LOGIN VIEW
 * --------------------------
 */
export function renderLogin(req: Request, res: Response): void {
  res.render('login');
}

/**
 * --------------------------
 * RENDER SIGNUP VIEW
 * --------------------------
 */
export async function renderSignup(req: Request, res: Response): Promise<void> {
  const candidateId = req.session.candidateId || null;
  let existingData: any = {};

  if (candidateId) {
    existingData = await getCandidateBasicInfo(candidateId) || {};
    
    // Extract ISD code if phone number contains it
    if (existingData.phone_number && existingData.phone_number.length > 10) {
      existingData.isd_code = existingData.phone_number.slice(
        0,
        existingData.phone_number.length - 10
      );
      existingData.phone_number = existingData.phone_number.slice(-10);
    } else {
      existingData.isd_code = '+91';
    }
  }

  const hasResume = Boolean(existingData.resume);

  res.render('signup', {
    existingData,
    candidateId,
    hasResume
  });
}

/**
 * --------------------------
 * ADMIN + MD LOGIN
 * --------------------------
 */
export async function handleAdminLogin(req: Request, res: Response): Promise<void> {
  const { username, password, loginType } = req.body;

  if (!username || !password) {
    return res.status(400).render('admin/admin-login', {
      error: 'Please enter username and password.'
    });
  }

  try {
    let authResult;

    authResult = await authenticateAdmin(username, password);

    if (!authResult.valid || !authResult.user) {
      return res.status(401).render('admin/admin-login', {
        error: authResult.error || 'Invalid credentials.'
      });
    }

    req.session.userType = loginType;
    req.session.userId = authResult.user.id;
    req.session.adminRole = authResult.user.role || 'super_admin';

    req.session.save(err => {
      if (err) {
        return res.status(500).render('admin/admin-login', {
          error: 'Session error. Please try again.'
        });
      }

      const redirectPath = '/admin-dashboard';
      res.redirect(redirectPath);
    });
  } catch (error) {
    console.error('Admin login failed:', error);
    res.status(500).render('admin/admin-login', {
      error: 'Login failed. Please try again.'
    });
  }
}

/**
 * --------------------------
 * GENERAL LOGIN
 * --------------------------
 */
export async function handleLogin(req: Request, res: Response): Promise<void> {
  const { email, username, password, loginType } = req.body;

  const credential = loginType === 'admin' ? username : email;

  if (!credential || !password) {
    const view = loginType === 'admin' ? 'admin/admin-login' : 'login';
    const fieldName = loginType === 'admin' ? 'username' : 'email';

    return res.status(400).render(view, {
      error: `Please enter ${fieldName} and password.`
    });
  }

  try {
    let user: any = null;
    let redirectPath = '/';

    if (loginType === 'admin') {
      const result = await authenticateAdmin(username!, password);
      if (!result.valid || !result.user) {
        return res.status(401).render('admin/admin-login', { error: result.error });
      }
      user = result.user;
      req.session.userType = 'admin';
      req.session.userId = user.id;
      req.session.adminRole = user.role || 'super_admin';
      redirectPath = '/admin-dashboard';

    }  

    req.session.save(err => {
      if (err) {
        const view = loginType === 'admin' ? 'admin/admin-login' : 'login';
        return res.status(500).render(view, {
          error: 'Session error. Please try again.'
        });
      }

      res.redirect(redirectPath);
    });

  } catch (error) {
    console.error('Login failed:', error);
    const view = loginType === 'admin' ? 'admin/admin-login' : 'login';
    res.status(500).render(view, { error: 'Login failed. Please try again.' });
  }
}

/**
 * --------------------------
 * SIGNUP & CANDIDATE UPDATE
 * --------------------------
 */
export async function handleSignup(req: Request, res: Response): Promise<void> {
  let candidateId: number | undefined = req.session.candidateId;
  let existingData: any = req.body || {};

  try {
    if (candidateId) {
      await updateCandidate(candidateId, req.body, req.files as SignupFiles);
    } else {
      candidateId = await registerCandidate(req.body, req.files as SignupFiles);
      req.session.candidateId = candidateId;
    }

    req.session.save(err => {
      if (err) {
        return res.status(500).render('signup', {
          error: 'Session error. Please try again.',
          existingData,
          candidateId,
          hasResume: false
        });
      }

      res.redirect('/work-experience?success=1');
    });

  } catch (error: any) {
    console.error('Signup failed:', error);

    if (error instanceof ServiceError) {
      return res.status(error.statusCode).render('signup', {
        error: error.message,
        existingData,
        candidateId,
        hasResume: false
      });
    }

    res.status(500).render('signup', {
      error: 'Something went wrong while processing your signup. Please try again later.',
      existingData,
      candidateId,
      hasResume: false
    });
  }
}
