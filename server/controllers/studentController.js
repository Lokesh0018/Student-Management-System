const pool = require('../config/db');
const https = require('https');
const http = require('http');
const StudentService = require('../services/studentService');
const ApiResponse = require('../utils/ApiResponse');
const logger = require('../utils/logger');
const bcrypt = require('bcrypt');

exports.getAllStudents = async (req, res) => {
    try {
        const { role, id } = req.user;
        const students = await StudentService.getAllStudents(role, id);
        return ApiResponse.success(res, 'Students fetched successfully', students);
    } catch (err) {
        logger.error('Error fetching students: %O', err);
        return ApiResponse.error(res, 'Failed to fetch students', 500);
    }
};

exports.getStudentById = async (req, res) => {
    try {
        const student = await StudentService.getStudentById(req.params.id);
        if (student) {
            return ApiResponse.success(res, 'Student fetched successfully', student);
        } else {
            return ApiResponse.error(res, 'Student not found', 404);
        }
    } catch (err) {
        logger.error('Error fetching student by ID: %O', err);
        return ApiResponse.error(res, 'Failed to fetch student', 500);
    }
};

exports.createStudent = async (req, res, next) => {
    let connection;
    try {
        const { 
            admission_number, first_name, last_name, email, class_id, roll_number, 
            photo, dob, gender, blood_group, phone, address, admission_date, status,
            parent_name, parent_email, parent_phone, parent_relationship, parent_password
        } = req.body;
        
        // Manual validation
        if (!first_name || !last_name || !admission_number || !class_id || !parent_name || !parent_email) {
            return res.status(400).json({ success: false, message: 'Missing required fields' });
        }

        connection = await pool.getConnection();
        await connection.beginTransaction();

        if (req.user && req.user.role === 'CLASS_TEACHER') {
            const [classes] = await connection.execute(
                'SELECT c.id FROM classes c INNER JOIN teachers t ON c.teacher_id = t.id WHERE t.user_id = ? AND c.id = ?',
                [req.user.id, class_id]
            );
            if (classes.length === 0) {
                await connection.rollback();
                return res.status(403).json({ success: false, message: 'You can only add students to your assigned class.' });
            }
        }

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
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(parent_password || 'parent123', salt);
            
            const [userResult] = await connection.execute(
                'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)',
                [parent_name, parent_email, hashedPassword, 'PARENT']
            );
            parentUserId = userResult.insertId;
        }

        const [studentResult] = await connection.execute(
            'INSERT INTO students (admission_number, first_name, last_name, email, class_id, roll_number, photo, dob, gender, blood_group, phone, address, admission_date, status, parent_name, parent_email, parent_phone, parent_relationship, parent_user_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
            [admission_number, first_name, last_name, email, class_id || null, roll_number, photo || null, dob || null, gender || null, blood_group || null, phone || null, address || null, admission_date || null, status || 'ACTIVE', parent_name, parent_email, parent_phone, parent_relationship, parentUserId]
        );
        const studentId = studentResult.insertId;

        await connection.commit();
        res.json({ success: true, message: 'Student created and linked to parent', data: { id: studentId } });
    } catch (error) {
        if (connection) await connection.rollback();
        next(error);
    } finally {
        if (connection) connection.release();
    }
};

