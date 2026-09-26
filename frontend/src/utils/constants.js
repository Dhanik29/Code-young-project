export const TIMEZONES = [
  { value: 'America/New_York', label: 'America / New York (Eastern Time - ET)' },
  { value: 'America/Chicago', label: 'America / Chicago (Central Time - CT)' },
  { value: 'America/Denver', label: 'America / Denver (Mountain Time - MT)' },
  { value: 'America/Los_Angeles', label: 'America / Los Angeles (Pacific Time - PT)' },
  { value: 'Europe/London', label: 'Europe / London (GMT / BST)' },
  { value: 'Asia/Kolkata', label: 'Asia / Kolkata (India Standard Time - IST)' },
  { value: 'Asia/Dubai', label: 'Asia / Dubai (Gulf Standard Time - GST)' },
  { value: 'Asia/Singapore', label: 'Asia / Singapore (SGT)' },
  { value: 'Australia/Sydney', label: 'Australia / Sydney (AEST / AEDT)' },
  { value: 'America/Toronto', label: 'America / Toronto (Canada Eastern)' },
  { value: 'America/Vancouver', label: 'America / Vancouver (Canada Pacific)' },
];

export const COUNTRIES = [
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

export const COURSES = [
  'Coding',
  'Mathematics',
  'English',
  'AI & Robotics',
  'Public Speaking',
];

export const DETECTED_TIMEZONE = (() => {
  try {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const match = TIMEZONES.find((t) => t.value === tz);
    return match ? match.value : 'America/New_York';
  } catch (e) {
    return 'America/New_York';
  }
})();
