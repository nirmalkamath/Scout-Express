"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkDatabaseHealth = checkDatabaseHealth;
const mysql_1 = require("../db/mysql");
async function checkDatabaseHealth() {
    return (0, mysql_1.pingDatabase)();
}
