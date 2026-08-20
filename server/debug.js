const pool = require('./config/db');

async function testAllParents() {
    try {
        const [users] = await pool.query('SELECT id, email FROM users WHERE role = "PARENT"');
        console.log(`Found ${users.length} parents.`);
        
        for (const user of users) {
            const parentId = user.id;
            const [children] = await pool.execute(`
                SELECT s.*, c.class_name, c.section 
                FROM students s
                LEFT JOIN classes c ON s.class_id = c.id
                WHERE s.parent_user_id = ?
            `, [parentId]);
            
            if (children.length === 0) continue;
            
            const studentIds = children.map(c => c.id);
            const placeholders = studentIds.map(() => '?').join(',');
            
            try {
                const [marks] = await pool.execute(`
                    SELECT m.*, sub.subject_name, e.exam_name 
                    FROM marks m
                    JOIN subjects sub ON m.subject_id = sub.id
                    JOIN exams e ON m.exam_id = e.id
                    WHERE m.student_id IN (${placeholders})
                    ORDER BY m.id DESC LIMIT 10
                `, studentIds);
                
                const [attendance] = await pool.execute(`
                    SELECT student_id, 
                           SUM(CASE WHEN status='PRESENT' THEN 1 ELSE 0 END) as present_days,
                           SUM(CASE WHEN status='ABSENT' THEN 1 ELSE 0 END) as absent_days
                    FROM attendance
                    WHERE student_id IN (${placeholders})
                    GROUP BY student_id
                `, studentIds);
                console.log(`Success for parent ${parentId} (email: ${user.email}). marks: ${marks.length}`);
            } catch (err) {
                console.error(`Error for parent ${parentId} (email: ${user.email}):`, err.message);
                console.error(err);
            }
        }
    } catch (e) {
        console.error('Error:', e);
    } finally {
        process.exit();
    }
}
testAllParents();
