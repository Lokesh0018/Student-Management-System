const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const app = express();

// Security Middlewares
app.use(helmet({
    crossOriginResourcePolicy: false,
}));

// Apply CORS before rate limiting so 429 responses have CORS headers
app.use(cors());

const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 2000, // Increased limit to prevent issues during React development
    message: { success: false, message: 'Too many requests from this IP, please try again after 15 minutes' }
});
// Apply to all API routes
app.use('/api/', limiter);
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));



const authRoutes = require('./routes/authRoutes');
app.use('/api/auth', authRoutes);

const userRoutes = require('./routes/userRoutes');
app.use('/api/users', userRoutes);

const adminRoutes = require('./routes/adminRoutes');
app.use('/api/admin', adminRoutes);

const classRoutes = require('./routes/classRoutes');
app.use('/api/classes', classRoutes);

const subjectRoutes = require('./routes/subjectRoutes');
app.use('/api/subjects', subjectRoutes);

const studentRoutes = require('./routes/studentRoutes');
app.use('/api/students', studentRoutes);

const teacherRoutes = require('./routes/teacherRoutes');
app.use('/api/teachers', teacherRoutes);


const examRoutes = require('./routes/examRoutes');
app.use('/api/exams', examRoutes);

const markRoutes = require('./routes/markRoutes');
app.use('/api/marks', markRoutes);

const attendanceRoutes = require('./routes/attendanceRoutes');
app.use('/api/attendance', attendanceRoutes);

const remarkRoutes = require('./routes/remarkRoutes');
app.use('/api/remarks', remarkRoutes);

const teacherDashboardRoutes = require('./routes/teacherDashboardRoutes');
app.use('/api/teacher/dashboard', teacherDashboardRoutes);

const performanceRoutes = require('./routes/performanceRoutes');
app.use('/api/performance', performanceRoutes);

const parentDashboardRoutes = require('./routes/parentDashboardRoutes');
app.use('/api/parent/dashboard', parentDashboardRoutes);

const notificationRoutes = require('./routes/notificationRoutes');
app.use('/api/notifications', notificationRoutes);

const feeRoutes = require('./routes/feeRoutes');
app.use('/api/fees', feeRoutes);

const assignmentRoutes = require('./routes/assignmentRoutes');
app.use('/api/assignments', assignmentRoutes);

const homeworkRoutes = require('./routes/homeworkRoutes');
app.use('/api/homework', homeworkRoutes);

const reportRoutes = require('./routes/reportRoutes');
app.use('/api/reports', reportRoutes);

const uploadRoutes = require('./routes/uploadRoutes');
app.use('/api/upload', uploadRoutes);

app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', message: 'Backend is running' });
});

// Global Error Handler
app.use((err, req, res, next) => {
    console.error('Unhandled Error:', err.stack);
    res.status(500).json({ 
        success: false, 
        message: 'An unexpected internal error occurred' 
    });
});

const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

process.on('exit', (code) => {
    console.log('Process exiting with code:', code);
});
process.on('SIGINT', () => {
    console.log('SIGINT received');
    process.exit(0);
});
process.on('SIGTERM', () => {
    console.log('SIGTERM received');
    process.exit(0);
});
process.on('uncaughtException', (err) => {
    console.error('Uncaught Exception:', err);
});
process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

setInterval(() => {
    console.log('Keep alive tick');
}, 5000);