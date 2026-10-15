# CineVerse AI — Complete Setup & Deployment Guide

This guide walks you through setting up, configuring, seeding, testing, and running CineVerse AI from scratch on your machine.

---

## 1. Prerequisites

Before starting, ensure you have the following installed:
- **Node.js**: v18.0.0 or later (tested on v26.9.0)
- **npm**: v9.0.0 or later
- **MongoDB**: v6.0 or later running locally (or a MongoDB Atlas connection URI)

Verify your environment:
```bash
node -v
npm -v
mongod --version
```

---

## 2. Environment Configuration

### 2.1 Backend Environment Setup
Create a `.env` file in the `backend/` directory (you can copy from `backend/.env.example` or root `.env.example`):

```bash
cp .env.example backend/.env
```

Ensure the values in `backend/.env` are configured:
```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/cineverse_ai
JWT_SECRET=cineverse_super_secret_jwt_key_2026_secure
JWT_EXPIRE=7d
FRONTEND_URL=http://localhost:5173

# Optional: Google Gemini AI API Key (If omitted, CineMate AI runs in offline semantic rule-engine mode)
GEMINI_API_KEY=

# Optional: Nominatim reverse geocoding custom User-Agent
GEOCODING_USER_AGENT=CineVerseAI-DemoApp/1.0
```

---

## 3. Installing Dependencies

Install dependencies for both backend and frontend:

```bash
# Root directory
npm install

# Backend directory
cd backend
npm install
cd ..

# Frontend directory
cd frontend
npm install
cd ..
```

---

## 4. Database Initialization & Seeding

Run the seed script to populate movies, theatres across Tamil Nadu and Karnataka, screens, seat layouts, upcoming showtimes, coupons, and demo accounts:

```bash
# From the project root:
node scripts/seedDatabase.js
```

### 4.1 Bootstrap Administrator Account
Run the secure admin creation script:
```bash
node scripts/createAdmin.js
```

---

## 5. Pre-Configured Demonstration Accounts

| Role | Portal / Login Mode | Email | Password |
| :--- | :--- | :--- | :--- |
| **System Admin** | Admin Login | `admin@cineverse.com` | `Admin@CineVerse2026` |
| **Theatre Staff** | Theatre Login | `theatre@cineverse.com` | `Theatre@CineVerse2026` |
| **Customer** | Customer Login | Register any new account at `/register` or login as `demo@cineverse.com` | `DemoUser@2026` |

---

## 6. Running the Automated Test Suite

Execute the 24 automated unit and integration tests:

```bash
cd backend
npm test
```

Expected result:
```
ℹ tests 24
ℹ suites 0
ℹ pass 24
ℹ fail 0
```

---

## 7. Starting the Application

Open two terminal windows:

### Terminal 1: Backend Server (API & Socket.IO)
```bash
cd backend
node src/server.js
# Or with automatic reload:
# npm run dev
```
*Backend runs on `http://localhost:5000` (API endpoint: `http://localhost:5000/api/v1`).*

### Terminal 2: Frontend Client (Vite Dev Server)
```bash
cd frontend
npm run dev
```
*Frontend runs on `http://localhost:5173`.*

---

## 8. Verifying Core Flows

1. **Home & Movies:** Open `http://localhost:5173`. Browse movies, watch trailers, filter by language or genre.
2. **Location System:** Click the city badge in the navbar to test auto-detection or select Chennai, Salem, Coimbatore, Madurai, or Bengaluru.
3. **CineMate AI:** Click the floating CineMate AI button or ask "Show action movies tonight".
4. **Unified Login:** Visit `http://localhost:5173/login`. Switch between Customer, Admin, and Theatre modes. Verify that an ordinary user cannot use Admin Login mode.
5. **Seat Map & Real-Time Locking:** Select a movie -> pick showtime -> click seats. Notice the 5-minute countdown and Socket.IO lock broadcast.
6. **Simulated Payment:** Complete checkout -> test UPI Demo, Card Demo, or Wallet Demo -> generate confirmed QR Ticket.
7. **Gate Scanner:** Log in as Theatre Staff (`theatre@cineverse.com` / `Theatre@CineVerse2026`), go to `/theatre/verify-ticket`, and verify admission using the booking reference. Verify that a second scan triggers a duplicate admission rejection.
8. **Admin Dashboard:** Log in as Administrator (`admin@cineverse.com` / `Admin@CineVerse2026`) and inspect live charts, movie CRUD, showtime scheduling, and promo coupons at `/admin/dashboard`.
