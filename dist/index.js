"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const express_1 = __importDefault(require("express"));
const express_2 = __importDefault(require("./config/express"));
const routes_1 = __importDefault(require("./routes"));
const candidateManagementServer_1 = require("./server-integration/candidateManagementServer");
const mysql_1 = require("./db/mysql");
const app = (0, express_1.default)();
const PORT = Number(process.env.PORT) || 3000;
const express_session_1 = __importDefault(require("express-session"));
app.use((0, express_session_1.default)({
    secret: "secret-key",
    resave: false,
    saveUninitialized: true,
}));
app.use(express_1.default.urlencoded({ extended: true }));
app.use(express_1.default.json());
(0, express_2.default)(app);
// Setup candidate management routes
(0, candidateManagementServer_1.setupCandidateManagement)(app);
app.use('/', routes_1.default);
app.listen(PORT, () => {
    // eslint-disable-next-line no-console
    console.log(`Scout Express server running on http://localhost:${PORT}`);
});
// Graceful shutdown
const shutdownSignals = ['SIGINT', 'SIGTERM'];
shutdownSignals.forEach((signal) => {
    process.on(signal, async () => {
        // eslint-disable-next-line no-console
        console.log(`\nReceived ${signal}. Shutting down...`);
        try {
            await (0, mysql_1.shutdownDatabase)();
        }
        catch {
            // ignore
        }
        finally {
            process.exit(0);
        }
    });
});
