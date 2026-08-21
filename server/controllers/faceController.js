const pool = require('../config/db');

// Register a new face embedding for a student
exports.registerFace = async (req, res) => {
    try {
        const { studentId, descriptor } = req.body;
        
        if (!studentId || !descriptor) {
            return res.status(400).json({ success: false, message: 'Student ID and descriptor are required' });
        }

        const descriptorStr = JSON.stringify(descriptor);

        // Check if student already has a face registered
        const [existing] = await pool.execute('SELECT id FROM student_faces WHERE student_id = ?', [studentId]);
        
        if (existing.length > 0) {
            // Update existing
            await pool.execute(
                'UPDATE student_faces SET descriptor = ?, is_active = true WHERE student_id = ?',
                [descriptorStr, studentId]
            );
        } else {
            // Insert new
            await pool.execute(
                'INSERT INTO student_faces (student_id, descriptor) VALUES (?, ?)',
                [studentId, descriptorStr]
            );
        }

        res.json({ success: true, message: 'Face registered successfully' });
    } catch (error) {
        console.error('Error registering face:', error);
        res.status(500).json({ success: false, message: 'Server error during face registration' });
    }
};

// Get all face descriptors for a specific class
exports.getFacesByClass = async (req, res) => {
    try {
        const { classId } = req.params;
        const teacherRole = req.user.role;
        const teacherId = req.user.id;

        // Verify authorization for CLASS_TEACHER
        if (teacherRole === 'CLASS_TEACHER') {
            const [classes] = await pool.execute('SELECT id FROM classes WHERE class_teacher_id = ?', [teacherId]);
            const assignedClassId = classes[0]?.id;
            
            if (parseInt(classId) !== assignedClassId) {
                return res.status(403).json({ success: false, message: 'Unauthorized to access this class faces' });
            }
        }

        const query = `
            SELECT sf.student_id, sf.descriptor, s.first_name, s.last_name, s.roll_number
            FROM student_faces sf
            JOIN students s ON sf.student_id = s.id
            WHERE s.class_id = ? AND sf.is_active = true
        `;
        
        const [faces] = await pool.execute(query, [classId]);
        
        // Parse the descriptors back to arrays
        const parsedFaces = faces.map(face => ({
            ...face,
            descriptor: typeof face.descriptor === 'string' ? JSON.parse(face.descriptor) : face.descriptor
        }));

        res.json({ success: true, data: parsedFaces });
    } catch (error) {
        console.error('Error fetching faces:', error);
        res.status(500).json({ success: false, message: 'Server error fetching faces' });
    }
};
