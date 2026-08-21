const pool = require('../config/db');

exports.getMarksByExamAndClass = async (req, res) => {
    try {
        const { exam_id, class_id, subject_id } = req.query;
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
            SELECT m.marks_obtained, m.max_marks, m.grade, m.remarks, s.id as student_id, s.first_name, s.last_name, s.roll_number 
            FROM students s
            LEFT JOIN marks m ON s.id = m.student_id AND m.exam_id = ? AND m.subject_id = ?
            WHERE s.class_id = ?
            ORDER BY s.roll_number ASC
        `;
        const [marks] = await pool.execute(query, [exam_id, subject_id, classIdToUse]);
        res.json({ success: true, data: marks });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

exports.saveMarks = async (req, res) => {
    const connection = await pool.getConnection();
    try {
        const { marksData } = req.body; // Array of { student_id, exam_id, marks_obtained, max_marks, remarks }
        
        await connection.beginTransaction();

        // Access Control: If teacher, ensure they only modify their own students
        if (req.user && req.user.role === 'CLASS_TEACHER') {
            const studentIds = [...new Set(marksData.map(m => m.student_id))];
            if (studentIds.length > 0) {
                const placeholders = studentIds.map(() => '?').join(',');
                const [validStudents] = await connection.execute(`
                    SELECT s.id FROM students s
                    JOIN classes c ON s.class_id = c.id
                    JOIN teachers t ON c.teacher_id = t.id
                    WHERE t.user_id = ? AND s.id IN (${placeholders})
                `, [req.user.id, ...studentIds]);
                
                if (validStudents.length !== studentIds.length) {
                    await connection.rollback();
                    return res.status(403).json({ success: false, message: 'You can only save marks for students in your assigned class.' });
                }
            }
        }
        
        for (let item of marksData) {
            const { student_id, exam_id, subject_id, marks_obtained, max_marks, remarks } = item;
            if (marks_obtained !== '' && marks_obtained !== null && marks_obtained !== undefined) {
                const marks = Number(marks_obtained);
                const max = Number(max_marks);
                if (marks < 0 || marks > max) {
                    await connection.rollback();
                    return res.status(400).json({ success: false, message: `Marks for student ${student_id} must be between 0 and ${max}` });
                }
            }

            if (marks_obtained === '' || marks_obtained === null || marks_obtained === undefined) {
                // Delete mark if it exists
                await connection.execute(`
                    DELETE FROM marks 
                    WHERE student_id = ? AND exam_id = ? AND subject_id = ?
                `, [student_id, exam_id, subject_id]);
                continue;
            }

            // Calculate grade
            const percentage = (marks_obtained / max_marks) * 100;
            let grade = 'F';
            if (percentage >= 90) grade = 'A+';
            else if (percentage >= 80) grade = 'A';
            else if (percentage >= 70) grade = 'B+';
            else if (percentage >= 60) grade = 'B';
            else if (percentage >= 50) grade = 'C';
            else if (percentage >= 40) grade = 'D';

            const [existing] = await connection.execute(
                'SELECT id FROM marks WHERE student_id = ? AND exam_id = ? AND subject_id = ? LIMIT 1',
                [mark.student_id, mark.exam_id, mark.subject_id]
            );

            if (existing.length > 0) {
                await connection.execute(
                    'UPDATE marks SET marks_obtained = ?, max_marks = ?, grade = ?, remarks = ? WHERE id = ?',
                    [mark.marks_obtained, mark.max_marks, grade, mark.remarks, existing[0].id]
                );
            } else {
                await connection.execute(
                    'INSERT INTO marks (student_id, exam_id, subject_id, marks_obtained, max_marks, grade, remarks) VALUES (?, ?, ?, ?, ?, ?, ?)',
                    [mark.student_id, mark.exam_id, mark.subject_id, mark.marks_obtained, mark.max_marks, grade, mark.remarks]
                );
            }
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
