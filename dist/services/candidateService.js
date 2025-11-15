"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ServiceError = void 0;
exports.registerCandidate = registerCandidate;
exports.updateCandidate = updateCandidate;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const zod_1 = require("zod");
const mysql_1 = require("../db/mysql");
const signupSchema = zod_1.z.object({
    full_name: zod_1.z.string().min(2, 'Full Name is required'),
    professional_headline: zod_1.z.string().min(1, 'Professional headline is required'),
    professional_summary: zod_1.z.string().min(1, 'Professional summary is required'),
    isd_code: zod_1.z.string().optional(),
    phone_number: zod_1.z.string().regex(/^[0-9]{10}$/, 'Enter a valid 10-digit phone number'),
    country: zod_1.z.string().min(1, 'Country is required'),
    state: zod_1.z.string().min(1, 'State is required'),
    district: zod_1.z.string().min(1, 'District is required'),
    city: zod_1.z.string().min(1, 'City is required'),
    pin_code: zod_1.z.string().regex(/^[0-9]{6}$/, 'Enter a valid 6-digit PIN code'),
    email: zod_1.z.string().email('Enter a valid email address'),
    password: zod_1.z.string().min(8, 'Password must be at least 8 characters long')
});
const updateSchema = zod_1.z.object({
    full_name: zod_1.z.string().min(2, 'Full Name is required'),
    professional_headline: zod_1.z.string().min(1, 'Professional headline is required'),
    professional_summary: zod_1.z.string().min(1, 'Professional summary is required'),
    isd_code: zod_1.z.string().optional(),
    phone_number: zod_1.z.string().regex(/^[0-9]{10}$/, 'Enter a valid 10-digit phone number'),
    country: zod_1.z.string().min(1, 'Country is required'),
    state: zod_1.z.string().min(1, 'State is required'),
    district: zod_1.z.string().min(1, 'District is required'),
    city: zod_1.z.string().min(1, 'City is required'),
    pin_code: zod_1.z.string().regex(/^[0-9]{6}$/, 'Enter a valid 6-digit PIN code'),
    email: zod_1.z.string().email('Enter a valid email address'),
    password: zod_1.z.string().min(8, 'Password must be at least 8 characters long')
});
class ServiceError extends Error {
    constructor(statusCode, message) {
        super(message);
        this.statusCode = statusCode;
    }
}
exports.ServiceError = ServiceError;
async function registerCandidate(payload, files) {
    const dbOk = await (0, mysql_1.pingDatabase)();
    if (!dbOk) {
        throw new ServiceError(500, 'Database connection unavailable. Please try again later.');
    }
    const result = signupSchema.safeParse(payload);
    if (!result.success) {
        const errorMsg = result.error.issues.map((issue) => issue.message).join('<br>');
        throw new ServiceError(400, errorMsg);
    }
    // Check for existing email or phone number
    const checkSql = 'SELECT id FROM candidates WHERE email = ? OR phone_number = ?';
    const [existing] = await mysql_1.mysqlPool.execute(checkSql, [result.data.email, result.data.isd_code ? result.data.isd_code + result.data.phone_number : result.data.phone_number]);
    if (existing.length > 0) {
        throw new ServiceError(400, 'Email or phone number already exists.');
    }
    const resumeFile = files?.resume?.[0];
    if (!resumeFile) {
        throw new ServiceError(400, 'Resume upload is required.');
    }
    const photoFile = files?.photo?.[0] ?? null;
    const hashedPassword = await bcryptjs_1.default.hash(result.data.password, 10);
    const sql = `
    INSERT INTO candidates
    (full_name, photo, professional_headline, professional_summary, phone_number, city, state, district, country, pin_code, email, password, resume)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;
    const values = [
        result.data.full_name,
        photoFile ? photoFile.filename : null,
        result.data.professional_headline,
        result.data.professional_summary,
        result.data.isd_code ? result.data.isd_code + result.data.phone_number : result.data.phone_number,
        result.data.city,
        result.data.state,
        result.data.district,
        result.data.country,
        result.data.pin_code,
        result.data.email,
        hashedPassword,
        resumeFile.filename
    ];
    const [insertResult] = await mysql_1.mysqlPool.execute(sql, values);
    return insertResult.insertId;
}
async function updateCandidate(candidateId, payload, files) {
    const dbOk = await (0, mysql_1.pingDatabase)();
    if (!dbOk) {
        throw new ServiceError(500, 'Database connection unavailable. Please try again later.');
    }
    const result = signupSchema.safeParse(payload);
    if (!result.success) {
        const errorMsg = result.error.issues.map((issue) => issue.message).join('<br>');
        throw new ServiceError(400, errorMsg);
    }
    const resumeFile = files?.resume?.[0];
    const photoFile = files?.photo?.[0];
    const hashedPassword = await bcryptjs_1.default.hash(result.data.password, 10);
    const updateFields = [
        'full_name = ?',
        'professional_headline = ?',
        'professional_summary = ?',
        'phone_number = ?',
        'city = ?',
        'state = ?',
        'district = ?',
        'country = ?',
        'pin_code = ?',
        'email = ?',
        'password = ?'
    ];
    const values = [
        result.data.full_name,
        result.data.professional_headline,
        result.data.professional_summary,
        result.data.isd_code ? result.data.isd_code + result.data.phone_number : result.data.phone_number,
        result.data.city,
        result.data.state,
        result.data.district,
        result.data.country,
        result.data.pin_code,
        result.data.email,
        hashedPassword
    ];
    if (photoFile) {
        updateFields.push('photo = ?');
        values.push(photoFile.filename);
    }
    if (resumeFile) {
        updateFields.push('resume = ?');
        values.push(resumeFile.filename);
    }
    const sql = `
    UPDATE candidates SET
    ${updateFields.join(', ')}
    WHERE id = ?
  `;
    values.push(candidateId);
    await mysql_1.mysqlPool.execute(sql, values);
}
