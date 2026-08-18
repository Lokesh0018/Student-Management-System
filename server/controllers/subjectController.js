const pool = require('../config/db');

exports.getAllSubjects = async (req, res) => {
    try {
        const [subjects] = await pool.execute(`
            SELECT s.*, t.name AS teacher_name 
            FROM subjects s 
            LEFT JOIN teachers t ON s.teacher_id = t.id
        `);
        res.json({ success: true, data: subjects });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

exports.getSubjectById = async (req, res) => {
    try {
        const [subjects] = await pool.execute('SELECT * FROM subjects WHERE id = ?', [req.params.id]);
        if (subjects.length === 0) {
            return res.status(404).json({ success: false, message: 'Subject not found' });
        }
        res.json({ success: true, data: subjects[0] });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

exports.createSubject = async (req, res) => {
    try {
        const { subject_name, subject_code, teacher_id } = req.body;
        const [result] = await pool.execute(
            'INSERT INTO subjects (subject_name, subject_code, teacher_id) VALUES (?, ?, ?)', 
            [subject_name, subject_code, teacher_id || null]
        );
        res.json({ success: true, message: 'Subject created', data: { id: result.insertId, subject_name, subject_code, teacher_id } });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

exports.updateSubject = async (req, res) => {
    try {
        const { subject_name, subject_code, teacher_id } = req.body;
        await pool.execute(
            'UPDATE subjects SET subject_name = ?, subject_code = ?, teacher_id = ? WHERE id = ?', 
            [subject_name, subject_code, teacher_id || null, req.params.id]
        );
        res.json({ success: true, message: 'Subject updated' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

exports.deleteSubject = async (req, res) => {
    try {
        await pool.execute('DELETE FROM subjects WHERE id = ?', [req.params.id]);
        res.json({ success: true, message: 'Subject deleted' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
};
