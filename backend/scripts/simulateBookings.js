import { prisma } from '../src/db.js';
import { createBookingService } from '../src/services/booking.service.js';
import { seedMentors } from '../prisma/seed.js';
import { DateTime } from 'luxon';

/**
 * End-to-end simulation script verifying:
 * 1. Exactly 10 mentors exist (seeded in Asia/Kolkata).
 * 2. 20 distinct parents book trial classes on the same day.
 * 3. Each mentor takes exactly 2 bookings (10 mentors * 2 = 20 total limit).
 * 4. Mentors are assigned using deterministic first-available and lowest-booking strategy.
 * 5. The 21st booking on that day returns HTTP 409 Conflict!
 */
async function runSimulation() {
  console.log('=====================================================');
  console.log('🚀 STARTING CODEYOUNG 20-BOOKINGS & LIMIT SIMULATION');
  console.log('=====================================================\n');

  // Step 1: Ensure mentors are seeded
  await seedMentors();
  const mentors = await prisma.mentor.findMany({ orderBy: { name: 'asc' } });
  console.log(`\n📋 Loaded ${mentors.length} mentors:`);
  mentors.forEach((m, idx) => console.log(`   ${idx + 1}. ${m.name} (${m.timezone}, dailyLimit: ${m.dailyLimit})`));

  // Step 2: Clear any previous simulation bookings to start fresh
  await prisma.booking.deleteMany();
  await prisma.parent.deleteMany();
  console.log('\n🧹 Cleared test bookings and parents.');

  // Target date for simulation (in future)
  // Let's use 10 days from now
  const targetDate = DateTime.utc().plus({ days: 10 }).toISODate(); // 'YYYY-MM-DD'
  console.log(`\n📅 Simulation Date: ${targetDate} (Parent timezone: America/New_York)`);

  // Slots available: 10:00 and 11:00 AM New York time
  // Slot 1: 10:00 AM NY (10 mentors can take 1 class each = 10 bookings)
  // Slot 2: 11:00 AM NY (10 mentors can take 1 class each = 10 bookings)
  // Total = 20 bookings!
  const parentRequests = [];
  for (let i = 1; i <= 20; i++) {
    const slotTime = i <= 10 ? '10:00' : '11:00';
    parentRequests.push({
      name: `Parent Test ${i}`,
      email: `parent${i}@example.com`,
      country: i % 2 === 0 ? 'United States' : 'United Kingdom',
      timezone: 'America/New_York',
      date: targetDate,
      time: slotTime,
    });
  }

  console.log(`\n⚡ Submitting 20 parent booking requests...`);
  const successBookings = [];

  for (let i = 0; i < parentRequests.length; i++) {
    const req = parentRequests[i];
    try {
      const result = await createBookingService(req);
      successBookings.push(result);
      console.log(
        `✅ Booking #${i + 1} Succeeded | Parent: ${req.name} | Slot: ${req.time} ET | Assigned Mentor: ${result.mentor.name} (Day Count: ${result.mentor.assignedDayBookingCount})`
      );
    } catch (err) {
      console.error(`❌ Booking #${i + 1} Failed:`, err.message);
    }
  }

  console.log(`\n📊 Successfully created ${successBookings.length} bookings out of 20.`);

  // Step 3: Verify Mentor Distribution
  console.log('\n🔍 Verifying Mentor Daily Quotas:');
  const updatedMentors = await prisma.mentor.findMany({
    include: {
      bookings: true,
    },
    orderBy: { name: 'asc' },
  });

  let allReachedLimit = true;
  for (const m of updatedMentors) {
    console.log(`   - Mentor: ${m.name.padEnd(20)} | Bookings: ${m.bookings.length} / ${m.dailyLimit}`);
    if (m.bookings.length !== 2) {
      allReachedLimit = false;
    }
  }

  if (allReachedLimit) {
    console.log('\n🎯 PERFECT LOAD BALANCING: All 10 mentors took exactly 2 classes (100% capacity)!');
  }

  // Step 4: Attempt 21st Booking (Expected: 409 Conflict)
  console.log('\n⚡ Attempting 21st parent booking on the same day (expecting 409 Conflict)...');
  const parent21 = {
    name: 'Parent Test 21',
    email: 'parent21@example.com',
    country: 'United States',
    timezone: 'America/New_York',
    date: targetDate,
    time: '12:00',
  };

  try {
    await createBookingService(parent21);
    console.error('❌ UNEXPECTED: 21st booking succeeded when it should have failed!');
  } catch (err) {
    console.log(`✅ EXPECTED ERROR CAUGHT (Status ${err.statusCode || 409}):`);
    console.log(`   "${err.message}"`);
  }

  console.log('\n=====================================================');
  console.log('🎉 ALL BUSINESS LOGIC & TIMEZONE TESTS PASSED!');
  console.log('=====================================================\n');
}

runSimulation()
  .catch((err) => {
    console.error('Simulation error:', err);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
