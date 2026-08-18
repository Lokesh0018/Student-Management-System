const pool = require('../config/db');

exports.getAllTeachers = async (req, res) => {
    try {
        const [teachers] = await pool.execute('SELECT * FROM teachers');
        res.json({ success: true, data: teachers });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

exports.getTeacherById = async (req, res) => {
    try {
        const [rows] = await pool.execute('SELECT * FROM teachers WHERE id = ?', [req.params.id]);
        if (rows.length > 0) {
            res.json({ success: true, data: rows[0] });
        } else {
            res.status(404).json({ success: false, message: 'Teacher not found' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

exports.createTeacher = async (req, res) => {
    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();
        console.log("createTeacher req.body:", req.body);
        const { name, email, phone, department, description, qualification, employee_id, joining_date, assigned_classes, password } = req.body;
        
        let processedClasses = null;
        if (assigned_classes) {
            const classesArray = assigned_classes.split(',').map(c => c.trim()).filter(c => c);
            processedClasses = [...new Set(classesArray)].join(', ') || null;
        }

        // 1. Create User
        const [userResult] = await connection.execute(
            'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)',
            [name, email, password || 'teacher123', 'CLASS_TEACHER']
        );
        const userId = userResult.insertId;

        // 2. Create Teacher
        const [teacherResult] = await connection.execute(
            'INSERT INTO teachers (user_id, name, email, phone, department, description, qualification, employee_id, joining_date, assigned_classes) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
            [userId, name, email, phone, department, description || null, qualification || null, employee_id || null, joining_date || null, processedClasses]
        );

        await connection.commit();
        res.json({ success: true, message: 'Teacher created', data: { id: teacherResult.insertId } });
    } catch (error) {
        await connection.rollback();
        console.error('Error creating teacher', error);
        if (error.code === 'ER_DUP_ENTRY') {
            if (error.message.includes('email')) {
                return res.status(400).json({ success: false, message: 'Email address is already in use.' });
            }
            return res.status(400).json({ success: false, message: 'Duplicate entry detected.' });
        }
        res.status(500).json({ success: false, message: 'Failed to create teacher' });
    } finally {
        connection.release();
    }
};

exports.updateTeacher = async (req, res) => {
    try {
        console.log("updateTeacher req.body:", req.body);
        const { name, email, phone, department, description, qualification, employee_id, joining_date, assigned_classes, password } = req.body;
        
        let processedClasses = null;
        if (assigned_classes) {
            const classesArray = assigned_classes.split(',').map(c => c.trim()).filter(c => c);
            processedClasses = [...new Set(classesArray)].join(', ') || null;
        }

        // Get user_id to update password
        const [teacher] = await pool.execute('SELECT user_id FROM teachers WHERE id = ?', [req.params.id]);
        if (teacher.length > 0 && password) {
            await pool.execute('UPDATE users SET password = ? WHERE id = ?', [password, teacher[0].user_id]);
        }

        await pool.execute(
            'UPDATE teachers SET name = ?, email = ?, phone = ?, department = ?, description = ?, qualification = ?, employee_id = ?, joining_date = ?, assigned_classes = ? WHERE id = ?',
            [name, email, phone, department, description || null, qualification || null, employee_id || null, joining_date || null, processedClasses, req.params.id]
        );
        // Should also update User table name/email ideally, keeping it simple for now
        res.json({ success: true, message: 'Teacher updated' });
    } catch (error) {
        console.error('Error updating teacher', error);
        if (error.code === 'ER_DUP_ENTRY') {
            if (error.message.includes('email')) {
                return res.status(400).json({ success: false, message: 'Email address is already in use.' });
            }
            return res.status(400).json({ success: false, message: 'Duplicate entry detected.' });
        }
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
