
# 🛠 Workshop Backend

Express + SQLite backend API for managing workshop consumables, orders, users, roles, sessions, API keys, announcements, and logs. Built for frontend integration via Netlify.

## ✨ Features

- `POST /api/login`
- `POST /api/save-order`
- `GET /api/items`
- `GET /api/history`
- `GET /api/stats`
- `GET /admin/users/export` / `POST /admin/users/import`
- `GET /admin/roles` / `PUT /admin/roles`
- `GET /admin/logs`
- `GET /admin/announcements` / `POST /admin/announcements` / `DELETE /admin/announcements/:ts`
- `GET /admin/sessions` / `DELETE /admin/sessions/:id`
- `GET /admin/apikeys` / `POST /admin/apikeys` / `DELETE /admin/apikeys/:key`
- `GET /admin/backup` / `POST /admin/restore`

All admin endpoints are persistent using SQLite tables.



\## ⚙️ Setup



```bash

npm install

node index.js



