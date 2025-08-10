Deploy status: [![Netlify Status](https://api.netlify.com/api/v1/badges/f4beb07d-7307-436f-879a-d9a8167934dd/deploy-status)](https://app.netlify.com/projects/workshop-order/deploys)

https://workshop.joshburt.com.au

🛠️ Workshop Ordering App — Frontend

This is the client-side interface for the Workshop Ordering App. It enables users to submit orders, view past requests, and for admins to manage inventory items. Built with vanilla HTML/CSS/JS and modular utilities for a responsive, interactive experience.

---

📄 Pages Overview

| Page             | Description                            |
|------------------|----------------------------------------|
| index.html     | Redirect or landing page (optional)    |
| login.html     | Role-based login form                  |
| item-admin.html| Add/edit items (admin only)            |
| order.html     | Submit workshop orders                 |
| history.html   | View past orders with timestamps       |

---

⚙️ Scripts & Modules

| File             | Description                                    |
|------------------|------------------------------------------------|
| utils.js       | Spinner, toast notifications, theme toggles    |
| item-admin.js  | Handles item addition workflow                 |
| order.js       | Handles order submission and form behavior     |
| history.js     | Renders order list from backend API            |

---

🎨 Styling & Theme

- Uses a single styles.css with global theme variables.
- Supports light/dark mode with animated transitions.
- Preferences saved via localStorage.

---

🚀 Setup Notes

1. Host frontend on Netlify.
2. Backend API should be publicly accessible (e.g. Render or similar).
3. Ensure CORS headers are enabled on backend.
4. Set up appropriate role tokens for admin functions.

---

🧪 Development Tips

- Use browser dev tools to inspect localStorage for theme and auth tokens.
- All toast/spinner feedback can be toggled from utils.js.
- Modular scripts allow easy expansion (e.g., dashboard, analytics).
