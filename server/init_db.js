const mysql = require('mysql2/promise');
require('dotenv').config();

async function initDB() {
    try {
        const connection = await mysql.createConnection({
            host: process.env.DB_HOST || '127.0.0.1',
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASSWORD || 'password',
            port: process.env.DB_PORT || 3306
        });

        console.log("Dropping and recreating database sms_db...");
        await connection.query('DROP DATABASE IF EXISTS sms_db;');
        await connection.query('CREATE DATABASE sms_db;');
        await connection.query('USE sms_db;');

        console.log("Creating tables...");
        
        await connection.query(`
            CREATE TABLE IF NOT EXISTS users (
                id INT AUTO_INCREMENT PRIMARY KEY,
                name VARCHAR(100) NOT NULL,
                email VARCHAR(100) UNIQUE NOT NULL,
                password VARCHAR(255) NOT NULL,
                role ENUM('ADMIN', 'CLASS_TEACHER', 'PARENT', 'STUDENT') NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);

        await connection.query(`
            CREATE TABLE IF NOT EXISTS notifications (
                id INT AUTO_INCREMENT PRIMARY KEY,
                user_id INT NOT NULL,
                title VARCHAR(255) NOT NULL,
                message TEXT NOT NULL,
                is_read BOOLEAN DEFAULT FALSE,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
            );
        `);

        await connection.query(`
            CREATE TABLE IF NOT EXISTS teachers (
                id INT AUTO_INCREMENT PRIMARY KEY,
                user_id INT,
                name VARCHAR(100),
                email VARCHAR(100),
                phone VARCHAR(20),
                department VARCHAR(100),
                description TEXT,
                qualification VARCHAR(100),
                employee_id VARCHAR(50),
                joining_date DATE,
                assigned_classes VARCHAR(255),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
            );
        `);

        await connection.query(`
            CREATE TABLE IF NOT EXISTS classes (
                id INT AUTO_INCREMENT PRIMARY KEY,
                class_name VARCHAR(50),
                section VARCHAR(10),
                teacher_id INT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (teacher_id) REFERENCES teachers(id) ON DELETE SET NULL
            );
        `);

        await connection.query(`
            CREATE TABLE IF NOT EXISTS students (
                id INT AUTO_INCREMENT PRIMARY KEY,
                admission_number VARCHAR(50) UNIQUE,
                first_name VARCHAR(50),
                last_name VARCHAR(50),
                email VARCHAR(100),
                class_id INT,
                roll_number VARCHAR(20),
                photo VARCHAR(500),
                dob DATE,
                gender VARCHAR(20),
                phone VARCHAR(20),
                address TEXT,
                admission_date DATE,
                status VARCHAR(20) DEFAULT 'ACTIVE',
                parent_name VARCHAR(100) DEFAULT NULL,
                parent_email VARCHAR(100) DEFAULT NULL,
                parent_phone VARCHAR(20) DEFAULT NULL,
                parent_relationship VARCHAR(50) DEFAULT NULL,
                parent_user_id INT DEFAULT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (class_id) REFERENCES classes(id) ON DELETE SET NULL,
                FOREIGN KEY (parent_user_id) REFERENCES users(id) ON DELETE SET NULL
            );
        `);



        await connection.query(`
            CREATE TABLE IF NOT EXISTS subjects (
                id INT AUTO_INCREMENT PRIMARY KEY,
                subject_name VARCHAR(100),
                subject_code VARCHAR(50),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);

        await connection.query(`
            CREATE TABLE IF NOT EXISTS exams (
                id INT AUTO_INCREMENT PRIMARY KEY,
                exam_name VARCHAR(100),
                academic_year_id INT,
                class_id INT,
                start_date DATE,
                end_date DATE,
                status VARCHAR(50),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (class_id) REFERENCES classes(id) ON DELETE CASCADE
            );
        `);

        await connection.query(`
            CREATE TABLE IF NOT EXISTS marks (
                id INT AUTO_INCREMENT PRIMARY KEY,
                student_id INT,
                exam_id INT,
                subject_id INT,
                marks_obtained DECIMAL(5, 2),
                max_marks DECIMAL(5, 2),
                grade VARCHAR(10),
                remarks TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
                FOREIGN KEY (exam_id) REFERENCES exams(id) ON DELETE CASCADE,
                FOREIGN KEY (subject_id) REFERENCES subjects(id) ON DELETE CASCADE
            );
        `);

        await connection.query(`
            CREATE TABLE IF NOT EXISTS remarks (
                id INT AUTO_INCREMENT PRIMARY KEY,
                sender_id INT,
                receiver_id INT,
                student_id INT,
                title VARCHAR(255),
                category VARCHAR(50) DEFAULT 'General',
                priority VARCHAR(50) DEFAULT 'Normal',
                message TEXT,
                is_read BOOLEAN DEFAULT FALSE,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE CASCADE,
                FOREIGN KEY (receiver_id) REFERENCES users(id) ON DELETE CASCADE,
                FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE
            );
        `);

        await connection.query(`
            CREATE TABLE IF NOT EXISTS attendance (
                id INT AUTO_INCREMENT PRIMARY KEY,
                student_id INT,
                date DATE,
                class_id INT,
                status VARCHAR(20),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
                FOREIGN KEY (class_id) REFERENCES classes(id) ON DELETE CASCADE
            );
        `);

        console.log("Inserting default admin user and classes...");
        await connection.query('INSERT IGNORE INTO users (name, email, password, role) VALUES (?, ?, ?, ?)', ['Admin', 'admin@school.com', 'admin123', 'ADMIN']);

        await connection.query('INSERT IGNORE INTO classes (id, class_name, section) VALUES (?, ?, ?)', [1, 'Class 10', 'A']);
        await connection.query('INSERT IGNORE INTO classes (id, class_name, section) VALUES (?, ?, ?)', [2, 'Class 9', 'A']);

        console.log("Database initialization complete.");
        await connection.end();
        process.exit();
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
}

initDB();
