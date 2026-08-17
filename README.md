# Student Management System

A modern, production-quality Student Management System (SMS) for educational institutions. 

## Features
- Single login entry point for all users
- Role-Based Access Control (RBAC): Admin, Class Teacher, Parent
- Admin Dashboard for overall management
- Teacher Dashboard for class and student management
- Parent Dashboard for student performance and attendance tracking
- Scorecards, Remarks, and Analytics

## Technology Stack
- **Frontend**: React.js, React Router, CSS
- **Backend**: Node.js, Express.js
- **Database**: MySQL
- **Authentication**: JWT, bcrypt

## Installation

1. Clone the repository
2. Install dependencies for the server:
   ```bash
   cd server
   npm install
   ```
3. Install dependencies for the client:
   ```bash
   cd client
   npm install
   ```
4. Copy `.env.example` to `.env` in the root (or `server`) directory and update credentials.

## Running Locally

Run backend:
```bash
cd server
npm run dev
```

Run frontend:
```bash
cd client
npm run dev
```
