# Student Management System

A modern, comprehensive, and production-ready Student Management System (SMS) for educational institutions. This platform provides a centralized, secure, and interactive interface for administrators, teachers, and parents to streamline school operations, academic tracking, and communication.

## Key Features

### 🔐 Authentication & Security
- Single login entry point with Role-Based Access Control (RBAC).
- Secure JWT authentication and bcrypt password hashing.
- Password recovery via OTP email verification.
- Rate limiting and security headers (Helmet).

### 👨‍💼 Admin Features
- Comprehensive Admin Dashboard for school management.
- Manage Classes, Subjects, Teachers, and Students.
- Fee Management System (Fee terms, settings, payment tracking, and history).
- Advanced analytics and reporting.

### 👩‍🏫 Teacher Features
- Dedicated Teacher Dashboard.
- Manage assigned classes and students.
- Automated Attendance Management (including Facial Recognition integration via Face-API).
- Create, track, and grade Assignments and Homework.
- Manage student Marks, Remarks, and performance progress.

### 👪 Parent Features
- Parent Dashboard for real-time monitoring.
- Track multiple children from a single account.
- View Attendance records and academic Performance Analytics.
- Access detailed Scorecards and Teacher Remarks.
- Track fee dues and payment history securely.

### 🚀 Advanced Integrations
- **Facial Recognition**: Integrated `@vladmandic/face-api` for modern face-based attendance and verification.
- **Data Visualization**: Rich performance analytics charts using `recharts`.
- **Dynamic Animations**: Smooth UI transitions powered by `framer-motion`.
- **QR Codes**: Generated on-the-fly for quick access or student ID integrations.
- **Email Notifications**: Automated email alerts for OTPs and notifications using `nodemailer`.

## Technology Stack

### Frontend
- **Framework**: React 19, Vite
- **Routing**: React Router DOM v7
- **Styling & UI**: Vanilla CSS, Framer Motion (Animations), React Icons
- **Data Visualization**: Recharts
- **Forms & Validation**: React Hook Form
- **Specialized Utilities**: `@vladmandic/face-api`, `qrcode.react`, `node-vibrant`

### Backend
- **Framework**: Node.js, Express.js 5
- **Database**: MySQL (using `mysql2`)
- **Authentication**: JSON Web Tokens (JWT), bcrypt
- **File Uploads**: Multer
- **Email & Notifications**: Nodemailer
- **Security & Logging**: Helmet, Express Rate Limit, Winston

## Installation & Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd "Student Management System"
   ```

2. **Install all dependencies**
   We have included a convenient script to install dependencies for both client and server:
   ```bash
   npm run install-all
   ```
   *(Alternatively, run `npm install` inside both `client` and `server` folders manually.)*

3. **Environment Configuration**
   - Copy `.env.example` to `.env` in the root (or `server`) directory.
   - Update the variables (Database credentials, JWT secret, Email SMTP details, etc.).

4. **Database Initialization**
   - Ensure MySQL is running and the specified database is created.
   - You can initialize the schema by running the initialization scripts provided in `server/scripts/`.

## Running the Application Locally

You can run both the frontend and backend concurrently from the root directory:

```bash
npm run dev
```

If you prefer to run them separately:

**Run backend:**
```bash
cd server
npm run dev
```

**Run frontend:**
```bash
cd client
npm run dev
```
