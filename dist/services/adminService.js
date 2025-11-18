"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.changeAdminUsername = changeAdminUsername;
exports.getAdminDetails = getAdminDetails;
exports.changeAdminPassword = changeAdminPassword;
exports.listAdmins = listAdmins;
exports.createAdmin = createAdmin;
exports.updateAdminRole = updateAdminRole;
exports.deleteAdmin = deleteAdmin;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const mysql_1 = require("../db/mysql");
async function changeAdminUsername(adminId, newUsername) {
    if (!newUsername || !newUsername.trim()) {
        return { success: false, error: 'Invalid username' };
    }
    try {
        // Check if username already exists
        const [existing] = await mysql_1.mysqlPool.execute('SELECT id FROM admin WHERE username = ? AND id != ?', [newUsername.trim(), adminId]);
        if (existing.length > 0) {
            return { success: false, error: 'Username already exists' };
        }
        // Update username
        await mysql_1.mysqlPool.execute('UPDATE admin SET username = ? WHERE id = ?', [newUsername.trim(), adminId]);
        return { success: true };
    }
    catch (error) {
        console.error('Change username error:', error);
        return { success: false, error: 'Failed to update username' };
    }
}
async function getAdminDetails(adminId) {
    try {
        const [rows] = await mysql_1.mysqlPool.execute('SELECT id, username, role FROM admin WHERE id = ?', [adminId]);
        if (rows.length === 0) {
            return null;
        }
        return rows[0];
    }
    catch (error) {
        console.error('Get admin details error:', error);
        return null;
    }
}
async function changeAdminPassword(adminId, currentPassword, newPassword) {
    if (!currentPassword || !newPassword || newPassword.length < 6) {
        return { success: false, error: 'Invalid password' };
    }
    try {
        // Verify current password
        const [rows] = await mysql_1.mysqlPool.execute('SELECT password FROM admin WHERE id = ?', [adminId]);
        if (rows.length === 0) {
            return { success: false, error: 'Admin not found' };
        }
        const isValidPassword = await bcryptjs_1.default.compare(currentPassword, rows[0].password);
        if (!isValidPassword) {
            return { success: false, error: 'Current password is incorrect' };
        }
        // Hash new password
        const hashedPassword = await bcryptjs_1.default.hash(newPassword, 10);
        // Update password
        await mysql_1.mysqlPool.execute('UPDATE admin SET password = ? WHERE id = ?', [hashedPassword, adminId]);
        return { success: true };
    }
    catch (error) {
        console.error('Change password error:', error);
        return { success: false, error: 'Failed to update password' };
    }
}
async function listAdmins() {
    const [rows] = await mysql_1.mysqlPool.execute('SELECT id, username, role FROM admin ORDER BY id ASC');
    return rows;
}
async function createAdmin(username, password, role) {
    if (!username || !password || !role) {
        return { success: false, error: 'Invalid input' };
    }
    const [existing] = await mysql_1.mysqlPool.execute('SELECT id FROM admin WHERE username = ?', [username]);
    if (existing.length > 0) {
        return { success: false, error: 'Username already exists' };
    }
    const hashed = await bcryptjs_1.default.hash(password, 10);
    await mysql_1.mysqlPool.execute('INSERT INTO admin (username, password, role) VALUES (?, ?, ?)', [username, hashed, role]);
    return { success: true };
}
async function updateAdminRole(adminId, role) {
    if (!adminId || !role) {
        return { success: false, error: 'Invalid input' };
    }
    await mysql_1.mysqlPool.execute('UPDATE admin SET role = ? WHERE id = ?', [role, adminId]);
    return { success: true };
}
async function deleteAdmin(adminId) {
    if (!adminId) {
        return { success: false, error: 'Invalid input' };
    }
    await mysql_1.mysqlPool.execute('DELETE FROM admin WHERE id = ?', [adminId]);
    return { success: true };
}
