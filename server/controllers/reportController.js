const pool = require('../config/db');

exports.getStudentReport = async (req, res) => {
    try {
        const [students] = await pool.execute(`
            SELECT s.admission_number, s.first_name, s.last_name, s.email, s.gender, s.status,
                   c.class_name, c.section,
                   s.parent_name, s.parent_email, s.parent_phone
            FROM students s
            LEFT JOIN classes c ON s.class_id = c.id
            ORDER BY c.class_name, s.first_name
        `);
        res.json({ success: true, data: students });
    } catch (error) {
        console.error('Error fetching student report:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

exports.getAttendanceReport = async (req, res) => {
    try {
        const { startDate, endDate, classId } = req.query;
        let query = `
            SELECT a.date, a.status, s.first_name, s.last_name, s.admission_number, c.class_name, c.section
            FROM attendance a
            JOIN students s ON a.student_id = s.id
            JOIN classes c ON a.class_id = c.id
            WHERE 1=1
        `;
        const params = [];
        if (startDate && endDate) {
            query += ` AND a.date BETWEEN ? AND ?`;
            params.push(startDate, endDate);
        }
        if (classId) {
            query += ` AND a.class_id = ?`;
            params.push(classId);
        }
        query += ` ORDER BY a.date DESC, c.class_name, s.first_name`;
        
        const [attendance] = await pool.execute(query, params);
        res.json({ success: true, data: attendance });
    } catch (error) {
        console.error('Error fetching attendance report:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

exports.getPerformanceReport = async (req, res) => {
    try {
        const { examId, classId } = req.query;
        let query = `
            SELECT m.marks_obtained, m.max_marks, m.grade,
                   s.first_name, s.last_name, s.admission_number,
                   c.class_name, c.section,
                   sub.subject_name,
                   e.exam_name
            FROM marks m
            JOIN students s ON m.student_id = s.id
            JOIN classes c ON s.class_id = c.id
            JOIN subjects sub ON m.subject_id = sub.id
            JOIN exams e ON m.exam_id = e.id
            WHERE 1=1
        `;
        const params = [];
        if (examId) {
            query += ` AND m.exam_id = ?`;
            params.push(examId);
        }
        if (classId) {
            query += ` AND s.class_id = ?`;
            params.push(classId);
        }
        query += ` ORDER BY e.exam_name, c.class_name, s.first_name, sub.subject_name`;
        
        const [performance] = await pool.execute(query, params);
        res.json({ success: true, data: performance });
    } catch (error) {
        console.error('Error fetching performance report:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};
