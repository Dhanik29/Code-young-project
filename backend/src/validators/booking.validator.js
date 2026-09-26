import { z } from 'zod';
import { isValidTimezone, parseLocalToUTC, isFutureDateTime } from '../utils/timezone.js';
import { SUPPORTED_TIMEZONES, DEFAULT_TRIAL_SLOT_HOURS } from '../config/constants.js';

export const bookingSchema = z.object({
  name: z
    .string({ required_error: 'Parent name is required' })
    .trim()
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name cannot exceed 100 characters'),

  email: z
    .string({ required_error: 'Parent email is required' })
    .trim()
    .email('Invalid email address format')
    .toLowerCase(),

  course: z
    .enum(['Coding', 'Mathematics', 'English', 'AI & Robotics', 'Public Speaking'], {
      required_error: 'Course selection is required',
      invalid_type_error: 'Selected course is not supported',
    }),

  country: z
    .string({ required_error: 'Country is required' })
    .trim()
    .min(2, 'Country must be at least 2 characters')
    .max(100, 'Country cannot exceed 100 characters'),

  timezone: z
    .string({ required_error: 'Timezone is required' })
    .trim()
    .refine((tz) => isValidTimezone(tz), {
      message: 'Invalid IANA timezone identifier (e.g. "America/New_York", "Europe/London")',
    }),

  date: z
    .string({ required_error: 'Booking date is required' })
    .trim()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format'),

  time: z
    .string({ required_error: 'Booking time slot is required' })
    .trim()
    .regex(/^([01]\d|2[0-3]):[0-5]\d$/, 'Time must be in HH:mm 24-hour format (e.g. "14:00")'),
}).superRefine((data, ctx) => {
  try {
    const utcDateTime = parseLocalToUTC(data.date, data.time, data.timezone);
    if (!isFutureDateTime(utcDateTime, 15)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['date'],
        message: 'Booking slot must be scheduled at least 15 minutes into the future.',
      });
    }

    // Verify slot falls within Mentor working hours: 09:00 to 21:00 IST
    const mentorDt = utcDateTime.setZone('Asia/Kolkata');
    if (mentorDt.hour < 9 || mentorDt.hour >= 21) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['time'],
        message: `The selected time maps to ${mentorDt.toFormat('hh:mm a')} IST, which is outside mentor working hours (9:00 AM - 9:00 PM IST).`,
      });
    }
  } catch (err) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ['time'],
      message: err.message || 'The specified date/time slot is invalid for the selected timezone.',
    });
  }
});

export const slotQuerySchema = z.object({
  date: z
    .string({ required_error: 'Date query parameter is required (YYYY-MM-DD)' })
    .trim()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format'),

  timezone: z
    .string({ required_error: 'Timezone query parameter is required' })
    .trim()
    .refine((tz) => isValidTimezone(tz), {
      message: 'Invalid IANA timezone identifier',
    }),
});
