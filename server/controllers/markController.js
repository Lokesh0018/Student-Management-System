const pool = require('../config/db');

exports.getMarksByExamAndClass = async (req, res) => {
    try {
        const { exam_id, class_id, subject_id } = req.query;
        let query = `
            SELECT m.*, s.first_name, s.last_name, s.roll_number 
            FROM marks m
            JOIN students s ON m.student_id = s.id
            WHERE m.exam_id = ? AND m.subject_id = ? AND s.class_id = ?
        `;
        const [marks] = await pool.execute(query, [exam_id, subject_id, class_id]);
        res.json({ success: true, data: marks });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

exports.saveMarks = async (req, res) => {
    const connection = await pool.getConnection();
    try {
        const { marksData } = req.body; // Array of { student_id, exam_id, subject_id, marks_obtained, max_marks, remarks }
        
        await connection.beginTransaction();
        
        for (const mark of marksData) {
            // Calculate grade
            const percentage = (mark.marks_obtained / mark.max_marks) * 100;
            let grade = 'F';
            if (percentage >= 90) grade = 'A+';
            else if (percentage >= 80) grade = 'A';
            else if (percentage >= 70) grade = 'B+';
            else if (percentage >= 60) grade = 'B';
            else if (percentage >= 50) grade = 'C';
            else if (percentage >= 40) grade = 'D';

            // Upsert
            await connection.execute(`
                INSERT INTO marks (student_id, exam_id, subject_id, marks_obtained, max_marks, grade, remarks)
                VALUES (?, ?, ?, ?, ?, ?, ?)
                ON DUPLICATE KEY UPDATE 
                marks_obtained = VALUES(marks_obtained),
                max_marks = VALUES(max_marks),
                grade = VALUES(grade),
                remarks = VALUES(remarks)
            `, [mark.student_id, mark.exam_id, mark.subject_id, mark.marks_obtained, mark.max_marks, grade, mark.remarks]);
        }
        
        await connection.commit();
        res.json({ success: true, message: 'Marks saved successfully' });
    } catch (error) {
        await connection.rollback();
        console.error('Error saving marks', error);
        res.status(500).json({ success: false, message: 'Failed to save marks' });
    } finally {
        connection.release();
    }
};
