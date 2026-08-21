const mysql = require('mysql2/promise');
const bcrypt = require('bcrypt');
require('dotenv').config({ path: '../.env' }); // Adjust path if necessary

const NAMES = ['John', 'Emma', 'Michael', 'Sarah', 'William', 'Olivia', 'James', 'Ava', 'Benjamin', 'Isabella', 
  'Lucas', 'Mia', 'Henry', 'Charlotte', 'Alexander', 'Amelia', 'Sebastian', 'Harper', 'Jack', 'Evelyn',
  'Liam', 'Noah', 'Oliver', 'Elijah', 'Mateo', 'Theodore', 'Leo', 'Ezra', 'Luca', 'Asher'];
const LAST_NAMES = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez',
  'Hernandez', 'Lopez', 'Gonzalez', 'Wilson', 'Anderson', 'Thomas', 'Taylor', 'Moore', 'Jackson', 'Martin',
  'Lee', 'Perez', 'Thompson', 'White', 'Harris', 'Sanchez', 'Clark', 'Ramirez', 'Lewis', 'Robinson'];
const DEPARTMENTS = ['Mathematics', 'Science', 'English', 'History', 'Physical Education', 'Art', 'Computer Science'];
const SUBJECTS = ['Algebra', 'Biology', 'Literature', 'World History', 'Gym', 'Drawing', 'Programming', 'Chemistry', 'Physics', 'Geography'];
const SECTIONS = ['A', 'B', 'C'];
const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'];

