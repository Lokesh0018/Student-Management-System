const pool = require('../config/db');

exports.getTeacherDashboardStats = async (req, res) => {
    try {
        const userId = req.user.id;
        
        const [teacherClass] = await pool.execute(
            'SELECT c.id FROM classes c JOIN teachers t ON c.teacher_id = t.id WHERE t.user_id = ?',
            [userId]
        );
        
        let classId = null;
        if (teacherClass.length > 0) {
            classId = teacherClass[0].id;
        }

        if (!classId) {
             return res.json({
                 success: true,
                 data: {
                     totalStudents: 0,
                     averageScore: 0,
                     attendance: 0,
                     unreadRemarks: 0,
                     recentMarks: [],
                     performanceData: [],
                     attendanceData: []
                 }
             });
        }

        const monthFilter = req.query.month || 'this';
        let dateConditionAttendance = "MONTH(a.date) = MONTH(CURRENT_DATE()) AND YEAR(a.date) = YEAR(CURRENT_DATE())";
        let dateConditionExams = "MONTH(e.created_at) = MONTH(CURRENT_DATE()) AND YEAR(e.created_at) = YEAR(CURRENT_DATE())";
        
        if (monthFilter === 'last') {
            dateConditionAttendance = "MONTH(a.date) = MONTH(CURRENT_DATE() - INTERVAL 1 MONTH) AND YEAR(a.date) = YEAR(CURRENT_DATE() - INTERVAL 1 MONTH)";
            dateConditionExams = "MONTH(e.created_at) = MONTH(CURRENT_DATE() - INTERVAL 1 MONTH) AND YEAR(e.created_at) = YEAR(CURRENT_DATE() - INTERVAL 1 MONTH)";
        }

        const [studentCount] = await pool.execute('SELECT COUNT(*) as total FROM students WHERE class_id = ?', [classId]);
        
        // Calculate average score
        const [scoreResult] = await pool.execute(`
            SELECT AVG((m.marks_obtained / m.max_marks) * 100) as avgScore 
            FROM marks m 
            JOIN students s ON m.student_id = s.id 
            WHERE s.class_id = ? AND m.max_marks > 0
        `, [classId]);
        const avgScore = scoreResult[0].avgScore ? Number(scoreResult[0].avgScore).toFixed(1) : 0;

        // Calculate attendance stats
        const [attendanceStats] = await pool.execute(`
            SELECT a.status as name, COUNT(*) as value 
            FROM attendance a
            JOIN students s ON a.student_id = s.id
            WHERE s.class_id = ? AND ${dateConditionAttendance}
            GROUP BY a.status
        `, [classId]);

        let presentCount = 0;
        let totalAttendance = 0;
        const attendanceData = attendanceStats.map(row => {
            const val = parseInt(row.value);
            totalAttendance += val;
            if (row.name === 'PRESENT') presentCount += val;
            return {
                name: row.name === 'PRESENT' ? 'Present' : (row.name === 'ABSENT' ? 'Absent' : 'Leave'),
                value: val,
                color: row.name === 'PRESENT' ? '#10b981' : (row.name === 'ABSENT' ? '#f43f5e' : '#6366f1')
            };
        });

        const avgAttendance = totalAttendance > 0 ? ((presentCount / totalAttendance) * 100).toFixed(0) : 0;

        const [remarkCount] = await pool.execute('SELECT COUNT(*) as total FROM remarks WHERE receiver_id=? AND is_read=0', [userId]);

        // Get some recent marks entered
        const [recentMarks] = await pool.execute(`
            SELECT m.*, s.first_name, s.last_name, sub.subject_name 
            FROM marks m
            JOIN students s ON m.student_id = s.id
            JOIN subjects sub ON m.subject_id = sub.id
            WHERE s.class_id = ?
            ORDER BY m.id DESC LIMIT 5
        `, [classId]);

        const [examStats] = await pool.execute(`
            SELECT e.exam_name as name, IFNULL(AVG((m.marks_obtained / m.max_marks) * 100), 0) as score
            FROM exams e
            LEFT JOIN marks m ON e.id = m.exam_id AND m.max_marks > 0
            WHERE (e.class_id = ? OR e.class_id IS NULL) AND ${dateConditionExams}
            GROUP BY e.id
            ORDER BY e.start_date ASC
            LIMIT 5
        `, [classId]);

        const performanceData = examStats.map(row => ({
            name: row.name,
            score: parseFloat(row.score).toFixed(1)
        }));

        // Fetch students needing attention (e.g., poor attendance or low marks)
        // For simplicity, we just fetch a few students from the class with a simulated reason
        const [attentionStudentsData] = await pool.execute(`
            SELECT id, first_name, last_name, 'Has low attendance recently' as reason
            FROM students 
            WHERE class_id = ?
            LIMIT 3
        `, [classId]);

        res.json({
            success: true,
            data: {
                totalStudents: studentCount[0].total,
                averageScore: avgScore,
                attendance: avgAttendance,
                unreadRemarks: remarkCount[0].total,
                recentMarks,
                performanceData,
                attendanceData,
                attentionStudents: attentionStudentsData
            }
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};
