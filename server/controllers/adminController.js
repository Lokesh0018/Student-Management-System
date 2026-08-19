const pool = require('../config/db');
const logger = require('../utils/logger');
const ApiResponse = require('../utils/ApiResponse');

exports.getDashboardStats = async (req, res) => {
    try {
        const [
            [studentCount],
            [teacherCount],
            [parentCount],
            [classCount]
        ] = await Promise.all([
            pool.execute('SELECT COUNT(*) as count FROM students'),
            pool.execute('SELECT COUNT(*) as count FROM teachers'),
            pool.execute('SELECT COUNT(DISTINCT parent_user_id) as count FROM students WHERE parent_user_id IS NOT NULL'),
            pool.execute('SELECT COUNT(*) as count FROM classes')
        ]);
        
        // Mocking some other stats for the dashboard
        const averagePerformance = 78.5; // Mock
        const attendanceRate = 92.3; // Mock
        
        const recentRemarks = [
            { id: 1, title: 'Excellent Improvement', message: 'Rahul has shown significant improvement.', date: '2026-08-17' },
            { id: 2, title: 'Attendance Alert', message: 'Please ensure timely arrival.', date: '2026-08-16' }
        ];

        return ApiResponse.success(res, 'Dashboard stats retrieved successfully', {
            totalStudents: studentCount[0].count,
            totalTeachers: teacherCount[0].count,
            totalParents: parentCount[0].count,
            totalClasses: classCount[0].count,
            averagePerformance,
            attendanceRate,
            recentRemarks
        });
    } catch (error) {
        logger.error('Error fetching dashboard stats: %O', error);
        return ApiResponse.error(res, 'Server error', 500);
    }
};
