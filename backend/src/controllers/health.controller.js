import { prisma } from '../db.js';
import { sendSuccess } from '../utils/response.js';

export const getHealth = async (req, res, next) => {
  try {
    let dbStatus = 'ok';
    let mentorCount = 0;
    let dbError = null;
    try {
      mentorCount = await prisma.mentor.count();
    } catch (e) {
      dbStatus = 'disconnected';
      dbError = e.message;
    }

    return sendSuccess(res, {
      status: 'UP',
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
      database: dbStatus,
      dbError,
      totalMentors: mentorCount,
      environment: process.env.NODE_ENV || 'development',
    }, 200, 'Server is running smoothly');
  } catch (error) {
    next(error);
  }
};
