import { Router } from 'express';
import { sendOTPController, verifyOTPController, checkDuplicateController } from '../controllers/otp.controller.js';

const router = Router();

// POST /api/otp/send  — send OTP to parent email
router.post('/send', sendOTPController);

// POST /api/otp/verify — verify the OTP
router.post('/verify', verifyOTPController);

// POST /api/otp/check-duplicate — check if email/phone already registered
router.post('/check-duplicate', checkDuplicateController);

export default router;
