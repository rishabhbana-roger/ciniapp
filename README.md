# CineBook - Production-Ready Cinema Ticket Booking Platform

[![Next.js](https://img.shields.io/badge/Next.js-14%20App%20Router-black?logo=next.js)](https://nextjs.org/)
[![Neon Database](https://img.shields.io/badge/PostgreSQL-Neon%20Serverless-00e599?logo=postgresql)](https://neon.tech/)
[![Drizzle ORM](https://img.shields.io/badge/ORM-Drizzle-c5f74f)](https://orm.drizzle.team/)
[![Tailwind CSS](https://img.shields.io/badge/Styling-Tailwind%20CSS-38bdf8?logo=tailwindcss)](https://tailwindcss.com/)
[![QA Tests](https://img.shields.io/badge/QA%20Suite-4%2F4%20Passing-brightgreen)](#qa-test-suite)

**CineBook** is an enterprise-grade cinema ticket booking platform built with Next.js App Router, Neon Serverless PostgreSQL, and Drizzle ORM. Designed by a three-agent collaborative engineering team, it delivers atomic seat hold locks with 10-minute expirations, idempotent payment workflows, dynamic digital QR passes, and full responsive aesthetics.

---

## 🏛 Three-Agent Team Architecture

```
  ┌────────────────────────────────────────────────────────┐
  │                 CineBook Architecture                   │
  └────────────────────────────────────────────────────────┘
          │
          ├── Agent 1: App Agent (Next.js App Router UI)
          │    ├── Home Billboard, Spotlight Carousel, Multi-Filter Search
          │    ├── Movie Details, Experience Formats, Trailers
          │    ├── Interactive Auditorium Visual Seat Map (Live Holds)
          │    ├── Checkout with 10-Min Hold Countdown Timer
          │    ├── Apple Wallet Style Digital Pass with Dynamic QR Code
          │    ├── User Bookings History & Cancellation with Refunds
          │    ├── Auth with 1-Click Demo Profiles (Admin & Customer)
          │    └── Admin Dashboard (Stats, Audit Logs, Hold Purge)
          │
          ├── Agent 2: Database Engine Agent (Neon Postgres & Drizzle)
          │    ├── 14 Relational Tables with UUID PKs & UTC Timestamps
          │    ├── Integer Minor Units (Cents) for all monetary values
          │    ├── Atomic Seat Hold Transaction (Locking + 10m Expiry)
          │    ├── Payment Idempotency Keys (Deduplication Safeguards)
          │    ├── Vercel Cron Hold-Release Endpoint (CRON_SECRET)
          │    └── Rich Seed Dataset (8 Movies, 3 Multiplexes, 672 Seats)
          │
          └── Agent 3: QA Agent (Automated Testing Suite)
               ├── Concurrent Seat Booking Race Condition Test
               ├── Hold Expiration & Automatic Release Test
               ├── Complete End-to-End Booking & Refund Test
               └── Multi-Tenant Security & Role Isolation Test
```

---

## 🚀 Key Features

### 🎬 Agent 1 - App Agent (UI & UX)
- **Cinematic Dark Design System**: Glowing amber accents (`#f59e0b`), glassmorphism cards, and fluid animations.
- **Multi-Filter Search**: Instant search by title, director, cast, genre, and language.
- **Interactive Auditorium Seat Map**:
  - 3D curved cinema screen projection.
  - Categories: **VIP Recliner** ($22), **Premium** ($18), **Standard** ($14), and **Accessible** ($12).
  - Status states: `AVAILABLE`, `HELD` (locked with countdown), `BOOKED`, and `SELECTED`.
- **Seat Hold Countdown Timer**: Live 10:00 countdown timer with urgent visual pulsing.
- **Checkout & Test Card Gateway**: Instant validation, test card presets, and server-side fee/tax breakdown.
- **Dynamic Digital QR Ticket Pass**: Client-side QR generation, booking reference, and print capability.
- **Booking Cancellation**: Instant seat release and payment refund logging.
- **Admin Management Console**: Real-time revenue metrics, occupancy rate, audit logs, and manual purge triggers.

### ⚡ Agent 2 - Database Engine Agent
- **Neon Serverless PostgreSQL** with connection pooling (`@neondatabase/serverless` & `pg`).
- **Drizzle ORM** with 14 normalized tables:
  `users`, `genres`, `movies`, `movie_genres`, `cinemas`, `auditoriums`, `seats`, `showtimes`, `showtime_seats`, `bookings`, `booking_items`, `payments`, `tickets`, `audit_logs`.
- **Database Rules**:
  - UUID Primary Keys (`gen_random_uuid()`).
  - Strict UTC timestamps.
  - Money stored strictly in integer minor units (cents) — *never floating-point*.
  - Unique constraints on cinema screens, auditorium seat positions, and showtime seats.
  - Atomic seat hold transaction engine.
  - Scheduled cleanup endpoint `/api/cron/release-holds` protected by `CRON_SECRET`.

### 🧪 Agent 3 - QA Agent & Automated Verification
- **Race Condition Concurrency Test**: Fires simultaneous requests to reserve the exact same seat from 2 distinct sessions; verifies exactly 1 succeeds and the other receives a `409 Conflict`.
- **Hold Expiration Test**: Simulates expired holds and confirms automatic release.
- **End-to-End Flow Test**: Covers Search ➔ Hold ➔ Payment ➔ Idempotent Retry ➔ Ticket ➔ Cancellation.
- **Security & Multi-Tenant Test**: Verifies password hashing, cross-user isolation, and role authorization.

---

## 🛠 Tech Stack

- **Framework**: [Next.js 14](https://nextjs.org/) (App Router, Server Actions, Route Handlers)
- **Database**: [Neon Serverless PostgreSQL](https://neon.tech/) via Vercel Marketplace
- **ORM**: [Drizzle ORM](https://orm.drizzle.team/) & [Drizzle Kit](https://orm.drizzle.team/kit-docs/overview)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Icons & Animation**: [Lucide React](https://lucide.dev/), [Canvas Confetti](https://www.npmjs.com/package/canvas-confetti)
- **Passes & QR**: [QRCode](https://www.npmjs.com/package/qrcode)
- **Security**: [bcryptjs](https://www.npmjs.com/package/bcryptjs), [jose](https://www.npmjs.com/package/jose) (JWT sessions)

---

## 📦 Quick Start & Local Setup

### 1. Clone & Install Dependencies
```bash
git clone <repo-url>
cd CINIAPP
npm install
```

### 2. Configure Environment Variables
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```

Edit `.env` with your credentials:
```env
# Neon PostgreSQL Connection URL
DATABASE_URL=postgresql://neondb_owner:npg_secret@ep-sample.us-east-2.aws.neon.tech/neondb?sslmode=require

# Authentication Secrets
JWT_SECRET=super-secret-cinebook-jwt-token-key-change-in-production-32chars

# Cron Protection Secret for Vercel Cron Endpoint
CRON_SECRET=cinebook_cron_secure_token_98374

# Payment Provider Test Keys
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_sample51NXYZCineBookKey
STRIPE_SECRET_KEY=sk_test_sample51NXYZCineBookSecret
STRIPE_WEBHOOK_SECRET=whsec_sampleCineBookWebhookSecret

# App URL
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 3. Run Migrations & Seed Database
```bash
# Seed initial movies, cinemas, auditoriums, showtimes, and users
npm run db:seed
```

### 4. Run Automated QA Tests
```bash
npm run test:qa
```

### 5. Start Local Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🔑 Demo Credentials

| Role | Email | Password | Access Level |
| :--- | :--- | :--- | :--- |
| **Admin** | `admin@cinebook.com` | `AdminPass123!` | Full Management, Revenue Analytics, Hold Purge |
| **Customer** | `alex@cinebook.com` | `UserPass123!` | Ticket Booking, Seat Selection, QR Passes |
| **Customer** | `sarah@cinebook.com` | `UserPass123!` | Ticket Booking, Seat Selection, QR Passes |

*(You can also use the **1-Click Demo Profiles** button on the sign-in modal for instant login without typing.)*

---

## 🧪 QA Test Suite Execution

Run the complete test suite:
```bash
npm run test:qa
```

Sample Output:
```
==========================================================
🎬 CINEBOOK AUTOMATED QA & INTEGRITY TEST SUITE (AGENT 3)
==========================================================

🧪 Running Test Suite: Concurrent Seat Booking & Race Condition Locks
   🎯 Target Seat: ID fb5475d9-9487-4444-9f73-87721f469a55 for Showtime c9916b3e-c8f4-4af9-afb3-de58b0cc6cde
   👥 Firing simultaneous requests from User A (alex@cinebook.com) & User B (sarah@cinebook.com)...
   Result A: ✅ SUCCESS (Held Seat)
   Result B: ❌ CONFLICT: Seat A1 is no longer available (held).
   ✅ Concurrency Test PASSED: Exactly 1 reservation succeeded, duplicate concurrent request rejected with Conflict!

🧪 Running Test Suite: Hold Expiration & Automatic Release Engine
   1. User A holds seat e00d4d2d-5e64-4a12-b5b1-c1af9ad41be2...
   ✅ Seat successfully held until: 2026-09-13T07:07:00.569Z
   2. Simulating 10-minute timeout by advancing held_until into the past...
   3. Triggering server-side releaseExpiredHolds() cron job...
   ✅ Released count: 1
   4. Verifying User B can now immediately hold the newly released seat...
   ✅ Hold Expiration Test PASSED: Expired holds are released and re-bookable!

🧪 Running Test Suite: End-to-End Booking Lifecycle, Idempotency & Refunds
   1. Searching for Sci-Fi movies...
   ✅ Found 4 Sci-Fi movies (e.g. Dune: Part Two)
   ✅ Selected Showtime: 2026-09-13T14:15:00.000Z in Screen 1 - IMAX Grand Laser
   ✅ Selecting 2 seats: A1 (ACCESSIBLE), A2 (ACCESSIBLE)
   ✅ Server-side price calculation verified: Total $36.80 (3680 cents)
   5. Processing payment with Idempotency Key: idemp_test_1789282620610_abc...
   ✅ Booking confirmed! Reference: CNB-7N82PP, Ticket: TKT-VAUG9LL5
   6. Retrying payment with duplicate idempotency key (simulating network retry)...
   ✅ Idempotency Verified: Duplicate payment attempt returned existing confirmed ticket without duplicate charges!
   7. Verifying booking history for user...
   ✅ Verified digital pass QR data contains: TKT-VAUG9LL5
   8. Testing cancellation and instant refund...
   ✅ Booking successfully cancelled. Refund of $36.80 recorded and seats returned to AVAILABLE!
   ✅ End-to-End Booking Test PASSED!

🧪 Running Test Suite: Authentication, Cross-Tenant Security & Role Isolation
   1. Testing bcrypt password hash verification...
   ✅ Password hashing and bcrypt verification secure
   2. Testing cross-user isolation: User B attempting to cancel User A's booking...
   ✅ Cross-user cancellation successfully blocked: Unauthorized to cancel this booking
   3. Testing Admin authorized cancellation...
   ✅ Admin override cancellation authorized
   ✅ Auth & Security Test PASSED: Isolation and role-based permissions enforced!

==========================================================
📊 TEST RESULTS: 4 Passed | 0 Failed (256ms)
==========================================================
🎉 ALL AGENT 3 QA VERIFICATION TESTS PASSED SUCCESSFULLY!
```

---

## 🚀 Vercel Deployment Guide

### 1. Push to GitHub
```bash
git add .
git commit -m "feat: CineBook production-ready cinema platform"
git push origin main
```

### 2. Import into Vercel
1. Navigate to [Vercel Dashboard](https://vercel.com/new).
2. Import your GitHub repository.
3. In the **Marketplace / Integrations** tab, attach **Neon Serverless Postgres**.
4. Vercel automatically configures the pooled `DATABASE_URL` environment variable.

### 3. Configure Environment Variables in Vercel
Under **Project Settings ➔ Environment Variables**, ensure the following are configured:
- `DATABASE_URL`: Your pooled Neon connection string
- `JWT_SECRET`: 32+ character random string
- `CRON_SECRET`: Secret token for Vercel Cron cleanup
- `NEXT_PUBLIC_APP_URL`: Your Vercel domain (e.g. `https://cinebook.vercel.app`)

### 4. Configure Vercel Cron (`vercel.json`)
The repo includes automatic configuration for expiring seat holds every 5 minutes:
```json
{
  "crons": [
    {
      "path": "/api/cron/release-holds",
      "schedule": "*/5 * * * *"
    }
  ]
}
```

### 5. Deploy & Verify
Click **Deploy**. Once built, run the seed script or trigger it via the admin panel.

---

## 🔒 Security & Best Practices

- **Never Expose Secrets**: Database credentials, payment secrets, and JWT private keys are strictly server-side.
- **Seat Hold Expiration**: Expired seats are automatically reclaimed via database timestamp checking and cron sweeps.
- **Idempotency Guarantee**: Payment attempts are tracked via `idempotency_key` in the `payments` table to prevent duplicate charges or double bookings.
- **Minor Units Precision**: Every monetary value is stored in integer cents (e.g. `$18.50` = `1850`) to avoid floating-point rounding bugs.