function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function getRandomItem(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function generateRandomDate(start, end) {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}

function formatDate(date) {
    return date.toISOString().split('T')[0];
}

async function seedData() {
  let connection;
  try {
    console.log("Connecting to the database...");
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || '127.0.0.1',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || 'password',
      database: 'sms_db',
      port: process.env.DB_PORT || 3306
    });

    console.log("Saving existing ADMIN users...");
    const [admins] = await connection.query("SELECT * FROM users WHERE role = 'ADMIN'");
    if (admins.length === 0) {
        console.warn("No ADMIN users found to save! You may need to create one manually after this script.");
    } else {
        console.log(`Found ${admins.length} ADMIN user(s). Preserving them.`);
    }

    console.log("Disabling foreign key checks...");
    await connection.query("SET FOREIGN_KEY_CHECKS = 0");

    const tablesToTruncate = [
      'users', 'notifications', 'password_resets', 'teachers', 'classes', 'students',
      'subjects', 'exams', 'marks', 'remarks', 'attendance', 'fee_terms', 'student_fees', 'payments'
    ];

    console.log("Truncating all tables...");
    for (const table of tablesToTruncate) {
        try {
            await connection.query(`TRUNCATE TABLE ${table}`);
            console.log(`- Truncated ${table}`);
        } catch (err) {
            console.error(`- Skipping ${table} (might not exist)`);
        }
    }

    console.log("Reinserting ADMIN users...");
    for (const admin of admins) {
        await connection.query(`
            INSERT INTO users (id, name, email, password, role, created_at)
            VALUES (?, ?, ?, ?, ?, ?)
        `, [admin.id, admin.name, admin.email, admin.password, admin.role, admin.created_at]);
    }
    
    // Auto-increment might be reset, so let's get the max user ID
    let [[{ maxId }]] = await connection.query("SELECT MAX(id) as maxId FROM users");
    let nextUserId = (maxId || 0) + 1;
    
    console.log("Generating common password hash ('password123')...");
    const hashedPassword = await bcrypt.hash('password123', 10);

    // ==========================================
    // 1. Generate Teachers (10)
    // ==========================================
    console.log("Generating 10 Teachers...");
    const teacherIds = [];
    for (let i = 0; i < 10; i++) {
        const firstName = getRandomItem(NAMES);
        const lastName = getRandomItem(LAST_NAMES);
        const email = `teacher${i+1}@example.com`;
        
        // Insert User
        const [userRes] = await connection.query(`
            INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)
        `, [`${firstName} ${lastName}`, email, hashedPassword, 'CLASS_TEACHER']);
        
        const userId = userRes.insertId;

        // Insert Teacher Profile
        const [teacherRes] = await connection.query(`
            INSERT INTO teachers (user_id, name, email, phone, department, qualification, employee_id, joining_date)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `, [
            userId, `${firstName} ${lastName}`, email, `555-01${getRandomInt(10, 99)}`, 
            getRandomItem(DEPARTMENTS), 'Master of Education', `EMP-T-${1000 + i}`, 
            formatDate(generateRandomDate(new Date(2015, 0, 1), new Date(2023, 0, 1)))
        ]);
        
        teacherIds.push(teacherRes.insertId);
    }

    // ==========================================
    // 2. Generate Classes (10)
    // ==========================================
    console.log("Generating 10 Classes...");
    const classIds = [];
    for (let i = 0; i < 10; i++) {
        const grade = (i % 10) + 1; // Class 1 to 10
        const section = getRandomItem(SECTIONS);
        const teacherId = teacherIds[i % teacherIds.length]; // Assign class teacher
        
        const [classRes] = await connection.query(`
            INSERT INTO classes (class_name, section, teacher_id) VALUES (?, ?, ?)
        `, [`Class ${grade}`, section, teacherId]);
        
        classIds.push(classRes.insertId);
    }

    // ==========================================
    // 3. Generate Subjects (10)
    // ==========================================
    console.log("Generating 10 Subjects...");
    const subjectIds = [];
    for (let i = 0; i < SUBJECTS.length; i++) {
        const teacherId = teacherIds[i % teacherIds.length];
        const [subRes] = await connection.query(`
            INSERT INTO subjects (subject_name, subject_code, teacher_id) VALUES (?, ?, ?)
        `, [SUBJECTS[i], `SUB-${100 + i}`, teacherId]);
        subjectIds.push(subRes.insertId);
    }

    // ==========================================
    // 4. Generate Parents (10) & Students (30)
    // ==========================================
    console.log("Generating 10 Parents and 30 Students...");
    const parentUserIds = [];
    for (let i = 0; i < 10; i++) {
        const pFirstName = getRandomItem(NAMES);
        const pLastName = getRandomItem(LAST_NAMES);
        const email = `parent${i+1}@example.com`;
        
        const [userRes] = await connection.query(`
            INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)
        `, [`${pFirstName} ${pLastName}`, email, hashedPassword, 'PARENT']);
        parentUserIds.push(userRes.insertId);
    }

    const studentIds = [];
    for (let i = 0; i < 30; i++) {
        const firstName = getRandomItem(NAMES);
        const lastName = getRandomItem(LAST_NAMES);
        const email = `student${i+1}@example.com`;
        const classId = classIds[i % classIds.length];
        const parentUserId = parentUserIds[i % parentUserIds.length];
        
        // Retrieve parent info
        const [[parent]] = await connection.query(`SELECT * FROM users WHERE id = ?`, [parentUserId]);
        
        // Insert User
        const [userRes] = await connection.query(`
            INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)
        `, [`${firstName} ${lastName}`, email, hashedPassword, 'STUDENT']);
        
        // Insert Student Profile
        const [studentRes] = await connection.query(`
            INSERT INTO students (
                admission_number, first_name, last_name, email, class_id, roll_number,
                dob, gender, blood_group, phone, admission_date, parent_name, parent_email, parent_user_id
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, [
            `ADM-${202400 + i}`, firstName, lastName, email, classId, `R-${i+1}`,
            formatDate(generateRandomDate(new Date(2005, 0, 1), new Date(2015, 0, 1))),
            getRandomItem(['Male', 'Female']), getRandomItem(BLOOD_GROUPS), `555-02${getRandomInt(10, 99)}`,
            formatDate(generateRandomDate(new Date(2023, 0, 1), new Date(2024, 0, 1))),
            parent.name, parent.email, parentUserId
        ]);
        
        studentIds.push(studentRes.insertId);
    }

    // ==========================================
    // 5. Generate Exams & Marks
    // ==========================================
    console.log("Generating Exams and Marks...");
    const examIds = [];
    for (const classId of classIds) {
        const [examRes] = await connection.query(`
            INSERT INTO exams (exam_name, exam_type, class_id, start_date, end_date, status)
            VALUES (?, ?, ?, ?, ?, ?)
        `, ['Midterm Exam', 'Midterm', classId, '2024-10-15', '2024-10-25', 'COMPLETED']);
        examIds.push(examRes.insertId);
    }
    
    // Assign marks for 3 subjects per student
    for (let i = 0; i < studentIds.length; i++) {
        const studentId = studentIds[i];
        const examId = examIds[i % examIds.length]; // Match exam to student's class roughly by index alignment (not perfect but OK for mock)
        
        for (let j = 0; j < 3; j++) {
            const subjectId = subjectIds[(i + j) % subjectIds.length];
            const marksObtained = getRandomInt(40, 100);
            let grade = 'F';
            if (marksObtained >= 90) grade = 'A+';
            else if (marksObtained >= 80) grade = 'A';
            else if (marksObtained >= 70) grade = 'B';
            else if (marksObtained >= 60) grade = 'C';
            else if (marksObtained >= 50) grade = 'D';

            await connection.query(`
                INSERT INTO marks (student_id, exam_id, subject_id, marks_obtained, max_marks, grade, remarks)
                VALUES (?, ?, ?, ?, ?, ?, ?)
            `, [studentId, examId, subjectId, marksObtained, 100, grade, 'Good effort']);
        }
    }

    // ==========================================
    // 6. Generate Remarks (20)
    // ==========================================
    console.log("Generating Remarks...");
    for(let i=0; i < 20; i++) {
        const senderId = getRandomItem(teacherIds); // Note: Should be user_id of teacher
        const [[teacherUser]] = await connection.query(`SELECT user_id FROM teachers WHERE id = ?`, [senderId]);
        
        const studentId = getRandomItem(studentIds);
        const [[student]] = await connection.query(`SELECT parent_user_id FROM students WHERE id = ?`, [studentId]);
        
        if (teacherUser && student && student.parent_user_id) {
            await connection.query(`
                INSERT INTO remarks (sender_id, receiver_id, student_id, title, category, priority, message)
                VALUES (?, ?, ?, ?, ?, ?, ?)
            `, [
                teacherUser.user_id, student.parent_user_id, studentId, 
                'Behavior Update', getRandomItem(['Behavior', 'Academic', 'General']),
                getRandomItem(['Low', 'Normal', 'High']), 
                'Student has been participating well in class activities.'
            ]);
        }
    }

    // ==========================================
    // 7. Generate Attendance (Mock 5 days)
    // ==========================================
    console.log("Generating Attendance...");
    const baseDate = new Date();
    for (let d = 0; d < 5; d++) {
        const dateStr = formatDate(new Date(baseDate.getTime() - (d * 24 * 60 * 60 * 1000)));
        for (const studentId of studentIds) {
            const [[student]] = await connection.query(`SELECT class_id FROM students WHERE id = ?`, [studentId]);
            const status = Math.random() > 0.15 ? 'PRESENT' : 'ABSENT'; // 85% attendance
            await connection.query(`
                INSERT INTO attendance (student_id, date, class_id, status)
                VALUES (?, ?, ?, ?)
            `, [studentId, dateStr, student.class_id, status]);
        }
    }

    // ==========================================
    // 8. Generate Fees & Payments
    // ==========================================
    console.log("Generating Fee Terms and Payments...");
    const [termRes] = await connection.query(`
        INSERT INTO fee_terms (name, amount, due_date, description, status)
        VALUES (?, ?, ?, ?, ?)
    `, ['Fall Term 2024', 5000.00, '2024-09-01', 'Tuition fees for Fall', 'ACTIVE']);
    const termId = termRes.insertId;

    for (let i = 0; i < studentIds.length; i++) {
        const studentId = studentIds[i];
        const parentId = parentUserIds[i % parentUserIds.length];

        // Assign fee to student
        const [feeRes] = await connection.query(`
            INSERT INTO student_fees (student_id, fee_term_id, amount, status, due_date)
            VALUES (?, ?, ?, ?, ?)
        `, [studentId, termId, 5000.00, 'PENDING', '2024-09-01']);
        const studentFeeId = feeRes.insertId;

        // Randomly pay some fees
        if (Math.random() > 0.5) {
            const status = Math.random() > 0.2 ? 'VERIFIED' : 'SUBMITTED';
            await connection.query(`
                INSERT INTO payments (student_fee_id, parent_id, amount, utr_number, payment_date, status)
                VALUES (?, ?, ?, ?, ?, ?)
            `, [studentFeeId, parentId, 5000.00, `TXN${getRandomInt(1000000, 9999999)}`, formatDate(new Date()), status]);
            
            if (status === 'VERIFIED') {
                 await connection.query(`UPDATE student_fees SET status = 'PAID' WHERE id = ?`, [studentFeeId]);
            } else {
                 await connection.query(`UPDATE student_fees SET status = 'PAYMENT_SUBMITTED' WHERE id = ?`, [studentFeeId]);
            }
        }
    }

    console.log("Re-enabling foreign key checks...");
    await connection.query("SET FOREIGN_KEY_CHECKS = 1");

    console.log("=========================================");
    console.log("Database Seeded Successfully!");
    console.log(`- Default Password for all new users: password123`);
    console.log(`- Inserted 10 Teachers (teacher1@example.com, etc)`);
    console.log(`- Inserted 10 Parents (parent1@example.com, etc)`);
    console.log(`- Inserted 30 Students`);
    console.log("=========================================");

  } catch (error) {
    console.error("FATAL ERROR SEEDING DATABASE:", error);
    if (connection) {
       await connection.query("SET FOREIGN_KEY_CHECKS = 1").catch(console.error);
    }
  } finally {
    if (connection) {
      await connection.end();
    }
    process.exit();
  }
}

seedData();
