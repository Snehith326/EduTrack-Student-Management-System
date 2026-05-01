# 🎓 EduTrack — Student Management System

A full-stack MERN application for managing students, conducting daily quizzes, and tracking learning consistency through streaks.

---

## 🚀 Quick Start

### 1. Start Backend
```bash
cd backend
npm run dev          # nodemon auto-restart
```

### 2. Seed Database (run once)
```bash
cd backend
npm run seed
```

### 3. Start Frontend
```bash
cd frontend
npm run dev
```

### 4. Open App
```
http://localhost:5173
```

---

## 🔑 Login Credentials

| Role    | Email                  | Password    |
|---------|------------------------|-------------|
| Admin   | admin@edutrack.com     | admin123    |
| Student | alice@college.edu      | student123  |
| Student | bob@college.edu        | student123  |

---

## 🏗️ Architecture

```
student-management-system/
├── backend/
│   ├── models/
│   │   ├── Student.js       # User model (admin + student)
│   │   ├── Quiz.js          # Daily quiz with 3-5 questions
│   │   └── Attempt.js       # Quiz attempt (unique per student/quiz)
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── studentController.js
│   │   └── quizController.js
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── studentRoutes.js
│   │   └── quizRoutes.js
│   ├── middleware/
│   │   └── authMiddleware.js  # JWT protect + adminOnly
│   ├── server.js
│   └── seed.js
│
└── frontend/
    └── src/
        ├── context/AuthContext.jsx
        ├── services/api.js
        ├── components/Layout.jsx   # Collapsible sidebar
        └── pages/
            ├── Login.jsx
            ├── Dashboard.jsx       # Admin & student views
            ├── StudentList.jsx     # CRUD with modals
            ├── StudentProfile.jsx  # Full analytics profile
            ├── QuizPage.jsx        # Timer, navigation, results
            ├── Analytics.jsx       # Student performance
            ├── Leaderboard.jsx     # Podium + ranked table
            └── AdminQuiz.jsx       # Quiz creator
```

---

## ✨ Feature Summary

| Feature                   | Status |
|---------------------------|--------|
| Student CRUD              | ✅     |
| Search & Filter           | ✅     |
| JWT Authentication        | ✅     |
| Role-based Access         | ✅     |
| Daily Quiz (3-5 MCQs)     | ✅     |
| Anti-duplicate Attempts   | ✅     |
| Score Calculation         | ✅     |
| 🔥 Streak Tracker (USP)  | ✅     |
| Performance Analytics     | ✅     |
| Leaderboard with Podium   | ✅     |
| Admin Quiz Creator        | ✅     |
| Countdown Timer           | ✅     |
| Missed Quiz Reminder      | ✅     |
| Answer Review             | ✅     |

---

## 🔥 Streak Logic

```
if today - lastAttemptDate == 1 day  →  streak += 1
if today - lastAttemptDate >  1 day  →  streak = 1
if first attempt ever               →  streak = 1
```

Duplicate attempts are prevented at the **database level** via a compound unique index: `{ student, quiz }`.

---

## 🌐 API Endpoints

```
POST   /api/auth/login
GET    /api/auth/me

GET    /api/students                    (admin)
POST   /api/students                    (admin)
PUT    /api/students/:id                (admin)
DELETE /api/students/:id                (admin)
GET    /api/students/:id                (any)
GET    /api/students/leaderboard        (any)
GET    /api/students/dashboard-stats    (admin)

GET    /api/quizzes/today               (any)
POST   /api/quizzes/submit              (student)
GET    /api/quizzes/analytics/:studentId (any)
POST   /api/quizzes                     (admin)
GET    /api/quizzes                     (admin)
```
