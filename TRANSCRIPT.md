# 🤖 AI Development Transcript: Codeyoung Appointment Booking System

This transcript documents the step-by-step AI-assisted architectural design, decision-making, and implementation phases for the Codeyoung Full-Stack Developer assignment, fulfilling the submission requirement.

## AI CHAT= https://chatgpt.com/share/6ab9180e-000c-83ee-9806-97131e04eec3
---

## 📌 Development Overview

| Attribute | Details |
|---|---|
| **Role** | Senior Full-Stack Software Engineer & Software Architect |
| **System** | Codeyoung Trial Class Appointment Booking System |
| **Frontend** | React 18, Vite, React Router v6, Axios, Vanilla CSS |
| **Backend** | Node.js, Express.js, Prisma ORM, SQLite, Luxon, Zod, Helmet, CORS |
| **Primary Domain Challenge** | Precision Multi-Timezone Conversion, DST Handling & Quota Balancing |

---

## 🧭 Phase 1: Requirements Analysis & Architecture Definition

### Prompt:
> Build a complete production-quality appointment booking system for the Codeyoung Full-Stack Developer assignment. Replicate Codeyoung's trial class booking flow where a parent selects a convenient time slot, the system automatically assigns an available mentor, both receive local timings in their own timezone, and a dummy meeting link is generated. Use React with Vite, Node.js with Express, SQLite with Prisma ORM, Luxon for timezone handling, and clean layered architecture.

### AI Architectural Decision & Summary:
1. **Layered Backend Architecture**:
   - Decoupled responsibilities into `controllers`, `routes`, `services`, `middleware`, `validators`, `utils`, `config`, and `db`.
   - Prevented business logic from leaking into controllers or routes.
2. **Database Schema Design**:
   - Designed 3 relational models in Prisma: `Mentor`, `Parent`, and `Booking`.
   - Mandated that `bookingDateUTC` must **strictly store UTC timestamps** (`DateTime` in Prisma).
   - Stored `parentTimezone` and `mentorTimezone` as metadata alongside each booking for auditability.
3. **Monorepo Layout**:
   - Organized as a multi-package workspace (`backend/` and `frontend/`) with root orchestration scripts to allow single-command installation (`npm run install:all`) and execution (`npm run dev`).

---

## 🕒 Phase 2: Timezone Handling & Luxon Strategy

### Challenge:
Parents book classes from diverse regions (e.g., `America/New_York`, `America/Chicago`, `America/Los_Angeles`, `Europe/London`), while all 10 mentors operate in `Asia/Kolkata`. Hardcoding static hour offsets (such as UTC-5 or UTC-4) fails catastrophically during Daylight Saving Time (DST) transitions and midnight crossovers.

### AI Implementation Decision:
- **Zero Static Offsets**: Exclusively utilized Luxon's `IANAZone` and `DateTime` methods.
- **Midnight Crossover Logic**:
  When a parent in New York books a class at 9:00 PM EDT on Friday, Oct 15:
  1. Local string `"2026-10-15T21:00:00"` in zone `"America/New_York"` converts to UTC `"2026-10-16T01:00:00Z"`.
  2. The mentor in `Asia/Kolkata` views this UTC moment as `"2026-10-16T06:30:00+05:30"` (Saturday morning).
  3. The mentor's daily quota limit (max 2 classes/day) is computed against the mentor's local calendar day (`2026-10-16`).
  4. The utility `getMentorDayBoundariesUTC(utcDateTime, mentor.timezone)` computes the mentor's `startOf('day')` and `endOf('day')` in UTC to accurately query bookings in Prisma.
- **DST Gap Protection**:
  `DateTime.fromISO(isoLocalString, { zone: timezone })` automatically flags nonexistent times during spring-forward transitions and throws a 400 Bad Request with an informative explanation.

---

## ⚖️ Phase 3: Deterministic Mentor Assignment Algorithm

### Challenge:
- Exactly 10 mentors available.
- Each mentor is restricted to a maximum of 2 trial classes per local calendar day.
- At least 20 parents making bookings must be supported.
- System must deterministically assign mentors using a first-available and lowest-booking strategy, and return HTTP 409 when capacity is exhausted.

