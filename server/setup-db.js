const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');
const bcrypt = require('bcrypt');

async function setupDB() {
    try {
        // Connect without database selected first
        const connection = await mysql.createConnection({
            host: '127.0.0.1',
            port: 3306,
            user: 'root',
            password: 'password',
            multipleStatements: true
        });

        console.log('Connected to MySQL successfully.');

        // Read and execute setup.sql
        const sqlScript = fs.readFileSync(path.join(__dirname, 'setup.sql'), 'utf-8');
        console.log('Executing database schema script...');
        await connection.query(sqlScript);
        console.log('Database schema created successfully.');

        // Connect to the specific database for seeding
        await connection.query('USE sms_db;');
        
        // Check if admin already exists
        const [rows] = await connection.query('SELECT * FROM users WHERE email = ?', ['admin@school.com']);
        if (rows.length === 0) {
            console.log('Inserting seed data...');
            
            const salt = await bcrypt.genSalt(10);
            const passwordHash = await bcrypt.hash('password123', salt);

            // 1. Insert Admin
            const [adminResult] = await connection.query(
                `INSERT INTO users (name, email, password_hash, role) VALUES (?, ?, ?, ?)`,
                ['System Admin', 'admin@school.com', passwordHash, 'ADMIN']
            );

            // 2. Insert Teacher
            const [teacherUserResult] = await connection.query(
                `INSERT INTO users (name, email, password_hash, role) VALUES (?, ?, ?, ?)`,
                ['Rahul Kumar', 'rahul.teacher@school.com', passwordHash, 'CLASS_TEACHER']
            );
            const [teacherResult] = await connection.query(
                `INSERT INTO teachers (user_id, name, email, phone, department) VALUES (?, ?, ?, ?, ?)`,
                [teacherUserResult.insertId, 'Rahul Kumar', 'rahul.teacher@school.com', '9876543210', 'Mathematics']
            );

            // 3. Insert Parent
            const [parentUserResult] = await connection.query(
                `INSERT INTO users (name, email, password_hash, role) VALUES (?, ?, ?, ?)`,
                ['Rajesh Sharma', 'rajesh.parent@gmail.com', passwordHash, 'PARENT']
            );
            const [parentResult] = await connection.query(
                `INSERT INTO parents (user_id, name, email, phone, address) VALUES (?, ?, ?, ?, ?)`,
                [parentUserResult.insertId, 'Rajesh Sharma', 'rajesh.parent@gmail.com', '9988776655', '123 Main St']
            );

            // 4. Insert Academic Year
            const [yearResult] = await connection.query(
                `INSERT INTO academic_years (year_name, start_date, end_date, status) VALUES (?, ?, ?, ?)`,
                ['2026-2027', '2026-04-01', '2027-03-31', 'ACTIVE']
            );

            // 5. Insert Class
            const [classResult] = await connection.query(
                `INSERT INTO classes (class_name, section) VALUES (?, ?)`,
                ['10', 'A']
            );

            // Assign Teacher to Class
            await connection.query(
                `INSERT INTO teacher_classes (teacher_id, class_id, academic_year_id) VALUES (?, ?, ?)`,
                [teacherResult.insertId, classResult.insertId, yearResult.insertId]
            );

            // 6. Insert Student
            const [studentResult] = await connection.query(
                `INSERT INTO students (admission_number, first_name, last_name, email, class_id, roll_number) VALUES (?, ?, ?, ?, ?, ?)`,
                ['ADM-1001', 'Arjun', 'Sharma', 'arjun@student.com', classResult.insertId, '10A-01']
            );

            // 7. Link Parent and Student
            await connection.query(
                `INSERT INTO parent_student (parent_id, student_id, relationship) VALUES (?, ?, ?)`,
                [parentResult.insertId, studentResult.insertId, 'Father']
            );

            console.log('Seed data inserted successfully.');
            console.log('Test Accounts (password: password123):');
            console.log('- Admin: admin@school.com');
            console.log('- Teacher: rahul.teacher@school.com');
            console.log('- Parent: rajesh.parent@gmail.com');
        } else {
            console.log('Seed data already exists.');
        }

        await connection.end();
        console.log('Database setup completed.');
    } catch (error) {
        console.error('Error setting up database:', error);
        process.exit(1);
    }
}

setupDB();
