"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const candidateManagementRoutes_1 = __importDefault(require("./candidateManagementRoutes"));
const router = (0, express_1.Router)();
// Mount all candidate management routes
router.use('/candidates', candidateManagementRoutes_1.default);
exports.default = router;