exports.updateStudent = async (req, res, next) => {
    let connection;
    try {
        const { 
            admission_number, first_name, last_name, email, class_id, roll_number, 
            photo, dob, gender, blood_group, phone, address, admission_date, status,
            parent_name, parent_email, parent_phone, parent_relationship, parent_password
        } = req.body;
        
        // Manual validation
        if (!first_name || !last_name || !admission_number || !class_id || !parent_name || !parent_email) {
            return res.status(400).json({ success: false, message: 'Missing required fields' });
        }

        connection = await pool.getConnection();
        await connection.beginTransaction();

        if (req.user && req.user.role === 'CLASS_TEACHER') {
            const [classes] = await connection.execute(
                'SELECT c.id FROM classes c INNER JOIN teachers t ON c.teacher_id = t.id WHERE t.user_id = ? AND c.id = ?',
                [req.user.id, class_id]
            );
            if (classes.length === 0) {
                await connection.rollback();
                return res.status(403).json({ success: false, message: 'You can only assign students to your assigned class.' });
            }
            
            const [originalStudent] = await connection.execute('SELECT class_id FROM students WHERE id = ?', [req.params.id]);
            if (originalStudent.length > 0) {
                 const [origClasses] = await connection.execute(
                     'SELECT c.id FROM classes c INNER JOIN teachers t ON c.teacher_id = t.id WHERE t.user_id = ? AND c.id = ?',
                     [req.user.id, originalStudent[0].class_id]
                 );
                 if (origClasses.length === 0) {
                     await connection.rollback();
                     return res.status(403).json({ success: false, message: 'You can only modify students from your own class.' });
                 }
            }
        }

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

        let query = 'UPDATE students SET admission_number = ?, first_name = ?, last_name = ?, email = ?, class_id = ?, roll_number = ?, photo = ?, dob = ?, gender = ?, blood_group = ?, phone = ?, address = ?, admission_date = ?, status = ?, parent_name = ?, parent_email = ?, parent_phone = ?, parent_relationship = ? WHERE id = ?';
        let params = [admission_number, first_name, last_name, email, class_id || null, roll_number, photo || null, dob || null, gender || null, blood_group || null, phone || null, address || null, admission_date || null, status || 'ACTIVE', parent_name, parent_email, parent_phone, parent_relationship, req.params.id];

        await connection.execute(query, params);

        // Try to update the user account associated with the parent (if we can find it)
        const [student] = await connection.execute('SELECT parent_user_id FROM students WHERE id = ?', [req.params.id]);
        if (student.length > 0 && student[0].parent_user_id) {
            const parentUserId = student[0].parent_user_id;
            
            if (parent_password && parent_password.trim() !== '') {
                const salt = await bcrypt.genSalt(10);
                const hashedPassword = await bcrypt.hash(parent_password, salt);
                await connection.execute(
                    'UPDATE users SET name = ?, email = ?, password = ? WHERE id = ?',
                    [parent_name, parent_email, hashedPassword, parentUserId]
                );
            } else {
                const [existingUser] = await connection.execute('SELECT password FROM users WHERE id = ?', [parentUserId]);
                if (existingUser.length > 0) {
                    const dbPassword = existingUser[0].password;
                    if (!dbPassword || dbPassword.trim() === '') {
                        const salt = await bcrypt.genSalt(10);
                        const hashedPassword = await bcrypt.hash('parent123', salt);
                        await connection.execute(
                            'UPDATE users SET name = ?, email = ?, password = ? WHERE id = ?',
                            [parent_name, parent_email, hashedPassword, parentUserId]
                        );
                    } else {
                        await connection.execute(
                            'UPDATE users SET name = ?, email = ? WHERE id = ?',
                            [parent_name, parent_email, parentUserId]
                        );
                    }
                }
            }
        }

        await connection.commit();
        res.json({ success: true, message: 'Student and Parent updated' });
    } catch (error) {
        if (connection) await connection.rollback();
        next(error);
    } finally {
        if (connection) connection.release();
    }
};

exports.deleteStudent = async (req, res) => {
    if (req.user && req.user.role === 'CLASS_TEACHER') {
        const [student] = await pool.execute('SELECT class_id FROM students WHERE id = ?', [req.params.id]);
        if (student.length === 0) return res.status(404).json({ success: false, message: 'Student not found' });
        
        const [classes] = await pool.execute(
            'SELECT c.id FROM classes c INNER JOIN teachers t ON c.teacher_id = t.id WHERE t.user_id = ? AND c.id = ?',
            [req.user.id, student[0].class_id]
        );
        if (classes.length === 0) {
            return res.status(403).json({ success: false, message: 'You can only delete students from your own class.' });
        }
    }
    await pool.execute('DELETE FROM students WHERE id = ?', [req.params.id]);
    res.json({ success: true, message: 'Student deleted' });
};

exports.getStudentImage = async (req, res) => {
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
};

exports.previewImage = async (req, res) => {
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
};
