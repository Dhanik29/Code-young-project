import { prisma } from '../db.js';
import {
  DEFAULT_TRIAL_SLOT_HOURS,
  MENTOR_WORK_START_HOUR_IST,
  MENTOR_WORK_END_HOUR_IST,
} from '../config/constants.js';
import {
  parseLocalToUTC,
  isFutureDateTime,
  getMentorDayBoundariesUTC,
} from '../utils/timezone.js';
import { DateTime } from 'luxon';

/**
 * Calculates available time slots for a given date in the parent's timezone,
 * evaluating mentor working hours (9 AM - 9 PM IST), mentor workload limits (2 classes/day),
 * and slot conflicts in real-time.
 * 
 * @param {string} dateStr - 'YYYY-MM-DD'
 * @param {string} parentTimezone - e.g. 'America/New_York'
 * @returns {Promise<{ date: string, timezone: string, slots: Array, totalAvailableSlots: number, isDayFullyBooked: boolean, suggestedNextDate: string|null }>}
 */
export const getAvailableSlots = async (dateStr, parentTimezone) => {
  const mentors = await prisma.mentor.findMany({
    orderBy: { name: 'asc' },
  });

  const slotsResult = [];
  let availableSlotCount = 0;
  let allSlotsOutsideOrFull = true;

  for (const slotHour of DEFAULT_TRIAL_SLOT_HOURS) {
    let utcDateTime;
    let isValidSlotTime = true;
    let validationErrorReason = null;

    try {
      utcDateTime = parseLocalToUTC(dateStr, slotHour, parentTimezone);
    } catch (err) {
      isValidSlotTime = false;
      validationErrorReason = err.message || 'Invalid time slot in selected timezone (DST gap)';
    }

    // Format human readable label (e.g. "09:00 AM" or "02:00 PM")
    const hourNum = parseInt(slotHour.split(':')[0], 10);
    const minuteStr = slotHour.split(':')[1];
    const ampm = hourNum >= 12 ? 'PM' : 'AM';
    const displayHour = hourNum % 12 === 0 ? 12 : hourNum % 12;
    const label = `${String(displayHour).padStart(2, '0')}:${minuteStr} ${ampm}`;

    if (!isValidSlotTime) {
      slotsResult.push({
        time: slotHour,
        label,
        isAvailable: false,
        availableMentorsCount: 0,
        reason: validationErrorReason,
      });
      continue;
    }

    // 1. Check if slot is in the past
    if (!isFutureDateTime(utcDateTime, 15)) {
      slotsResult.push({
        time: slotHour,
        label,
        isAvailable: false,
        availableMentorsCount: 0,
        reason: 'Slot is in the past or starts in less than 15 minutes',
      });
      continue;
    }

    // 2. Check Mentor Working Hours in Asia/Kolkata (9:00 AM - 9:00 PM IST)
    const mentorDt = utcDateTime.setZone('Asia/Kolkata');
    const mentorHour = mentorDt.hour;
    if (
      mentorHour < MENTOR_WORK_START_HOUR_IST ||
      mentorHour >= MENTOR_WORK_END_HOUR_IST
    ) {
      slotsResult.push({
        time: slotHour,
        label,
        isAvailable: false,
        availableMentorsCount: 0,
        reason: `Outside mentor working hours (${mentorDt.toFormat('hh:mm a')} IST). Mentors are active 9:00 AM - 9:00 PM IST.`,
      });
      continue;
    }

    const slotTargetJSDate = utcDateTime.toJSDate();
    const { startOfDayUTC, endOfDayUTC } = getMentorDayBoundariesUTC(
      utcDateTime,
      'Asia/Kolkata'
    );

    // Fetch all bookings for this slot's mentor day in batch
    const dayBookings = await prisma.booking.findMany({
      where: {
        bookingDateUTC: {
          gte: startOfDayUTC,
          lte: endOfDayUTC,
        },
      },
      select: {
        mentorId: true,
        bookingDateUTC: true,
      },
    });

    const dailyCountByMentor = {};
    const busyMentorIdsAtSlot = new Set();
    for (const b of dayBookings) {
      dailyCountByMentor[b.mentorId] = (dailyCountByMentor[b.mentorId] || 0) + 1;
      if (new Date(b.bookingDateUTC).getTime() === slotTargetJSDate.getTime()) {
        busyMentorIdsAtSlot.add(b.mentorId);
      }
    }

    let availableMentorsCount = 0;
    let mentorsWithDailyQuotaLeft = 0;

    for (const mentor of mentors) {
      const count = dailyCountByMentor[mentor.id] || 0;
      if (count < mentor.dailyLimit) {
        mentorsWithDailyQuotaLeft++;
        if (!busyMentorIdsAtSlot.has(mentor.id)) {
          availableMentorsCount++;
        }
      }
    }

    const isAvailable = availableMentorsCount > 0;
    if (isAvailable) {
      availableSlotCount++;
      allSlotsOutsideOrFull = false;
    }

    let reason = null;
    if (!isAvailable) {
      if (mentorsWithDailyQuotaLeft === 0) {
        reason = 'All mentors have reached their daily limit of 2 classes for this date';
      } else {
        reason = 'All available mentors are already booked for this specific time slot';
      }
    }

    slotsResult.push({
      time: slotHour,
      label,
      mentorLocalTimeIST: mentorDt.toFormat('hh:mm a IST'),
      isAvailable,
      availableMentorsCount,
      reason,
    });
  }

  // Calculate suggested next date if this date has no available slots
  let suggestedNextDate = null;
  if (availableSlotCount === 0) {
    try {
      const requestedDateObj = DateTime.fromISO(dateStr, { zone: parentTimezone });
      if (requestedDateObj.isValid) {
        suggestedNextDate = requestedDateObj.plus({ days: 1 }).toISODate();
      }
    } catch (e) {
      // ignore date calculation fallback
    }
  }

  return {
    date: dateStr,
    timezone: parentTimezone,
    slots: slotsResult,
    totalAvailableSlots: availableSlotCount,
    isDayFullyBooked: availableSlotCount === 0,
    suggestedNextDate,
  };
};
