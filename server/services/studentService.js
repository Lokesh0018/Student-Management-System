const pool = require('../config/db');

class StudentService {
    static async getAllStudents(role, userId) {
        let query = `
            SELECT s.id, s.admission_number, s.first_name, s.last_name, s.email, s.class_id, s.roll_number, s.photo, s.dob, s.gender, s.phone, s.address, s.admission_date, s.status, s.created_at, c.class_name, c.section, s.parent_name
            FROM students s
            LEFT JOIN classes c ON s.class_id = c.id
        `;
        let params = [];
        
        if (role === 'CLASS_TEACHER') {
            query += `
                INNER JOIN teachers t ON c.teacher_id = t.id
                WHERE t.user_id = ?
            `;
            params.push(userId);
        } else if (role === 'PARENT') {
            query += `
                WHERE s.parent_user_id = ?
            `;
            params.push(userId);
        }

        const [students] = await pool.execute(query, params);
        return students;
    }

    static async getStudentById(studentId) {
        const [rows] = await pool.execute(`
            SELECT s.id, s.admission_number, s.first_name, s.last_name, s.email, s.class_id, s.roll_number, 
                   s.photo, s.dob, s.gender, s.phone, s.address, s.admission_date, s.status, s.created_at, 
                   c.class_name, c.section,
                   s.parent_name, s.parent_email, s.parent_phone, s.parent_relationship
            FROM students s
            LEFT JOIN classes c ON s.class_id = c.id
            WHERE s.id = ?
        `, [studentId]);
        
        if (rows.length === 0) return null;
        
        const student = rows[0];
        
        // Fetch marks for the student
        const [marks] = await pool.execute(`
            SELECT m.marks_obtained, m.max_marks, m.grade, sub.subject_name, e.exam_name 
            FROM marks m
            JOIN subjects sub ON m.subject_id = sub.id
            JOIN exams e ON m.exam_id = e.id
            WHERE m.student_id = ?
            ORDER BY e.start_date DESC, sub.subject_name ASC
        `, [studentId]);
        
        student.marks = marks;
        return student;
    }
}

module.exports = StudentService;
