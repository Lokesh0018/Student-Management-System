const pool = require('../config/db');

exports.getAttendanceByClassAndDate = async (req, res) => {
    try {
        const { class_id, date } = req.query;
        let classIdToUse = class_id;

        if (req.user && req.user.role === 'CLASS_TEACHER') {
            const [teacherClass] = await pool.execute(
                'SELECT c.id FROM classes c JOIN teachers t ON c.teacher_id = t.id WHERE t.user_id = ?',
                [req.user.id]
            );
            if (teacherClass.length > 0) {
                classIdToUse = teacherClass[0].id;
            } else {
                return res.json({ success: true, data: [] });
            }
        }

        let query = `
            SELECT a.id as attendance_id, a.status, s.id as student_id, s.first_name, s.last_name, s.roll_number 
            FROM students s
            LEFT JOIN attendance a ON s.id = a.student_id AND a.date = ?
            WHERE s.class_id = ?
        `;
        const [attendance] = await pool.execute(query, [date, classIdToUse]);
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
        
        let classIdToUse = class_id;

        if (req.user && req.user.role === 'CLASS_TEACHER') {
            const [teacherClass] = await connection.execute(
                'SELECT c.id FROM classes c JOIN teachers t ON c.teacher_id = t.id WHERE t.user_id = ?',
                [req.user.id]
            );
            if (teacherClass.length > 0) {
                classIdToUse = teacherClass[0].id;
            } else {
                connection.release();
                return res.status(403).json({ success: false, message: 'Not assigned to any class' });
            }
        }

        await connection.beginTransaction();
        
        for (const record of attendanceData) {
            const [existing] = await connection.execute(
                'SELECT id FROM attendance WHERE student_id = ? AND date = ? LIMIT 1', 
                [record.student_id, date]
            );
            
            if (existing.length > 0) {
                await connection.execute(
                    'UPDATE attendance SET status = ? WHERE id = ?',
                    [record.status, existing[0].id]
                );
            } else {
                await connection.execute(
                    'INSERT INTO attendance (student_id, date, class_id, status) VALUES (?, ?, ?, ?)',
                    [record.student_id, date, classIdToUse, record.status]
                );
            }
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
