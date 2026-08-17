const pool = require('../config/db');

exports.getParentDashboardStats = async (req, res) => {
    try {
        const userId = req.user.id;
        
        // Find parent ID from user ID
        const [parentRec] = await pool.execute('SELECT id FROM parents WHERE user_id = ?', [userId]);
        if (parentRec.length === 0) {
            return res.status(404).json({ success: false, message: 'Parent profile not found' });
        }
        const parentId = parentRec[0].id;

        // Fetch children
        const [children] = await pool.execute(`
            SELECT s.*, c.class_name, c.section 
            FROM students s
            JOIN parent_student ps ON s.id = ps.student_id
            LEFT JOIN classes c ON s.class_id = c.id
            WHERE ps.parent_id = ?
        `, [parentId]);

        // If no children, return empty early
        if (children.length === 0) {
            return res.json({ success: true, data: { children: [], marks: [], attendance: [] } });
        }

        const studentIds = children.map(c => c.id);
        const placeholders = studentIds.map(() => '?').join(',');

        // Fetch recent marks for these children
        const [marks] = await pool.execute(`
            SELECT m.*, sub.subject_name, e.exam_name 
            FROM marks m
            JOIN subjects sub ON m.subject_id = sub.id
            JOIN exams e ON m.exam_id = e.id
            WHERE m.student_id IN (${placeholders})
            ORDER BY m.id DESC LIMIT 10
        `, studentIds);

        // Fetch attendance summary for these children
        const [attendance] = await pool.execute(`
            SELECT student_id, 
                   SUM(CASE WHEN status='PRESENT' THEN 1 ELSE 0 END) as present_days,
                   SUM(CASE WHEN status='ABSENT' THEN 1 ELSE 0 END) as absent_days
            FROM attendance
            WHERE student_id IN (${placeholders})
            GROUP BY student_id
        `, studentIds);

        res.json({
            success: true,
            data: {
                children,
                marks,
                attendance
            }
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};
