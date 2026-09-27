import { sendOTP, verifyOTP } from '../services/otp.service.js';
import { prisma } from '../db.js';
import { sendSuccess } from '../utils/response.js';
import { ApiError } from '../utils/apiError.js';

/**
 * POST /api/otp/send
 * Body: { email, name }
 * Checks for uniqueness then sends OTP.
 */
export const sendOTPController = async (req, res, next) => {
  try {
    const { email, name, phone } = req.body;
    if (!email || !email.includes('@')) {
      throw ApiError.badRequest('A valid email address is required.');
    }

    // Check if this email is already registered
    const existingParentByEmail = await prisma.parent.findFirst({
      where: { email: email.toLowerCase() },
    });

    if (existingParentByEmail) {
      throw ApiError.conflict(
        `User already exists with this email address (${email}). Please use another email.`
      );
    }

    if (phone && phone.trim()) {
      const cleanPhone = phone.trim();
      const existingParentByPhone = await prisma.parent.findFirst({
        where: { phone: cleanPhone },
      });
      if (existingParentByPhone) {
        throw ApiError.conflict(
          `User already exists with this mobile number (${cleanPhone}). Please use another number.`
        );
      }
    }

    const result = await sendOTP(email.toLowerCase(), name || 'Parent');

    return sendSuccess(res, {
      sent: result.sent,
      previewUrl: result.previewUrl || null,
      alreadyRegistered: false,
      registeredName: null,
    }, 200, `OTP sent successfully to ${email}`);
  } catch (err) {
    next(err);
  }
};

/**
 * POST /api/otp/verify
 * Body: { email, otp }
 */
export const verifyOTPController = async (req, res, next) => {
  try {
    const { email, otp } = req.body;
    if (!email || !otp) {
      throw ApiError.badRequest('Email and OTP are required.');
    }

    const result = verifyOTP(email.toLowerCase(), otp);
    if (!result.valid) {
      throw ApiError.badRequest(result.reason);
    }

    return sendSuccess(res, { verified: true }, 200, 'OTP verified successfully. You may proceed.');
  } catch (err) {
    next(err);
  }
};

/**
 * POST /api/check-duplicate
 * Body: { email, phone }
 * Returns whether email/phone already exist in the parent table.
 */
export const checkDuplicateController = async (req, res, next) => {
  try {
    const { email, phone } = req.body;

    let emailExists = false;
    let phoneExists = false;
    let registeredName = null;

    if (email) {
      const byEmail = await prisma.parent.findFirst({
        where: { email: email.trim().toLowerCase() },
      });
      if (byEmail) {
        emailExists = true;
        registeredName = byEmail.name;
      }
    }

    if (phone) {
      const cleanPhone = phone.trim();
      const byPhone = await prisma.parent.findFirst({
        where: { phone: cleanPhone },
      });
      if (byPhone) {
        phoneExists = true;
        if (!registeredName) registeredName = byPhone.name;
      }
    }

    return sendSuccess(res, { emailExists, phoneExists, registeredName }, 200);
  } catch (err) {
    next(err);
  }
};
