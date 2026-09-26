# 🚀 Codeyoung Trial Class Appointment Booking System

A production-ready, full-stack appointment booking system engineered for the **Codeyoung Full-Stack Developer Assignment**. The system accurately replicates Codeyoung's 1:1 live trial class booking flow: parents in the US, UK, or anywhere in the world select a convenient slot in their local timezone, the backend deterministically assigns an available mentor, both parties receive formatted meeting timings in their own local timezones with automatic Daylight Saving Time (DST) handling, and an instant dummy meeting link is generated.

---

## 📑 Table of Contents
1. [Key Features](#-key-features)
2. [Architecture & Folder Structure](#-architecture--folder-structure)
3. [Technology Stack](#-technology-stack)
4. [Database Design & Prisma Models](#-database-design--prisma-models)
5. [Business Logic & Timezone Mechanics](#-business-logic--timezone-mechanics)
6. [API Specification & Examples](#-api-specification--examples)
7. [Installation & Quick Start](#-installation--quick-start)
8. [Automated Verification & Simulation](#-automated-verification--simulation)
9. [Assumptions](#-assumptions)
10. [AI Development Transcript](#-ai-development-transcript)

---

## ✨ Key Features

- **Accurate Multi-Timezone Handling with Luxon**:
  - Automatically handles US Eastern (`America/New_York`), Central (`America/Chicago`), Pacific (`America/Los_Angeles`), UK (`Europe/London`), India (`Asia/Kolkata`), and global timezones.
  - **Zero hardcoded timezone offsets**: Full automatic handling of Daylight Saving Time (DST spring-forward / fall-back) and midnight crossovers (e.g., 9:00 PM EDT in New York is 6:30 AM IST next day in India).
  - Internal storage is **strictly UTC** in the database.
- **Deterministic Mentor Assignment & Quota Balancing**:
  - Exactly 10 mentors seeded in `Asia/Kolkata`.
  - Strict daily limit: **Maximum 2 trial classes per mentor per local calendar day**.
  - **First-available and lowest-booking strategy**: Assigns the eligible mentor with the fewest bookings on that day to balance workload, breaking ties deterministically.
  - Returns **HTTP 409 Conflict** with a descriptive JSON error when all mentors reach their daily limit (20 trial classes total per day).
- **Comprehensive Layered Architecture**:
  - Clean separation: `controllers`, `routes`, `services`, `middleware`, `validators`, `utils`, `config`, and `db`.
- **Security & Reliability**:
  - Request validation using **Zod** (checking names, emails, countries, IANA timezones, and future dates).
  - Security headers using **Helmet**.
  - Rate limiting using **Express Rate Limit** (100 requests per 15 minutes).
  - Configurable **CORS** middleware.
  - Centralized error handler preventing stack trace leaks in production.
- **Responsive React Frontend (Vite)**:
  - **Home Page**: Introduces the 1:1 trial class and showcases mentor profiles.
  - **Booking Page**: Interactive booking form with real-time slot availability, remaining mentor spots per slot, and validation alerts.
  - **Success Page**: Displays mentor details, dual local time summaries (parent & mentor), meeting link with 1-click clipboard copy, and system UTC metadata.
  - **Live Dashboard**: Displays all scheduled trial classes with dual time representations.

---

## 🏛️ Architecture & Folder Structure

```
codeyoung/
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma        # Prisma ORM schema (Mentor, Parent, Booking)
│   │   ├── seed.js              # Database seed script for 10 mentors
│   │   └── dev.db               # SQLite database file (created on push)
│   ├── scripts/
│   │   └── simulateBookings.js  # Automated 20-booking & 409 limit test script
│   ├── src/
│   │   ├── config/
│   │   │   ├── constants.js     # Timezones, countries, slot hours, quotas
│   │   │   └── env.js           # Validated environment configuration
│   │   ├── controllers/
│   │   │   ├── booking.controller.js
│   │   │   ├── health.controller.js
│   │   │   ├── mentor.controller.js
│   │   │   └── slot.controller.js
│   │   ├── middleware/
│   │   │   ├── errorHandler.js   # Centralized error handler
│   │   │   ├── rateLimiter.js    # Express rate limiter
│   │   │   └── validateRequest.js# Zod schema validation middleware
│   │   ├── routes/
│   │   │   ├── booking.routes.js # POST /api/book, GET /api/bookings
│   │   │   ├── health.routes.js  # GET /api/health
│   │   │   ├── mentor.routes.js  # GET /api/mentors
│   │   │   ├── slot.routes.js    # GET /api/slots
│   │   │   └── index.js          # Master route assembly
│   │   ├── services/
│   │   │   ├── booking.service.js# Mentor assignment & transaction logic
│   │   │   ├── mentor.service.js # Mentor querying logic
│   │   │   └── slot.service.js   # Dynamic slot availability logic
│   │   ├── utils/
│   │   │   ├── apiError.js       # Operational error class
│   │   │   ├── meetingLink.js    # Dummy meeting URL generator
│   │   │   ├── response.js       # Standardized response formatters
│   │   │   └── timezone.js       # Luxon UTC/local conversion & formatting
│   │   ├── validators/
│   │   │   └── booking.validator.js # Zod schemas for booking & queries
│   │   ├── app.js               # Express application configuration
│   │   ├── db.js                # PrismaClient singleton
│   │   └── server.js            # Server entry point with graceful shutdown
│   ├── .env.example
│   ├── .env
│   ├── .gitignore
│   └── package.json
├── frontend/
│   ├── public/
│   │   └── favicon.svg
│   ├── src/
│   │   ├── components/
│   │   │   ├── Alert.jsx        # Notification alert banners
│   │   │   ├── Navbar.jsx       # Global navigation bar
│   │   │   ├── SlotPicker.jsx   # Interactive time slot picker
│   │   │   └── Spinner.jsx      # Loading indicator
│   │   ├── hooks/
│   │   │   └── useSlots.js      # Custom React hook for dynamic slot fetching
│   │   ├── pages/
│   │   │   ├── BookingPage.jsx  # Trial booking form page
│   │   │   ├── BookingsListPage.jsx # Live admin/evaluator dashboard
│   │   │   ├── HomePage.jsx     # Landing page
│   │   │   ├── NotFoundPage.jsx # 404 page
│   │   │   └── SuccessPage.jsx  # Confirmation & meeting link page
│   │   ├── services/
│   │   │   └── api.js           # Axios API client
│   │   ├── utils/
│   │   │   ├── constants.js     # Timezones and country options
│   │   │   └── formatters.js    # Date formatting utilities
│   │   ├── App.jsx              # Routes and layout
│   │   ├── index.css            # Clean, functional styling
│   │   └── main.jsx             # React DOM entry point
│   ├── .env.example
│   ├── .env
│   ├── index.html
│   ├── package.json
│   └── vite.config.js
├── .gitignore
├── package.json                 # Monorepo management scripts
├── README.md                    # Project documentation
└── TRANSCRIPT.md                # AI-assisted development record
```

---

## 🛠️ Technology Stack

| Layer | Technology | Purpose |
|---|---|---|
| **Frontend Framework** | React 18 + Vite | High-performance SPA with client-side routing |
| **Routing** | React Router v6 | Declarative multi-page navigation |
| **API Client** | Axios | Promise-based HTTP client with interceptors |
| **Styling** | Vanilla CSS | Clean, responsive, minimal functional design |
| **Backend Runtime** | Node.js (ES Modules) | Server execution environment |
| **Web Framework** | Express.js 4.x | RESTful API routing and middleware pipeline |
| **Database & ORM** | SQLite + Prisma ORM | Relational data persistence with strict types |
| **Timezone Engine** | Luxon | IANA timezone conversion, DST handling & formatting |
| **Validation** | Zod | Runtime schema validation for requests |
| **Security** | Helmet + CORS | HTTP headers hardening and cross-origin controls |
| **Rate Limiter** | Express Rate Limit | API abuse and brute-force protection |

---

## 🗄️ Database Design & Prisma Models

```prisma
model Mentor {
  id         String    @id @default(uuid())
  name       String
  email      String    @unique
  timezone   String    @default("Asia/Kolkata")
  dailyLimit Int       @default(2)
  createdAt  DateTime  @default(now())
  bookings   Booking[]

  @@map("mentors")
}

model Parent {
  id        String    @id @default(uuid())
  name      String
  email     String
  country   String
  timezone  String
  createdAt DateTime  @default(now())
  bookings  Booking[]

  @@map("parents")
}

model Booking {
  id             String   @id @default(uuid())
  parentId       String
  mentorId       String
  bookingDateUTC DateTime // Stored in UTC only
  parentTimezone String
  mentorTimezone String
  meetingLink    String
  createdAt      DateTime @default(now())

  parent Parent @relation(fields: [parentId], references: [id], onDelete: Cascade)
  mentor Mentor @relation(fields: [mentorId], references: [id], onDelete: Cascade)

  @@index([mentorId, bookingDateUTC])
  @@index([parentId])
  @@map("bookings")
}
```

---

## 🧠 Business Logic & Timezone Mechanics

### 1. Deterministic Mentor Assignment Strategy
When a parent requests a booking for local date `D` and slot `T` in timezone `TZ`:
1. **UTC Conversion**: Converts local time `(D, T, TZ)` into a precise UTC `DateTime` object using Luxon.
2. **Mentor Day Calculation (Midnight Crossover Handling)**:
   - Mentors operate in `Asia/Kolkata`.
   - The booking's UTC timestamp is mapped to the mentor's timezone to find the mentor's local calendar day boundaries:
     $$\text{startOfDayUTC} = \text{mentorDateTime.startOf('day').toUTC()}$$
     $$\text{endOfDayUTC} = \text{mentorDateTime.endOf('day').toUTC()}$$
   - *Example*: A booking at 9:00 PM EDT on Oct 15 in New York corresponds to 6:30 AM IST on Oct 16 in India. The booking counts against the mentor's Oct 16 daily quota.
3. **Availability Filtering**:
   - Mentors who already have a confirmed booking at that exact UTC time are excluded.
   - Mentors whose total bookings between `startOfDayUTC` and `endOfDayUTC` $\ge \text{dailyLimit}$ (2) are excluded.
4. **Lowest-Booking Tie-Breaker**:
   - Eligible mentors are sorted by `dailyBookingCount` ascending (load balancing).
   - If counts are equal, ties are broken deterministically by mentor name ascending.
5. **Capacity Exhaustion (HTTP 409)**:
   - If no mentor is eligible, the API returns `HTTP 409 Conflict` with:
     ```json
     {
       "success": false,
       "error": {
         "message": "No mentors are available for the selected slot and date. All mentors have either reached their maximum daily limit (2 classes/day) or are already booked for this time."
       }
     }
     ```

### 2. Timezone Formatting & Output
Both parties receive clear, human-readable local time descriptions with timezone abbreviations and offsets:
- **Parent Local Time**: `Thursday, Oct 15, 2026, 06:00 PM EDT (UTC-4)`
- **Mentor Local Time**: `Friday, Oct 16, 2026, 03:30 AM IST (UTC+5:30)`
- **Meeting Link**: `https://demo.codeyoung.com/meeting/K8X9WZ2L`

---

## 📡 API Specification & Examples

### Base URL: `http://localhost:5000/api`

### 1. Health Check
- **Endpoint**: `GET /api/health`
- **Response**:
```json
{
  "success": true,
  "data": {
    "status": "UP",
    "uptime": 128.45,
    "timestamp": "2026-09-26T07:15:30.123Z",
    "database": "ok",
    "totalMentors": 10,
    "environment": "development"
  },
  "message": "Server is running smoothly"
}
```

### 2. List Mentors
- **Endpoint**: `GET /api/mentors`
- **Response**:
```json
{
  "success": true,
  "data": [
    {
      "id": "e3b0c442-...",
      "name": "Amit Patel",
      "email": "amit.patel@codeyoung.com",
      "timezone": "Asia/Kolkata",
      "dailyLimit": 2,
      "totalBookings": 1
    }
  ]
}
```

### 3. Check Available Slots
- **Endpoint**: `GET /api/slots?date=2026-10-15&timezone=America/New_York`
- **Response**:
```json
{
  "success": true,
  "data": {
    "date": "2026-10-15",
    "timezone": "America/New_York",
    "slots": [
      {
        "time": "10:00",
        "label": "10:00 AM",
        "isAvailable": true,
        "availableMentorsCount": 10,
        "reason": null
      },
      {
        "time": "14:00",
        "label": "02:00 PM",
        "isAvailable": false,
        "availableMentorsCount": 0,
        "reason": "All mentors are either booked at this slot or reached their daily limit (2 classes/day)"
      }
    ]
  }
}
```

### 4. Create Trial Booking
- **Endpoint**: `POST /api/book`
- **Request Body**:
```json
{
  "name": "Sarah Jenkins",
  "email": "sarah.jenkins@example.com",
  "country": "United States",
  "timezone": "America/New_York",
  "date": "2026-10-15",
  "time": "10:00"
}
```
- **Response (201 Created)**:
```json
{
  "success": true,
  "data": {
    "bookingId": "c92fa68b-118c-4a37-975e-5e729a674d82",
    "meetingLink": "https://demo.codeyoung.com/meeting/HN72QP9L",
    "bookingDateUTC": "2026-10-15T14:00:00.000Z",
    "parent": {
      "id": "4b9e28fa-...",
      "name": "Sarah Jenkins",
      "email": "sarah.jenkins@example.com",
      "country": "United States",
      "timezone": "America/New_York",
      "formattedTime": "Thursday, Oct 15, 2026, 10:00 AM EDT (UTC-4)"
    },
    "mentor": {
      "id": "e3b0c442-...",
      "name": "Amit Patel",
      "email": "amit.patel@codeyoung.com",
      "timezone": "Asia/Kolkata",
      "formattedTime": "Thursday, Oct 15, 2026, 07:30 PM IST (UTC+5:30)",
      "assignedDayBookingCount": 1
    }
  },
  "message": "Trial class booked successfully"
}
```

### 5. List All Bookings
- **Endpoint**: `GET /api/bookings`
- Returns all bookings with parent details, mentor details, and dual formatted times.

---

## 🚀 Installation & Quick Start

### Prerequisites
- Node.js (v18 or higher)
- npm (v9 or higher)

### Step 1: Install Dependencies
From the repository root:
```bash
# Install root, backend, and frontend packages
npm run install:all
```

### Step 2: Initialize Database and Seed Mentors
```bash
# Push Prisma schema to SQLite database
npm run db:push

# Automatically seed the 10 mentors in Asia/Kolkata
npm run db:seed
```

### Step 3: Run Both Backend and Frontend Concurrently
```bash
npm run dev
```
- **Backend API**: `http://localhost:5000`
- **Frontend App**: `http://localhost:5173`

*(Alternatively, you can run them in separate terminal windows: `npm run dev:backend` and `npm run dev:frontend`)*

---

## 🧪 Automated Verification & Simulation

To prove that the system can handle **20 parent requests on the same day** without error and strictly return **HTTP 409 Conflict** on the 21st request when all 10 mentors reach their 2-classes/day quota, run:

```bash
npm run simulate
```

### Simulation Output:
```
=====================================================
🚀 STARTING CODEYOUNG 20-BOOKINGS & LIMIT SIMULATION
=====================================================

📋 Loaded 10 mentors:
   1. Amit Patel (Asia/Kolkata, dailyLimit: 2)
   2. Ananya Iyer (Asia/Kolkata, dailyLimit: 2)
   ...
   10. Vikram Malhotra (Asia/Kolkata, dailyLimit: 2)

📅 Simulation Date: 2026-10-06 (Parent timezone: America/New_York)
⚡ Submitting 20 parent booking requests...
✅ Booking #1 Succeeded | Parent: Parent Test 1 | Assigned Mentor: Amit Patel (Day Count: 1)
✅ Booking #2 Succeeded | Parent: Parent Test 2 | Assigned Mentor: Ananya Iyer (Day Count: 1)
...
✅ Booking #20 Succeeded | Parent: Parent Test 20 | Assigned Mentor: Vikram Malhotra (Day Count: 2)

📊 Successfully created 20 bookings out of 20.

🔍 Verifying Mentor Daily Quotas:
   - Mentor: Amit Patel           | Bookings: 2 / 2
   - Mentor: Ananya Iyer          | Bookings: 2 / 2
   ...
   - Mentor: Vikram Malhotra      | Bookings: 2 / 2

🎯 PERFECT LOAD BALANCING: All 10 mentors took exactly 2 classes (100% capacity)!

⚡ Attempting 21st parent booking on the same day (expecting 409 Conflict)...
✅ EXPECTED ERROR CAUGHT (Status 409):
   "No mentors are available for the selected slot and date. All mentors have either reached their maximum daily limit (2 classes/day) or are already booked for this time."

=====================================================
🎉 ALL BUSINESS LOGIC & TIMEZONE TESTS PASSED!
=====================================================
```

---

## 📌 Assumptions

1. **Trial Class Duration**: Each trial class is modeled as a 60-minute session.
2. **Booking Lead Time**: Bookings must be scheduled at least 15 minutes into the future to avoid scheduling conflicts with imminent or past times.
3. **Mentor Calendar Day**: A mentor's daily limit of 2 bookings applies to the mentor's local calendar day in `Asia/Kolkata` (00:00:00 to 23:59:59 IST), correctly accounting for midnight crossovers from Western timezones.
4. **Meeting Links**: Unique dummy meeting URLs are generated following the format `https://demo.codeyoung.com/meeting/{NANOID}`.
5. **Database**: SQLite is used via Prisma ORM for portable, zero-configuration local execution with seamless switching to PostgreSQL/MySQL in production.

---

## 📝 AI Development Transcript
As required by the assignment guidelines, the complete structured record of prompts and AI-assisted architectural decisions is documented in [`TRANSCRIPT.md`](./TRANSCRIPT.md).
