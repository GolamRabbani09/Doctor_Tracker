# 🏥 Doctor Tracker — Admin Portal

> A comprehensive, full-stack healthcare administration web portal designed for authenticated administrators to manage doctors, patients, and their clinical relationships. Built with a modern, production-grade tech stack featuring real-time analytics dashboards, optimized MongoDB aggregation pipelines, and a clean, responsive medical-themed UI.

---

## 📋 Table of Contents

- [Description](#description)
- [Tech Stack](#tech-stack)
- [System Architecture](#system-architecture)
- [Features](#features)
- [Setup Guide](#setup-guide)
- [Testing & Verification Guide](#-testing--verification-guide)
- [API Endpoints](#api-endpoints)
- [Database Schema & Indexing](#database-schema--indexing)
- [Technical Decisions](#technical-decisions)
- [Deployment](#deployment)
- [Visual Evidence](#-visual-evidence)
- [Submission Links & Credentials](#-submission-links--credentials)

---

## 📝 Description

**Doctor Tracker** is a full-stack web application that empowers healthcare administrators to efficiently manage their organization's doctors and patients from a single, intuitive dashboard. The platform provides real-time analytics with interactive charts showing patient distribution across specializations, registration trends over time, and doctor-patient load balancing — all powered by optimized MongoDB aggregation pipelines. With features like full-text search, multi-criteria filtering, server-side pagination, and role-based authentication, it delivers a production-ready solution built for scalability and performance.

---

## 🛠️ Tech Stack

| Layer              | Technology                                                         |
| :----------------- | :----------------------------------------------------------------- |
| **Frontend**       | Next.js 14 (App Router), React 18, TypeScript                      |
| **Styling**        | Tailwind CSS 3.4, Custom Component Library (no external UI lib)    |
| **Charts**         | Recharts (Bar, Pie/Donut, Area Charts)                             |
| **Icons**          | Lucide React                                                       |
| **State/Fetching** | React Hooks + Axios + Custom Debounce                              |
| **Notifications**  | React Hot Toast                                                    |
| **Backend**        | Node.js, Express.js                                                |
| **Database**       | MongoDB + Mongoose ODM                                             |
| **Authentication** | JSON Web Tokens (JWT) + bcryptjs                                   |
| **Security**       | Rate Limiting, CORS, Input Sanitization, Centralized Error Handler |

---

## 🏗️ System Architecture

```
┌─────────────────────────────────────────────────────┐
│                     CLIENT (Next.js)                │
│  ┌──────────┐  ┌──────────┐  ┌──────────────────┐  │
│  │  Login   │  │Dashboard │  │ Doctors/Patients │  │
│  │  Page    │  │Analytics │  │   Management     │  │
│  └────┬─────┘  └────┬─────┘  └────────┬─────────┘  │
│       │              │                 │             │
│       └──────────────┼─────────────────┘             │
│                      │                               │
│              ┌───────▼───────┐                       │
│              │  Axios API    │  (Bearer JWT Token)   │
│              │  Service      │                       │
│              └───────┬───────┘                       │
└──────────────────────┼──────────────────────────────┘
                       │  HTTP REST API
                       ▼
┌──────────────────────────────────────────────────────┐
│                   SERVER (Express.js)                │
│  ┌────────────┐  ┌────────────┐  ┌───────────────┐  │
│  │ Auth       │  │  CORS +    │  │  Rate Limiter │  │
│  │ Middleware │  │  Security  │  │  (100/15min)  │  │
│  └─────┬──────┘  └────────────┘  └───────────────┘  │
│        │                                             │
│  ┌─────▼─────────────────────────────────────────┐   │
│  │              REST API Routes                  │   │
│  │  /api/auth    → Login, GetMe                  │   │
│  │  /api/doctors → CRUD + Search + Pagination    │   │
│  │  /api/patients → CRUD + Filter + Pagination   │   │
│  │  /api/analytics → Aggregation Dashboard       │   │
│  └─────┬─────────────────────────────────────────┘   │
│        │                                             │
│  ┌─────▼────────────────────────────────────┐        │
│  │      Centralized Error Handler           │        │
│  │  (CastError, Duplicate, Validation, JWT) │        │
│  └──────────────────────────────────────────┘        │
└──────────────────────┬───────────────────────────────┘
                       │  Mongoose ODM
                       ▼
┌──────────────────────────────────────────────────────┐
│                  MongoDB (Atlas / Local)              │
│  ┌──────────┐  ┌──────────┐  ┌──────────────────┐   │
│  │  Users   │  │ Doctors  │  │    Patients      │   │
│  │ (Admin)  │  │(Indexed) │  │ (Doctor Ref +    │   │
│  │          │  │          │  │  Indexed)        │   │
│  └──────────┘  └──────────┘  └──────────────────┘   │
│                                                      │
│  Indexes: Text Search, Compound, Date, Unique        │
│  Analytics: $facet, $unionWith, $lookup, $group       │
└──────────────────────────────────────────────────────┘
```

---

## ✨ Features

### 🔐 Authentication & Security

- JWT-based admin login with bcrypt password hashing
- Protected API routes and client-side route guards
- Rate limiting (100 requests per 15 minutes per IP)
- Centralized error handling with meaningful error messages

### 📊 Admin Dashboard & Data Visualization

- **4 KPI Metric Cards**: Total Doctors, Total Patients, Avg Patients/Doctor, New This Month
- **Bar Chart**: Top 10 doctors by patient count (horizontal bars)
- **Donut/Pie Chart**: Specialization distribution across doctors
- **Area Chart**: 12-month registration trends (dual lines for doctors & patients)
- All analytics powered by a **single MongoDB Aggregation Pipeline** using `$facet`

### 👨‍⚕️ Doctor Management

- Full CRUD operations (Create, Read, Update, Delete)
- Real-time debounced search (name, specialization, hospital)
- Multi-criteria filtering (specialization, hospital, date range)
- Server-side pagination with metadata
- View & manage patients assigned to each doctor
- Cascade delete (removing a doctor also removes associated patients)

### 🏥 Patient Management

- Dedicated patient management page
- Search by name or medical condition
- Filter by condition, attending doctor, and registration date
- Edit patient details with doctor reassignment
- Server-side pagination

### 🎨 UI/UX Quality

- Fully responsive (mobile, tablet, desktop)
- Loading skeleton animations
- Toast notifications for all operations
- Empty state illustrations
- Confirmation dialogs for destructive actions
- Collapsible sidebar with mobile drawer

---

## 🚀 Setup Guide

### Prerequisites

- **Node.js** >= 18.x
- **MongoDB** (Local instance or [MongoDB Atlas](https://www.mongodb.com/atlas) free cluster)
- **npm** >= 9.x

### 1. Clone the Repository

```bash
git clone <your-repo-url>
cd Doctor_Tracker
```

### 2. Backend Setup

```bash
cd server

# Install dependencies
npm install

# Create environment file
cp .env.example .env
```

Edit `server/.env` with your values:

```env
MONGODB_URI=mongodb://127.0.0.1:27017/doctor_tracker
JWT_SECRET=your_super_secret_jwt_key_here_change_this
JWT_EXPIRE=7d
PORT=5001
CLIENT_URL=http://localhost:3000
```

> **For MongoDB Atlas:** Replace `MONGODB_URI` with your Atlas connection string:
> `mongodb+srv://<username>:<password>@cluster.xxxxx.mongodb.net/doctor_tracker?retryWrites=true&w=majority`

```bash
# Seed the database with demo data
npm run seed

# Start the development server
npm run dev
```

The backend will run on **http://localhost:5001**.

### 3. Frontend Setup

```bash
cd ../client

# Install dependencies
npm install

# Create environment file
cp .env.example .env.local
```

Edit `client/.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:5001/api
```

```bash
# Start the development server
npm run dev
```

The frontend will run on **http://localhost:3000**.

### 4. Access the Application

1. Open **http://localhost:3000** in your browser
2. Login with the demo credentials (see below)

---

## 🧪 Testing & Verification Guide

Run these commands to verify that both frontend and backend are completely functional without errors:

### 1. Backend Verification

```bash
cd server

# A. Syntax and integrity validation for all backend modules
node -c src/server.js

# B. Populate database with demo admin, doctors, and patients
npm run seed

# C. Start server in development mode
npm run dev

# D. Verify server health check (in another terminal)
curl -X GET http://localhost:5001/api/health
# Expected Output: {"success":true,"status":"ok","uptime":...}
```

### 2. Frontend Production Build & Lint Test

```bash
cd client

# A. Run TypeScript type-checking and Next.js production build
npm run build
# Expected Output: ✓ Compiled successfully | ✓ Generating static pages (8/8)

# B. Run linter check
npm run lint

# C. Start local development server
npm run dev
# Open http://localhost:3000 in your browser
```

### 3. Quick API Verification via cURL

**Admin Login Test:**

```bash
curl -X POST http://localhost:5001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@doctor-tracker.com","password":"password123"}'
```

**Fetch Analytics Dashboard (using token from login):**

```bash
curl -X GET http://localhost:5001/api/analytics/dashboard \
  -H "Authorization: Bearer <YOUR_JWT_TOKEN>"
```

**Fetch Paginated & Filtered Doctors:**

```bash
curl -X GET "http://localhost:5001/api/doctors?page=1&limit=5&specialization=Cardiology" \
  -H "Authorization: Bearer <YOUR_JWT_TOKEN>"
```

---

## 🔌 API Endpoints

### Authentication

| Method | Endpoint        | Description           | Auth Required |
| :----- | :-------------- | :-------------------- | :-----------: |
| POST   | /api/auth/login | Admin login           |      No       |
| GET    | /api/auth/me    | Get current user info |      Yes      |

### Doctors

| Method | Endpoint                  | Description                       | Auth Required |
| :----- | :------------------------ | :-------------------------------- | :-----------: |
| GET    | /api/doctors              | List doctors (search/filter/page) |      Yes      |
| GET    | /api/doctors/:id          | Get single doctor                 |      Yes      |
| POST   | /api/doctors              | Create new doctor                 |      Yes      |
| PUT    | /api/doctors/:id          | Update doctor                     |      Yes      |
| DELETE | /api/doctors/:id          | Delete doctor + cascade patients  |      Yes      |
| GET    | /api/doctors/:id/patients | Get doctor's patients             |      Yes      |

### Patients

| Method | Endpoint          | Description                        | Auth Required |
| :----- | :---------------- | :--------------------------------- | :-----------: |
| GET    | /api/patients     | List patients (search/filter/page) |      Yes      |
| GET    | /api/patients/:id | Get single patient                 |      Yes      |
| POST   | /api/patients     | Create new patient                 |      Yes      |
| PUT    | /api/patients/:id | Update patient                     |      Yes      |
| DELETE | /api/patients/:id | Delete patient                     |      Yes      |

### Analytics

| Method | Endpoint                 | Description                     | Auth Required |
| :----- | :----------------------- | :------------------------------ | :-----------: |
| GET    | /api/analytics/dashboard | Aggregated dashboard statistics |      Yes      |

---

## 🗄️ Database Schema & Indexing

### Doctor Schema

| Field          | Type   | Constraints                 |
| :------------- | :----- | :-------------------------- |
| name           | String | Required, trimmed           |
| specialization | String | Required, trimmed           |
| hospital       | String | Required, trimmed           |
| phone          | String | Required                    |
| email          | String | Required, unique, lowercase |
| createdAt      | Date   | Default: Date.now           |

**Indexes:**

- `{ name: 'text', specialization: 'text', hospital: 'text' }` — Full-text search
- `{ specialization: 1, hospital: 1 }` — Compound filter index
- `{ createdAt: -1 }` — Date range queries

### Patient Schema

| Field     | Type     | Constraints               |
| :-------- | :------- | :------------------------ |
| name      | String   | Required, trimmed         |
| age       | Number   | Required                  |
| gender    | String   | Enum: Male, Female, Other |
| phone     | String   | Required                  |
| email     | String   | Optional, lowercase       |
| condition | String   | Required, trimmed         |
| doctorId  | ObjectId | Required, ref: Doctor     |
| createdAt | Date     | Default: Date.now         |

**Indexes:**

- `{ name: 'text', condition: 'text' }` — Full-text search
- `{ doctorId: 1 }` — Doctor-patient lookup
- `{ condition: 1, doctorId: 1 }` — Compound filter
- `{ createdAt: -1 }` — Date range queries

---

## 🧠 Technical Decisions

### Decision 1: Single MongoDB Aggregation Pipeline with `$facet` for Dashboard Analytics

**Problem:** The dashboard requires 8+ different metrics (total counts, ratios, distributions, trends). Executing 8 separate database queries would result in high latency, multiple round-trips, and poor scalability.

**Solution:** We use a **single MongoDB Aggregation Pipeline** that combines `$unionWith` (to merge Doctor and Patient collections) and `$facet` (to execute multiple aggregation sub-pipelines in parallel within a single database call). This approach:

1. **Reduces database round-trips** from 8+ to exactly 1
2. **Leverages MongoDB's native aggregation engine** for server-side computation instead of processing data in Node.js
3. **Uses `$lookup`** for doctor-patient join operations directly in the pipeline
4. **Calculates 12-month registration trends** by grouping by `{ year, month }` with chronological ordering

This is significantly more performant than fetching raw data and computing metrics in application code, especially as the dataset grows.

### Decision 2: Custom UI Component Library with Tailwind CSS (No External UI Framework)

**Problem:** UI libraries like MUI or Ant Design add significant bundle size (often 200KB+ gzipped) and impose their own design language, making customization difficult and increasing load times.

**Solution:** We built a **custom, lightweight component library** from scratch using only Tailwind CSS utility classes:

1. **Zero additional bundle weight** — components compile to vanilla CSS at build time
2. **Complete design control** — every pixel matches the medical admin theme without fighting framework defaults
3. **Better performance** — no runtime CSS-in-JS overhead or unused component imports
4. **Reusable abstractions** — Modal, ConfirmDialog, Pagination, Skeleton, EmptyState — all purpose-built for this application's exact needs
5. **Accessibility built-in** — proper ARIA attributes, focus management, keyboard navigation (Escape to close modals)

This approach demonstrates deep frontend competency while keeping the application lean and maintainable.

---

## 🌐 Deployment

### Backend Deployment (Render)

1. Create a new **Web Service** on [render.com](https://render.com)
2. Connect your GitHub repository
3. Set the **Root Directory** to `server`
4. **Build Command:** `npm install`
5. **Start Command:** `npm start`
6. Add environment variables (MONGODB_URI, JWT_SECRET, JWT_EXPIRE, CLIENT_URL)

### Frontend Deployment (Vercel)

1. Import your GitHub repository on [vercel.com](https://vercel.com)
2. Set the **Root Directory** to `client`
3. **Framework Preset:** Next.js
4. Add environment variable: `NEXT_PUBLIC_API_URL` = your Render backend URL + `/api`

---

## 📸 Visual Evidence

### 1. Desktop Experience (Wide Viewport)

| View                    | Description                                                                                      |         Screenshot Preview          |
| :---------------------- | :----------------------------------------------------------------------------------------------- | :---------------------------------: |
| **Admin Login**         | Secure medical administrative login portal                                                       |   `screenshots/desktop-login.png`   |
| **Analytics Dashboard** | 4 KPI cards, Recharts horizontal bar chart, specialization donut, 12-month dual area trend chart | `screenshots/desktop-dashboard.png` |
| **Doctor Management**   | Multi-criteria filter, debounced search, responsive table, and assigned patients drawer          |  `screenshots/desktop-doctors.png`  |
| **Patient Management**  | Condition filters, doctor assignment, pagination, and edit/delete modals                         | `screenshots/desktop-patients.png`  |

### 2. Mobile Experience (Adaptive Viewport)

| View                         | Description                                                     |         Screenshot Preview         |
| :--------------------------- | :-------------------------------------------------------------- | :--------------------------------: |
| **Mobile Drawer Navigation** | Slide-out overlay navigation with active indicator              |   `screenshots/mobile-menu.png`    |
| **Mobile Analytics & KPIs**  | Stacked responsive stat cards & touch-friendly charts           | `screenshots/mobile-dashboard.png` |
| **Mobile Doctor List**       | Responsive horizontal scrolling & touch-friendly action buttons |  `screenshots/mobile-doctors.png`  |

---

## 📬 Submission Links & Credentials

| Field                          | Submission Details                                         |
| :----------------------------- | :--------------------------------------------------------- |
| **Frontend GitHub Repository** | `https://github.com/<your-username>/doctor-tracker-client` |
| **Backend GitHub Repository**  | `https://github.com/<your-username>/doctor-tracker-server` |
| **Live Frontend URL**          | `https://doctor-tracker-frontend.vercel.app`               |
| **Live Backend API URL**       | `https://doctor-tracker-api.onrender.com`                  |
| **Admin Demo Email**           | `admin@doctor-tracker.com`                                 |
| **Admin Demo Password**        | `password123`                                              |

---

## 📂 Project Structure

```
Doctor_Tracker/
├── server/                    # Backend REST API
│   ├── src/
│   │   ├── config/db.js       # MongoDB connection
│   │   ├── models/            # Mongoose schemas (User, Doctor, Patient)
│   │   ├── controllers/       # Business logic (Auth, Doctor, Patient, Analytics)
│   │   ├── routes/            # Express route definitions
│   │   ├── middleware/        # Auth guard & error handler
│   │   ├── utils/seed.js      # Database seeder
│   │   └── server.js          # Express app entry point
│   ├── .env.example
│   └── package.json
│
├── client/                    # Frontend Application
│   ├── src/
│   │   ├── app/               # Next.js App Router pages
│   │   ├── components/        # Reusable UI components
│   │   ├── services/api.ts    # Axios API client
│   │   ├── context/           # Auth context provider
│   │   ├── hooks/             # Custom React hooks
│   │   └── types/             # TypeScript interfaces
│   ├── .env.example
│   └── package.json
│
└── README.md
```

---

**Built with ❤️ for healthcare administration**
