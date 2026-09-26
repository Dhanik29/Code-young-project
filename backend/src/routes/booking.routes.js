import { Router } from 'express';
import { createBooking, listBookings, getBookingById } from '../controllers/booking.controller.js';
import { validateRequest } from '../middleware/validateRequest.js';
import { bookingSchema } from '../validators/booking.validator.js';

const router = Router();

// POST /api/bookings  (also aliased as /api/book in app.js)
router.post('/', validateRequest(bookingSchema, 'body'), createBooking);

// GET /api/bookings
router.get('/', listBookings);

// GET /api/bookings/:id
router.get('/:id', getBookingById);

export default router;
