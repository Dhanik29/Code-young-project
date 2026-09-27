import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const SEED_MENTORS = [
  {
    name: 'Priya Sharma',
    email: 'priya.sharma@codeyoung.com',
    timezone: 'Asia/Kolkata',
    dailyLimit: 2,
  },
  {
    name: 'Rahul Verma',
    email: 'rahul.verma@codeyoung.com',
    timezone: 'Asia/Kolkata',
    dailyLimit: 2,
  },
  {
    name: 'Ananya Iyer',
    email: 'ananya.iyer@codeyoung.com',
    timezone: 'Asia/Kolkata',
    dailyLimit: 2,
  },
  {
    name: 'Amit Patel',
    email: 'amit.patel@codeyoung.com',
    timezone: 'Asia/Kolkata',
    dailyLimit: 2,
  },
  {
    name: 'Sneha Reddy',
    email: 'sneha.reddy@codeyoung.com',
    timezone: 'Asia/Kolkata',
    dailyLimit: 2,
  },
  {
    name: 'Vikram Malhotra',
    email: 'vikram.malhotra@codeyoung.com',
    timezone: 'Asia/Kolkata',
    dailyLimit: 2,
  },
  {
    name: 'Pooja Nair',
    email: 'pooja.nair@codeyoung.com',
    timezone: 'Asia/Kolkata',
    dailyLimit: 2,
  },
  {
    name: 'Rohan Kulkarni',
    email: 'rohan.kulkarni@codeyoung.com',
    timezone: 'Asia/Kolkata',
    dailyLimit: 2,
  },
  {
    name: 'Divya Sen',
    email: 'divya.sen@codeyoung.com',
    timezone: 'Asia/Kolkata',
    dailyLimit: 2,
  },
  {
    name: 'Arjun Kapoor',
    email: 'arjun.kapoor@codeyoung.com',
    timezone: 'Asia/Kolkata',
    dailyLimit: 2,
  },
];

export async function seedMentors(dbClient = prisma) {
  console.log('🌱 Starting database seeding...');

  let createdCount = 0;
  for (const mentor of SEED_MENTORS) {
    const existing = await dbClient.mentor.findUnique({
      where: { email: mentor.email },
    });

    if (!existing) {
      await dbClient.mentor.create({
        data: mentor,
      });
      createdCount++;
    } else {
      await dbClient.mentor.update({
        where: { email: mentor.email },
        data: {
          name: mentor.name,
          timezone: mentor.timezone,
          dailyLimit: mentor.dailyLimit,
        },
      });
    }
  }

  const totalMentors = await dbClient.mentor.count();
  console.log(`✅ Seeding complete. Created: ${createdCount}, Total Mentors: ${totalMentors}`);
}

async function main() {
  try {
    await seedMentors();
  } catch (error) {
    console.error('❌ Error during seeding:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Run directly if called via CLI
if (process.argv[1] && process.argv[1].endsWith('seed.js')) {
  main();
}
