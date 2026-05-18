# 🚀 Smart Leads Dashboard

A full-stack Lead Management Dashboard built with the **MERN stack + TypeScript**.

--- 

## Live
Deploy: https://anilservicehive.vercel.app

---

## ✨ Features

### Core
- **JWT Authentication** — Register, Login, Protected Routes, bcrypt password hashing
- **Lead CRUD** — Create, Read, Update, Delete leads
- **Advanced Filtering** — Filter by Status, Source, Search by Name/Email, Sort
- **Backend Pagination** — 10 records/page with full metadata
- **Debounced Search** — 400ms debounce on search input
- **CSV Export** — Export filtered leads as CSV
- **Role-Based Access Control** — Admin & Sales roles with scoped access

### Bonus
- ☀️ **Dark Mode** — System preference + manual toggle, persisted in localStorage

---

## 🛠 Tech Stack

| Layer      | Technology                              |
|------------|------------------------------------------|
| Frontend   | React 18, TypeScript, TailwindCSS, Vite |
| State      | Zustand (with persist middleware)        |
| Backend    | Node.js, Express.js, TypeScript          |
| Database   | MongoDB + Mongoose                       |
| Auth       | JWT + bcrypt                             |
| Routing    | React Router v6                          |
| HTTP       | Axios (with interceptors)                |
| DevOps     | Docker + Docker Compose                  |

---

## 📁 Project Structure

```
smart-leads-dashboard/
├── backend/
│   ├── src/
│   │   ├── config/         # DB connection
│   │   ├── controllers/    # Route handlers
│   │   ├── middleware/     # Auth + error middleware
│   │   ├── models/         # Mongoose models
│   │   ├── routes/         # Express routers
│   │   ├── types/          # TypeScript interfaces
│   │   └── index.ts        # Entry point
│   ├── Dockerfile
│   ├── tsconfig.json
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── layout/     # Layout, Sidebar
│   │   │   ├── leads/      # LeadTable, LeadForm, LeadFilters
│   │   │   └── ui/         # Reusable UI primitives
│   │   ├── hooks/          # useDebounce, useDarkMode
│   │   ├── pages/          # Page-level components
│   │   ├── services/       # API service layer
│   │   ├── store/          # Zustand stores
│   │   ├── types/          # TypeScript interfaces
│   │   └── App.tsx
│   ├── Dockerfile
│   ├── nginx.conf
│   └── package.json
│
└── docker-compose.yml
```

---

## 🚀 Setup Instructions

### Prerequisites
- Node.js 18+
- MongoDB (local or Atlas)
- Docker (optional)

---

### Option 1 — Local Dev

**1. Clone & install**
```bash
git clone <repo-url>
cd smart-leads-dashboard

# Backend
cd backend
cp .env.example .env       # edit with your values
npm install
npm run dev                # http://localhost:5000

# Frontend (new terminal)
cd ../frontend
cp .env.example .env.local
npm install
npm run dev                # http://localhost:5173
```

**2. Configure environment**

`backend/.env`:
```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/smart-leads
JWT_SECRET=your_super_secret_key
JWT_EXPIRES_IN=7d
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
```

`frontend/.env.local`:
```
VITE_API_URL=http://localhost:5000/api
```

---

### Option 2 — Docker

```bash
cp backend/.env.example backend/.env   # edit JWT_SECRET
docker-compose up --build
```

- Frontend: http://localhost
- Backend: http://localhost:5000
- MongoDB: localhost:27017

---

## 📡 API Documentation

### Base URL
```
http://localhost:5000/api
```

### Authentication

All protected routes require:
```
Authorization: Bearer <token>
```

---

#### `POST /auth/register`
```json
{
  "name": "Rahul Sharma",
  "email": "rahul@example.com",
  "password": "secret123",
  "role": "sales"          // "admin" | "sales"
}
```
**Response 201:**
```json
{
  "success": true,
  "data": { "user": {...}, "token": "..." }
}
```

---

#### `POST /auth/login`
```json
{ "email": "rahul@example.com", "password": "secret123" }
```

---

#### `GET /auth/me` 🔒
Returns authenticated user profile.

---

#### `GET /auth/users` 🔒 Admin only
Returns all registered users.

---

### Leads

#### `GET /leads` 🔒
**Query params:**
| Param    | Type   | Description                      |
|----------|--------|----------------------------------|
| page     | number | Page number (default: 1)         |
| limit    | number | Records per page (default: 10)   |
| status   | string | New \| Contacted \| Qualified \| Lost |
| source   | string | Website \| Instagram \| Referral |
| search   | string | Search by name or email          |
| sort     | string | latest \| oldest                 |

**Response 200:**
```json
{
  "success": true,
  "data": { "leads": [...] },
  "pagination": {
    "total": 42,
    "page": 1,
    "limit": 10,
    "totalPages": 5,
    "hasNextPage": true,
    "hasPrevPage": false
  }
}
```

---

#### `POST /leads` 🔒
```json
{
  "name": "Priya Patel",
  "email": "priya@example.com",
  "status": "New",
  "source": "Instagram",
  "notes": "Interested in premium plan"
}
```

---

#### `GET /leads/stats` 🔒
Returns aggregate counts by status and source.

---

#### `GET /leads/export` 🔒
Returns CSV file download.

---

#### `GET /leads/:id` 🔒
Returns single lead by ID.

---

#### `PUT /leads/:id` 🔒
Partial update — same fields as POST, all optional.

---

#### `DELETE /leads/:id` 🔒
Deletes lead. Sales users can only delete their own.

---

## 🔐 Role-Based Access

| Action              | Admin | Sales         |
|---------------------|-------|---------------|
| View all leads      | ✅    | ❌ (own only) |
| Create lead         | ✅    | ✅            |
| Update any lead     | ✅    | ❌ (own only) |
| Delete any lead     | ✅    | ❌ (own only) |
| Export CSV          | ✅    | ✅ (filtered) |
| View all users      | ✅    | ❌            |

---

## 📊 Lead Schema

| Field      | Type   | Values                              | Required |
|------------|--------|-------------------------------------|----------|
| name       | String | min 2, max 100                      | ✅        |
| email      | String | valid email                         | ✅        |
| status     | Enum   | New, Contacted, Qualified, Lost     | default: New |
| source     | Enum   | Website, Instagram, Referral        | ✅        |
| notes      | String | max 500                             | ❌        |
| createdBy  | Ref    | User                                | ✅ (auto) |
| assignedTo | Ref    | User                                | ❌        |

---

## 🌙 Dark Mode

Toggle via the sidebar button. Preference is saved to `localStorage` and respects system `prefers-color-scheme` on first visit.

---

## 🤝 Contributing

1. Fork the repo
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit with conventional commits (`git commit -m 'feat: add amazing feature'`)
4. Push and open a PR

---

## Deploy:
Frontend: https://anilservicehive.vercel.app
Backend: https://anilservicehive.onrender.com/health

----

## Author
**Anil Kumar**

---

