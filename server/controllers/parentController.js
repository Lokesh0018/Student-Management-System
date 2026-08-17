const pool = require('../config/db');

exports.getAllParents = async (req, res) => {
    try {
        const [parents] = await pool.execute(`
            SELECT p.*, 
                   GROUP_CONCAT(s.first_name, ' ', s.last_name SEPARATOR ', ') as children_names
            FROM parents p
            LEFT JOIN parent_student ps ON p.id = ps.parent_id
            LEFT JOIN students s ON ps.student_id = s.id
            GROUP BY p.id
        `);
        res.json({ success: true, data: parents });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

exports.createParent = async (req, res) => {
    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();
        const { name, email, phone, address, studentIds } = req.body;
        
        // 1. Create User
        const [userResult] = await connection.execute(
            'INSERT INTO users (name, email, password_hash, role) VALUES (?, ?, ?, ?)',
            [name, email, 'password123', 'PARENT']
        );
        const userId = userResult.insertId;

        // 2. Create Parent
        const [parentResult] = await connection.execute(
            'INSERT INTO parents (user_id, name, email, phone, address) VALUES (?, ?, ?, ?, ?)',
            [userId, name, email, phone, address]
        );
        const parentId = parentResult.insertId;

        // 3. Link students if provided
        if (studentIds && Array.isArray(studentIds)) {
            for (const studentId of studentIds) {
                await connection.execute(
                    'INSERT INTO parent_student (parent_id, student_id, relationship) VALUES (?, ?, ?)',
                    [parentId, studentId, 'Parent']
                );
            }
        }

        await connection.commit();
        res.json({ success: true, message: 'Parent created', data: { id: parentId } });
    } catch (error) {
        await connection.rollback();
        console.error('Error creating parent', error);
        res.status(500).json({ success: false, message: 'Failed to create parent' });
    } finally {
        connection.release();
    }
};

exports.updateParent = async (req, res) => {
    try {
        const { name, email, phone, address } = req.body;
        await pool.execute(
            'UPDATE parents SET name = ?, email = ?, phone = ?, address = ? WHERE id = ?',
            [name, email, phone, address, req.params.id]
        );
        // We skip updating student links here for brevity, would be a delete + insert pattern
        res.json({ success: true, message: 'Parent updated' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

exports.deleteParent = async (req, res) => {
    try {
        const [parent] = await pool.execute('SELECT user_id FROM parents WHERE id = ?', [req.params.id]);
        if (parent.length > 0) {
            await pool.execute('DELETE FROM users WHERE id = ?', [parent[0].user_id]);
        }
        res.json({ success: true, message: 'Parent deleted' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
};
