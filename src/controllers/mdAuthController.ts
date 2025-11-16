import { Request, Response } from 'express';
import { mysqlPool } from '../db/mysql';

/**
 * Handle MD login authentication
 */
export const handleMDLogin = async (req: Request, res: Response) => {
  const { username, password } = req.body;

  try {
    const connection = await mysqlPool.getConnection();
    
    // Query director table for MD authentication
    const query = 'SELECT * FROM director WHERE username = ? AND password = ?';
    const [rows] = await connection.execute(query, [username, password]);
    connection.release();

    if (Array.isArray(rows) && rows.length > 0) {
      const result = rows[0] as any;
      
      // Set MD session
      req.session.userId = result.id;
      req.session.userType = 'md';
      (req.session as any).username = username;
      
      res.redirect('/md-dashboard');
    } else {
      res.render('md/md-login', {
        error: 'Invalid MD credentials'
      });
    }
  } catch (error) {
    console.error('MD login error:', error);
    res.render('md/md-login', {
      error: 'Login failed. Please try again.'
    });
  }
};
