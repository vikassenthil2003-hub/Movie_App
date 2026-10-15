# CineVerse AI — REST API Documentation (v1)

Base URL: `http://localhost:5000/api/v1`

---

## 1. Authentication Endpoints (`/auth`)

### 1.1 Register User
- **Method:** `POST /auth/register`
- **Access:** Public
- **Description:** Registers a new user. Always assigns `role: "user"`. Rejects/ignores any attempt to register an admin role.
- **Request Body:**
  ```json
  {
    "name": "Vikas K",
    "email": "vikas@example.com",
    "password": "Password123!",
    "phone": "+91 9876543210",
    "preferredCity": "Chennai"
  }
  ```
- **Response (201 Created):**
  ```json
  {
    "success": true,
    "message": "User registered successfully",
    "token": "eyJhbGciOi...",
    "data": {
      "_id": "67...",
      "name": "Vikas K",
      "email": "vikas@example.com",
      "role": "user"
    }
  }
  ```

### 1.2 Unified Login (Role-Verified)
- **Method:** `POST /auth/login`
- **Access:** Public
- **Description:** Authenticates credentials and validates against requested `loginMode`. Returns 403 Forbidden if a customer attempts to log in using Admin Login mode, or if an administrator attempts to log in as a customer.
- **Request Body:**
  ```json
  {
    "email": "admin@cineverse.com",
    "password": "Admin@CineVerse2026",
    "loginMode": "admin"
  }
  ```
- **Response (200 OK):**
  ```json
  {
    "success": true,
    "token": "eyJhbGciOi...",
    "data": {
      "_id": "67...",
      "name": "System Administrator",
      "email": "admin@cineverse.com",
      "role": "admin"
    }
  }
  ```

### 1.3 Forgot Password
- **Method:** `POST /auth/forgot-password`
- **Request Body:** `{ "email": "user@example.com" }`
- **Response (200 OK):** Includes development reset token when SMTP is unconfigured.

### 1.4 Reset Password
- **Method:** `POST /auth/reset-password`
- **Request Body:** `{ "token": "123456", "password": "NewPassword123!" }`

---

## 2. Movies Endpoints (`/movies`)

### 2.1 Get All Movies
- **Method:** `GET /movies`
- **Query Parameters:** `search`, `genre`, `language`, `status` (`now_showing`, `coming_soon`), `page`, `limit`.
- **Response (200 OK):** Array of movie records with pagination metadata.

### 2.2 Get Movie by ID
- **Method:** `GET /movies/:movieId`
- **Response (200 OK):** Detailed movie object including cast, directors, formats, and rating.

---

## 3. Theatres & Geospatial Endpoints (`/theatres`)

### 3.1 Get All Theatres
- **Method:** `GET /theatres`
- **Query Parameters:** `city`, `amenities`.

### 3.2 Nearby Theatres (GeoJSON Coordinates)
- **Method:** `GET /theatres/nearby`
- **Query Parameters:** `lat` (Latitude), `lng` (Longitude), `radius` (in km, default: 10).
- **Description:** Queries MongoDB using `$near` on the `2dsphere` index. If zero theatres are found within 10 km, automatically tests radius expansion up to 50 km.
- **Response (200 OK):** Theatres sorted by distance with calculated `distanceKm`.

---

## 4. Shows & Scheduling (`/shows`)

### 4.1 Get Shows
- **Method:** `GET /shows`
- **Query Parameters:** `movieId`, `theatreId`, `date` (`YYYY-MM-DD`).
- **Response (200 OK):** Available showtimes grouped by theatre or movie. Past showtimes are excluded.

---

## 5. Seat Concurrency & Real-Time Locking (`/seats`)

### 5.1 Get Screen Seat Layout & Status
- **Method:** `GET /seats/:showId`
- **Response (200 OK):** Full screen matrix with each seat categorized as `available`, `locked`, or `booked`.

### 5.2 Atomic Temporary Seat Lock
- **Method:** `POST /seats/:showId/lock`
- **Headers:** `Authorization: Bearer <token>`
- **Request Body:** `{ "seats": ["C5", "C6"] }`
- **Response (200 OK):** Returns locked seat IDs and countdown expiration timestamp (300 seconds). Broadcasts `seat_locked` event via Socket.IO.
- **Conflict Response (409 Conflict):** Triggered when another user has already locked any of the selected seats.

### 5.3 Release Seat Lock
- **Method:** `POST /seats/:showId/release`
- **Headers:** `Authorization: Bearer <token>`
- **Request Body:** `{ "seats": ["C5"] }`

---

## 6. Bookings & Checkout (`/bookings`)

### 6.1 Create Pending Booking
- **Method:** `POST /bookings`
- **Headers:** `Authorization: Bearer <token>`
- **Request Body:**
  ```json
  {
    "showId": "67...",
    "seats": ["C5", "C6"],
    "couponCode": "CINEVERSE50"
  }
  ```
- **Description:** Recalculates base price, convenience fees, and coupon discounts on the server. Validates active seat lock ownership.

### 6.2 Get User Bookings
- **Method:** `GET /bookings/my-bookings`
- **Headers:** `Authorization: Bearer <token>`

---

## 7. Demo Payment Simulation (`/payments`)

### 7.1 Simulate Payment
- **Method:** `POST /payments/:bookingId/simulate`
- **Headers:** `Authorization: Bearer <token>`
- **Request Body:**
  ```json
  {
    "paymentMethod": "UPI",
    "simulateOutcome": "success",
    "idempotencyKey": "uuid-v4-..."
  }
  ```
- **Description:** Idempotent demo transaction. Confirms booking status to `'confirmed'`, awards reward points, and broadcasts `seat_booked` via Socket.IO.

---

## 8. QR Tickets & Gate Admission (`/tickets`)

### 8.1 Get Confirmed Ticket
- **Method:** `GET /tickets/:bookingReference`
- **Headers:** `Authorization: Bearer <token>`

### 8.2 Verify Ticket at Theatre Gate
- **Method:** `POST /tickets/verify`
- **Headers:** `Authorization: Bearer <theatre_or_admin_token>`
- **Request Body:**
  ```json
  {
    "bookingReference": "CV-2026-A1B2C3",
    "verificationSecret": "..."
  }
  ```
- **Response (200 OK):** Admitted. Marks `isAdmitted: true` and logs timestamp.
- **Conflict Response (409 Conflict):** Returns error if ticket has already been admitted or cancelled.

---

## 9. CineMate AI Concierge (`/assistant`)

### 9.1 Chat with CineMate AI
- **Method:** `POST /assistant/ask`
- **Request Body:**
  ```json
  {
    "query": "Find action movies showing tonight under 300 rupees",
    "userCity": "Chennai"
  }
  ```
- **Response (200 OK):**
  ```json
  {
    "success": true,
    "reply": "I found 2 action movies showing tonight in Chennai...",
    "matchedShows": [...],
    "source": "rule_based_database_engine"
  }
  ```

---

## 10. Admin & Management Endpoints (`/admin`)

- `GET /admin/analytics`: Aggregated overview stats, top movies, status breakdown, and demo volume.
- `POST /admin/movies`: Create movie.
- `PUT /admin/movies/:id`: Update movie.
- `DELETE /admin/movies/:id`: Delete movie.
- `POST /admin/theatres`: Create cinema complex.
- `POST /admin/shows`: Schedule showtime.
- `POST /coupons`: Create discount coupon.
