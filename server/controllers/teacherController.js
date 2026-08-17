const pool = require('../config/db');

exports.getAllTeachers = async (req, res) => {
    try {
        const [teachers] = await pool.execute('SELECT * FROM teachers');
        res.json({ success: true, data: teachers });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

exports.createTeacher = async (req, res) => {
    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();
        const { name, email, phone, department } = req.body;
        
        // 1. Create User
        const [userResult] = await connection.execute(
            'INSERT INTO users (name, email, password_hash, role) VALUES (?, ?, ?, ?)',
            [name, email, 'password123', 'CLASS_TEACHER']
        );
        const userId = userResult.insertId;

        // 2. Create Teacher
        const [teacherResult] = await connection.execute(
            'INSERT INTO teachers (user_id, name, email, phone, department) VALUES (?, ?, ?, ?, ?)',
            [userId, name, email, phone, department]
        );

        await connection.commit();
        res.json({ success: true, message: 'Teacher created', data: { id: teacherResult.insertId } });
    } catch (error) {
        await connection.rollback();
        console.error('Error creating teacher', error);
        res.status(500).json({ success: false, message: 'Failed to create teacher' });
    } finally {
        connection.release();
    }
};

exports.updateTeacher = async (req, res) => {
    try {
        const { name, email, phone, department } = req.body;
        await pool.execute(
            'UPDATE teachers SET name = ?, email = ?, phone = ?, department = ? WHERE id = ?',
            [name, email, phone, department, req.params.id]
        );
        // Should also update User table name/email ideally, keeping it simple for now
        res.json({ success: true, message: 'Teacher updated' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

exports.deleteTeacher = async (req, res) => {
    try {
        const [teacher] = await pool.execute('SELECT user_id FROM teachers WHERE id = ?', [req.params.id]);
        if (teacher.length > 0) {
            // Delete user, which cascades to delete teacher
            await pool.execute('DELETE FROM users WHERE id = ?', [teacher[0].user_id]);
        }
        res.json({ success: true, message: 'Teacher deleted' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
};
