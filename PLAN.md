# Security and Quality Improvement Plan
Last updated: August 27, 2025

This plan addresses critical issues found during the full-repo review and defines clear deliverables, owners, and acceptance criteria. Execute tasks in priority order. Create one PR per work package.

## P0 — Security Hardening (blocker for release)
- A. Password hashing and auth flow
  - Scope:
    - Replace plaintext password storage with bcrypt.
    - Refactor validateUser to compare bcrypt hashes.
    - Introduce JWT-based session (access + refresh) or server sessions.
  - Targets:
    - backend/models/orders.js: functions validateUser, createUser (or equivalent user creation point).
    - backend/routes/*: login/register routes.
    - backend/index.js: wire auth middleware.
  - Deliverables:
    - bcrypt and jsonwebtoken (or express-session) added to backend/package.json.
    - New utils/auth.js (hashPassword, verifyPassword, signToken, verifyToken).
    - POST /auth/register, POST /auth/login, GET /auth/me endpoints with validation.
    - Migration script: re-hash existing users or force password reset.
  - Acceptance:
    - Passwords never stored/compared in plaintext.
    - Login returns JWT; protected route requires Authorization: Bearer <token>.
    - End-to-end tests for register/login/protected resource.

- B. CORS and security headers
  - Scope: Lock down CORS and add Helmet.
  - Targets:
    - backend/index.js
  - Deliverables:
    - CORS configured with explicit allowlist via process.env.CORS_ORIGIN.
    - Helmet added with sane defaults.
  - Acceptance:
    - Preflight and simple requests succeed only from allowlisted origins.
    - Security headers visible in responses (X-DNS-Prefetch-Control, X-Content-Type-Options, etc.).

- C. Input validation and sanitization
  - Scope: Validate and sanitize payloads on all write endpoints.
  - Targets:
    - backend/routes/*.js
  - Deliverables:
    - express-validator integrated; validation middlewares per route.
  - Acceptance:
    - Invalid payloads return 400 with field-level messages.
    - Tests cover happy path and common invalid cases.

- D. XSS remediation
  - Scope: Replace unsafe innerHTML with safe rendering or DOMPurify.
  - Targets:
    - frontend/**/*.js where innerHTML is used.
  - Deliverables:
    - Use textContent or sanitized HTML via DOMPurify.
  - Acceptance:
    - No direct user-controlled assignment to innerHTML without sanitization.

## P1 — Reliability, Observability, and DX
- A. Centralized error handling & logging
  - Deliverables:
    - backend/middleware/errorHandler.js (Express error handler).
    - Winston-based logger with JSON logs in production.
  - Acceptance:
    - Uncaught route errors return consistent JSON and are logged with request context.

- B. Test suite
  - Deliverables:
    - Jest + Supertest configured in backend.
    - Minimum 10 API tests (auth, CRUD flows, validation failures).
  - Acceptance:
    - CI passes tests; coverage >= 70% lines backend.

- C. Linting/formatting & pre-commit
  - Deliverables:
    - ESLint + Prettier config.
    - Husky + lint-staged pre-commit hooks.
  - Acceptance:
    - npm run lint and npm run format succeed; pre-commit enforces staged checks.

- D. Health checks and rate-limiting
  - Deliverables:
    - GET /health (returns {status:"ok"}).
    - Ensure express-rate-limit is enabled on write routes.
  - Acceptance:
    - Health endpoint integrated; 429 emitted on abuse.

## P2 — Platform & Performance
- A. Environment management
  - Deliverables:
    - .env-example with PORT, DATABASE_URL, JWT_SECRET, CORS_ORIGIN, NODE_ENV.
    - dotenv loaded in backend/index.js.
  - Acceptance:
    - App bootstraps solely from process.env; secrets not hardcoded.

- B. CI/CD
  - Deliverables:
    - GitHub Actions: Node matrix (LTS) running install, lint, test.
  - Acceptance:
    - On PR, workflow runs and blocks merge on failure.

- C. Frontend build optimization (optional)
  - Deliverables:
    - Vite or similar bundler; production build script.
  - Acceptance:
    - Build artifacts under dist/; basic Lighthouse check shows no blocking issues.

---
## Implementation Notes (file-specific)

- backend/models/orders.js
  - Refactor:
    - createUser(username, password) → hash with bcrypt (saltRounds=12).
    - validateUser(username, password) → fetch by username, bcrypt.compare.
  - Remove any SQL querying by username AND plaintext password.

- backend/index.js
  - Add:
    - dotenv config at top.
    - helmet().
    - `cors({ origin: process.env.CORS_ORIGIN?.split(",") ?? [], credentials: true })`.
    - app.use(express.json({ limit: "1mb" })) and a centralized error handler.

- frontend/**/*
  - Replace direct innerHTML assignment as follows:
    - textContent for plain text;
    - DOMPurify.sanitize(html) when HTML is required.

---
## Milestones & Timeline

- M1 (1–2 days): P0-A Password hashing + auth routes + tests.
- M2 (0.5 day): P0-B CORS + Helmet.
- M3 (1 day): P0-C Validation + tests.
- M4 (0.5–1 day): P0-D XSS fixes.
- M5 (1 day): P1-A Error handler + logging.
- M6 (1 day): P1-B Tests to reach coverage bar.
- M7 (0.5 day): P1-C Tooling & hooks.
- M8 (0.5 day): P1-D Health + rate limit verification.
- P2 items as schedule permits.

---
## PR Breakdown

1) feat(auth): hash passwords, JWT sessions, routes, tests  
2) feat(security): enable helmet, restrict CORS  
3) feat(validation): express-validator across write endpoints  
4) fix(xss): sanitize DOM updates on frontend  
5) feat(obs): error middleware + winston logger  
6) chore(dxtools): eslint, prettier, husky, lint-staged  
7) feat(ops): health endpoint, confirm rate limit  
8) ci: add GitHub Actions workflow

---
## Commands & Scaffolding (to use when implementing)

Backend deps:
- npm i -w backend bcrypt jsonwebtoken express-validator helmet cors dotenv winston
- npm i -D -w backend jest supertest cross-env

Scripts (backend/package.json):
- "dev": "nodemon index.js"
- "test": "cross-env NODE_ENV=test jest --runInBand"
- "lint": "eslint ."
- "format": "prettier --write ."

.env.example:
- PORT=3000
- DATABASE_URL=./orders.db
- JWT_SECRET=change-me
- `CORS_ORIGIN=http://localhost:5173`
- NODE_ENV=development

Testing:
- Supertest for /auth/register, /auth/login, /health, a protected route.

---
## Definition of Done (per work package)

- Security: No plaintext credentials; CORS restricted; headers present; OWASP ASVS basic auth controls met.
- Validation: All write endpoints validate payloads; tests enforce failures on bad input.
- XSS: No unsafe innerHTML without sanitization; manual test reproduces safety.
- Observability: Central error handler; logs structured in prod.
- Tooling/CI: Lint, format, tests required for PR merge.

---
## Risks & Mitigations

- Legacy user data with plaintext passwords → force reset flow; mark users as "password_reset_required".
- CORS misconfiguration → staged rollout with env-driven allowlist; test with dev/stage origins first.
- Token storage on frontend → prefer HttpOnly secure cookies if SSR; otherwise, short-lived access token + refresh path.