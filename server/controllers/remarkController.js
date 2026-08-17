const pool = require('../config/db');

exports.getRemarksForUser = async (req, res) => {
    try {
        const userId = req.user.id;
        
        // Fetch remarks where user is sender or receiver
        let query = `
            SELECT r.*, 
                   sender.name as sender_name, sender.role as sender_role,
                   receiver.name as receiver_name, receiver.role as receiver_role,
                   s.first_name as student_first, s.last_name as student_last
            FROM remarks r
            JOIN users sender ON r.sender_id = sender.id
            JOIN users receiver ON r.receiver_id = receiver.id
            LEFT JOIN students s ON r.student_id = s.id
            WHERE r.sender_id = ? OR r.receiver_id = ?
            ORDER BY r.created_at DESC
        `;
        const [remarks] = await pool.execute(query, [userId, userId]);
        res.json({ success: true, data: remarks });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

exports.sendRemark = async (req, res) => {
    try {
        const { receiver_id, student_id, title, message } = req.body;
        const sender_id = req.user.id;
        
        await pool.execute(
            'INSERT INTO remarks (sender_id, receiver_id, student_id, title, message) VALUES (?, ?, ?, ?, ?)',
            [sender_id, receiver_id, student_id || null, title, message]
        );
        
        res.json({ success: true, message: 'Remark sent successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

exports.markAsRead = async (req, res) => {
    try {
        const remarkId = req.params.id;
        const userId = req.user.id;
        
        // Only receiver can mark as read
        await pool.execute(
            'UPDATE remarks SET is_read = 1 WHERE id = ? AND receiver_id = ?',
            [remarkId, userId]
        );
        
        res.json({ success: true, message: 'Remark marked as read' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
};
