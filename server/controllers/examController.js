const pool = require('../config/db');

exports.getAllExams = async (req, res) => {
    try {
        const [exams] = await pool.execute(`
            SELECT e.id, e.exam_name, e.exam_type, e.academic_year_id, e.class_id, e.start_date, e.end_date, e.created_at,
                   CASE 
                       WHEN CURRENT_DATE < e.start_date THEN 'Upcoming'
                       WHEN CURRENT_DATE > e.end_date THEN 'Completed'
                       ELSE 'Ongoing'
                   END AS status,
                   c.class_name, c.section 
            FROM exams e
            LEFT JOIN classes c ON e.class_id = c.id
        `);
        res.json({ success: true, data: exams });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

exports.getExamById = async (req, res) => {
    try {
        const [exams] = await pool.execute(`
            SELECT e.id, e.exam_name, e.exam_type, e.academic_year_id, e.class_id, e.start_date, e.end_date, e.created_at,
                   CASE 
                       WHEN CURRENT_DATE < e.start_date THEN 'Upcoming'
                       WHEN CURRENT_DATE > e.end_date THEN 'Completed'
                       ELSE 'Ongoing'
                   END AS status,
                   c.class_name, c.section 
            FROM exams e
            LEFT JOIN classes c ON e.class_id = c.id
            WHERE e.id = ?
        `, [req.params.id]);

        if (exams.length === 0) {
            return res.status(404).json({ success: false, message: 'Exam not found' });
        }
        res.json({ success: true, data: exams[0] });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

exports.createExam = async (req, res) => {
    try {
        const { exam_name, exam_type, academic_year_id, class_id, start_date, end_date } = req.body;
        const validClassId = class_id === '' ? null : class_id;

        const [result] = await pool.execute(
            'INSERT INTO exams (exam_name, exam_type, academic_year_id, class_id, start_date, end_date) VALUES (?, ?, ?, ?, ?, ?)',
            [exam_name, exam_type || 'Regular', academic_year_id, validClassId, start_date, end_date]
        );

        if (validClassId) {
            // Notify Class Teacher
            const [teacherRows] = await pool.execute(
                'SELECT t.user_id FROM classes c JOIN teachers t ON c.teacher_id = t.id WHERE c.id = ?',
                [class_id]
            );
            if (teacherRows.length > 0 && teacherRows[0].user_id) {
                await pool.execute(
                    'INSERT INTO notifications (user_id, title, message) VALUES (?, ?, ?)',
                    [teacherRows[0].user_id, 'Upcoming Exam', `An exam (${exam_name}) has been scheduled for your class.`]
                );
            }

            // Notify Parents
            const [parentRows] = await pool.execute(`
                SELECT parent_user_id as user_id 
                FROM students 
                WHERE class_id = ? AND parent_user_id IS NOT NULL
            `, [class_id]);

            const uniqueParents = [...new Set(parentRows.map(r => r.user_id))];
            for (const userId of uniqueParents) {
                await pool.execute(
                    'INSERT INTO notifications (user_id, title, message) VALUES (?, ?, ?)',
                    [userId, 'Upcoming Exam', `An exam (${exam_name}) has been scheduled. Please ensure your child is prepared.`]
                );
            }
        }

        res.json({ success: true, message: 'Exam created', data: { id: result.insertId } });
    } catch (error) {
        console.error('Error in createExam:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

exports.updateExam = async (req, res) => {
    try {
        const { exam_name, exam_type, academic_year_id, class_id, start_date, end_date } = req.body;
        const validClassId = class_id === '' ? null : class_id;

        await pool.execute(
            'UPDATE exams SET exam_name = ?, exam_type = ?, academic_year_id = ?, class_id = ?, start_date = ?, end_date = ? WHERE id = ?',
            [exam_name, exam_type || 'Regular', academic_year_id, validClassId, start_date, end_date, req.params.id]
        );
        res.json({ success: true, message: 'Exam updated' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

exports.deleteExam = async (req, res) => {
    try {
        await pool.execute('DELETE FROM exams WHERE id = ?', [req.params.id]);
        res.json({ success: true, message: 'Exam deleted' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
};
