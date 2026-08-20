const pool = require('../config/db');

exports.getRemarksForUser = async (req, res) => {
    try {
        const userId = req.user.id;
        const role = req.user.role;
        
        let query = `
            SELECT r.*, 
                   sender.name as sender_name, sender.role as sender_role,
                   receiver.name as receiver_name, receiver.role as receiver_role,
                   s.first_name as student_first, s.last_name as student_last
            FROM remarks r
            JOIN users sender ON r.sender_id = sender.id
            LEFT JOIN users receiver ON r.receiver_id = receiver.id
            LEFT JOIN students s ON r.student_id = s.id
            LEFT JOIN classes c ON s.class_id = c.id
            LEFT JOIN teachers t ON c.teacher_id = t.id
        `;
        
        let params = [];
        
        if (role === 'ADMIN') {
            query += ` ORDER BY r.created_at DESC`;
        } else if (role === 'CLASS_TEACHER') {
            query += ` WHERE r.sender_id = ? OR r.receiver_id = ? OR t.user_id = ? ORDER BY r.created_at DESC`;
            params = [userId, userId, userId];
        } else if (role === 'PARENT') {
            query += ` WHERE r.sender_id = ? OR r.receiver_id = ? OR s.parent_user_id = ? ORDER BY r.created_at DESC`;
            params = [userId, userId, userId];
        } else {
            query += ` WHERE r.sender_id = ? OR r.receiver_id = ? ORDER BY r.created_at DESC`;
            params = [userId, userId];
        }

        const [remarks] = await pool.execute(query, params);
        res.json({ success: true, data: remarks });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

exports.sendRemark = async (req, res) => {
    try {
        const { receiver_id, student_id, title, category, priority, message } = req.body;
        const sender_id = req.user.id;
        
        await pool.execute(
            'INSERT INTO remarks (sender_id, receiver_id, student_id, title, category, priority, message) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [sender_id, receiver_id || null, student_id || null, title, category || 'General', priority || 'Normal', message]
        );
        
        if (student_id) {
            // Notify Class Teacher
            const [teacherRows] = await pool.execute(`
                SELECT t.user_id 
                FROM students s 
                JOIN classes c ON s.class_id = c.id 
                JOIN teachers t ON c.teacher_id = t.id 
                WHERE s.id = ?
            `, [student_id]);
            
            if (teacherRows.length > 0 && teacherRows[0].user_id) {
                await pool.execute(
                    'INSERT INTO notifications (user_id, title, message) VALUES (?, ?, ?)',
                    [teacherRows[0].user_id, 'New Remark', `A new remark has been added regarding your student (${title}).`]
                );
            }

            // Notify Parents
            const [parentRows] = await pool.execute(`
                SELECT parent_user_id as user_id 
                FROM students 
                WHERE id = ? AND parent_user_id IS NOT NULL
            `, [student_id]);

            const uniqueParents = [...new Set(parentRows.map(r => r.user_id))];
            for (const userId of uniqueParents) {
                await pool.execute(
                    'INSERT INTO notifications (user_id, title, message) VALUES (?, ?, ?)',
                    [userId, 'New Remark', `A new remark has been added regarding your child (${title}).`]
                );
            }
        }
        
        res.json({ success: true, message: 'Remark sent successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

exports.markAsRead = async (req, res) => {
    try {
        const remarkId = req.params.id;
        
        await pool.execute(
            'UPDATE remarks SET is_read = 1 WHERE id = ?',
            [remarkId]
        );
        
        res.json({ success: true, message: 'Remark marked as read' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

exports.markAsUnread = async (req, res) => {
    try {
        const remarkId = req.params.id;
        
        await pool.execute(
            'UPDATE remarks SET is_read = 0 WHERE id = ?',
            [remarkId]
        );
        
        res.json({ success: true, message: 'Remark marked as unread' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
};
