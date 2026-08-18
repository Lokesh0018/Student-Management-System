const pool = require('../config/db');
const https = require('https');
const http = require('http');

exports.getAllStudents = async (req, res) => {
    try {
        const { role, id } = req.user;
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
            params.push(id);
        } else if (role === 'PARENT') {
            query += `
                WHERE s.parent_user_id = ?
            `;
            params.push(id);
        }

        const [students] = await pool.execute(query, params);
        res.json({ success: true, data: students });
    } catch (error) {
        console.error('Error fetching students:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

exports.getStudentById = async (req, res) => {
    try {
        const [rows] = await pool.execute(`
            SELECT s.id, s.admission_number, s.first_name, s.last_name, s.email, s.class_id, s.roll_number, 
                   s.photo, s.dob, s.gender, s.phone, s.address, s.admission_date, s.status, s.created_at, 
                   c.class_name, c.section,
                   s.parent_name, s.parent_email, s.parent_phone, s.parent_relationship
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
    let connection;
    try {
        const { 
            admission_number, first_name, last_name, email, class_id, roll_number, 
            photo, dob, gender, phone, address, admission_date, status,
            parent_name, parent_email, parent_phone, parent_relationship 
        } = req.body;
        
        connection = await pool.getConnection();
        await connection.beginTransaction();

        // Check for duplicates
        const [existingAdmission] = await connection.execute('SELECT id FROM students WHERE admission_number = ?', [admission_number]);
        if (existingAdmission.length > 0) {
            await connection.rollback();
            return res.status(400).json({ success: false, message: 'Admission number already exists.' });
        }
        
        const [existingRoll] = await connection.execute('SELECT id FROM students WHERE class_id = ? AND roll_number = ?', [class_id, roll_number]);
        if (existingRoll.length > 0) {
            await connection.rollback();
            return res.status(400).json({ success: false, message: 'Roll number already exists in this class.' });
        }

        // Check if parent user already exists
        const [existingUser] = await connection.execute('SELECT id FROM users WHERE email = ? AND role = "PARENT"', [parent_email]);
        let parentUserId;
        
        if (existingUser.length > 0) {
            parentUserId = existingUser[0].id;
        } else {
            // Create user for parent
            const [userResult] = await connection.execute(
                'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)',
                [parent_name, parent_email, 'parent123', 'PARENT']
            );
            parentUserId = userResult.insertId;
        }

        const [studentResult] = await connection.execute(
            'INSERT INTO students (admission_number, first_name, last_name, email, class_id, roll_number, photo, dob, gender, phone, address, admission_date, status, parent_name, parent_email, parent_phone, parent_relationship, parent_user_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
            [admission_number, first_name, last_name, email, class_id || null, roll_number, photo || null, dob || null, gender || null, phone || null, address || null, admission_date || null, status || 'ACTIVE', parent_name, parent_email, parent_phone, parent_relationship, parentUserId]
        );
        const studentId = studentResult.insertId;

        await connection.commit();
        res.json({ success: true, message: 'Student created and linked to parent', data: { id: studentId } });
    } catch (error) {
        if (connection) await connection.rollback();
        console.error(error);
        res.status(500).json({ success: false, message: 'Server error' });
    } finally {
        if (connection) connection.release();
    }
};

exports.updateStudent = async (req, res) => {
    let connection;
    try {
        const { 
            admission_number, first_name, last_name, email, class_id, roll_number, 
            photo, dob, gender, phone, address, admission_date, status,
            parent_name, parent_email, parent_phone, parent_relationship 
        } = req.body;
        
        connection = await pool.getConnection();
        await connection.beginTransaction();

        // Check for duplicates
        const [existingAdmission] = await connection.execute('SELECT id FROM students WHERE admission_number = ? AND id != ?', [admission_number, req.params.id]);
        if (existingAdmission.length > 0) {
            await connection.rollback();
            return res.status(400).json({ success: false, message: 'Admission number already exists.' });
        }
        
        const [existingRoll] = await connection.execute('SELECT id FROM students WHERE class_id = ? AND roll_number = ? AND id != ?', [class_id, roll_number, req.params.id]);
        if (existingRoll.length > 0) {
            await connection.rollback();
            return res.status(400).json({ success: false, message: 'Roll number already exists in this class.' });
        }

        let query = 'UPDATE students SET admission_number = ?, first_name = ?, last_name = ?, email = ?, class_id = ?, roll_number = ?, photo = ?, dob = ?, gender = ?, phone = ?, address = ?, admission_date = ?, status = ?, parent_name = ?, parent_email = ?, parent_phone = ?, parent_relationship = ? WHERE id = ?';
        let params = [admission_number, first_name, last_name, email, class_id || null, roll_number, photo || null, dob || null, gender || null, phone || null, address || null, admission_date || null, status || 'ACTIVE', parent_name, parent_email, parent_phone, parent_relationship, req.params.id];

        await connection.execute(query, params);

        // Try to update the user account associated with the parent (if we can find it)
        const [student] = await connection.execute('SELECT parent_user_id FROM students WHERE id = ?', [req.params.id]);
        if (student.length > 0 && student[0].parent_user_id) {
            await connection.execute(
                'UPDATE users SET name = ?, email = ? WHERE id = ?',
                [parent_name, parent_email, student[0].parent_user_id]
            );
        }

        await connection.commit();
        res.json({ success: true, message: 'Student and Parent updated' });
    } catch (error) {
        if (connection) await connection.rollback();
        console.error(error);
        res.status(500).json({ success: false, message: 'Server error' });
    } finally {
        if (connection) connection.release();
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

exports.previewImage = async (req, res) => {
    try {
        const imageUrl = req.query.url;
        if (!imageUrl) return res.status(400).send('URL required');
        
        // Anti-SSRF Check: Only allow Google Drive URLs to be proxied
        if (!imageUrl.includes('drive.google.com') && !imageUrl.includes('googleusercontent.com')) {
            return res.status(403).send('Only Google Drive URLs are allowed for preview proxy');
        }

        let targetUrl = imageUrl;
        const match = imageUrl.match(/\/d\/([^/]+)/);
        if (match) {
            targetUrl = `https://drive.google.com/thumbnail?id=${match[1]}&sz=w500`;
        } else {
            const matchOpen = imageUrl.match(/open\?id=([a-zA-Z0-9_-]+)/);
            if (matchOpen) {
                targetUrl = `https://drive.google.com/thumbnail?id=${matchOpen[1]}&sz=w500`;
            }
        }

        const fetchImage = (url) => {
            const reqClient = url.startsWith('https') ? https : http;
            reqClient.get(url, (response) => {
                if (response.statusCode >= 300 && response.statusCode < 400 && response.headers.location) {
                    return fetchImage(response.headers.location);
                }
                if (response.statusCode !== 200) {
                    return res.status(response.statusCode).send('Failed to fetch image from source');
                }
                res.setHeader('Content-Type', response.headers['content-type'] || 'image/jpeg');
                res.setHeader('Cache-Control', 'public, max-age=86400');
                response.pipe(res);
            }).on('error', (e) => {
                res.status(500).send('Error proxying image');
            });
        };

        fetchImage(targetUrl);
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error retrieving image' });
    }
};
