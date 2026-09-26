import { getAvailableSlots } from '../services/slot.service.js';
import { sendSuccess } from '../utils/response.js';

export const listSlots = async (req, res, next) => {
  try {
    const { date, timezone } = req.query;
    // getAvailableSlots returns { date, timezone, slots, totalAvailableSlots, isDayFullyBooked, suggestedNextDate }
    const result = await getAvailableSlots(date, timezone);
    return sendSuccess(res, result, 200, 'Available slots calculated successfully');
  } catch (error) {
    next(error);
  }
};