### AI Implementation Decision:
1. **Filtering Phase**:
   - Query all mentors ordered alphabetically.
   - For each mentor, check for an existing booking at the exact same UTC timestamp (`findFirst`).
   - For each mentor, count total bookings on that mentor's local day (`startOfDayUTC` to `endOfDayUTC`).
   - If `dailyCount >= mentor.dailyLimit` (2), exclude mentor.
2. **Sorting Phase (Load Balancing)**:
   - Primary Sort: `a.dayBookingCount - b.dayBookingCount` (mentor with fewest classes on that day gets priority).
   - Secondary Sort (Deterministic Tie-Breaker): `a.mentor.name.localeCompare(b.mentor.name)`.
3. **Exhaustion Handling**:
   - If no mentor passes the filter, throw `ApiError.conflict(409)` with a clear message indicating all mentors are booked or at daily capacity.
4. **Transactional Persistence**:
   - Used `prisma.$transaction` to atomically upsert the parent and insert the booking, guaranteeing consistency under concurrent bookings.

---

## 🛡️ Phase 4: Security, Middleware & Input Validation

### Decisions:
- **Zod Schemas**:
  - `bookingSchema`: Validates parent name (2-100 chars), valid email, country, valid IANA timezone, date (`YYYY-MM-DD`), and time (`HH:mm`).
  - Added a `superRefine` check ensuring the requested slot is at least 15 minutes into the future.
- **Rate Limiting**:
  - Applied `express-rate-limit` configuring 100 requests per 15-minute window with clean JSON responses.
- **Helmet & CORS**:
  - Protected HTTP response headers and enabled secure cross-origin communication between the Vite frontend (`http://localhost:5173`) and the Express API (`http://localhost:5000`).
- **Centralized Error Handling**:
  - Structured error format: `{ success: false, error: { message, details? } }`.
  - Stack traces are sanitized and never leaked to the client in production.

---

## 🖥️ Phase 5: React Frontend & User Experience

### Decisions:
- **Component Breakdown**:
  - `Navbar`: Consistent header with branding and navigation.
  - `HomePage`: Clear value proposition, mentor showcase, and instant action buttons.
  - `BookingPage`: Interactive form with live slot availability feedback.
  - `SlotPicker`: Real-time grid showing available slots, remaining mentor spots per slot, and disabled states for booked/past slots.
  - `SuccessPage`: Visual dual-timezone summary (Parent local time + Mentor IST time), booking ID, and meeting link with 1-click clipboard copy.
  - `BookingsListPage`: Live dashboard providing parents and evaluators with full visibility of scheduled trials.
- **Custom Hook `useSlots`**:
  - Listens to changes in `date` and `timezone` and debounces/fetches slot availability from `GET /api/slots`.

---

## 🧪 Phase 6: Automated Verification Script

### Prompt:
> Create an automated simulation script demonstrating 20 bookings being distributed across all 10 mentors, reaching their 2 classes/day limit, and showing the 21st booking failing with HTTP 409 Conflict.

### AI Implementation:
Created `backend/scripts/simulateBookings.js`:
- Seeds the 10 mentors in `Asia/Kolkata`.
- Generates 20 distinct parent bookings across two slot times on the same date.
- Confirms each mentor receives exactly 2 bookings (10 mentors × 2 = 20 trial classes).
- Attempts a 21st booking on the same day and verifies that an HTTP 409 Conflict exception is caught and reported.

---

## 🏆 Summary of Deliverables

1. Full layered Node.js/Express backend with Prisma & SQLite.
2. Seed script inserting exactly 10 mentors with `Asia/Kolkata` timezone.
3. Deterministic load-balanced assignment service with HTTP 409 conflict handling.
4. Complete Luxon timezone engine handling US/UK/global zones and midnight crossovers.
5. React + Vite frontend with Home, Booking, Success, and Dashboard pages.
6. Comprehensive documentation (`README.md`) and automated simulation script.
