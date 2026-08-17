const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const app = express();

// Security Middlewares
app.use(helmet());

const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    message: { success: false, message: 'Too many requests from this IP, please try again after 15 minutes' }
});
// Apply to all API routes
app.use('/api/', limiter);

app.use(cors());
app.use(express.json());

const authRoutes = require('./routes/authRoutes');
app.use('/api/auth', authRoutes);

const testRoutes = require('./routes/testRoutes');
app.use('/api/test', testRoutes);

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

const parentRoutes = require('./routes/parentRoutes');
app.use('/api/parents', parentRoutes);

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
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
