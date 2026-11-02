# EduManage — School Management System (MERN Stack ERP)

A modern, full-stack School Management & ERP system built with MongoDB, Express.js, React 18, and Node.js.

Features an enterprise-grade School ERP user interface designed with a crisp light aesthetic, professional blue theme (`#1d4ed8`), warm orange accents (`#ea580c`), and role-based workspaces for **Administrators**, **Teachers**, and **Students**.

---

## Tech Stack

- **Frontend:** React 18 + Vite + React Router v6 + Axios + Lucide React Icons
- **Backend:** Node.js + Express 4 REST API
- **Database:** MongoDB Community Server / MongoDB Atlas + Mongoose 8
- **Authentication:** JWT (JSON Web Tokens) + Bcryptjs Password Hashing
- **Security:** Strict Role-Based Access Control (RBAC), Server-Side Scoping, IDOR Protection, Sanitized Auth Payloads

---

## Architecture

```
                       ┌───────────────────────────────┐
                       │     Browser Client (SPA)      │
                       │    Vite React (Port 5173)     │
                       └───────────────┬───────────────┘
                                       │ HTTP / REST API (JWT Bearer)
                                       ▼
                       ┌───────────────────────────────┐
                       │    Node.js + Express API      │
                       │          (Port 5000)          │
                       └───────────────┬───────────────┘
                                       │ Mongoose ODM
                                       ▼
                       ┌───────────────────────────────┐
                       │       MongoDB Database        │
                       │ (school_management / Atlas)   │
                       └───────────────────────────────┘
```

---

## Role-Based Workspaces & Features

