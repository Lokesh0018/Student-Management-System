const pool = require('../config/db');

exports.getAllStudents = async (req, res) => {
    try {
        const [students] = await pool.execute(`
            SELECT s.*, c.class_name, c.section 
            FROM students s
            LEFT JOIN classes c ON s.class_id = c.id
        `);
        res.json({ success: true, data: students });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

exports.createStudent = async (req, res) => {
    try {
        const { admission_number, first_name, last_name, email, class_id, roll_number } = req.body;
        const [result] = await pool.execute(
            'INSERT INTO students (admission_number, first_name, last_name, email, class_id, roll_number) VALUES (?, ?, ?, ?, ?, ?)',
            [admission_number, first_name, last_name, email, class_id || null, roll_number]
        );
        res.json({ success: true, message: 'Student created', data: { id: result.insertId } });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

exports.updateStudent = async (req, res) => {
    try {
        const { admission_number, first_name, last_name, email, class_id, roll_number } = req.body;
        await pool.execute(
            'UPDATE students SET admission_number = ?, first_name = ?, last_name = ?, email = ?, class_id = ?, roll_number = ? WHERE id = ?',
            [admission_number, first_name, last_name, email, class_id || null, roll_number, req.params.id]
        );
        res.json({ success: true, message: 'Student updated' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

exports.deleteStudent = async (req, res) => {
    try {
        await pool.execute('DELETE FROM students WHERE id = ?', [req.params.id]);
        res.json({ success: true, message: 'Student deleted' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
};
