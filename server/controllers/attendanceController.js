const pool = require('../config/db');

exports.getAttendanceByClassAndDate = async (req, res) => {
    try {
        const { class_id, date } = req.query;
        let query = `
            SELECT a.id as attendance_id, a.status, s.id as student_id, s.first_name, s.last_name, s.roll_number 
            FROM students s
            LEFT JOIN attendance a ON s.id = a.student_id AND a.date = ?
            WHERE s.class_id = ?
        `;
        const [attendance] = await pool.execute(query, [date, class_id]);
        res.json({ success: true, data: attendance });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

exports.saveAttendance = async (req, res) => {
    const connection = await pool.getConnection();
    try {
        const { class_id, date, attendanceData } = req.body; // Array of { student_id, status }
        
        await connection.beginTransaction();
        
        for (const record of attendanceData) {
            // Upsert attendance
            await connection.execute(`
                INSERT INTO attendance (student_id, date, class_id, status)
                VALUES (?, ?, ?, ?)
                ON DUPLICATE KEY UPDATE 
                status = VALUES(status)
            `, [record.student_id, date, class_id, record.status]);
        }
        
        await connection.commit();
        res.json({ success: true, message: 'Attendance saved successfully' });
    } catch (error) {
        await connection.rollback();
        console.error('Error saving attendance', error);
        res.status(500).json({ success: false, message: 'Failed to save attendance' });
    } finally {
        connection.release();
    }
};
