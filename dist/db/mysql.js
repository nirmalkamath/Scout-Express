"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.mysqlPool = void 0;
exports.pingDatabase = pingDatabase;
exports.shutdownDatabase = shutdownDatabase;
const promise_1 = require("mysql2/promise");
function requireEnv(name) {
    const value = process.env[name];
    if (typeof value === 'undefined' || value === '') {
        throw new Error(`Missing required environment variable: ${name}`);
    }
    return value;
}
// Enforce env-based configuration (no hardcoded defaults)
const MYSQL_HOST = requireEnv('MYSQL_HOST');
const MYSQL_PORT = Number(requireEnv('MYSQL_PORT'));
const MYSQL_USER = requireEnv('MYSQL_USER');
// Password can be blank for local setups; treat undefined as empty string
const MYSQL_PASSWORD = process.env.MYSQL_PASSWORD ?? '';
const MYSQL_DATABASE = requireEnv('MYSQL_DATABASE');
const poolOptions = {
    host: MYSQL_HOST,
    port: MYSQL_PORT,
    user: MYSQL_USER,
    password: MYSQL_PASSWORD,
    database: MYSQL_DATABASE,
    waitForConnections: true,
    queueLimit: 0,
    enableKeepAlive: true,
    keepAliveInitialDelay: 0,
};
// Optional pool sizing via env; if provided, apply it
if (process.env.MYSQL_CONNECTION_LIMIT) {
    poolOptions.connectionLimit = Number(process.env.MYSQL_CONNECTION_LIMIT);
}
exports.mysqlPool = (0, promise_1.createPool)(poolOptions);
async function pingDatabase() {
    try {
        const connection = await exports.mysqlPool.getConnection();
        try {
            await connection.ping();
            return true;
        }
        finally {
            connection.release();
        }
    }
    catch {
        return false;
    }
}
async function shutdownDatabase() {
    await exports.mysqlPool.end();
}
