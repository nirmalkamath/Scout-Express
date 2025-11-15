"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authenticateAdmin = authenticateAdmin;
exports.authenticateMD = authenticateMD;
exports.authenticateUser = authenticateUser;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const mysql_1 = require("../db/mysql");
async function authenticateAdmin(username, password) {
    if (!username || !password) {
        return {
            valid: false,
            error: 'Please enter username and password.'
        };
    }
    try {
        const [rows] = await mysql_1.mysqlPool.execute('SELECT * FROM admin WHERE username = ?', [username]);
        if (rows.length === 0) {
            return { valid: false, error: 'Invalid credentials.' };
        }
        const user = rows[0];
        const isValidPassword = await bcryptjs_1.default.compare(password, user.password);
        if (!isValidPassword) {
            return { valid: false, error: 'Invalid credentials.' };
        }
        return { valid: true, user };
    }
    catch (error) {
        console.error('Admin authentication error:', error);
        return { valid: false, error: 'Authentication failed.' };
    }
}
async function authenticateMD(username, password) {
    if (!username || !password) {
        return {
            valid: false,
            error: 'Please enter username and password.'
        };
    }
    try {
        const [rows] = await mysql_1.mysqlPool.execute('SELECT * FROM director WHERE username = ?', [username]);
        if (rows.length === 0) {
            return { valid: false, error: 'Invalid credentials.' };
        }
        const user = rows[0];
        const isValidPassword = await bcryptjs_1.default.compare(password, user.password);
        if (!isValidPassword) {
            return { valid: false, error: 'Invalid credentials.' };
        }
        return { valid: true, user };
    }
    catch (error) {
        console.error('MD authentication error:', error);
        return { valid: false, error: 'Authentication failed.' };
    }
}
function authenticateUser(email, password) {
    if (!email || !password) {
        return {
            valid: false,
            error: 'Please enter email and password.'
        };
    }
    return { valid: true };
}
