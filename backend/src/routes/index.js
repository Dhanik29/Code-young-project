import { Router } from 'express';
import healthRoutes from './health.routes.js';
import mentorRoutes from './mentor.routes.js';
import slotRoutes from './slot.routes.js';
import bookingRoutes from './booking.routes.js';
import otpRoutes from './otp.routes.js';

const router = Router();

router.use('/health', healthRoutes);
router.use('/mentors', mentorRoutes);
router.use('/slots', slotRoutes);
router.use('/book', bookingRoutes);
router.use('/bookings', bookingRoutes);
router.use('/otp', otpRoutes);

export default router;
