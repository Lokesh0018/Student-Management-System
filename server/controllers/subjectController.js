const pool = require('../config/db');

exports.getAllSubjects = async (req, res) => {
    const [subjects] = await pool.execute(`
        SELECT s.*, t.name AS teacher_name 
        FROM subjects s 
        LEFT JOIN teachers t ON s.teacher_id = t.id
    `);
    res.json({ success: true, data: subjects });
};

exports.getSubjectById = async (req, res) => {
    const [subjects] = await pool.execute('SELECT * FROM subjects WHERE id = ?', [req.params.id]);
    if (subjects.length === 0) {
        return res.status(404).json({ success: false, message: 'Subject not found' });
    }
    res.json({ success: true, data: subjects[0] });
};

exports.createSubject = async (req, res) => {
    const { subject_name, subject_code, teacher_id } = req.body;
    
    // Manual validation
    if (!subject_name || !subject_code) {
        return res.status(400).json({ success: false, message: 'Subject name and code are required' });
    }

    const [result] = await pool.execute(
        'INSERT INTO subjects (subject_name, subject_code, teacher_id) VALUES (?, ?, ?)', 
        [subject_name, subject_code, teacher_id || null]
    );
    res.json({ success: true, message: 'Subject created', data: { id: result.insertId, subject_name, subject_code, teacher_id } });
};

exports.updateSubject = async (req, res) => {
    const { subject_name, subject_code, teacher_id } = req.body;
    
    // Manual validation
    if (!subject_name || !subject_code) {
        return res.status(400).json({ success: false, message: 'Subject name and code are required' });
    }

    await pool.execute(
        'UPDATE subjects SET subject_name = ?, subject_code = ?, teacher_id = ? WHERE id = ?', 
        [subject_name, subject_code, teacher_id || null, req.params.id]
    );
    res.json({ success: true, message: 'Subject updated' });
};

exports.deleteSubject = async (req, res) => {
    await pool.execute('DELETE FROM subjects WHERE id = ?', [req.params.id]);
    res.json({ success: true, message: 'Subject deleted' });
};
