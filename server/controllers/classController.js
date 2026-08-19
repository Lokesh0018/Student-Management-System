const pool = require('../config/db');

exports.getAllClasses = async (req, res) => {
    let query = `
        SELECT c.*, t.name as teacher_name,
               (SELECT COUNT(*) FROM students s WHERE s.class_id = c.id) as student_count
        FROM classes c
        LEFT JOIN teachers t ON c.teacher_id = t.id
    `;
    let params = [];

    if (req.user && req.user.role === 'CLASS_TEACHER') {
        query += ` WHERE t.user_id = ?`;
        params.push(req.user.id);
    }

    const [classes] = await pool.execute(query, params);
    res.json({ success: true, data: classes });
};

exports.getClassById = async (req, res) => {
    const [classes] = await pool.execute(`
        SELECT c.*, t.name as teacher_name
        FROM classes c
        LEFT JOIN teachers t ON c.teacher_id = t.id
        WHERE c.id = ?
    `, [req.params.id]);

    if (classes.length === 0) {
        return res.status(404).json({ success: false, message: 'Class not found' });
    }

    res.json({ success: true, data: classes[0] });
};

exports.createClass = async (req, res) => {
    const { class_name, section, teacher_id } = req.body;
    
    // Manual validation
    if (!class_name || !section) {
        return res.status(400).json({ success: false, message: 'Class name and section are required' });
    }

    try {
        const [existing] = await pool.execute(
            'SELECT id FROM classes WHERE class_name = ? AND section = ?',
            [class_name, section]
        );
        if (existing.length > 0) {
            return res.status(400).json({ success: false, message: 'Class and section combination already exists.' });
        }

        const [result] = await pool.execute(
            'INSERT INTO classes (class_name, section, teacher_id) VALUES (?, ?, ?)',
            [class_name, section, teacher_id || null]
        );
        res.json({ success: true, message: 'Class created', data: { id: result.insertId, class_name, section, teacher_id } });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

exports.updateClass = async (req, res) => {
    const { class_name, section, teacher_id } = req.body;
    
    // Manual validation
    if (!class_name || !section) {
        return res.status(400).json({ success: false, message: 'Class name and section are required' });
    }

    try {
        const [existing] = await pool.execute(
            'SELECT id FROM classes WHERE class_name = ? AND section = ? AND id != ?',
            [class_name, section, req.params.id]
        );
        if (existing.length > 0) {
            return res.status(400).json({ success: false, message: 'Class and section combination already exists.' });
        }

        await pool.execute(
            'UPDATE classes SET class_name = ?, section = ?, teacher_id = ? WHERE id = ?',
            [class_name, section, teacher_id || null, req.params.id]
        );
        res.json({ success: true, message: 'Class updated' });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

exports.deleteClass = async (req, res) => {
    await pool.execute('DELETE FROM classes WHERE id = ?', [req.params.id]);
    res.json({ success: true, message: 'Class deleted' });
};
