const pool = require('../config/db');
const logger = require('../utils/logger');
const ApiResponse = require('../utils/ApiResponse');

exports.getDashboardStats = async (req, res) => {
    try {
        const [
            [studentCount],
            [teacherCount],
            [parentCount],
            [classCount],
            [avgScoreRow],
            classStats,
            attendanceStats,
            examStats,
            [recentRemarksData],
            [upcomingExamsData]
        ] = await Promise.all([
            pool.execute('SELECT COUNT(*) as count FROM students'),
            pool.execute('SELECT COUNT(*) as count FROM teachers'),
            pool.execute('SELECT COUNT(DISTINCT parent_user_id) as count FROM students WHERE parent_user_id IS NOT NULL'),
            pool.execute('SELECT COUNT(*) as count FROM classes'),
            pool.execute('SELECT AVG((marks_obtained / max_marks) * 100) as avg_score FROM marks WHERE max_marks > 0'),
            pool.execute('SELECT c.class_name, c.section, COUNT(s.id) as students FROM classes c LEFT JOIN students s ON c.id = s.class_id GROUP BY c.id'),
            pool.execute('SELECT status as name, COUNT(*) as value FROM attendance GROUP BY status'),
            pool.execute(`
                SELECT e.exam_name as name, AVG((m.marks_obtained / m.max_marks) * 100) as score
                FROM exams e
                LEFT JOIN marks m ON e.id = m.exam_id
                WHERE m.max_marks > 0
                GROUP BY e.id
                ORDER BY e.start_date ASC
                LIMIT 5
            `),
            pool.execute(`
                SELECT r.*, u.name as sender_name 
                FROM remarks r 
                LEFT JOIN users u ON r.sender_id = u.id 
                ORDER BY r.created_at DESC LIMIT 5
            `),
            pool.execute(`
                SELECT * FROM exams 
                WHERE status = 'UPCOMING' OR start_date >= CURDATE() 
                ORDER BY start_date ASC LIMIT 5
            `)
        ]);
        
        const averagePerformance = avgScoreRow[0].avg_score ? parseFloat(avgScoreRow[0].avg_score).toFixed(1) : 0;
        
        let presentCount = 0;
        let totalAttendance = 0;
        const attendanceData = attendanceStats[0].map(row => {
            const val = parseInt(row.value);
            totalAttendance += val;
            if (row.name === 'PRESENT') presentCount += val;
            return {
                name: row.name === 'PRESENT' ? 'Present' : (row.name === 'ABSENT' ? 'Absent' : 'Leave'),
                value: val,
                color: row.name === 'PRESENT' ? '#10b981' : (row.name === 'ABSENT' ? '#f43f5e' : '#6366f1')
            };
        });

        const attendanceRate = totalAttendance > 0 ? ((presentCount / totalAttendance) * 100).toFixed(1) : 0;

        const classData = classStats[0].map(row => ({
            name: `${row.class_name} ${row.section}`,
            students: row.students
        }));

        const performanceData = examStats[0].map(row => ({
            name: row.name,
            score: parseFloat(row.score).toFixed(1)
        }));

        return ApiResponse.success(res, 'Dashboard stats retrieved successfully', {
            totalStudents: studentCount[0].count,
            totalTeachers: teacherCount[0].count,
            totalParents: parentCount[0].count,
            totalClasses: classCount[0].count,
            averagePerformance: parseFloat(averagePerformance),
            attendanceRate: parseFloat(attendanceRate),
            classData,
            attendanceData,
            performanceData,
            recentRemarks: recentRemarksData,
            upcomingExams: upcomingExamsData
        });
    } catch (error) {
        logger.error('Error fetching dashboard stats: %O', error);
        return ApiResponse.error(res, 'Server error', 500);
    }
};
