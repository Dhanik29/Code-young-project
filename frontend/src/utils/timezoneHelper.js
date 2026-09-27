/**
 * Timezone calculation and formatting helpers for Codeyoung Trial Class System
 */

const TIMEZONE_LABELS = {
  'America/New_York': 'US – EST / EDT',
  'America/Chicago': 'US – CST / CDT',
  'America/Denver': 'US – MST / MDT',
  'America/Los_Angeles': 'US – PST / PDT',
  'Europe/London': 'UK – GMT / BST',
  'Asia/Kolkata': 'India – IST',
  'Asia/Dubai': 'UAE – GST',
  'Asia/Singapore': 'Singapore – SGT',
  'Australia/Sydney': 'Australia – AEST',
};

export const getTimezoneLabel = (tz) => TIMEZONE_LABELS[tz] || tz;

/**
 * Calculates parent time and corresponding mentor IST time given date, time slot, and parent timezone.
 * Correctly handles next-day rollover for IST when conversion crosses midnight.
 */
export const calculateDualTimes = (dateStr, timeStr, parentTimezone = 'America/New_York') => {
  if (!dateStr || !timeStr) {
    return {
      parentTime: '12:00 PM',
      mentorTime: '9:30 PM',
      parentDateFormatted: '',
      mentorDateFormatted: '',
      mentorDateLabel: '',
      fullDateLong: '',
    };
  }

  try {
    const [h, m] = timeStr.split(':').map(Number);
    const hour = isNaN(h) ? 12 : h;
    const min = isNaN(m) ? 0 : m;

    // IST offset above various parent timezones (in minutes, adding to parent time → IST)
    // These are approximate daylight-adjusted values for the region:
    // EDT (UTC-4) → IST (UTC+5:30) = +9h30m = +570 min
    // EST (UTC-5) → IST           = +10h30m = +630 min
    // CDT (UTC-5) → IST           = +10h30m = +630 min
    // MDT (UTC-6) → IST           = +11h30m = +690 min
    // PDT (UTC-7) → IST           = +12h30m = +750 min
    // BST (UTC+1) → IST           = +4h30m  = +270 min
    // GMT (UTC+0) → IST           = +5h30m  = +330 min

    let offsetMinutes = 570; // default EDT
    if (parentTimezone.includes('New_York')) offsetMinutes = 570;  // EDT approx
    else if (parentTimezone.includes('Chicago')) offsetMinutes = 630;
    else if (parentTimezone.includes('Denver')) offsetMinutes = 690;
    else if (parentTimezone.includes('Los_Angeles')) offsetMinutes = 750;
    else if (parentTimezone.includes('London')) offsetMinutes = 270;  // BST approx
    else offsetMinutes = 570;

    const parentTotalMin = hour * 60 + min;
    let mentorTotalMin = parentTotalMin + offsetMinutes;

    // How many days forward does IST fall?
    const dayShift = Math.floor(mentorTotalMin / (24 * 60));
    const mentorDayMin = mentorTotalMin % (24 * 60);
    const mentorHour = Math.floor(mentorDayMin / 60);
    const mentorMin = mentorDayMin % 60;

    // Format parent time (12h)
    const pPeriod = hour >= 12 ? 'PM' : 'AM';
    const pH12 = hour % 12 === 0 ? 12 : hour % 12;
    const parentTimeFormatted = `${pH12}:${String(min).padStart(2, '0')} ${pPeriod}`;

    // Format mentor time (12h)
    const mPeriod = mentorHour >= 12 ? 'PM' : 'AM';
    const mH12 = mentorHour % 12 === 0 ? 12 : mentorHour % 12;
    const mentorTimeFormatted = `${mH12}:${String(mentorMin).padStart(2, '0')} ${mPeriod}`;

    // Format parent date
    const dObj = new Date(dateStr + 'T00:00:00');
    const optLong = { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' };
    const optShort = { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' };

    const fullDateLong = isNaN(dObj.getTime()) ? dateStr : dObj.toLocaleDateString('en-US', optLong);
    const parentDateFormatted = isNaN(dObj.getTime()) ? dateStr : dObj.toLocaleDateString('en-US', optShort);

    // Compute mentor date (add dayShift days)
    const mentorDate = new Date(dObj);
    mentorDate.setDate(mentorDate.getDate() + dayShift);
    const mentorDateFormatted = isNaN(mentorDate.getTime()) ? dateStr : mentorDate.toLocaleDateString('en-US', optShort);

    // Label for the mentor date line — if next day show "(next day)"
    const mentorDateLabel = dayShift > 0 ? `${mentorDateFormatted} (+${dayShift} day)` : mentorDateFormatted;

    return {
      parentTime: parentTimeFormatted,
      mentorTime: mentorTimeFormatted,
      parentDateFormatted,
      mentorDateFormatted,
      mentorDateLabel,
      fullDateLong,
    };
  } catch (err) {
    return {
      parentTime: timeStr,
      mentorTime: '9:30 PM',
      parentDateFormatted: dateStr,
      mentorDateFormatted: dateStr,
      mentorDateLabel: dateStr,
      fullDateLong: dateStr,
    };
  }
};

