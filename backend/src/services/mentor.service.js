import { prisma } from '../db.js';

export const getAllMentors = async () => {
  const mentors = await prisma.mentor.findMany({
    orderBy: { name: 'asc' },
    include: {
      _count: {
        select: { bookings: true },
      },
    },
  });

  return mentors.map((m) => ({
    id: m.id,
    name: m.name,
    email: m.email,
    timezone: m.timezone,
    dailyLimit: m.dailyLimit,
    totalBookings: m._count.bookings,
    createdAt: m.createdAt,
  }));
};

export const getMentorById = async (id) => {
  return prisma.mentor.findUnique({
    where: { id },
    include: {
      bookings: {
        orderBy: { bookingDateUTC: 'asc' },
      },
    },
  });
};
