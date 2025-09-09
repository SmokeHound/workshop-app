# 🛠 Workshop App - Monorepo

![Netlify Status](https://api.netlify.com/api/v1/badges/f4beb07d-7307-436f-879a-d9a8167934dd/deploy-status)
![GitHub last commit](https://img.shields.io/github/last-commit/SmokeHound/workshop-app)
![CodeRabbit Pull Request Reviews](https://img.shields.io/coderabbit/prs/github/SmokeHound/workshop-app?label=CodeRabbit+Reviews)

This monorepo contains the frontend, backend, and shared modules for the Workshop App. It’s designed for modular development, shared configuration, and streamlined deployment.

---

## 📦 Repository Structure

```plaintext
workshop-app/
├── frontend/   # Static HTML/JS/CSS client interface
├── backend/    # Express + SQLite API server
├── shared/     # Shared config/constants
└── README.md
```

---

## 🚀 Features

- Role-based authentication (Admin, User, Tech)
- Secure inventory management (CRUD)
- Workshop order submission & history
- Site-wide settings (theme, API base, notifications, accessibility)
- User management (CRUD, roles, password reset, audit log)
- Admin tools (bulk import/export, logs, announcements, sessions, API keys, backup/restore)
- Persistent backend with SQLite for all admin features
- Light/dark/high-contrast theme support
- Real-time feedback with spinners & toasts
- Centralized error handling & logging
- API rate limiting & health check
- Input validation & XSS protection
- *more to come...

---

## 🏗️ Technology Stack

- **Frontend:** HTML, CSS, JavaScript (Vanilla)
- **Backend:** Node.js, Express, SQLite
- **Admin/Settings:** Modular JS, persistent API endpoints
- **Auth:** JWT, bcrypt
- **DevOps:** Netlify (frontend), Render (backend), GitHub Actions (CI)

---

## ⚙️ Installation & Setup

### Prerequisites

- Node.js (22.x LTS recommended; 20.x LTS supported)
- npm

### Backend

*** TO BE UPDATED!! ***

You may need to configure environment variables in `.env` (see `.env-example`):

```env
PORT=3000
DATABASE_URL=./orders.db
JWT_SECRET=your-secret
CORS_ORIGIN=http://localhost:5173
NODE_ENV=development
```

### Frontend

Host via Netlify or serve statically.  
Update any API endpoint URLs in `shared/config.js` if needed.

---

## 📄 Usage

- Visit the frontend app (e.g. [https://workshop.joshburt.com.au](https://workshop.joshburt.com.au))
- Login with appropriate role credentials
- Submit orders, view history, or manage items (admin)
- Theme and preferences stored

---

## 🔌 API Reference

**Base URL:**  
Production: `https://workshop-backend.joshburt.com.au/api`  
Local: `http://localhost:3000/api`

### Endpoints

| Method | Route                | Description                    |
|--------|----------------------|--------------------------------|
| POST   | `/auth/login`        | Login, returns JWT             |
| POST   | `/auth/register`     | Register a new user            |
| GET    | `/auth/me`           | Get current user info          |
| GET    | `/items`             | List all items                 |
| POST   | `/items`             | Add new item (admin)           |
| PUT    | `/items/:id`         | Update item (admin)            |
| DELETE | `/items/:id`         | Delete item (admin)            |
| POST   | `/save-order`        | Submit a new order             |
| GET    | `/history`           | Get order history              |
| GET    | `/stats`             | View stats (orders/items)      |
| GET    | `/health`            | Health check                   |
| GET    | `/consumables`       | Static consumables list        |

**Authentication:**  
- Login returns JWT, use as Bearer token  
- Some endpoints (item management, history) require admin role

### Example: Get Items

```http
GET /api/items
Response: [
  { "id": 1, "name": "Mask", "quantity": 100, "price": 2.00 },
  ...
]
```

### Example: Add Item

```http
POST /api/items
Body: { "name": "Gloves", "quantity": 50, "price": 1.50 }
Response: { "message": "Item added successfully" }
```

---

## 🎨 Layout System

The app uses a reusable layout system for consistent headers, footers, and content areas across pages.  
- CSS variables for themes  
- Modular page scripts for easy expansion (dashboard, analytics, etc.)  
- See `frontend/utils.js` and `frontend/assets/styles.css` for details

---

## 💬 Contact

For questions, reach out via GitHub issues or pull requests.
