export const SUPPORTED_TIMEZONES = [
  'America/New_York',      // US Eastern Time (ET)
  'America/Chicago',       // US Central Time (CT)
  'America/Denver',        // US Mountain Time (MT)
  'America/Los_Angeles',   // US Pacific Time (PT)
  'Europe/London',         // UK London (GMT/BST)
  'Asia/Kolkata',          // India (IST)
  'Asia/Dubai',            // UAE (GST)
  'Asia/Singapore',        // Singapore (SGT)
  'Australia/Sydney',      // Australia Eastern (AEST/AEDT)
  'America/Toronto',       // Canada Eastern Time
  'America/Vancouver'      // Canada Pacific Time
];

export const SUPPORTED_COUNTRIES = [
  'United States',
  'United Kingdom',
  'Canada',
  'Australia',
  'India',
  'United Arab Emirates',
  'Singapore',
  'Germany',
  'France',
  'Ireland',
  'New Zealand'
];

export const SUPPORTED_COURSES = [
  'Math Mystery',
  'Coding & AI',
  'English',
  'Science',
  'Vedic / Speed Math',
];

export const MENTOR_DEFAULT_TIMEZONE = 'Asia/Kolkata';
export const MENTOR_DAILY_BOOKING_LIMIT = 2;
export const TOTAL_MENTORS_COUNT = 10;
export const SLOT_DURATION_MINUTES = 60;

// Mentor Working Hours (Asia/Kolkata IST): 8:00 AM to 11:00 PM IST (accommodates US & UK trial slots)
export const MENTOR_WORK_START_HOUR_IST = 8;  // 08:00 IST
export const MENTOR_WORK_END_HOUR_IST = 23;    // 23:00 IST

// Standard parent local slots offered for trial classes (9 AM to 8 PM)
export const DEFAULT_TRIAL_SLOT_HOURS = [
  '09:00',
  '10:00',
  '11:00',
  '12:00',
  '13:00',
  '14:00',
  '15:00',
  '16:00',
  '17:00',
  '18:00',
  '19:00',
  '20:00'
];
