import {
  createBookingService,
  getAllBookingsService,
  getBookingByIdService,
} from '../services/booking.service.js';
import { sendSuccess } from '../utils/response.js';

export const createBooking = async (req, res, next) => {
  try {
    const booking = await createBookingService(req.body);
    return sendSuccess(res, booking, 201, 'Trial class booked successfully');
  } catch (error) {
    next(error);
  }
};

export const listBookings = async (req, res, next) => {
  try {
    const bookings = await getAllBookingsService();
    return sendSuccess(res, bookings, 200, 'Bookings fetched successfully');
  } catch (error) {
    next(error);
  }
};

export const getBookingById = async (req, res, next) => {
  try {
    const booking = await getBookingByIdService(req.params.id);
    return sendSuccess(res, booking, 200, 'Booking fetched successfully');
  } catch (error) {
    next(error);
  }
};
