const db = require('../config/db');

// Teacher Assignment Management
exports.getAssignments = async (req, res) => {
    try {
        const teacherId = req.user.id;
        
        const [assignments] = await db.execute(`
            SELECT a.*, c.class_name, c.section, s.subject_name 
            FROM assignments a
            JOIN classes c ON a.class_id = c.id
            JOIN subjects s ON a.subject_id = s.id
            WHERE c.teacher_id = (SELECT id FROM teachers WHERE user_id = ?)
            ORDER BY a.due_date ASC
        `, [teacherId]);

        res.json({ success: true, data: assignments });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

exports.createAssignment = async (req, res) => {
    try {
        const teacherUserId = req.user.id;
        const { class_id, subject_id, title, description, due_date, priority } = req.body;

        const [teacher] = await db.execute('SELECT id FROM teachers WHERE user_id = ?', [teacherUserId]);
        if (teacher.length === 0) return res.status(403).json({ success: false, message: 'Unauthorized' });
        const teacherId = teacher[0].id;

        // Verify class belongs to this teacher
        const [cls] = await db.execute('SELECT id FROM classes WHERE id = ? AND teacher_id = ?', [class_id, teacherId]);
        if (cls.length === 0) return res.status(403).json({ success: false, message: 'Class not assigned to you' });

        await db.execute(
            'INSERT INTO assignments (teacher_id, class_id, subject_id, title, description, assigned_date, due_date, priority) VALUES (?, ?, ?, ?, ?, CURDATE(), ?, ?)',
            [teacherId, class_id, subject_id, title, description, due_date, priority || 'Normal']
        );

        res.status(201).json({ success: true, message: 'Assignment created' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

exports.updateAssignment = async (req, res) => {
    try {
        const { id } = req.params;
        const { title, description, due_date, priority, status } = req.body;
        const teacherUserId = req.user.id;

        const [teacher] = await db.execute('SELECT id FROM teachers WHERE user_id = ?', [teacherUserId]);
        if (teacher.length === 0) return res.status(403).json({ success: false, message: 'Unauthorized' });

        const [assignment] = await db.execute('SELECT id FROM assignments WHERE id = ? AND teacher_id = ?', [id, teacher[0].id]);
        if (assignment.length === 0) return res.status(403).json({ success: false, message: 'Unauthorized or not found' });

        await db.execute(
            'UPDATE assignments SET title=?, description=?, due_date=?, priority=?, status=? WHERE id=?',
            [title, description, due_date, priority, status, id]
        );

        res.json({ success: true, message: 'Assignment updated' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

exports.deleteAssignment = async (req, res) => {
    try {
        const { id } = req.params;
        const teacherUserId = req.user.id;

        const [teacher] = await db.execute('SELECT id FROM teachers WHERE user_id = ?', [teacherUserId]);
        if (teacher.length === 0) return res.status(403).json({ success: false, message: 'Unauthorized' });

        const [assignment] = await db.execute('SELECT id FROM assignments WHERE id = ? AND teacher_id = ?', [id, teacher[0].id]);
        if (assignment.length === 0) return res.status(403).json({ success: false, message: 'Unauthorized or not found' });

        await db.execute('DELETE FROM assignments WHERE id=?', [id]);

        res.json({ success: true, message: 'Assignment deleted' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

exports.getAssignmentProgress = async (req, res) => {
    try {
        const { id } = req.params;
        const teacherUserId = req.user.id;

        const [teacher] = await db.execute('SELECT id FROM teachers WHERE user_id = ?', [teacherUserId]);
        if (teacher.length === 0) return res.status(403).json({ success: false, message: 'Unauthorized' });

        const [assignment] = await db.execute('SELECT class_id FROM assignments WHERE id = ? AND teacher_id = ?', [id, teacher[0].id]);
        if (assignment.length === 0) return res.status(403).json({ success: false, message: 'Unauthorized or not found' });

        const class_id = assignment[0].class_id;

        const [progressData] = await db.execute(`
            SELECT s.id as student_id, s.first_name, s.last_name, s.roll_number, h.status, h.completed_at 
            FROM students s
            LEFT JOIN homework h ON s.id = h.student_id AND h.assignment_id = ?
            WHERE s.class_id = ?
            ORDER BY s.first_name ASC, s.last_name ASC
        `, [id, class_id]);

        res.json({ success: true, data: progressData });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

exports.getAssignmentById = async (req, res) => {
    try {
        const { id } = req.params;
        const teacherUserId = req.user.id;

        const [teacher] = await db.execute('SELECT id FROM teachers WHERE user_id = ?', [teacherUserId]);
        if (teacher.length === 0) return res.status(403).json({ success: false, message: 'Unauthorized' });

        const [assignment] = await db.execute(`
            SELECT a.*, c.class_name, c.section, s.subject_name 
            FROM assignments a
            JOIN classes c ON a.class_id = c.id
            JOIN subjects s ON a.subject_id = s.id
            WHERE a.id = ? AND a.teacher_id = ?
        `, [id, teacher[0].id]);

        if (assignment.length === 0) return res.status(404).json({ success: false, message: 'Assignment not found' });

        res.json({ success: true, data: assignment[0] });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

// Parent Endpoints
exports.getParentAssignments = async (req, res) => {
    try {
        const parentId = req.user.id;
        
        const [children] = await db.execute('SELECT id, first_name, last_name, class_id FROM students WHERE parent_user_id=?', [parentId]);
        if (children.length === 0) return res.json({ success: true, data: [] });

        const classIds = children.map(c => c.class_id).filter(id => id !== null);
        if (classIds.length === 0) return res.json({ success: true, data: [] });

        // Get assignments for these classes
        const [assignments] = await db.execute(`
            SELECT a.*, c.class_name, c.section, s.subject_name 
            FROM assignments a
            JOIN classes c ON a.class_id = c.id
            JOIN subjects s ON a.subject_id = s.id
            WHERE a.class_id IN (${classIds.join(',')}) AND a.status = 'Active'
            ORDER BY a.due_date ASC
        `);

        // Attach homework status if exists
        for (const assign of assignments) {
            const [hw] = await db.execute('SELECT id, status FROM homework WHERE assignment_id = ? AND parent_id = ?', [assign.id, parentId]);
            assign.homework_status = hw.length > 0 ? hw[0].status : null;
            assign.homework_id = hw.length > 0 ? hw[0].id : null;
            
            // map to child
            const child = children.find(c => c.class_id === assign.class_id);
            assign.student_name = child ? (child.first_name + ' ' + child.last_name) : 'Unknown';
        }

        res.json({ success: true, data: assignments });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

exports.addHomework = async (req, res) => {
    try {
        const { assignment_id } = req.body;
        const parentId = req.user.id;

        const [assignment] = await db.execute('SELECT class_id FROM assignments WHERE id = ?', [assignment_id]);
        if (assignment.length === 0) return res.status(404).json({ success: false, message: 'Not found' });

        const [child] = await db.execute('SELECT id FROM students WHERE parent_user_id = ? AND class_id = ?', [parentId, assignment[0].class_id]);
        if (child.length === 0) return res.status(403).json({ success: false, message: 'Unauthorized' });

        await db.execute(
            'INSERT INTO homework (assignment_id, student_id, parent_id, status) VALUES (?, ?, ?, ?)',
            [assignment_id, child[0].id, parentId, 'TO_DO']
        );

        res.status(201).json({ success: true, message: 'Added to homework' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

exports.updateHomeworkStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;
        const parentId = req.user.id;

        const [hw] = await db.execute('SELECT id FROM homework WHERE id = ? AND parent_id = ?', [id, parentId]);
        if (hw.length === 0) return res.status(403).json({ success: false, message: 'Unauthorized' });

        const completedAt = status === 'COMPLETED' ? 'NOW()' : 'NULL';
        await db.execute('UPDATE homework SET status = ?, completed_at = ' + completedAt + ' WHERE id = ?', [status, id]);

        res.json({ success: true, message: 'Status updated' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};
