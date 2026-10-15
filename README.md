# CineVerse AI — Advanced Movie Ticket Booking Platform

[![Node.js](https://img.shields.io/badge/Node.js-v18%2B-green.svg)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-18-blue.svg)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/Vite-5-purple.svg)](https://vitejs.dev/)
[![MongoDB](https://img.shields.io/badge/MongoDB-7.0%2B-forestgreen.svg)](https://www.mongodb.com/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3.4-teal.svg)](https://tailwindcss.com/)
[![Socket.IO](https://img.shields.io/badge/Socket.IO-4.8-black.svg)](https://socket.io/)
[![Tests](https://img.shields.io/badge/Tests-24%20Passing-brightgreen.svg)]()

> A full-stack MERN cinema ticketing web application engineered with cinematic dark-mode aesthetics, real-time Socket.IO seat locking, automatic geospatial location detection, an intelligent CineMate AI movie assistant with offline fallback, a unified `/login` portal with strict database role enforcement, demo payment simulation, digital QR tickets with theatre gate verification, and dedicated Admin & Theatre dashboards.

---

## 🌟 Key Features

### 🎬 1. Cinematic UI/UX & Master Design System
- Dark navy `#070A12` base with glassmorphic cards (`backdrop-filter: blur(16px)`), violet `#8B5CF6` and teal `#14B8A6` accents, and gold highlights.
- Interactive hero banner with movie trailers, genre & language chips, and dynamic showtime selector.
- 100% responsive across desktop, tablet, and mobile with accessible forms, skeletons, and zero dead buttons.

### 🔐 2. Mandatory Single Login Page (`/login`)
- **Single Public URL:** One unified login page at `/login` with an interactive segmented portal selector:
  1. **Customer Login** (`loginMode: 'user'`)
  2. **Admin Login** (`loginMode: 'admin'`)
  3. **Theatre Login** (`loginMode: 'theatre'`)
- **Server Role Guard:** Selecting Admin Login mode **never** grants administrative privileges. The server checks the authentic database role and rejects ordinary users with HTTP **403 Forbidden**.
- **Role-Locked Registration:** Public registration at `/register` strictly hardcodes `role: 'user'`, discarding any user-supplied role inputs.

### 📍 3. Automatic Location Detection & Geospatial Nearby Theatres
- Browser Geolocation API integration with OpenStreetMap Nominatim reverse geocoding.
- Fallback manual city selector supporting **Chennai**, **Salem**, **Coimbatore**, **Madurai**, and **Bengaluru**. Browsing is never blocked.
- MongoDB `2dsphere` geospatial indexing with automated radius expansion (10 km &rarr; 25 km &rarr; 50 km).
- Interactive Leaflet map and list view with exact Haversine distance calculations.

### 🤖 4. CineMate AI Cinema Concierge
- Floating assistant and dedicated interface capable of answering natural-language queries (e.g., *"Find thriller movies under ₹300 in Chennai tonight"*).
- Powered by Google Gemini API with an **automatic semantic database rule-engine fallback** when no API key is configured. Operates 100% without external API costs!

### 💺 5. Live Interactive Seat Map & Concurrency Protection
- Visual tiers: **Standard (₹190)**, **Premium (₹280)**, and **Recliner (₹450)** with realistic screen glow curves.
- **Atomic Locking:** Atomic MongoDB operations prevent duplicate locks.
- **Real-Time Sync:** Socket.IO broadcasts seat lock and booking events instantly to all peers in the auditorium.
- **5-Minute TTL Timer:** Active countdown timer on screen with automatic lock release upon expiration.

### 💳 6. Checkout & Demo Payment Simulation
- Server-side price recalculation: base ticket price + 10% convenience fee + 18% GST - verified coupon discounts.
- Payment simulation for **UPI Demo**, **Card Demo**, and **Wallet Demo** with idempotency keys.
- Prominently watermarked: *"DEMO PAYMENT — NO REAL MONEY CHARGED"*.

### 🎫 7. Digital QR Tickets & Gate Admission Scanner
- Instant generation of verified digital tickets with unique references (e.g., `CV-2026-A1B2C3`).
- Cryptographic verification tokens embedded inside QR codes (no plain-text user passwords or private card numbers).
- Dedicated Theatre Gate Scanner at `/theatre/verify-ticket` to admit patrons and block duplicate scans.

### 📊 8. Admin & Theatre Portals
- **Admin Console (`/admin`):** Recharts analytics, movie CRUD, theatre and screen management, showtime scheduling, coupon creation, and user management.
- **Theatre Portal (`/theatre`):** Daily showtime schedules, screen occupancy, and ticket gate scanner.

### 🏛️ 9. Comprehensive Tamil Nadu Theatre Directory & Administration
- **38 District Coverage:** Spanning all official districts of Tamil Nadu (Chennai, Coimbatore, Madurai, Salem, Tiruchirappalli, Tirunelveli, Erode, Tiruppur, Vellore, Thanjavur, Dindigul, Hosur, Kanyakumari, etc.).
- **Major Chains & Landmark Hubs:** PVR INOX, AGS Cinemas, SPI/Sathyam Cinemas, Cinepolis, Mayajaal, Rohini Silver Screens, Kamala Cinemas, ARRS Multiplex, and verified independent single screens.
- **OpenStreetMap Overpass Integration:** Legitimate public directory and OSM Overpass API queries with pre-bundled fallback, strict rate-limiting, and 24-hr geocode caching.
- **Verified vs Unverified Separation:** Clear labeling of authenticated directory venues vs imported OpenStreetMap directory records.
- **Duplicate Prevention & Cluster Detection:** Spatial (< 400m) and normalized name deduplication. Admin console includes a live Duplicate Scanner to inspect and resolve redundant records.
- **Honest District Completeness Audit:** Distinguishes High Density, Moderate Density, and Minimal / Expanding districts.
- **Showtime Configuration & Booking Restriction:** Authorizes admins and theatre staff to configure screens and showtimes for any theatre. Strictly restricts administrators from booking tickets.

---

## 🏗️ Project Architecture

```
cineverse-ai/
├── frontend/                     # React 18 + Vite client
│   ├── src/
│   │   ├── components/           # Common, layout, movies, seats, map, assistant, modals
│   │   ├── pages/                # Customer, Auth, Admin, and Theatre pages
│   │   ├── context/              # Auth, Location, and Assistant contexts
│   │   ├── services/             # Axios API client & Socket.IO client
│   │   ├── routes/               # AppRoutes with ProtectedRoute guards
│   │   └── styles/               # Tailwind CSS & custom cinematic tokens
│   ├── package.json
│   └── vite.config.js
├── backend/                      # Node.js + Express + Socket.IO server
│   ├── src/
│   │   ├── models/               # 15 Mongoose schemas with 2dsphere & TTL indexes
│   │   ├── controllers/          # Business logic controllers
│   │   ├── routes/               # Versioned REST endpoints (/api/v1)
│   │   ├── middleware/           # Auth, Role guards, Rate limiter, Error handler
│   │   ├── services/             # AI service (Gemini + fallback), Socket handlers
│   │   ├── app.js
│   │   └── server.js
│   ├── tests/                    # Automated Node test runner suite (24 tests)
│   └── package.json
├── scripts/
│   ├── seedDatabase.js           # Seeds movies, theatres, screens, shows, coupons
│   └── createAdmin.js            # Secure initial administrator bootstrap
├── docs/                         # Comprehensive engineering documentation
│   ├── architecture.md
│   ├── database-design.md
│   ├── tamil-nadu-theatre-directory.md  # Complete 38-district directory & audit guide
│   ├── api-documentation.md
│   ├── booking-flow.md
│   ├── location-system.md
│   ├── authentication.md
│   └── setup-guide.md
├── .env.example
└── README.md
```

---

## ⚡ Quick Start

### 1. Clone & Configure Environment
```bash
git clone <repo-url>
cd "movie ticket booking"

# Create backend .env
cp .env.example backend/.env
```

Ensure `backend/.env` contains:
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/cineverse_ai
JWT_SECRET=cineverse_super_secret_jwt_key_2026_secure
FRONTEND_URL=http://localhost:5173
```

### 2. Install Dependencies
```bash
cd backend && npm install
cd ../frontend && npm install
cd ..
```

### 3. Seed Database & Bootstrap Admin
```bash
# Seed demonstration movies, theatres, screens, showtimes, and coupons
node scripts/seedDatabase.js

# Bootstrap system administrator account
node scripts/createAdmin.js
```

### 4. Run Automated Tests
```bash
cd backend && npm test
```
*Executes all 36 automated unit and integration tests (Auth, Role enforcement, Seat lock conflicts, Demo payments, QR gate verification).*

### 4b. Tamil Nadu Directory & RBAC Test Suites
```bash
# Run 38-district Tamil Nadu Comprehensive Test Suite
node backend/src/scripts/comprehensiveTamilNaduTest.js

# Run RBAC Permissions & Booking Restrictions Test Suite
node backend/src/scripts/testPermissionsAndWorkflows.js

# Seed / Reseed Tamil Nadu Theatres & Shows
node backend/src/scripts/seedTamilNaduTheatres.js
```
*Validates 38-district coverage, reverse geocoding, proximity sorting, dynamic showtimes, idempotent deduplication, and administrator booking prevention.*

### 5. Setup & Verify Demonstration User Accounts
```bash
npm run setup-users
```
*Ensures Customer (`customer@cineverse.com`), Admin (`admin@cineverse.com`), and Theatre Staff (`theatre@cineverse.com`) exist idempotently in MongoDB with bcrypt passwords preserved.*

To create or reset an individual account:
```bash
# Create or verify customer
npm run create-customer -- --email=mycustomer@cineverse.com --password=MyPassword@123

# Create or verify admin
npm run create-admin -- --email=admin@cineverse.com --password=Admin@CineVerse2026
```

### 6. Start Application
Open two terminal windows:

**Terminal 1 (Backend Server):**
```bash
cd backend
node src/server.js
```

**Terminal 2 (Frontend Client):**
```bash
cd frontend
npm run dev
```

Visit **`http://localhost:5173`** in your browser!

---

## 🔑 Pre-Configured Demo Credentials

| Role | Portal Mode | Email | Password |
| :--- | :--- | :--- | :--- |
| **Customer** | Customer Login | `customer@cineverse.com` | `Customer@CineVerse2026` |
| **System Administrator** | Admin Login | `admin@cineverse.com` | `Admin@CineVerse2026` |
| **Theatre Staff** | Theatre Login | `theatre@cineverse.com` | `Theatre@CineVerse2026` |

---

## 📄 License & Notes
- Built for educational, demonstration, and evaluation purposes.
- All monetary transactions, cards, and reward points are simulations.
- Documentation available in the [`docs/`](./docs) directory.
