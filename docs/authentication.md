# CineVerse AI — Authentication & Role-Based Access Control

## 1. Single Unified Login Page Requirement

As strictly specified in requirement 3:
- **Single Public Route:** One unified login page exists at `/login`. No separate public login URLs are created.
- **Segmented Portal Selector:** Inside `/login`, a segmented control allows switching between:
  1. `Customer Login` (`loginMode: 'user'`)
  2. `Admin Login` (`loginMode: 'admin'`)
  3. `Theatre Login` (`loginMode: 'theatre'`)
- **Server Role Verification:** Selecting `Admin Login` in the UI does **NOT** grant any administrative rights. The backend verifies the user's authentic database role during authentication:
  - If a user with `role: 'user'` attempts to submit credentials via `Admin Login` mode, the server rejects the request with HTTP **403 Forbidden**:
    ```json
    { "success": false, "message": "Forbidden: This account does not have administrator privileges" }
    ```
  - If an administrator attempts to log in via Customer mode under strict mode segregation, the server redirects them to the appropriate portal.

---

## 2. Public Registration Security

- **Route:** `/register`
- **Role Assignment:** Public registration exclusively creates accounts with `role: 'user'`.
- **Payload Sanitization:** The controller explicitly overrides or omits any client-submitted `role` field:
  ```javascript
  const user = await User.create({
    name,
    email,
    password: hashedPassword,
    role: 'user' // Hardcoded: never accepts req.body.role
  });
  ```
- Any malicious request submitting `role: 'admin'` or `role: 'theatre'` is strictly neutralized.

---

## 3. Cryptography & Password Standards

1. **Hashing:** Passwords are never stored in plain text. Hashing is executed via `bcryptjs` using a minimum salt work factor of `10`.
2. **JWT Tokens:**
   - Tokens are signed with a server-side secret (`JWT_SECRET`) and standard expiration (e.g., 7 days).
   - The token payload includes `{ id, role }`.
3. **Transport Security:** Passwords and tokens are transmitted over TLS in production and passed via `Authorization: Bearer <token>` headers.

---

## 4. Initial Administrator Bootstrap

Administrator accounts are never created through public registration. An automated bootstrap script is provided:

```bash
# Securely bootstraps the initial system administrator
node scripts/createAdmin.js
```

The script reads credentials from environment variables (`ADMIN_EMAIL` and `ADMIN_PASSWORD`) or defaults to secure demonstration credentials (`admin@cineverse.com` / `Admin@CineVerse2026`).

---

## 5. Middleware Enforcement Table

| Route Pattern | Required Middleware | Permitted Database Roles |
| :--- | :--- | :--- |
| `/api/v1/movies` (GET) | None (Public) | Any |
| `/api/v1/theatres` (GET) | None (Public) | Any |
| `/api/v1/seats/:showId/lock` | `protect` | `user`, `admin`, `theatre` |
| `/api/v1/bookings` (POST) | `protect` | `user`, `admin`, `theatre` |
| `/api/v1/tickets/verify` | `protect`, `requireRole('theatre', 'admin')` | `theatre`, `admin` |
| `/api/v1/admin/*` | `protect`, `requireRole('admin')` | `admin` |
| `/api/v1/theatre/*` | `protect`, `requireTheatreAccess` | `theatre`, `admin` |
