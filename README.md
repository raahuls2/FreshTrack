# FreshTrack 🌿 | Household Food Management & Waste Reduction

FreshTrack is a full-stack household food inventory application built with **React**, **Vite**, **TypeScript**, **Tailwind CSS**, **Node.js**, **Express**, and **Prisma ORM**.

It is designed to help households track food inventory, minimize waste, streamline shopping lists, and discover recipes matching existing ingredients.

---

## 🎯 Core Questions Answered

1. 🟢 **What food do I have?** -> Accessible via the **Pantry Inventory** (`/pantry`) with category, search, and storage location filters.
2. 🟡 **What should I use soon?** -> Actionable **"Use these first"** dashboard shelf (`/`) showing items expiring today or within 3 days.
3. 🔴 **What has expired?** -> Prominent **🔴 EXPIRED** visual callouts on the dashboard and pantry cards.
4. 🛒 **What do I need to buy?** -> Dedicated **Shopping List** (`/shopping`) with 1-click automatic conversion to pantry stock upon purchase.

---

## 🛠 Tech Stack

### Frontend
- **Framework**: React 18 + Vite + TypeScript
- **Styling**: Tailwind CSS + Custom Design System tokens
- **Icons**: Lucide React
- **Analytics**: Recharts
- **Routing**: React Router DOM v6

### Backend
- **Runtime**: Node.js (v20+) + Express + TypeScript
- **Database ORM**: Prisma ORM (SQLite / PostgreSQL ready)
- **Authentication**: JWT (JSON Web Tokens) with 7-day expiration
- **Security**: bcrypt password hashing & per-user household data isolation

---

## 🚀 Quick Start Instructions

### 1. Prerequisites
- Node.js `v18+` or `v20+`
- `npm` v10+

### 2. Backend Setup
```bash
cd backend
npm install

# Push schema and generate Prisma client
npm run db:push

# Seed realistic demo data (Tomatoes, Spinach, Milk, Bananas, etc.)
npm run db:seed

# Start backend dev server (runs on http://localhost:5000)
npm run dev
```

### 3. Frontend Setup
```bash
cd frontend
npm install

# Start frontend dev server (runs on http://localhost:3000)
npm run dev
```

Open `http://localhost:3000` in your web browser.

---

## 🔑 Demo Account Credentials

Click **"Explore Demo Household"** on the login page or use:
- **Email**: `demo@freshtrack.com`
- **Password**: `password123`

### Pre-Seeded Food Items:
- **Spinach** — 250 g — *expires today* (🟡 SOON)
- **Tomatoes** — 750 g — *expires tomorrow* (🟡 SOON)
- **Milk** — 1 L — *expires in 3 days* (🟡 SOON)
- **Bananas** — 6 pcs — *expires in 2 days* (🟡 SOON)
- **Apples** — 1 kg — *expires in 6 days* (🟢 FRESH)
- **Potatoes** — 2 kg — *expires in 15 days* (🟢 FRESH)
- **Greek Yogurt** — 1 tub — *expired 2 days ago* (🔴 EXPIRED)

---

## 🔮 Future Architecture Readiness

The application is structured to easily integrate future capabilities:
- **Barcode Scanning (`/api/foods/barcode/:code`)**: The food model has strict standard `name`, `unit`, and `category` fields ready to accept UPC/EAN lookup payload wrappers.
- **Receipt Scanning (OCR payload processor)**: The `POST /api/foods` endpoint accepts batch array creation or single item creation cleanly.

---

## 📁 Project Structure

```
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma       # Database schema & indexes
│   │   └── seed.ts             # Demo data seed script
│   ├── src/
│   │   ├── controllers/        # Auth, Food, Shopping, Waste, Dashboard, Recipe controllers
│   │   ├── middleware/         # JWT verification & boundary check
│   │   ├── routes/             # Express API routes
│   │   ├── utils/              # calculateFoodStatus logic & Prisma client
│   │   └── index.ts            # Main Express server entrypoint
│   └── tsconfig.json
│
└── frontend/
    ├── src/
    │   ├── components/         # Navbar, MobileNav, QuickAddModal, EditFoodModal
    │   ├── context/            # AuthContext & Session management
    │   ├── pages/              # Home, Pantry, Shopping, Insights, Recipes, Settings, Login, Register
    │   ├── services/           # Fetch client & API service
    │   ├── types/              # TypeScript interface definitions
    │   └── App.tsx             # Main routing & layout controller
    └── vite.config.ts
```
