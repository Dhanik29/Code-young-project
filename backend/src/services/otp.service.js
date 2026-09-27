/**
 * OTP Service — generates, stores, verifies, and emails 6-digit OTPs.
 * Uses an in-memory Map for dev simplicity (TTL = 10 minutes).
 */

import nodemailer from 'nodemailer';
import '../config/env.js';

// ── In-memory OTP store (email → { code, expiresAt, attempts }) ──────────────
const otpStore = new Map();
const OTP_TTL_MS = 10 * 60 * 1000; // 10 minutes
const MAX_VERIFY_ATTEMPTS = 5;

// ── Transporter (shared singleton) ────────────────────────────────────────────
let _transporter = null;
const getTransporter = async () => {
  if (_transporter) return _transporter;
  if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
    const cleanPass = process.env.SMTP_PASS.replace(/\s+/g, '');
    _transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || '587', 10),
      secure: process.env.SMTP_SECURE === 'true',
      auth: { user: process.env.SMTP_USER.trim(), pass: cleanPass },
    });
  } else {
    const testAccount = await nodemailer.createTestAccount();
    console.log(`📧 OTP Ethereal account: ${testAccount.user}`);
    _transporter = nodemailer.createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      secure: false,
      auth: { user: testAccount.user, pass: testAccount.pass },
    });
  }
  return _transporter;
};

// ── Generate 6-digit OTP ──────────────────────────────────────────────────────
const generateOTP = () => String(Math.floor(100000 + Math.random() * 900000));

// ── Send OTP to parent email ──────────────────────────────────────────────────
export const sendOTP = async (email, parentName) => {
  const code = generateOTP();
  const expiresAt = Date.now() + OTP_TTL_MS;

  // Store (overwrite any existing OTP for this email)
  otpStore.set(email.toLowerCase(), { code, expiresAt, attempts: 0 });

  const sender = process.env.SMTP_FROM || '"Codeyoung Admissions" <admissions@codeyoung.com>';
  const transporter = await getTransporter();

  const html = `
    <div style="font-family:Arial,sans-serif;max-width:560px;margin:0 auto;color:#1e293b;border:1px solid #e2e8f0;border-radius:10px;overflow:hidden;">
      <div style="background:linear-gradient(135deg,#2563eb,#6366f1);padding:22px 28px;text-align:center;">
        <h2 style="margin:0;color:#fff;font-size:20px;">🔐 Verify Your Email</h2>
        <p style="margin:6px 0 0;color:#bfdbfe;font-size:13px;">Codeyoung Free Trial Class Booking</p>
      </div>
      <div style="padding:28px;">
        <p>Hi <strong>${parentName || 'there'}</strong>,</p>
        <p>Please use the One-Time Password (OTP) below to verify your email and proceed with booking your child's free trial class:</p>

        <div style="text-align:center;margin:28px 0;">
          <div style="display:inline-block;background:#eff6ff;border:2px dashed #2563eb;border-radius:12px;padding:18px 36px;">
            <span style="font-size:36px;font-weight:900;letter-spacing:10px;color:#2563eb;font-family:monospace;">${code}</span>
          </div>
          <p style="margin-top:12px;font-size:13px;color:#64748b;">This OTP is valid for <strong>10 minutes</strong>. Do not share it with anyone.</p>
        </div>

        <p style="font-size:13px;color:#64748b;border-top:1px solid #e2e8f0;padding-top:14px;">
          If you did not request this OTP, please ignore this email. No action is needed.
        </p>
      </div>
    </div>
  `;

  const info = await transporter.sendMail({
    from: sender,
    to: email,
    subject: `${code} — Your Codeyoung OTP (valid 10 min)`,
    text: `Hi ${parentName},\n\nYour Codeyoung verification OTP is: ${code}\n\nThis OTP is valid for 10 minutes. Do not share it.\n\nCodeyoung Team`,
    html,
  });

  const previewUrl = nodemailer.getTestMessageUrl(info) || null;
  if (previewUrl) {
    console.log(`✉️ OTP email sent! Preview: ${previewUrl}`);
  }

  // In development, log the OTP to console for testing
  if (process.env.NODE_ENV !== 'production') {
    console.log(`🔑 OTP for ${email}: ${code}`);
  }

  return { sent: true, previewUrl };
};

// ── Verify OTP ────────────────────────────────────────────────────────────────
export const verifyOTP = (email, code) => {
  const key = email.toLowerCase();
  const record = otpStore.get(key);

  if (!record) {
    return { valid: false, reason: 'No OTP found for this email. Please request a new OTP.' };
  }

  if (Date.now() > record.expiresAt) {
    otpStore.delete(key);
    return { valid: false, reason: 'OTP has expired. Please request a new one.' };
  }

  record.attempts += 1;
  if (record.attempts > MAX_VERIFY_ATTEMPTS) {
    otpStore.delete(key);
    return { valid: false, reason: 'Too many incorrect attempts. Please request a new OTP.' };
  }

  if (record.code !== String(code).trim()) {
    return { valid: false, reason: `Incorrect OTP. ${MAX_VERIFY_ATTEMPTS - record.attempts} attempt(s) remaining.` };
  }

  // Valid — remove from store
  otpStore.delete(key);
  return { valid: true };
};
