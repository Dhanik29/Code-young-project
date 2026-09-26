import { customAlphabet } from 'nanoid';
import { env } from '../config/env.js';

// Clean alphanumeric character set avoiding confusing characters like 0/O, 1/I
const nanoid = customAlphabet('23456789ABCDEFGHJKLMNPQRSTUVWXYZ', 8);

export const generateMeetingLink = (bookingId) => {
  const code = nanoid();
  return `${env.MEETING_BASE_URL}/${code}`;
};
