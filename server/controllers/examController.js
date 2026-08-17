const pool = require('../config/db');

exports.getAllExams = async (req, res) => {
    try {
        const [exams] = await pool.execute(`
            SELECT e.*, a.year_name, c.class_name, c.section 
            FROM exams e
            LEFT JOIN academic_years a ON e.academic_year_id = a.id
            LEFT JOIN classes c ON e.class_id = c.id
        `);
        res.json({ success: true, data: exams });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

exports.createExam = async (req, res) => {
    try {
        const { exam_name, academic_year_id, class_id, start_date, end_date, status } = req.body;
        const [result] = await pool.execute(
            'INSERT INTO exams (exam_name, academic_year_id, class_id, start_date, end_date, status) VALUES (?, ?, ?, ?, ?, ?)',
            [exam_name, academic_year_id, class_id, start_date, end_date, status || 'UPCOMING']
        );
        res.json({ success: true, message: 'Exam created', data: { id: result.insertId } });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

exports.updateExam = async (req, res) => {
    try {
        const { exam_name, academic_year_id, class_id, start_date, end_date, status } = req.body;
        await pool.execute(
            'UPDATE exams SET exam_name = ?, academic_year_id = ?, class_id = ?, start_date = ?, end_date = ?, status = ? WHERE id = ?',
            [exam_name, academic_year_id, class_id, start_date, end_date, status, req.params.id]
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
