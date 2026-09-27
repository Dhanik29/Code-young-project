import { prisma } from '../db.js';
import { ApiError } from '../utils/apiError.js';
import {
  parseLocalToUTC,
  formatInTimezone,
  getMentorDayBoundariesUTC,
  isFutureDateTime,
} from '../utils/timezone.js';
import { generateMeetingLink } from '../utils/meetingLink.js';
import { sendBookingConfirmationEmails } from './email.service.js';

/**
 * Creates a trial class booking using a deterministic first-available and lowest-booking strategy.
 *
 * Rules:
 * 1. Exactly 10 mentors available (seeded in Asia/Kolkata).
 * 2. Each mentor can take a maximum of 2 trial classes per local calendar day (IST).
 * 3. All booking dates stored internally in UTC only.
 * 4. Deterministic assignment:
 *    - Filters mentors free at requested slot.
 *    - Filters mentors who haven't reached daily limit (count < dailyLimit) on mentor's calendar day.
 *    - Sorts by least daily bookings (lowest-booking strategy), then alphabetically by mentor name.
 *    - If all mentors are busy or reached limit, returns HTTP 409 Conflict.
 * 5. Generates unique meeting link.
 * 6. Returns localized, human-formatted time for both parent and mentor.
 *
 * @param {Object} bookingInput
 */
export const createBookingService = async (bookingInput) => {
  const { name, email, country, timezone, date, time, course } = bookingInput;

  // 1. Convert parent's local time to UTC DateTime
  const utcDateTime = parseLocalToUTC(date, time, timezone);

  // 2. Validate future date (at least 15 minutes ahead)
  if (!isFutureDateTime(utcDateTime, 15)) {
    throw ApiError.badRequest('Booking slot must be scheduled at least 15 minutes into the future.');
  }

  const targetUTCJSDate = utcDateTime.toJSDate();

  // 3. Fetch all mentors deterministically
  let mentors = await prisma.mentor.findMany({
    orderBy: { name: 'asc' },
  });

  if (!mentors || mentors.length === 0) {
    console.log('🌱 No mentors found during booking. Auto-seeding mentors now...');
    const { seedMentors } = await import('../../prisma/seed.js');
    await seedMentors(prisma);
    mentors = await prisma.mentor.findMany({
      orderBy: { name: 'asc' },
    });
  }

  // 4. Evaluate each mentor for conflict and daily limit
  const eligibleMentors = [];
  let slotConflictCount = 0; // how many mentors are busy at this exact slot
  let dailyLimitCount = 0;   // how many mentors hit daily limit

  for (const mentor of mentors) {
    // Mentor's local calendar day start and end in UTC
    const { startOfDayUTC, endOfDayUTC, mentorDateString } = getMentorDayBoundariesUTC(
      utcDateTime,
      mentor.timezone
    );

    // Check if mentor has a slot conflict at this exact time
    const conflictingBooking = await prisma.booking.findFirst({
      where: {
        mentorId: mentor.id,
        bookingDateUTC: targetUTCJSDate,
      },
    });

    if (conflictingBooking) {
      slotConflictCount++;
      continue; // Mentor is busy at this slot
    }

    // Check daily booking count for this mentor on their local calendar day (IST)
    const dailyBookingCount = await prisma.booking.count({
      where: {
        mentorId: mentor.id,
        bookingDateUTC: {
          gte: startOfDayUTC,
          lte: endOfDayUTC,
        },
      },
    });

    if (dailyBookingCount < mentor.dailyLimit) {
      eligibleMentors.push({
        mentor,
        dayBookingCount: dailyBookingCount,
        mentorDateString,
      });
    } else {
      dailyLimitCount++;
    }
  }

  // 5. If no mentor is eligible, throw 409 Conflict with a specific reason
  if (eligibleMentors.length === 0) {
    // All mentors are slot-conflicted (every mentor already booked at this exact time)
    if (slotConflictCount === mentors.length) {
      throw ApiError.conflict(
        'This slot was just booked by someone else. Please choose another time slot.'
      );
    }
    // All remaining mentors hit daily limit
    if (dailyLimitCount + slotConflictCount >= mentors.length) {
      throw ApiError.conflict(
        'All mentors have reached their daily class limit (2 classes/day IST) for this date. Please try a different date.'
      );
    }
    // Generic fallback
    throw ApiError.conflict(
      'No mentors available for this slot. Please choose a different date or time.'
    );
  }

  // 6. Sort eligible mentors:
  // Primary: Lowest bookings on that day (load balancing)
  // Secondary: Mentor name ascending (deterministic first-available)
  eligibleMentors.sort((a, b) => {
    if (a.dayBookingCount !== b.dayBookingCount) {
      return a.dayBookingCount - b.dayBookingCount;
    }
    return a.mentor.name.localeCompare(b.mentor.name);
  });

  const selectedCandidate = eligibleMentors[0];
  const assignedMentor = selectedCandidate.mentor;

  // 7. Atomic database transaction — re-check availability to guard against race conditions
  const meetingLink = generateMeetingLink();

  const createdBooking = await prisma.$transaction(async (tx) => {
    // Race-condition guard: re-check the slot inside the transaction
    const raceConflict = await tx.booking.findFirst({
      where: {
        mentorId: assignedMentor.id,
        bookingDateUTC: targetUTCJSDate,
      },
    });

    if (raceConflict) {
      throw ApiError.conflict(
        'This slot was just taken by another booking. Please select a different time.'
      );
    }

    // Upsert parent record
    let parent = await tx.parent.findFirst({
      where: { email: email.toLowerCase() },
    });

    if (!parent) {
      parent = await tx.parent.create({
        data: {
          name,
          email: email.toLowerCase(),
          phone: bookingInput.phone ? bookingInput.phone.trim() : null,
          country,
          timezone,
        },
      });
    } else {
      parent = await tx.parent.update({
        where: { id: parent.id },
        data: {
          name,
          phone: bookingInput.phone ? bookingInput.phone.trim() : parent.phone,
          country,
          timezone,
        },
      });
    }

    // Create booking record with internal UTC time and selected course
    const booking = await tx.booking.create({
      data: {
        parentId: parent.id,
        mentorId: assignedMentor.id,
        course: course || 'Coding',
        bookingDateUTC: targetUTCJSDate,
        parentTimezone: timezone,
        mentorTimezone: assignedMentor.timezone,
        meetingLink,
      },
      include: {
        mentor: true,
        parent: true,
      },
    });

    return booking;
  });

  // 8. Format local times for both parent and mentor
  const parentFormattedTime = formatInTimezone(createdBooking.bookingDateUTC, createdBooking.parentTimezone);
  const mentorFormattedTime = formatInTimezone(createdBooking.bookingDateUTC, createdBooking.mentorTimezone);

  const result = {
    bookingId: createdBooking.id,
    course: createdBooking.course,
    meetingLink: createdBooking.meetingLink,
    bookingDateUTC: createdBooking.bookingDateUTC.toISOString(),
    parent: {
      id: createdBooking.parent.id,
      name: createdBooking.parent.name,
      email: createdBooking.parent.email,
      country: createdBooking.parent.country,
      timezone: createdBooking.parent.timezone,
      formattedTime: parentFormattedTime,
    },
    mentor: {
      id: createdBooking.mentor.id,
      name: createdBooking.mentor.name,
      email: createdBooking.mentor.email,
      timezone: createdBooking.mentor.timezone,
      formattedTime: mentorFormattedTime,
      assignedDayBookingCount: selectedCandidate.dayBookingCount + 1,
    },
    createdAt: createdBooking.createdAt,
  };

  // 9. Send confirmation emails (non-blocking — failure does not cancel booking)
  sendBookingConfirmationEmails({
    course: result.course,
    meetingLink: result.meetingLink,
    bookingId: result.bookingId,
    bookingDateUTC: result.bookingDateUTC,
    childName: bookingInput.childName || null,
    childGrade: bookingInput.childGrade || null,
    city: bookingInput.city || null,
    schoolName: bookingInput.schoolName || null,
    parent: {
      name: result.parent.name,
      email: result.parent.email,
      country: result.parent.country,
      timezone: result.parent.timezone,
      formattedTime: result.parent.formattedTime,
    },
    mentor: {
      name: result.mentor.name,
      email: result.mentor.email,
      formattedTime: result.mentor.formattedTime,
    },
  }).catch((err) => {
    console.error('⚠️ Email sending failed (non-blocking):', err.message);
  });

  return result;
};

