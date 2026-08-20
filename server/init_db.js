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
            CREATE TABLE IF NOT EXISTS password_resets (
                id INT AUTO_INCREMENT PRIMARY KEY,
                email VARCHAR(100) NOT NULL,
                token VARCHAR(255) NOT NULL,
                expires_at DATETIME NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
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
                blood_group VARCHAR(10) DEFAULT NULL,
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
                teacher_id INT DEFAULT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (teacher_id) REFERENCES teachers(id) ON DELETE SET NULL
            );
        `);

        await connection.query(`
            CREATE TABLE IF NOT EXISTS exams (
                id INT AUTO_INCREMENT PRIMARY KEY,
                exam_name VARCHAR(100),
                exam_type VARCHAR(50),
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

        // =======================
        // FEE MANAGEMENT TABLES
        // =======================
        await connection.query(`
            CREATE TABLE IF NOT EXISTS fee_terms (
                id INT AUTO_INCREMENT PRIMARY KEY,
                name VARCHAR(100) NOT NULL,
                amount DECIMAL(10, 2) NOT NULL,
                due_date DATE NOT NULL,
                description TEXT,
                status ENUM('ACTIVE', 'INACTIVE') DEFAULT 'ACTIVE',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
            );
        `);

        await connection.query(`
            CREATE TABLE IF NOT EXISTS student_fees (
                id INT AUTO_INCREMENT PRIMARY KEY,
                student_id INT NOT NULL,
                fee_term_id INT NOT NULL,
                amount DECIMAL(10, 2) NOT NULL,
                status ENUM('PENDING', 'PAYMENT_SUBMITTED', 'PAID', 'OVERDUE', 'REJECTED') DEFAULT 'PENDING',
                due_date DATE NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
                FOREIGN KEY (fee_term_id) REFERENCES fee_terms(id) ON DELETE CASCADE
            );
        `);

        await connection.query(`
            CREATE TABLE IF NOT EXISTS payment_settings (
                id INT AUTO_INCREMENT PRIMARY KEY,
                admin_id INT NOT NULL,
                upi_id VARCHAR(100) NOT NULL,
                payee_name VARCHAR(100),
                instructions TEXT,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                FOREIGN KEY (admin_id) REFERENCES users(id) ON DELETE CASCADE
            );
        `);

        await connection.query(`
            CREATE TABLE IF NOT EXISTS payments (
                id INT AUTO_INCREMENT PRIMARY KEY,
                student_fee_id INT NOT NULL,
                parent_id INT NOT NULL,
                amount DECIMAL(10, 2) NOT NULL,
                upi_id VARCHAR(100),
                utr_number VARCHAR(100) NOT NULL,
                payment_date DATE NOT NULL,
                status ENUM('SUBMITTED', 'VERIFIED', 'REJECTED') DEFAULT 'SUBMITTED',
                rejection_reason TEXT,
                verified_by INT DEFAULT NULL,
                verified_at TIMESTAMP NULL DEFAULT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                FOREIGN KEY (student_fee_id) REFERENCES student_fees(id) ON DELETE CASCADE,
                FOREIGN KEY (parent_id) REFERENCES users(id) ON DELETE CASCADE,
                FOREIGN KEY (verified_by) REFERENCES users(id) ON DELETE SET NULL
            );
        `);

        // =======================
        // ASSIGNMENT MANAGEMENT TABLES
        // =======================
        await connection.query(`
            CREATE TABLE IF NOT EXISTS assignments (
                id INT AUTO_INCREMENT PRIMARY KEY,
                teacher_id INT NOT NULL,
                class_id INT NOT NULL,
                subject_id INT NOT NULL,
                title VARCHAR(255) NOT NULL,
                description TEXT,
                assigned_date DATE NOT NULL,
                due_date DATE NOT NULL,
                priority ENUM('Low', 'Normal', 'High') DEFAULT 'Normal',
                attachment_url VARCHAR(500),
                status ENUM('Active', 'Draft', 'Closed') DEFAULT 'Active',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                FOREIGN KEY (teacher_id) REFERENCES teachers(id) ON DELETE CASCADE,
                FOREIGN KEY (class_id) REFERENCES classes(id) ON DELETE CASCADE,
                FOREIGN KEY (subject_id) REFERENCES subjects(id) ON DELETE CASCADE
            );
        `);

        await connection.query(`
            CREATE TABLE IF NOT EXISTS homework (
                id INT AUTO_INCREMENT PRIMARY KEY,
                assignment_id INT NOT NULL,
                student_id INT NOT NULL,
                parent_id INT NOT NULL,
                status ENUM('TO_DO', 'IN_PROGRESS', 'COMPLETED') DEFAULT 'TO_DO',
                marked_at TIMESTAMP NULL DEFAULT NULL,
                completed_at TIMESTAMP NULL DEFAULT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                FOREIGN KEY (assignment_id) REFERENCES assignments(id) ON DELETE CASCADE,
                FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
                FOREIGN KEY (parent_id) REFERENCES users(id) ON DELETE CASCADE
            );
        `);

        console.log("Inserting default admin user and classes...");
        const bcrypt = require('bcrypt');
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash('admin123', salt);
        await connection.query('INSERT IGNORE INTO users (name, email, password, role) VALUES (?, ?, ?, ?)', ['Admin', 'admin@school.com', hashedPassword, 'ADMIN']);

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
