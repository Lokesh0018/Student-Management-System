const pool = require('../config/db');

exports.getAllClasses = async (req, res) => {
    const [classes] = await pool.execute(`
        SELECT c.*, t.name as teacher_name,
               (SELECT COUNT(*) FROM students s WHERE s.class_id = c.id) as student_count
        FROM classes c
        LEFT JOIN teachers t ON c.teacher_id = t.id
    `);
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

    const [result] = await pool.execute(
        'INSERT INTO classes (class_name, section, teacher_id) VALUES (?, ?, ?)',
        [class_name, section, teacher_id || null]
    );
    res.json({ success: true, message: 'Class created', data: { id: result.insertId, class_name, section, teacher_id } });
};

exports.updateClass = async (req, res) => {
    const { class_name, section, teacher_id } = req.body;
    
    // Manual validation
    if (!class_name || !section) {
        return res.status(400).json({ success: false, message: 'Class name and section are required' });
    }

    await pool.execute(
        'UPDATE classes SET class_name = ?, section = ?, teacher_id = ? WHERE id = ?',
        [class_name, section, teacher_id || null, req.params.id]
    );
    res.json({ success: true, message: 'Class updated' });
};

exports.deleteClass = async (req, res) => {
    await pool.execute('DELETE FROM classes WHERE id = ?', [req.params.id]);
    res.json({ success: true, message: 'Class deleted' });
};