/**
 * Retrieves booking by ID with formatted local timestamps.
 */
export const getBookingByIdService = async (bookingId) => {
  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: { parent: true, mentor: true },
  });

  if (!booking) {
    throw ApiError.notFound(`Booking with ID "${bookingId}" not found.`);
  }

  return {
    id: booking.id,
    course: booking.course,
    meetingLink: booking.meetingLink,
    bookingDateUTC: booking.bookingDateUTC.toISOString(),
    parentTimezone: booking.parentTimezone,
    mentorTimezone: booking.mentorTimezone,
    parentFormattedTime: formatInTimezone(booking.bookingDateUTC, booking.parentTimezone),
    mentorFormattedTime: formatInTimezone(booking.bookingDateUTC, booking.mentorTimezone),
    parent: {
      id: booking.parent.id,
      name: booking.parent.name,
      email: booking.parent.email,
      country: booking.parent.country,
      timezone: booking.parent.timezone,
    },
    mentor: {
      id: booking.mentor.id,
      name: booking.mentor.name,
      email: booking.mentor.email,
      timezone: booking.mentor.timezone,
    },
    createdAt: booking.createdAt,
  };
};

/**
 * Retrieves all bookings with formatted local timestamps for parents and mentors.
 */
export const getAllBookingsService = async () => {
  const bookings = await prisma.booking.findMany({
    orderBy: { bookingDateUTC: 'desc' },
    include: {
      parent: true,
      mentor: true,
    },
  });

  return bookings.map((b) => ({
    id: b.id,
    course: b.course,
    meetingLink: b.meetingLink,
    bookingDateUTC: b.bookingDateUTC.toISOString(),
    parentTimezone: b.parentTimezone,
    mentorTimezone: b.mentorTimezone,
    parentFormattedTime: formatInTimezone(b.bookingDateUTC, b.parentTimezone),
    mentorFormattedTime: formatInTimezone(b.bookingDateUTC, b.mentorTimezone),
    parent: {
      id: b.parent.id,
      name: b.parent.name,
      email: b.parent.email,
      country: b.parent.country,
      timezone: b.parent.timezone,
    },
    mentor: {
      id: b.mentor.id,
      name: b.mentor.name,
      email: b.mentor.email,
      timezone: b.mentor.timezone,
    },
    createdAt: b.createdAt,
  }));
};
