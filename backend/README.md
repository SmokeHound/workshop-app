# 🛠 Workshop Backend

Express + SQLite backend API for the Workshop App.

## Prerequisites
- Node.js (LTS) and npm
- SQLite (bundled via sqlite3 driver)

## Setup
1. Copy `.env-example` to `.env` and set values (especially `JWT_SECRET`).
2. Install dependencies:

```bash
npm install
```

3. Start the server in development:

```bash
NODE_ENV=development npm start
```

The server will create or migrate the SQLite database file indicated by `DATABASE_URL` on first run if migrations/initialization are implemented.

## Environment variables
See `.env-example`. Ensure `JWT_SECRET` is a long random string and kept secret.

## API
All endpoints are prefixed with `/api` by default. Update the frontend `shared/config.js` or API_BASE_URL to match if you change the prefix.

Examples:
- POST `/api/auth/login`
- POST `/api/auth/register`
- GET `/api/items`
- POST `/api/items` (admin)
- GET `/api/history`
- GET `/api/admin/logs`

### Admin endpoints (examples)
- `GET /api/admin/users/export` / `POST /api/admin/users/import`
- `GET /api/admin/roles` / `PUT /api/admin/roles`
- `GET /api/admin/logs`
- `GET /api/admin/announcements` / `POST /api/admin/announcements` / `DELETE /api/admin/announcements/:ts`
- `GET /api/admin/sessions` / `DELETE /api/admin/sessions/:id`
- `GET /api/admin/apikeys` / `POST /api/admin/apikeys` / `DELETE /api/admin/apikeys/:key`
- `GET /api/admin/backup` / `POST /api/admin/restore`

## Security & Production
- Run behind HTTPS (TLS).
- Use a strong `JWT_SECRET` and rotate periodically.
- Limit CORS to trusted origins only (set `CORS_ORIGIN`).
- Add HTTP security headers with `helmet`.
- Add rate limiting (e.g. `express-rate-limit`).
- Validate and sanitize incoming data (e.g. `express-validator` or `Joi`).
- Avoid logging secrets; store API keys and sensitive tokens securely.

## Recommendations
- Add automated tests (unit + integration) and CI linting.
- Use DB migrations or a reliable initialization script for schema changes.
- Consider storing API keys hashed and enforcing least-privilege access for admin endpoints.



