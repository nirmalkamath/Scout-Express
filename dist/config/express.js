"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = configureExpress;
const express_1 = __importDefault(require("express"));
const express_session_1 = __importDefault(require("express-session"));
const path_1 = __importDefault(require("path"));
function configureExpress(app) {
    app.set('view engine', 'ejs');
    app.set('views', path_1.default.join(process.cwd(), 'views'));
    app.use(express_1.default.static(path_1.default.join(process.cwd(), 'public')));
    app.use(express_1.default.urlencoded({ extended: true }));
    // Session configuration
    app.use((0, express_session_1.default)({
        secret: process.env.SESSION_SECRET || 'scout-express-secret-key',
        resave: false,
        saveUninitialized: false,
        cookie: {
            secure: false, // Set to true in production with HTTPS
            maxAge: 24 * 60 * 60 * 1000 // 24 hours
        }
    }));
}
