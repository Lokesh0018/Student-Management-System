const pool = require('../config/db');

exports.getAllStudents = async (req, res) => {
    try {
        const [students] = await pool.execute(`
            SELECT s.id, s.admission_number, s.first_name, s.last_name, s.email, s.class_id, s.roll_number, s.photo_type, s.dob, s.gender, s.phone, s.address, s.admission_date, s.status, s.created_at, c.class_name, c.section, IF(s.photo IS NOT NULL, 1, 0) as photo 
            FROM students s
            LEFT JOIN classes c ON s.class_id = c.id
        `);
        res.json({ success: true, data: students });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

exports.getStudentById = async (req, res) => {
    try {
        const [rows] = await pool.execute(`
            SELECT s.id, s.admission_number, s.first_name, s.last_name, s.email, s.class_id, s.roll_number, s.photo_type, s.dob, s.gender, s.phone, s.address, s.admission_date, s.status, s.created_at, c.class_name, c.section, IF(s.photo IS NOT NULL, 1, 0) as photo 
            FROM students s
            LEFT JOIN classes c ON s.class_id = c.id
            WHERE s.id = ?
        `, [req.params.id]);
        if (rows.length > 0) {
            res.json({ success: true, data: rows[0] });
        } else {
            res.status(404).json({ success: false, message: 'Student not found' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

exports.createStudent = async (req, res) => {
    try {
        const { admission_number, first_name, last_name, email, class_id, roll_number, dob, gender, phone, address, admission_date, status } = req.body;
        
        // Check for duplicates
        const [existingAdmission] = await pool.execute('SELECT id FROM students WHERE admission_number = ?', [admission_number]);
        if (existingAdmission.length > 0) {
            return res.status(400).json({ success: false, message: 'Admission number already exists.' });
        }
        
        const [existingRoll] = await pool.execute('SELECT id FROM students WHERE class_id = ? AND roll_number = ?', [class_id, roll_number]);
        if (existingRoll.length > 0) {
            return res.status(400).json({ success: false, message: 'Roll number already exists in this class.' });
        }

        let photo = null;
        let photo_type = null;
        if (req.file) {
            photo = req.file.buffer;
            photo_type = req.file.mimetype;
        }

        const [result] = await pool.execute(
            'INSERT INTO students (admission_number, first_name, last_name, email, class_id, roll_number, photo, photo_type, dob, gender, phone, address, admission_date, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
            [admission_number, first_name, last_name, email, class_id || null, roll_number, photo, photo_type, dob || null, gender || null, phone || null, address || null, admission_date || null, status || 'ACTIVE']
        );
        res.json({ success: true, message: 'Student created', data: { id: result.insertId } });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

exports.updateStudent = async (req, res) => {
    try {
        const { admission_number, first_name, last_name, email, class_id, roll_number, dob, gender, phone, address, admission_date, status } = req.body;
        
        // Check for duplicates
        const [existingAdmission] = await pool.execute('SELECT id FROM students WHERE admission_number = ? AND id != ?', [admission_number, req.params.id]);
        if (existingAdmission.length > 0) {
            return res.status(400).json({ success: false, message: 'Admission number already exists.' });
        }
        
        const [existingRoll] = await pool.execute('SELECT id FROM students WHERE class_id = ? AND roll_number = ? AND id != ?', [class_id, roll_number, req.params.id]);
        if (existingRoll.length > 0) {
            return res.status(400).json({ success: false, message: 'Roll number already exists in this class.' });
        }

        let query = 'UPDATE students SET admission_number = ?, first_name = ?, last_name = ?, email = ?, class_id = ?, roll_number = ?, dob = ?, gender = ?, phone = ?, address = ?, admission_date = ?, status = ?';
        let params = [admission_number, first_name, last_name, email, class_id || null, roll_number, dob || null, gender || null, phone || null, address || null, admission_date || null, status || 'ACTIVE'];

        if (req.file) {
            query += ', photo = ?, photo_type = ?';
            params.push(req.file.buffer, req.file.mimetype);
        }

        query += ' WHERE id = ?';
        params.push(req.params.id);

        await pool.execute(query, params);
        res.json({ success: true, message: 'Student updated' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

exports.deleteStudent = async (req, res) => {
    try {
        await pool.execute('DELETE FROM students WHERE id = ?', [req.params.id]);
        res.json({ success: true, message: 'Student deleted' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

exports.getStudentPhoto = async (req, res) => {
    try {
        const [rows] = await pool.execute('SELECT photo, photo_type FROM students WHERE id = ?', [req.params.id]);
        if (rows.length > 0 && rows[0].photo) {
            res.set('Content-Type', rows[0].photo_type);
            res.send(rows[0].photo);
        } else {
            res.status(404).json({ success: false, message: 'Photo not found' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};
