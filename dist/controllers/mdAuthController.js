"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleMDLogin = void 0;
const mysql_1 = require("../db/mysql");
/**
 * Handle MD login authentication
 */
const handleMDLogin = async (req, res) => {
    const { username, password } = req.body;
    try {
        const connection = await mysql_1.mysqlPool.getConnection();
        // Query director table for MD authentication
        const query = 'SELECT * FROM director WHERE username = ? AND password = ?';
        const [rows] = await connection.execute(query, [username, password]);
        connection.release();
        if (Array.isArray(rows) && rows.length > 0) {
            const result = rows[0];
            // Set MD session
            req.session.userId = result.id;
            req.session.userType = 'md';
            req.session.username = username;
            res.redirect('/md-dashboard');
        }
        else {
            res.render('md/md-login', {
                error: 'Invalid MD credentials'
            });
        }
    }
    catch (error) {
        console.error('MD login error:', error);
        res.render('md/md-login', {
            error: 'Login failed. Please try again.'
        });
    }
};
exports.handleMDLogin = handleMDLogin;
