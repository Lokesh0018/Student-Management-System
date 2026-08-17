const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
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

app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', message: 'Backend is running' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
