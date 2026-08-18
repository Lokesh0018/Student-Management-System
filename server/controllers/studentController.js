const pool = require('../config/db');
const https = require('https');
const http = require('http');

exports.getAllStudents = async (req, res) => {
    try {
        const [students] = await pool.execute(`
            SELECT s.id, s.admission_number, s.first_name, s.last_name, s.email, s.class_id, s.roll_number, s.photo, s.dob, s.gender, s.phone, s.address, s.admission_date, s.status, s.created_at, c.class_name, c.section
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
            SELECT s.id, s.admission_number, s.first_name, s.last_name, s.email, s.class_id, s.roll_number, s.photo, s.dob, s.gender, s.phone, s.address, s.admission_date, s.status, s.created_at, c.class_name, c.section
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
        const { admission_number, first_name, last_name, email, class_id, roll_number, photo, dob, gender, phone, address, admission_date, status } = req.body;
        
        // Check for duplicates
        const [existingAdmission] = await pool.execute('SELECT id FROM students WHERE admission_number = ?', [admission_number]);
        if (existingAdmission.length > 0) {
            return res.status(400).json({ success: false, message: 'Admission number already exists.' });
        }
        
        const [existingRoll] = await pool.execute('SELECT id FROM students WHERE class_id = ? AND roll_number = ?', [class_id, roll_number]);
        if (existingRoll.length > 0) {
            return res.status(400).json({ success: false, message: 'Roll number already exists in this class.' });
        }

        const [result] = await pool.execute(
            'INSERT INTO students (admission_number, first_name, last_name, email, class_id, roll_number, photo, dob, gender, phone, address, admission_date, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
            [admission_number, first_name, last_name, email, class_id || null, roll_number, photo || null, dob || null, gender || null, phone || null, address || null, admission_date || null, status || 'ACTIVE']
        );
        res.json({ success: true, message: 'Student created', data: { id: result.insertId } });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

exports.updateStudent = async (req, res) => {
    try {
        const { admission_number, first_name, last_name, email, class_id, roll_number, photo, dob, gender, phone, address, admission_date, status } = req.body;
        
        // Check for duplicates
        const [existingAdmission] = await pool.execute('SELECT id FROM students WHERE admission_number = ? AND id != ?', [admission_number, req.params.id]);
        if (existingAdmission.length > 0) {
            return res.status(400).json({ success: false, message: 'Admission number already exists.' });
        }
        
        const [existingRoll] = await pool.execute('SELECT id FROM students WHERE class_id = ? AND roll_number = ? AND id != ?', [class_id, roll_number, req.params.id]);
        if (existingRoll.length > 0) {
            return res.status(400).json({ success: false, message: 'Roll number already exists in this class.' });
        }

        let query = 'UPDATE students SET admission_number = ?, first_name = ?, last_name = ?, email = ?, class_id = ?, roll_number = ?, photo = ?, dob = ?, gender = ?, phone = ?, address = ?, admission_date = ?, status = ?';
        let params = [admission_number, first_name, last_name, email, class_id || null, roll_number, photo || null, dob || null, gender || null, phone || null, address || null, admission_date || null, status || 'ACTIVE'];

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

exports.getStudentImage = async (req, res) => {
    try {
        const studentId = req.params.id;
        const [rows] = await pool.execute('SELECT photo FROM students WHERE id = ?', [studentId]);
        
        if (rows.length === 0 || !rows[0].photo) {
            return res.status(404).send('Image not found');
        }

        const imageUrl = rows[0].photo;

        // Parse Google Drive URL
        let targetUrl = imageUrl;
        const match = imageUrl.match(/\/d\/([^/]+)/);
        if (match) {
            const fileId = match[1];
            targetUrl = `https://drive.google.com/thumbnail?id=${fileId}&sz=w500`;
        } else {
            const matchOpen = imageUrl.match(/open\?id=([a-zA-Z0-9_-]+)/);
            if (matchOpen) {
                targetUrl = `https://drive.google.com/thumbnail?id=${matchOpen[1]}&sz=w500`;
            }
        }

        // Fetch image
        const client = targetUrl.startsWith('https') ? https : http;
        
        const fetchImage = (url) => {
            const reqClient = url.startsWith('https') ? https : http;
            reqClient.get(url, (response) => {
                // Handle redirect
                if (response.statusCode >= 300 && response.statusCode < 400 && response.headers.location) {
                    return fetchImage(response.headers.location);
                }
                
                if (response.statusCode !== 200) {
                    return res.status(response.statusCode).send('Failed to fetch image from source');
                }

                // Set headers
                res.setHeader('Content-Type', response.headers['content-type'] || 'image/jpeg');
                res.setHeader('Cache-Control', 'public, max-age=86400');
                
                // Stream response
                response.pipe(res);
            }).on('error', (e) => {
                console.error("Proxy error:", e);
                res.status(500).send('Error proxying image');
            });
        };

        fetchImage(targetUrl);

    } catch (error) {
        console.error("Error in getStudentImage:", error);
        res.status(500).json({ success: false, message: 'Server error retrieving image' });
    }
};
