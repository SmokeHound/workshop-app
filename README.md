# 🧰 Workshop App — Monorepo

[![Netlify Status](https://api.netlify.com/api/v1/badges/f4beb07d-7307-436f-879a-d9a8167934dd/deploy-status)](https://app.netlify.com/projects/workshop-order/deploys)
![GitHub last commit](https://img.shields.io/github/last-commit/SmokeHound/workshop-app)
![CodeRabbit Pull Request Reviews](https://img.shields.io/coderabbit/prs/github/SmokeHound/workshop-app?utm_source=oss&utm_medium=github&utm_campaign=SmokeHound%2Fworkshop-app&labelColor=171717&color=FF570A&link=https%3A%2F%2Fcoderabbit.ai&label=CodeRabbit+Reviews)




This monorepo contains both the frontend, backend and shared modules for the Workshop Ordering App. It’s designed for modular development, shared configuration, and streamlined deployment.

---

## 📁 Structure

```plaintext
workshop-app/
├── frontend/   # Static HTML/JS/CSS interface
├── backend/    # Express + SQLite API
├── shared/     # (Optional) Shared config/constants
├── package.json
└── README.md

