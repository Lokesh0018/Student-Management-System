const pool = require('../config/db');

exports.getPerformanceStats = async (req, res) => {
    try {
        // Fetch average marks per class
        const [classAverages] = await pool.execute(`
            SELECT c.class_name, c.section, AVG((m.marks_obtained / m.max_marks) * 100) as avg_percentage
            FROM marks m
            JOIN students s ON m.student_id = s.id
            JOIN classes c ON s.class_id = c.id
            GROUP BY c.id
        `);

        // Fetch subject averages
        const [subjectAverages] = await pool.execute(`
            SELECT sub.subject_name, AVG((m.marks_obtained / m.max_marks) * 100) as avg_percentage
            FROM marks m
            JOIN subjects sub ON m.subject_id = sub.id
            GROUP BY sub.id
        `);

        // Get Top students
        const [topStudents] = await pool.execute(`
            SELECT s.first_name, s.last_name, AVG((m.marks_obtained / m.max_marks) * 100) as avg_percentage
            FROM marks m
            JOIN students s ON m.student_id = s.id
            GROUP BY s.id
            ORDER BY avg_percentage DESC
            LIMIT 5
        `);

        res.json({
            success: true,
            data: {
                classAverages,
                subjectAverages,
                topStudents
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};
