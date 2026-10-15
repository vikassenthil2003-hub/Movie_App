# CineVerse AI — System Architecture & Design

## 1. High-Level Architecture Overview

CineVerse AI is built on a modern MERN stack with a decoupled, event-driven, real-time client-server architecture:

```
+-------------------------------------------------------------------------------+
|                                  CLIENT TIER                                  |
|   React.js 18 (Vite) + Tailwind CSS + Lucide Icons + React-Leaflet + Recharts  |
|                                                                               |
|   +-------------------+  +--------------------+  +-------------------------+  |
|   |   Customer UI     |  |  Admin Dashboard   |  |   Theatre Gate Portal   |  |
|   |  - CineMate AI    |  |  - Recharts        |  |   - QR Scanner Gate     |  |
|   |  - Seat Map (Live)|  |  - CRUD Show/Movie |  |   - Admitted Logging    |  |
|   +-------------------+  +--------------------+  +-------------------------+  |
+-------------------------------------------------------------------------------+
                                  |              ^
                    REST API (v1) |              | Socket.IO (Live Seat Locks)
                                  v              |
+-------------------------------------------------------------------------------+
|                                 APPLICATION TIER                              |
|                          Node.js & Express.js Engine                          |
|                                                                               |
|   +-----------------------------------------------------------------------+   |
|   | Middlewares: JWT Auth, Role Enforcement, Rate Limiting, Sanitization |   |
|   +-----------------------------------------------------------------------+   |
|                                                                               |
|   +-----------------+  +--------------------+  +--------------------------+   |
|   |   Auth Service  |  |    Seat Engine     |  |   CineMate AI Service    |   |
|   |  - Bcrypt 10    |  |  - Atomic Locking  |  |  - Gemini API Provider   |   |
|   |  - Role Guard   |  |  - 5-Min TTL Expire|  |  - Semantic DB Fallback  |   |
|   +-----------------+  +--------------------+  +--------------------------+   |
|   |  Payment Engine |  |  Location Engine   |  |   Gate Ticket Engine     |   |
|   |  - Idempotency  |  |  - 2dsphere GeoJSON|  |  - QR Cryptographic Ref |   |
|   |  - UPI/Card Demo|  |  - Haversine Calc  |  |  - Anti-Duplicate Admiss |   |
|   +-----------------+  +--------------------+  +--------------------------+   |
+-------------------------------------------------------------------------------+
                                         |
                                         | Mongoose ODM
                                         v
+-------------------------------------------------------------------------------+
|                                   DATA TIER                                   |
|                        MongoDB 7.0+ Replica/Standalone                        |
|                                                                               |
|  - Users (Roles, Tiers, Rewards)       - Theatres (GeoJSON 2dsphere)          |
|  - Movies (Text index, Multilingual)   - Shows (Compound Date/Screen index)   |
|  - SeatLocks (MongoDB TTL index 300s)  - Bookings & Payments (Idempotency)    |
+-------------------------------------------------------------------------------+
```

---

## 2. Component Design & Responsibilities

### 2.1 Client Tier (Frontend)
- **Framework & Bundler:** React 18, Vite 5.
- **State Management:**
  - `AuthContext`: Centralized JWT token storage, user roles (`user`, `admin`, `theatre`), login/logout, profile updates.
  - `LocationContext`: Geolocation coordinate listener, reverse geocoding fallback, city selector (`Chennai`, `Salem`, `Coimbatore`, `Madurai`, `Bengaluru`).
  - `AssistantContext`: Floating AI drawer state, natural language conversation history, rule-based execution callbacks.
- **Real-Time Layer:** `Socket.IO Client` connecting to backend room `show:{showId}` for instant seat locking and booking broadcasts without manual page refresh.
- **Visuals:** Custom cinematic design system featuring glassmorphism (`backdrop-filter: blur(16px)`), dark charcoal `#070A12` base, violet `#8B5CF6` and teal `#14B8A6` accents.

### 2.2 Application Tier (Backend)
- **Runtime:** Node.js with Express.js.
- **API Versioning:** All endpoints namespaced under `/api/v1`.
- **Security & Reliability:**
  - `express-rate-limit`: Prevents brute-force on authentication and ticket gate verification.
  - `helmet`: Sets secure HTTP headers (`X-Content-Type-Options`, `X-Frame-Options`).
  - `cors`: Strictly whitelists configured frontend origin.
  - Server-side price recalculation: The client *never* computes final payable totals; fees, taxes, and coupon discounts are verified on the server.

### 2.3 Real-Time WebSocket Engine
- Rooms: `show:{showId}`
- Events:
  - `join_show`: Emitted when user opens the seat booking map.
  - `seat_locked`: Broadcasts to all connected peers in the same auditorium when a seat is temporarily locked.
  - `seat_released`: Broadcasts when a user deselects a seat or when the 5-minute countdown expires.
  - `seat_booked`: Broadcasts final booking confirmation to permanently render seats as booked.

---

## 3. Resilience & Fallback Design

| Subsystem | External Dependency | Fallback Behaviour |
| :--- | :--- | :--- |
| **CineMate AI** | Google Gemini API (`GEMINI_API_KEY`) | Seamlessly switches to local semantic NLP rule engine executing MongoDB queries for languages, budgets, timings, and genres. Works 100% offline. |
| **Location System** | Browser Geolocation API / Nominatim Reverse Geocoder | If permission is denied or geocoding times out, allows one-click selection of supported cities (Chennai, Salem, Coimbatore, Madurai, Bengaluru). Browsing is never blocked. |
| **Seat Locking** | Distributed In-Memory Cache | Uses MongoDB collections with atomic `$setOnInsert` and TTL indices for lock expiration. |
| **Payment Gateway** | Real Banking Gateways | Full simulation engine for UPI, Credit/Debit Card, and Net Banking with simulated success/failure toggles, idempotent references, and demo banners. |