### 1. Admin Workspace
- **Dashboard:** Real-time KPI statistics (Total Students, Teachers, Classes, Pending Fees, Today's Attendance count).
- **Students Management:** Complete student directory, roll numbers, class assignment, parent details, debounced search, modal forms.
- **Teachers Management:** Complete faculty records, subject specializations, qualifications, contact info.
- **Classes & Subjects:** Create and manage classes, assign class teachers, create subjects with unique subject codes.
- **Attendance Module:** Interactive daily attendance marking with Present/Absent status pills; full historical log by date/class.
- **Fee Management:** Assign tuition fees, record installment payments with instant validation, track paid and pending balances.
- **Examinations:** Schedule exams with exam dates, subjects, classes, and maximum marks.
- **Marks & Results:** Grade entry with automated percentage and letter grade calculation (`A+`, `A`, `B`, `C`, `D`, `F`).
- **Reports:** Tabular reports for Students, Faculty, Attendance, Fees, and Exam Results with dedicated print stylesheets.
- **User Management:** Create login credentials with safe profile linkage to existing Teacher or Student records; toggle account activation status.

### 2. Teacher Workspace
- **Overview & Statistics:** Total assigned classes, enrolled students count, assigned subjects, and today's attendance summary.
- **My Classes:** View only classes where the teacher is designated as Class Teacher or Subject Teacher, with enrolled student counters.
- **My Students:** Student directory strictly scoped to the teacher's authorized classes.
- **Attendance Marking & History:** Select authorized class and date, mark daily attendance using interactive pills, and view past attendance logs.
- **Marks Entry:** Grade students on scheduled exams for authorized classes with strict bounds checking against `maxMarks`.
- **Exam Schedule:** View scheduled examination dates and subjects for assigned classes.
- **Faculty Profile:** View personal teaching credentials, qualifications, contact information, and class assignments.

### 3. Student Workspace
- **Overview Dashboard:** Personal summary cards, overall attendance percentage, pending tuition balance, academic performance, and overall grade.
- **Personal Profile:** Comprehensive enrollment record including roll number, class, assigned class teacher, date of birth, parent details, phone, and address.
- **Attendance Record:** Real-time attendance rate, days present, days absent, total sessions, and full date-by-date attendance history.
- **Fees & Dues:** Breakdown of total tuition fees, total paid, pending balance, and detailed payment installment receipts.
- **Marks & Results:** Detailed subject-wise examination scores, maximum marks, percentages, and letter grade badges.
- **Exam Schedule:** Upcoming exam schedule for the student's enrolled class.

---

## Project Structure

```
school-management-system/
├── client/                     # Frontend (React 18 + Vite)
│   ├── src/
│   │   ├── components/         # Reusable UI: Sidebar, Modal, ConfirmDialog, StatCard, Forms
│   │   ├── context/            # AuthContext (JWT session), NotificationContext (Toasts)
│   │   ├── layouts/            # AdminLayout (shared navigation shell)
│   │   ├── pages/              # Login, TeacherDashboard, StudentDashboard, Unauthorized
│   │   │   └── admin/          # Dashboard, Students, Teachers, Classes, Subjects, Attendance,
│   │   │                       # Fees, Exams, Results, Reports, Users
│   │   ├── services/           # Axios instance with auth interceptor
│   │   └── index.css           # Enterprise ERP design system stylesheet
│   ├── .env.example
│   ├── package.json
│   └── vite.config.js
├── server/                     # Backend REST API (Node.js + Express)
│   ├── config/                 # MongoDB connection (connectDB)
│   ├── controllers/            # Business logic (Admin, Teacher Portal, Student Portal, Auth, etc.)
│   ├── middleware/             # Auth middleware (protect, authorize), error handlers
│   ├── models/                 # Mongoose schemas (User, Student, Teacher, Class, Subject,
│   │                           #                   Attendance, Fee, Exam, Mark)
│   ├── routes/                 # Express route definitions
│   ├── seed/                   # Database seed script for initial testing
│   ├── utils/                  # resolveProfile, generateToken, asyncHandler
│   ├── .env.example
│   ├── package.json
│   └── server.js
├── screenshots/
├── .gitignore
└── README.md
```

---

## Quick Start & Local Setup

### 1. Prerequisites
- **Node.js** (v18 or higher)
- **MongoDB** running locally on port 27017 or a MongoDB Atlas connection URI

### 2. Backend Setup
```bash
cd server
npm install

# Copy environment template
cp .env.example .env    # On Windows: copy .env.example .env

# (Optional) Seed demo data if database is empty:
# npm run seed

# Start development server
npm run dev
```
Backend API will be running on **http://localhost:5000**.  
Verify health check at **http://localhost:5000/api/health**.

### 3. Frontend Setup
```bash
cd client
npm install

# Copy environment template
cp .env.example .env    # On Windows: copy .env.example .env

# Start Vite dev server
npm run dev
```
Frontend application will be accessible at **http://localhost:5173**.

---

## API Endpoints Reference

### Public / Authentication
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/api/health` | Public | System status and timestamp |
| `POST` | `/api/auth/login` | Public | Authenticates credentials, returns signed JWT & user profile |
| `GET` | `/api/auth/me` | Authenticated | Validates token and returns current user identity & linked profile |

### Teacher Portal (`/api/teachers/portal/*`)
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/api/teachers/portal/stats` | Teacher | Overview KPIs (classes, students, subjects, today's attendance) |
| `GET` | `/api/teachers/portal/profile` | Teacher | Personal faculty credentials and class assignments |
| `GET` | `/api/teachers/portal/classes` | Teacher | Classes assigned to the teacher with student counts |
| `GET` | `/api/teachers/portal/students` | Teacher | Students enrolled in teacher's assigned classes |
| `GET` | `/api/teachers/portal/attendance/sheet` | Teacher | Attendance sheet for an authorized class and date |
| `POST` | `/api/teachers/portal/attendance` | Teacher | Mark attendance for an authorized class |
| `GET` | `/api/teachers/portal/attendance/history` | Teacher | Attendance history scoped to teacher's classes |
| `GET` | `/api/teachers/portal/exams` | Teacher | Scheduled exams for teacher's classes/subjects |
| `GET` | `/api/teachers/portal/marks` | Teacher | Exam marks roster for grading |
| `POST` | `/api/teachers/portal/marks` | Teacher | Submit or update student examination marks |

### Student Portal (`/api/students/portal/*`)
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/api/students/portal/stats` | Student | Summary metrics (attendance %, dues, grade average) |
| `GET` | `/api/students/portal/profile` | Student | Personal enrollment record and contact details |
| `GET` | `/api/students/portal/attendance` | Student | Full attendance log and cumulative attendance rate |
| `GET` | `/api/students/portal/fees` | Student | Tuition fee status and installment payment history |
| `GET` | `/api/students/portal/marks` | Student | Examination results, percentages, and letter grades |
| `GET` | `/api/students/portal/exams` | Student | Upcoming examination schedule for enrolled class |

### Administrator Endpoints
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/api/dashboard/admin-stats` | Admin | Overall school statistics and financial totals |
| `GET/POST/PUT/DELETE` | `/api/students` | Admin | Full student CRUD and search |
| `GET/POST/PUT/DELETE` | `/api/teachers` | Admin | Full faculty CRUD and search |
| `GET/POST/PUT/DELETE` | `/api/classes` | Admin | Class CRUD and class teacher assignment |
| `GET/POST/PUT/DELETE` | `/api/subjects` | Admin | Subject CRUD and teacher assignment |
| `GET/POST` | `/api/attendance` | Admin | School-wide attendance marking and history |
| `GET/POST/DELETE` | `/api/fees` | Admin | Fee management and payment recording |
| `GET/POST/PUT/DELETE` | `/api/exams` | Admin | Exam scheduling |
| `GET/POST/PUT/DELETE` | `/api/marks` | Admin | Mark entry and result management |
| `GET/POST/PUT/DELETE` | `/api/users` | Admin | User account management with profile linkage |

---

## Production Build & Deployment

### 1. Build Frontend
```bash
cd client
npm run build
```
Generates optimized static assets in `client/dist`.

### 2. Production Environment Variables
Configure on your hosting platform (Render, Railway, Heroku, AWS, DigitalOcean):

**Server (`.env`):**
```ini
PORT=5000
NODE_ENV=production
MONGO_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/school_management?retryWrites=true&w=majority
JWT_SECRET=your_strong_random_jwt_secret_key_here
JWT_EXPIRES_IN=7d
CLIENT_URL=https://your-frontend-domain.com
```

**Client (`.env` / Environment Variables):**
```ini
VITE_API_URL=https://your-backend-api-domain.com/api
```

### 3. Production Start Commands
- **Backend:** `npm start` (runs `node server.js`)
- **Frontend:** Serve `dist/` directory with Nginx, Cloudflare Pages, Netlify, or Vercel.

---

## Grading Scheme

| Percentage Range | Grade | Description |
|---|---|---|
| 90% – 100% | **A+** | Outstanding |
| 80% – 89% | **A** | Excellent |
| 70% – 79% | **B** | Very Good |
| 60% – 69% | **C** | Good |
| 50% – 59% | **D** | Pass |
| Below 50% | **F** | Fail |
