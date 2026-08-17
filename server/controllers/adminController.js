const pool = require('../config/db');

exports.getDashboardStats = async (req, res) => {
    try {
        const [studentCount] = await pool.execute('SELECT COUNT(*) as count FROM students');
        const [teacherCount] = await pool.execute('SELECT COUNT(*) as count FROM teachers');
        const [parentCount] = await pool.execute('SELECT COUNT(*) as count FROM parents');
        const [classCount] = await pool.execute('SELECT COUNT(*) as count FROM classes');
        
        // Mocking some other stats for the dashboard
        const averagePerformance = 78.5; // Mock
        const attendanceRate = 92.3; // Mock
        
        const recentRemarks = [
            { id: 1, title: 'Excellent Improvement', message: 'Rahul has shown significant improvement.', date: '2026-08-17' },
            { id: 2, title: 'Attendance Alert', message: 'Please ensure timely arrival.', date: '2026-08-16' }
        ];

        res.json({
            success: true,
            data: {
                totalStudents: studentCount[0].count,
                totalTeachers: teacherCount[0].count,
                totalParents: parentCount[0].count,
                totalClasses: classCount[0].count,
                averagePerformance,
                attendanceRate,
                recentRemarks
            }
        });
    } catch (error) {
        console.error('Error fetching dashboard stats:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};
