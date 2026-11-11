# Doctor Tracker - Backend REST API

Production-ready Node.js, Express, and MongoDB backend for the Doctor Tracker administrative portal.

---

## Architecture Overview

The backend strictly follows the **MVC (Model-View-Controller)** pattern with modular routing and clean separation of concerns:

```
server/
├── package.json
├── .env.example
├── .env
├── README.md
└── src/
    ├── server.js                  # Application entry point, Express setup, rate limiting, graceful shutdown
    ├── config/
    │   └── db.js                  # MongoDB connection with retry logic & event logging
    ├── models/
    │   ├── User.js                # Admin user schema, bcrypt hashing, JWT issuance
    │   ├── Doctor.js              # Doctor schema, compound & text indexing, virtual population
    │   └── Patient.js             # Patient schema, relation indexing, auto-populate hooks
    ├── middleware/
    │   ├── authMiddleware.js      # JWT Bearer token authentication & user context attachment
    │   └── errorHandler.js        # Centralized ApiError class and operational error handler
    ├── controllers/
    │   ├── authController.js      # Authentication logic (login, me)
    │   ├── doctorController.js    # Doctor CRUD, regex/text search, pagination, cascade deletion
    │   ├── patientController.js   # Patient CRUD, doctor validation, search, filtering
    │   └── analyticsController.js # Single MongoDB $facet aggregation pipeline for dashboard metrics
    ├── routes/
    │   ├── authRoutes.js          # /api/auth endpoints
    │   ├── doctorRoutes.js        # /api/doctors endpoints
    │   ├── patientRoutes.js       # /api/patients endpoints
    │   └── analyticsRoutes.js     # /api/analytics endpoints
    └── utils/
        └── seed.js                # Database seeder (Admin, 18 Doctors, 55 Patients across 12 months)
```

---

## API Contract Reference

### Authentication
| Method | Endpoint | Access | Body / Headers | Description |
|---|---|---|---|---|
| `POST` | `/api/auth/login` | Public | `{ email, password }` | Authenticates admin and returns JWT token & user info |
| `GET` | `/api/auth/me` | Protected | `Authorization: Bearer <token>` | Returns current authenticated user |

### Doctors Management
| Method | Endpoint | Access | Query / Body | Description |
|---|---|---|---|---|
| `GET` | `/api/doctors` | Protected | `search=&specialization=&hospital=&startDate=&endDate=&page=1&limit=10&sortBy=createdAt&sortOrder=desc` | Paginated, searchable, filterable list of doctors |
| `GET` | `/api/doctors/:id` | Protected | None | Returns single doctor with assigned patients |
| `POST` | `/api/doctors` | Protected | `{ name, specialization, hospital, phone, email }` | Creates a new doctor |
| `PUT` | `/api/doctors/:id` | Protected | `{ name, specialization, hospital, phone, email }` | Updates existing doctor |
| `DELETE` | `/api/doctors/:id` | Protected | None | Cascades deletion to all assigned patients, then deletes doctor |
| `GET` | `/api/doctors/:id/patients` | Protected | None | Returns list of patients assigned to the specified doctor |

### Patients Management
| Method | Endpoint | Access | Query / Body | Description |
|---|---|---|---|---|
| `GET` | `/api/patients` | Protected | `search=&condition=&doctorId=&startDate=&endDate=&page=1&limit=10&sortBy=createdAt&sortOrder=desc` | Paginated, searchable, filterable list of patients with populated doctor |
| `GET` | `/api/patients/:id` | Protected | None | Returns single patient with doctor details |
| `POST` | `/api/patients` | Protected | `{ name, age, gender, phone, email, condition, doctorId }` | Validates referenced doctor exists and creates patient |
| `PUT` | `/api/patients/:id` | Protected | Partial patient fields (validates doctorId if updated) | Updates patient |
| `DELETE` | `/api/patients/:id` | Protected | None | Deletes patient |

### Analytics Dashboard
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/api/analytics/dashboard` | Protected | Single-query `$facet` aggregation returning: `totalDoctors`, `totalPatients`, `avgPatientsPerDoctor`, `recentDoctors` (30 days), `recentPatients` (30 days), `specializations`, `hospitalDistribution`, `doctorPatientDistribution` (top 10), `registrationTrends` (12 months) |

### Health Check
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/api/health` | Public | Server uptime and health verification |

---

## Seed Data & Credentials

Running `npm run seed` sets up:
- **Admin Email:** `admin@doctor-tracker.com`
- **Admin Password:** `password123`
- **18 Doctors:** Diverse specializations (Cardiology, Neurology, Orthopedics, Pediatrics, etc.) across major hospitals (Square Hospital, United Hospital, Apollo Hospital, Dhaka Medical College, Evercare Hospital, etc.)
- **55 Patients:** Realistic clinical conditions matching doctor specialties, distributed chronologically over the past 12 months for chart visualization.

---

## Getting Started

1. **Install Dependencies:**
   ```bash
   npm install
   ```

2. **Configure Environment:**
   Ensure `.env` exists with:
   ```env
   MONGODB_URI=mongodb://127.0.0.1:27017/doctor_tracker
   JWT_SECRET=doctor_tracker_jwt_super_secret_production_key_2026
   JWT_EXPIRE=7d
   PORT=5000
   CLIENT_URL=http://localhost:3000
   ```

3. **Seed Database:**
   ```bash
   npm run seed
   ```

4. **Run Server:**
   ```bash
   npm run dev
   # or
   npm start
   ```
