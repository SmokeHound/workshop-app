# GitHub Copilot Instructions for Workshop App

This monorepo contains a workshop management application with role-based authentication, inventory management, and order tracking capabilities.

## Repository Structure

```
workshop-app/
├── frontend/         # Vanilla HTML/CSS/JS client interface
│   ├── assets/       # CSS styles, JavaScript utilities
│   ├── shared/       # Frontend config (symlinked from /shared)
│   └── *.html        # Page templates (index, admin, login, etc.)
├── backend/          # Node.js Express + SQLite API server
│   ├── routes/       # API route handlers
│   ├── middleware/   # Security, auth, validation middleware
│   ├── models/       # Database models and schemas
│   └── server.js     # Main server entry point
└── shared/           # Shared configuration and constants
    └── config.js     # API endpoints, roles, themes, features
```

## Technology Stack

- **Frontend**: Vanilla HTML, CSS, JavaScript (ES6+ modules)
- **Backend**: Node.js, Express.js, SQLite3
- **Authentication**: JWT tokens with bcrypt password hashing
- **Security**: Helmet.js, express-rate-limit, express-validator
- **Database**: SQLite with manual schema management
- **Deployment**: Netlify (frontend), Render (backend)

## Architecture Patterns

### Authentication & Authorization
- JWT-based authentication with role-based access control
- Roles: `admin`, `user`, `tech` (defined in `shared/config.js`)
- Protected routes use JWT middleware in `backend/middleware/`
- Frontend stores JWT in localStorage and includes in API requests

### API Design
- RESTful API with `/api` prefix
- Routes organized by feature: `/api/auth`, `/api/orders`, `/api/admin`
- Consistent error handling with status codes and JSON responses
- Request validation using express-validator
- Rate limiting applied to sensitive endpoints

### Frontend Architecture
- Modular vanilla JavaScript with ES6 modules
- Shared utilities in `frontend/utils.js` for DOM manipulation, API calls
- Theme system with CSS variables (light/dark/high-contrast)
- No build process - direct serving of static files

### Database Design
- SQLite database with manual schema management
- Models defined in `backend/models/` directory
- Direct SQL queries (no ORM)
- Tables: users, items, orders, sessions, audit_logs

## Code Patterns to Follow

### Backend API Routes
```javascript
const express = require('express');
const { authenticateToken, requireRole } = require('../middleware/auth');
const router = express.Router();

// Public endpoint
router.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Protected endpoint
router.get('/admin-data', authenticateToken, requireRole('admin'), (req, res) => {
  // Handler logic
});

module.exports = router;
```

### Frontend API Calls
```javascript
// Use fetchAPI utility from utils.js
import { fetchAPI } from './utils.js';

const data = await fetchAPI('/api/endpoint', {
  method: 'POST',
  body: JSON.stringify({ key: 'value' }),
  headers: { 'Content-Type': 'application/json' }
});
```

### Error Handling
- Backend: Consistent JSON error responses with appropriate HTTP status codes
- Frontend: User-friendly error messages with toast notifications
- Logging: Console.error for debugging, structured logs for production

### Security Considerations
- Always validate input on both client and server side
- Use parameterized queries to prevent SQL injection
- Sanitize HTML output to prevent XSS
- Apply rate limiting to sensitive endpoints
- Use HTTPS in production (configured in deployment)

### Theme System
- CSS variables defined in `:root` for theme colors
- Theme switching via `setTheme()` function in `utils.js`
- Persistent theme storage in localStorage
- Support for: light, dark, high-contrast themes

## Development Guidelines

### Adding New Features
1. Backend: Create route in appropriate `/routes` file
2. Add authentication middleware if needed
3. Validate input using express-validator
4. Frontend: Create HTML structure, add JavaScript handlers
5. Update shared config if new constants/endpoints needed

### Database Changes
- Update schema manually in database initialization code
- Consider migration strategy for existing data
- Update models in `backend/models/` directory

### Security Best Practices
- Always authenticate and authorize before data access
- Validate all input on server side
- Use prepared statements for database queries
- Apply rate limiting to prevent abuse
- Log security-relevant events

### Code Style
- Use modern JavaScript (async/await, destructuring, arrow functions)
- Follow REST conventions for API endpoints
- Use semantic HTML and accessible markup
- Keep functions small and focused
- Use meaningful variable and function names

## Common Tasks

### Adding a new API endpoint:
1. Create route handler in appropriate `routes/` file
2. Add authentication middleware if needed
3. Implement input validation
4. Handle success/error responses consistently

### Adding a new frontend page:
1. Create HTML file with standard layout structure
2. Add JavaScript module for page functionality
3. Update navigation if needed
4. Apply consistent styling and theme support

### Managing user roles:
- Roles defined in `shared/config.js` ROLES constant
- Backend middleware enforces role-based access
- Frontend conditionally shows/hides features based on user role

## Environment Configuration

Required environment variables (see `.env-example`):
- `PORT`: Server port (default: 3000)
- `DATABASE_URL`: SQLite database path
- `JWT_SECRET`: Secret for JWT token signing
- `CORS_ORIGIN`: Allowed CORS origins (comma-separated)
- `NODE_ENV`: Environment (development/production)

When suggesting code, prioritize security, maintainability, and consistency with existing patterns.