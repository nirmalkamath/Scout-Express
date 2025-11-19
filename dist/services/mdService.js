"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getMDDetails = getMDDetails;
exports.changeMDUsername = changeMDUsername;
exports.changeMDPassword = changeMDPassword;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const mysql_1 = require("../db/mysql");
async function getMDDetails(mdId) {
    try {
        const [rows] = await mysql_1.mysqlPool.execute('SELECT id, username FROM director WHERE id = ?', [mdId]);
        if (rows.length === 0) {
            return null;
        }
        return rows[0];
    }
    catch (error) {
        console.error('Get MD details error:', error);
        return null;
    }
}
async function changeMDUsername(mdId, newUsername) {
    if (!newUsername || !newUsername.trim()) {
        return { success: false, error: 'Invalid username' };
    }
    try {
        const [existing] = await mysql_1.mysqlPool.execute('SELECT id FROM director WHERE username = ? AND id != ?', [newUsername.trim(), mdId]);
        if (existing.length > 0) {
            return { success: false, error: 'Username already exists' };
        }
        await mysql_1.mysqlPool.execute('UPDATE director SET username = ? WHERE id = ?', [newUsername.trim(), mdId]);
        return { success: true };
    }
    catch (error) {
        console.error('Change MD username error:', error);
        return { success: false, error: 'Failed to update username' };
    }
}
async function changeMDPassword(mdId, currentPassword, newPassword) {
    if (!currentPassword || !newPassword || newPassword.length < 6) {
        return { success: false, error: 'Invalid password' };
    }
    try {
        const [rows] = await mysql_1.mysqlPool.execute('SELECT password FROM director WHERE id = ?', [mdId]);
        if (rows.length === 0) {
            return { success: false, error: 'MD not found' };
        }
        const isValidPassword = await bcryptjs_1.default.compare(currentPassword, rows[0].password);
        if (!isValidPassword) {
            return { success: false, error: 'Current password is incorrect' };
        }
        const hashedPassword = await bcryptjs_1.default.hash(newPassword, 10);
        await mysql_1.mysqlPool.execute('UPDATE director SET password = ? WHERE id = ?', [hashedPassword, mdId]);
        return { success: true };
    }
    catch (error) {
        console.error('Change MD password error:', error);
        return { success: false, error: 'Failed to update password' };
    }
}
