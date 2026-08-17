const pool = require('../config/db');

exports.getAllSubjects = async (req, res) => {
    try {
        const [subjects] = await pool.execute('SELECT * FROM subjects');
        res.json({ success: true, data: subjects });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

exports.createSubject = async (req, res) => {
    try {
        const { subject_name, subject_code } = req.body;
        const [result] = await pool.execute('INSERT INTO subjects (subject_name, subject_code) VALUES (?, ?)', [subject_name, subject_code]);
        res.json({ success: true, message: 'Subject created', data: { id: result.insertId, subject_name, subject_code } });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

exports.updateSubject = async (req, res) => {
    try {
        const { subject_name, subject_code } = req.body;
        await pool.execute('UPDATE subjects SET subject_name = ?, subject_code = ? WHERE id = ?', [subject_name, subject_code, req.params.id]);
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
