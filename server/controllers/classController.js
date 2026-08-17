const pool = require('../config/db');

exports.getAllClasses = async (req, res) => {
    try {
        const [classes] = await pool.execute('SELECT * FROM classes');
        res.json({ success: true, data: classes });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

exports.createClass = async (req, res) => {
    try {
        const { class_name, section } = req.body;
        const [result] = await pool.execute('INSERT INTO classes (class_name, section) VALUES (?, ?)', [class_name, section]);
        res.json({ success: true, message: 'Class created', data: { id: result.insertId, class_name, section } });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

exports.updateClass = async (req, res) => {
    try {
        const { class_name, section } = req.body;
        await pool.execute('UPDATE classes SET class_name = ?, section = ? WHERE id = ?', [class_name, section, req.params.id]);
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
