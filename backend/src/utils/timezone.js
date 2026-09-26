import { DateTime, IANAZone } from 'luxon';
import { ApiError } from './apiError.js';
import { MENTOR_DEFAULT_TIMEZONE } from '../config/constants.js';

/**
 * Validates if the given timezone string is a valid IANA timezone name.
 * Uses Luxon's IANAZone.isValidZone.
 * @param {string} timezone 
 * @returns {boolean}
 */
export const isValidTimezone = (timezone) => {
  if (!timezone || typeof timezone !== 'string') return false;
  return IANAZone.isValidZone(timezone.trim());
};

/**
 * Parses local date ('YYYY-MM-DD') and local time ('HH:mm') in a specific timezone,
 * validates against DST gaps/ambiguities, and converts into a Luxon DateTime in UTC.
 * 
 * Luxon handles Daylight Saving Time (DST) automatically:
 * e.g., in US ET, during spring forward (2:00 AM -> 3:00 AM), 2:30 AM does not exist;
 * Luxon's isValid detects this immediately.
 * 
 * @param {string} dateStr - 'YYYY-MM-DD'
 * @param {string} timeStr - 'HH:mm'
 * @param {string} timezone - e.g. 'America/New_York'
 * @returns {DateTime} Luxon DateTime in UTC zone
 */
export const parseLocalToUTC = (dateStr, timeStr, timezone) => {
  if (!isValidTimezone(timezone)) {
    throw ApiError.badRequest(`Invalid or unsupported IANA timezone: "${timezone}"`);
  }

  // Parse ISO string in the specified timezone
  const isoLocalString = `${dateStr}T${timeStr}:00`;
  const localDateTime = DateTime.fromISO(isoLocalString, { zone: timezone });

  if (!localDateTime.isValid) {
    throw ApiError.badRequest(
      `Invalid local date/time: ${localDateTime.invalidReason || 'Date/time does not exist in the specified timezone (check DST gap).'}`
    );
  }

  // Convert to UTC
  return localDateTime.toUTC();
};

/**
 * Formats a UTC timestamp into a rich, human-readable local time string
 * for any target timezone with full weekday, month, day, year, time (12-hour AM/PM),
 * timezone abbreviation (e.g., EDT, GMT, IST), and offset (e.g., UTC-4, UTC+5:30).
 * 
 * Example output: "Friday, Oct 16, 2026, 09:00 PM EDT (UTC-4)"
 * 
 * @param {Date|string|DateTime} utcInput 
 * @param {string} targetTimezone 
 * @returns {string}
 */
export const formatInTimezone = (utcInput, targetTimezone) => {
  let dt;
  if (DateTime.isDateTime(utcInput)) {
    dt = utcInput.setZone(targetTimezone);
  } else if (utcInput instanceof Date) {
    dt = DateTime.fromJSDate(utcInput, { zone: 'utc' }).setZone(targetTimezone);
  } else {
    dt = DateTime.fromISO(utcInput, { zone: 'utc' }).setZone(targetTimezone);
  }

  if (!dt.isValid) {
    return 'Invalid Date';
  }

  // Format: "Friday, Oct 16, 2026, 07:00 PM EDT (UTC-4)"
  const dateFormatted = dt.toFormat('cccc, LLL dd, yyyy, hh:mm a');
  const zoneName = dt.offsetNameShort || dt.zoneName;
  const offsetFormatted = dt.toFormat('ZZZZ'); // e.g. "UTC-4" or "UTC+5:30"

  return `${dateFormatted} ${zoneName} (${offsetFormatted})`;
};

/**
 * Calculates the start and end of a mentor's calendar day in UTC.
 * 
 * This is crucial for handling midnight crossover:
 * When a parent in New York books at 9:00 PM EDT on Oct 15, in Asia/Kolkata it is
 * 6:30 AM on Oct 16.
 * The mentor's daily limit belongs to Oct 16 in Asia/Kolkata.
 * This function returns the UTC Date objects for 00:00:00.000 to 23:59:59.999 of
 * that mentor's local calendar day.
 * 
 * @param {DateTime|Date|string} utcInput 
 * @param {string} mentorTimezone 
 * @returns {{ startOfDayUTC: Date, endOfDayUTC: Date, mentorDateString: string }}
 */
export const getMentorDayBoundariesUTC = (utcInput, mentorTimezone = MENTOR_DEFAULT_TIMEZONE) => {
  let utcDt;
  if (DateTime.isDateTime(utcInput)) {
    utcDt = utcInput;
  } else if (utcInput instanceof Date) {
    utcDt = DateTime.fromJSDate(utcInput, { zone: 'utc' });
  } else {
    utcDt = DateTime.fromISO(utcInput, { zone: 'utc' });
  }

  // View the moment from the mentor's timezone perspective
  const mentorDt = utcDt.setZone(mentorTimezone);
  const mentorDateString = mentorDt.toISODate(); // 'YYYY-MM-DD'

  // Boundaries of that local day in mentor's timezone, converted back to UTC
  const startOfDayUTC = mentorDt.startOf('day').toUTC().toJSDate();
  const endOfDayUTC = mentorDt.endOf('day').toUTC().toJSDate();

  return {
    startOfDayUTC,
    endOfDayUTC,
    mentorDateString,
  };
};

/**
 * Checks if a UTC DateTime is at least `bufferMinutes` in the future.
 * Prevents booking slots in the past or immediately before start.
 * 
 * @param {DateTime} utcDateTime 
 * @param {number} bufferMinutes 
 * @returns {boolean}
 */
export const isFutureDateTime = (utcDateTime, bufferMinutes = 15) => {
  const nowUTC = DateTime.utc();
  return utcDateTime > nowUTC.plus({ minutes: bufferMinutes });
};
