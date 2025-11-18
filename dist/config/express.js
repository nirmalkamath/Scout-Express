"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = configureExpress;
const express_1 = __importDefault(require("express"));
const path_1 = __importDefault(require("path"));
function configureExpress(app) {
    app.set('view engine', 'ejs');
    app.set('views', path_1.default.join(process.cwd(), 'views'));
    app.use(express_1.default.static(path_1.default.join(process.cwd(), 'public')));
}
