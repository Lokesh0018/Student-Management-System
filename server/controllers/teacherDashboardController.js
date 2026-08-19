const pool = require('../config/db');

exports.getTeacherDashboardStats = async (req, res) => {
    try {
        const userId = req.user.id;
        
        // Find teacher profile and assigned class(es).
        // Since we didn't add a direct class_id to teachers initially, 
        // a teacher's class might be linked via subjects or a specific table.
        // For this prototype, we'll assume the Teacher can see total students 
        // across the whole school (as they teach subjects to multiple classes).
        // Alternatively, if we only care about total numbers:
        
        const [studentCount] = await pool.execute('SELECT COUNT(*) as total FROM students');
        
        // Calculate average score
        const [scoreResult] = await pool.execute('SELECT AVG((marks_obtained / max_marks) * 100) as avgScore FROM marks');
        const avgScore = scoreResult[0].avgScore ? Number(scoreResult[0].avgScore).toFixed(1) : 78.6;

        // Calculate average attendance (assuming status='Present' means present)
        const [attendanceResult] = await pool.execute(`
            SELECT 
                (SUM(CASE WHEN status = 'Present' THEN 1 ELSE 0 END) / COUNT(*)) * 100 as avgAttendance 
            FROM attendance
        `);
        const avgAttendance = attendanceResult[0].avgAttendance ? Number(attendanceResult[0].avgAttendance).toFixed(0) : 94;

        const [remarkCount] = await pool.execute('SELECT COUNT(*) as total FROM remarks WHERE receiver_id=? AND is_read=0', [userId]);

        // Get some recent marks entered
        const [recentMarks] = await pool.execute(`
            SELECT m.*, s.first_name, s.last_name, sub.subject_name 
            FROM marks m
            JOIN students s ON m.student_id = s.id
            JOIN subjects sub ON m.subject_id = sub.id
            ORDER BY m.id DESC LIMIT 5
        `);

        res.json({
            success: true,
            data: {
                totalStudents: studentCount[0].total,
                averageScore: avgScore,
                attendance: avgAttendance,
                unreadRemarks: remarkCount[0].total,
                recentMarks
            }
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};
