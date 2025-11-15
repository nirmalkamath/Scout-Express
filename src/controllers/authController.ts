import { Request, Response } from 'express';
import { authenticateUser, authenticateAdmin, authenticateMD } from '../services/authService';
import { registerCandidate, updateCandidate, ServiceError, SignupFiles } from '../services/candidateService';
import { mysqlPool } from '../db/mysql';

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
  let existingData: any = {};
  const candidateId = req.session.candidateId;

  if (candidateId) {
    try {
      const [rows] = await mysqlPool.execute(
        'SELECT full_name, professional_headline, professional_summary, phone_number, country, state, district, city, pin_code, email FROM candidates WHERE id = ?',
        [candidateId]
      );

      if ((rows as any[]).length > 0) {
        existingData = (rows as any[])[0];

        // Split ISD code out of the stored phone number
        if (existingData.phone_number && existingData.phone_number.length > 10) {
          existingData.isd_code = existingData.phone_number.slice(
            0,
            existingData.phone_number.length - 10
          );
          existingData.phone_number = existingData.phone_number.slice(-10);
        }
      }
    } catch (error) {
      console.error('Error fetching signup data:', error);
    }
  }

  res.render('signup', { existingData });
}

/**
 * --------------------------
 * ADMIN + MD LOGIN
 * --------------------------
 */
export async function handleAdminLogin(req: Request, res: Response): Promise<void> {
  const { username, password, loginType } = req.body as {
    username?: string;
    password?: string;
    loginType?: string;
  };

  if (!username || !password) {
    return res.status(400).render('admin-login', {
      error: 'Please enter username and password.'
    });
  }

  try {
    let authResult;

    if (loginType === 'admin') {
      authResult = await authenticateAdmin(username, password);
    } else if (loginType === 'md') {
      authResult = await authenticateMD(username, password);
    } else {
      return res.status(400).render('admin-login', {
        error: 'Invalid login type.'
      });
    }

    if (!authResult.valid || !authResult.user) {
      return res.status(401).render('admin-login', {
        error: authResult.error || 'Invalid credentials.'
      });
    }

    // Set session values
    req.session.userType = loginType;
    req.session.userId = authResult.user.id;

    req.session.save(err => {
      if (err) {
        console.error('Session save error:', err);
        return res.status(500).render('admin-login', {
          error: 'Session error. Please try again.'
        });
      }

      const redirectPath =
        loginType === 'admin' ? '/admin-dashboard' : '/md-dashboard';

      res.redirect(redirectPath);
    });
  } catch (error) {
    console.error('Admin/MD login failed:', error);
    res.status(500).render('admin-login', {
      error: 'Login failed. Please try again.'
    });
  }
}

/**
 * --------------------------
 * GENERAL LOGIN (Candidates, Others)
 * --------------------------
 */
export async function handleLogin(req: Request, res: Response): Promise<void> {
  const { email, username, password, loginType } = req.body as {
    email?: string;
    username?: string;
    password?: string;
    loginType?: string;
  };

  const credential = loginType === 'admin' || loginType === 'md' ? username : email;

  if (!credential || !password) {
    const view = loginType === 'admin' || loginType === 'md' ? 'admin-login' : 'login';
    const fieldName = loginType === 'admin' || loginType === 'md' ? 'username' : 'email';
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
        return res.status(401).render('admin-login', { error: result.error });
      }
      user = result.user;
      req.session.userType = 'admin';
      req.session.userId = user.id;
      redirectPath = '/admin-dashboard';
    } else if (loginType === 'md') {
      const result = await authenticateMD(username!, password);
      if (!result.valid || !result.user) {
        return res.status(401).render('admin-login', { error: result.error });
      }
      user = result.user;
      req.session.userType = 'md';
      req.session.userId = user.id;
      redirectPath = '/md-dashboard';
    } else {
      // General user login
      const result = authenticateUser(email, password);
      if (!result.valid) {
        return res.status(400).render('login', { error: result.error });
      }
      req.session.userType = loginType;
      // Add custom logic if needed later
    }

    req.session.save(err => {
      if (err) {
        console.error('Session save error:', err);
        const view =
          loginType === 'admin' || loginType === 'md' ? 'admin-login' : 'login';
        return res.status(500).render(view, {
          error: 'Session error. Please try again.'
        });
      }

      res.redirect(redirectPath);
    });
  } catch (error) {
    console.error('Login failed:', error);
    const view =
      loginType === 'admin' || loginType === 'md' ? 'admin-login' : 'login';
    res.status(500).render(view, { error: 'Login failed. Please try again.' });
  }
}

/**
 * --------------------------
 * SIGNUP & CANDIDATE UPDATE
 * --------------------------
 */

export async function handleSignup(req: Request, res: Response): Promise<void> {
  try {
    let candidateId = req.session.candidateId;
    if (candidateId) {
      // Update existing candidate
      await updateCandidate(candidateId, req.body, req.files as SignupFiles);
    } else {
      // Register new candidate
      candidateId = await registerCandidate(req.body, req.files as SignupFiles);
      req.session.candidateId = candidateId;
    }
    req.session.save((err) => {
      if (err) {
        console.error('Session save error:', err);
        res.status(500).render('signup', { error: 'Session error. Please try again.' });
        return;
      }
      res.redirect('/work-experience?success=1');
    });
  } catch (error) {
    if (error instanceof ServiceError) {
      res.status(error.statusCode).render('signup', { error: error.message });
      return;
    }

    console.error('Signup failed:', error);
    res.status(500).render('signup', {
      error: 'Something went wrong while processing your signup. Please try again later.'
    });
  }
}
