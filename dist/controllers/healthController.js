"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDatabaseHealth = getDatabaseHealth;
const healthService_1 = require("../services/healthService");
async function getDatabaseHealth(req, res) {
    const ok = await (0, healthService_1.checkDatabaseHealth)();
    if (ok) {
        res.json({ status: 'ok' });
        return;
    }
    res.status(500).json({ status: 'error' });
}
