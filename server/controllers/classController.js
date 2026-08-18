const pool = require('../config/db');

exports.getAllClasses = async (req, res) => {
    try {
        const [classes] = await pool.execute(`
            SELECT c.*, t.name as teacher_name 
            FROM classes c 
            LEFT JOIN teachers t ON c.teacher_id = t.id
        `);
        res.json({ success: true, data: classes });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

exports.createClass = async (req, res) => {
    try {
        const { class_name, section, teacher_id } = req.body;
        const [result] = await pool.execute(
            'INSERT INTO classes (class_name, section, teacher_id) VALUES (?, ?, ?)', 
            [class_name, section, teacher_id || null]
        );
        res.json({ success: true, message: 'Class created', data: { id: result.insertId, class_name, section, teacher_id } });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

exports.updateClass = async (req, res) => {
    try {
        const { class_name, section, teacher_id } = req.body;
        await pool.execute(
            'UPDATE classes SET class_name = ?, section = ?, teacher_id = ? WHERE id = ?', 
            [class_name, section, teacher_id || null, req.params.id]
        );
        res.json({ success: true, message: 'Class updated' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

exports.deleteClass = async (req, res) => {
    try {
        await pool.execute('DELETE FROM classes WHERE id = ?', [req.params.id]);
        res.json({ success: true, message: 'Class deleted' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
};
