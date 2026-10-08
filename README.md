# School Management System (MERN Stack, Offline)

A fully offline School Management System built with MongoDB, Express, React, and Node.js.
Everything runs on your local machine — no cloud database, no external APIs.

## Tech Stack

- **Frontend:** React 18 + Vite + React Router + Axios + lucide-react icons
- **Backend:** Node.js + Express.js + REST API
- **Database:** MongoDB (local) + Mongoose
- **Auth:** JWT + bcrypt password hashing, role-based access control (admin/teacher/student)

## Architecture

```
Browser
  |
React Frontend (http://localhost:5173)
  |
Node.js + Express REST API (http://localhost:5000)
  |
Local MongoDB (mongodb://127.0.0.1:27017/school_management)
```

## Features

- **Auth:** Login, JWT sessions, role-based dashboards and route protection
- **Admin Dashboard:** Live stats (total students, teachers, classes, pending fees, today's attendance)
- **Students:** Full CRUD, search, class assignment, validation
- **Teachers:** Full CRUD, search
- **Classes & Subjects:** Create/manage classes, assign subjects and teachers
- **Attendance:** Mark present/absent per class/date (duplicate-proof), view history
- **Fees:** Create fee records, record payments, auto-calculated pending/paid amounts
- **Exams & Marks:** Create exams, enter/update marks, auto-calculated percentage and grade (A+ to F)
- **Reports:** Student, teacher, attendance, fee, and result reports with print support
- **Users:** Admin can create/activate/deactivate login accounts for teachers and students

## Prerequisites

- [Node.js](https://nodejs.org/) 18+ and npm
- [MongoDB Community Server](https://www.mongodb.com/try/download/community) installed and running locally

### Starting local MongoDB

- **Windows:** Usually runs as a service automatically. If not: `net start MongoDB` (elevated Command Prompt).
- **macOS (Homebrew):** `brew services start mongodb-community`
- **Linux:** `sudo systemctl start mongod`

Verify: running `mongosh` in a terminal should connect without errors.

## Project Structure

```
school-management-system/
├── client/          React frontend (Vite)
│   └── src/
│       ├── components/   Reusable UI: Modal, ConfirmDialog, Sidebar, StatCard, forms
│       ├── context/       AuthContext, NotificationContext
│       ├── layouts/       AdminLayout (sidebar + content shell)
│       ├── pages/          Login, role dashboards
│       │   └── admin/      Students, Teachers, Classes, Subjects, Attendance,
│       │                   Fees, Exams, Results, Reports, Users
│       └── services/       Axios API client
├── server/          Express backend (REST API)
│   ├── config/       MongoDB connection
│   ├── controllers/  Business logic per module
│   ├── middleware/    Auth (JWT) + error handling
│   ├── models/         Mongoose schemas
│   ├── routes/         Express routers
│   ├── seed/            Demo data seed script
│   └── utils/           Helpers (async handler, token generator)
├── screenshots/
├── .gitignore
└── README.md
```

## Setup

### 1. Backend

```bash
cd server
npm install
copy .env.example .env      # Windows
# cp .env.example .env      # macOS/Linux
npm run seed                # creates demo admin/teacher/student + sample data
npm run dev
```

API runs on **http://localhost:5000**. Check **http://localhost:5000/api/health** for a JSON success message.

### 2. Frontend

```bash
cd client
npm install
npm run dev
```

App runs on **http://localhost:5173**.

## Demo Credentials

After running `npm run seed`:

| Role    | Username      | Password     |
|---------|---------------|--------------|
| Admin   | admin         | Admin@123    |
| Teacher | rahul.sharma  | Teacher@123  |
| Student | aarav.patel   | Student@123  |

> This is demo data only. Change these passwords before any real deployment.

## API Endpoints

| Method | Endpoint                       | Access           | Description                        |
|--------|---------------------------------|------------------|-------------------------------------|
| GET    | /api/health                     | Public           | Health check                        |
| POST   | /api/auth/login                 | Public           | Log in, returns JWT + user info     |
| GET    | /api/auth/me                    | Private          | Current user's profile              |
| GET    | /api/dashboard/admin-stats      | Admin            | Dashboard summary stats             |
| GET/POST/PUT/DELETE /api/students      | Admin/Teacher | Student CRUD                  |
| GET/POST/PUT/DELETE /api/teachers      | Admin         | Teacher CRUD                  |
| GET/POST/PUT/DELETE /api/classes       | Admin/Teacher | Class CRUD                    |
| GET/POST/PUT/DELETE /api/subjects      | Admin/Teacher | Subject CRUD                  |
| GET /api/attendance/sheet, POST /api/attendance, GET /api/attendance/history | Admin/Teacher | Attendance |
| GET/POST/DELETE /api/fees, POST /api/fees/:id/payments | Admin | Fees |
| GET/POST/PUT/DELETE /api/exams         | Admin/Teacher | Exam CRUD                     |
| GET/POST/PUT/DELETE /api/marks         | Admin/Teacher | Marks entry, auto grade/%     |
| GET/POST/PUT/DELETE /api/users         | Admin         | Manage login accounts         |

## Grading System

| Percentage | Grade |
|-----------|-------|
| 90–100    | A+    |
| 80–89     | A     |
| 70–79     | B     |
| 60–69     | C     |
| 50–59     | D     |
| Below 50  | F     |

## Pushing to GitHub

The `.gitignore` already excludes `node_modules/`, `.env`, and build output.

```bash
git init
git add .
git commit -m "Initial commit: School Management System"
git remote add origin <your-repo-url>
git branch -M main
git push -u origin main
```

Never commit your real `server/.env` — only `.env.example` should be tracked.

## Notes

- Teacher and Student dashboards are currently simple placeholders. All Admin-side modules (Students, Teachers, Classes, Subjects, Attendance, Fees, Exams, Results, Reports, Users) are fully functional.
- Class field on Student/Subject/Exam/Attendance references the actual `Class` collection (not free text), so create Classes first, then Subjects, before adding Students/Exams that depend on them.
