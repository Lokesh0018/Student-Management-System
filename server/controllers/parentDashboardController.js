const pool = require('../config/db');

exports.getParentDashboardStats = async (req, res) => {
    try {
        const userId = req.user.id;
        
        // Fetch children
        const [children] = await pool.execute(`
            SELECT s.*, c.class_name, c.section 
            FROM students s
            LEFT JOIN classes c ON s.class_id = c.id
            WHERE s.parent_user_id = ?
        `, [userId]);

        // If no children, return empty early
        if (children.length === 0) {
            return res.json({ success: true, data: { children: [], marks: [], attendance: [] } });
        }

        const studentIds = children.map(c => c.id);
        const placeholders = studentIds.map(() => '?').join(',');

        // Fetch recent marks for these children
        const [marks] = await pool.query(`
            SELECT m.*, sub.subject_name, e.exam_name 
            FROM marks m
            JOIN subjects sub ON m.subject_id = sub.id
            JOIN exams e ON m.exam_id = e.id
            WHERE m.student_id IN (${placeholders})
            ORDER BY m.id DESC
        `, studentIds);

        // Fetch attendance summary for these children
        const [attendance] = await pool.query(`
            SELECT student_id, 
                   SUM(CASE WHEN status='PRESENT' THEN 1 ELSE 0 END) as present_days,
                   SUM(CASE WHEN status='ABSENT' THEN 1 ELSE 0 END) as absent_days
            FROM attendance
            WHERE student_id IN (${placeholders})
            GROUP BY student_id
        `, studentIds);

        // --- Rank Calculation ---
        const classIds = [...new Set(children.map(c => c.class_id))].filter(id => id !== null);
        if (classIds.length > 0) {
            const classPlaceholders = classIds.map(() => '?').join(',');
            
            const [classRanks] = await pool.query(`
                SELECT s.class_id, m.student_id, SUM(m.marks_obtained) as total_score
                FROM students s
                JOIN marks m ON s.id = m.student_id
                WHERE s.class_id IN (${classPlaceholders})
                GROUP BY s.class_id, m.student_id
                ORDER BY s.class_id, total_score DESC
            `, classIds);

            const [classSizes] = await pool.query(`
                SELECT class_id, COUNT(id) as total_students
                FROM students
                WHERE class_id IN (${classPlaceholders})
                GROUP BY class_id
            `, classIds);
            
            const classSizeMap = {};
            classSizes.forEach(r => classSizeMap[r.class_id] = r.total_students);

            const rankMap = {};
            classIds.forEach(cid => {
                const studentsInClass = classRanks.filter(r => r.class_id === cid);
                let currentRank = 1;
                for (let i = 0; i < studentsInClass.length; i++) {
                    if (i > 0 && studentsInClass[i].total_score < studentsInClass[i-1].total_score) {
                        currentRank = i + 1;
                    }
                    rankMap[studentsInClass[i].student_id] = currentRank;
                }
            });

            children.forEach(c => {
                c.rank = rankMap[c.id] || 'N/A';
                c.class_size = classSizeMap[c.class_id] || 0;
            });
        } else {
            children.forEach(c => {
                c.rank = 'N/A';
                c.class_size = 0;
            });
        }
        // --- End Rank Calculation ---

        // Fetch general remarks for these children
        const [remarks] = await pool.query(`
            SELECT r.*, sender.name as sender_name, sender.role as sender_role
            FROM remarks r
            LEFT JOIN users sender ON r.sender_id = sender.id
            WHERE r.student_id IN (${placeholders})
            ORDER BY r.created_at DESC
        `, studentIds);

        res.json({
            success: true,
            data: {
                children,
                marks,
                attendance,
                remarks
            }
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};
