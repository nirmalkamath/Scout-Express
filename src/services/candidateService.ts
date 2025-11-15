import bcrypt from 'bcryptjs';
import type { Express } from 'express';
import { z } from 'zod';
import { mysqlPool, pingDatabase } from '../db/mysql';

const signupSchema = z.object({
  full_name: z.string().min(2, 'Full Name is required'),
  professional_headline: z.string().min(1, 'Professional headline is required'),
  professional_summary: z.string().min(1, 'Professional summary is required'),
  isd_code: z.string().optional(),
  phone_number: z.string().regex(/^[0-9]{10}$/, 'Enter a valid 10-digit phone number'),
  country: z.string().min(1, 'Country is required'),
  state: z.string().min(1, 'State is required'),
  district: z.string().min(1, 'District is required'),
  city: z.string().min(1, 'City is required'),
  pin_code: z.string().regex(/^[0-9]{6}$/, 'Enter a valid 6-digit PIN code'),
  email: z.string().email('Enter a valid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters long')
});

const updateSchema = z.object({
  full_name: z.string().min(2, 'Full Name is required'),
  professional_headline: z.string().min(1, 'Professional headline is required'),
  professional_summary: z.string().min(1, 'Professional summary is required'),
  isd_code: z.string().optional(),
  phone_number: z.string().regex(/^[0-9]{10}$/, 'Enter a valid 10-digit phone number'),
  country: z.string().min(1, 'Country is required'),
  state: z.string().min(1, 'State is required'),
  district: z.string().min(1, 'District is required'),
  city: z.string().min(1, 'City is required'),
  pin_code: z.string().regex(/^[0-9]{6}$/, 'Enter a valid 6-digit PIN code'),
  email: z.string().email('Enter a valid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters long').optional()
});

export class ServiceError extends Error {
  statusCode: number;

  constructor(statusCode: number, message: string) {
    super(message);
    this.statusCode = statusCode;
  }
}

export type SignupFiles = {
  [fieldname: string]: Express.Multer.File[];
} | undefined;

export async function registerCandidate(payload: unknown, files: SignupFiles): Promise<number> {
  const dbOk = await pingDatabase();
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
  const [existing] = await mysqlPool.execute(checkSql, [result.data.email, result.data.isd_code ? result.data.isd_code + result.data.phone_number : result.data.phone_number]);
  if ((existing as any[]).length > 0) {
    throw new ServiceError(400, 'Email or phone number already exists.');
  }

  const resumeFile = files?.resume?.[0];
  if (!resumeFile) {
    throw new ServiceError(400, 'Resume upload is required.');
  }

  const photoFile = files?.photo?.[0] ?? null;

    const hashedPassword = await bcrypt.hash(result.data.password, 10);

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

  const [insertResult] = await mysqlPool.execute(sql, values);
  return (insertResult as any).insertId;
}

export async function updateCandidate(candidateId: number, payload: unknown, files: SignupFiles): Promise<void> {
  const dbOk = await pingDatabase();
  if (!dbOk) {
    throw new ServiceError(500, 'Database connection unavailable. Please try again later.');
  }

  const result = updateSchema.safeParse(payload);
  if (!result.success) {
    const errorMsg = result.error.issues.map((issue) => issue.message).join('<br>');
    throw new ServiceError(400, errorMsg);
  }

  const resumeFile = files?.resume?.[0];
  const photoFile = files?.photo?.[0];

  let hashedPassword: string | null = null;
  if (result.data.password) {
    hashedPassword = await bcrypt.hash(result.data.password, 10);
  }

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
   ];

  const values: (string | number)[] = [
    result.data.full_name,
    result.data.professional_headline,
    result.data.professional_summary,
    result.data.isd_code ? result.data.isd_code + result.data.phone_number : result.data.phone_number,
    result.data.city,
    result.data.state,
    result.data.district,
    result.data.country,
    result.data.pin_code,
    result.data.email
  ];

  if (hashedPassword) {
    updateFields.push('password = ?');
    values.push(hashedPassword);
  }

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

  await mysqlPool.execute(sql, values);
}
