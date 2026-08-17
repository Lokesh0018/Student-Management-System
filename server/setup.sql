CREATE DATABASE IF NOT EXISTS sms_db;
USE sms_db;

-- 1. users
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role ENUM('ADMIN', 'CLASS_TEACHER', 'PARENT') NOT NULL,
    status ENUM('ACTIVE', 'INACTIVE') DEFAULT 'ACTIVE',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- 2. academic_years
CREATE TABLE IF NOT EXISTS academic_years (
    id INT AUTO_INCREMENT PRIMARY KEY,
    year_name VARCHAR(20) NOT NULL,
    start_date DATE,
    end_date DATE,
    status ENUM('ACTIVE', 'INACTIVE') DEFAULT 'INACTIVE'
);

-- 3. classes
CREATE TABLE IF NOT EXISTS classes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    class_name VARCHAR(50) NOT NULL,
    section VARCHAR(10) NOT NULL,
    UNIQUE(class_name, section)
);

-- 4. teachers
CREATE TABLE IF NOT EXISTS teachers (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    phone VARCHAR(20),
    qualification VARCHAR(100),
    joining_date DATE,
    department VARCHAR(50),
    status ENUM('ACTIVE', 'INACTIVE') DEFAULT 'ACTIVE',
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 5. parents
CREATE TABLE IF NOT EXISTS parents (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    phone VARCHAR(20),
    address TEXT,
    status ENUM('ACTIVE', 'INACTIVE') DEFAULT 'ACTIVE',
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 6. students
CREATE TABLE IF NOT EXISTS students (
    id INT AUTO_INCREMENT PRIMARY KEY,
    admission_number VARCHAR(50) NOT NULL UNIQUE,
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    dob DATE,
    gender ENUM('MALE', 'FEMALE', 'OTHER'),
    email VARCHAR(100),
    phone VARCHAR(20),
    address TEXT,
    class_id INT,
    roll_number VARCHAR(20),
    admission_date DATE,
    profile_photo VARCHAR(255),
    status ENUM('ACTIVE', 'INACTIVE', 'GRADUATED') DEFAULT 'ACTIVE',
    FOREIGN KEY (class_id) REFERENCES classes(id) ON DELETE SET NULL
);

-- 7. parent_student
CREATE TABLE IF NOT EXISTS parent_student (
    parent_id INT NOT NULL,
    student_id INT NOT NULL,
    relationship VARCHAR(50),
    PRIMARY KEY (parent_id, student_id),
    FOREIGN KEY (parent_id) REFERENCES parents(id) ON DELETE CASCADE,
    FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE
);

-- 8. teacher_classes (Class Teacher assignment)
CREATE TABLE IF NOT EXISTS teacher_classes (
    teacher_id INT NOT NULL,
    class_id INT NOT NULL,
    academic_year_id INT,
    PRIMARY KEY (class_id, academic_year_id), -- One class teacher per class per year
    FOREIGN KEY (teacher_id) REFERENCES teachers(id) ON DELETE CASCADE,
    FOREIGN KEY (class_id) REFERENCES classes(id) ON DELETE CASCADE,
    FOREIGN KEY (academic_year_id) REFERENCES academic_years(id) ON DELETE CASCADE
);

-- 9. subjects
CREATE TABLE IF NOT EXISTS subjects (
    id INT AUTO_INCREMENT PRIMARY KEY,
    subject_name VARCHAR(100) NOT NULL,
    subject_code VARCHAR(20) UNIQUE
);

-- 10. class_subjects
CREATE TABLE IF NOT EXISTS class_subjects (
    class_id INT NOT NULL,
    subject_id INT NOT NULL,
    teacher_id INT,
    PRIMARY KEY (class_id, subject_id),
    FOREIGN KEY (class_id) REFERENCES classes(id) ON DELETE CASCADE,
    FOREIGN KEY (subject_id) REFERENCES subjects(id) ON DELETE CASCADE,
    FOREIGN KEY (teacher_id) REFERENCES teachers(id) ON DELETE SET NULL
);

-- 11. exams
CREATE TABLE IF NOT EXISTS exams (
    id INT AUTO_INCREMENT PRIMARY KEY,
    exam_name VARCHAR(100) NOT NULL,
    academic_year_id INT NOT NULL,
    class_id INT NOT NULL,
    start_date DATE,
    end_date DATE,
    status ENUM('UPCOMING', 'ONGOING', 'COMPLETED') DEFAULT 'UPCOMING',
    FOREIGN KEY (academic_year_id) REFERENCES academic_years(id) ON DELETE CASCADE,
    FOREIGN KEY (class_id) REFERENCES classes(id) ON DELETE CASCADE
);

-- 12. marks
CREATE TABLE IF NOT EXISTS marks (
    id INT AUTO_INCREMENT PRIMARY KEY,
    student_id INT NOT NULL,
    exam_id INT NOT NULL,
    subject_id INT NOT NULL,
    marks_obtained DECIMAL(5,2),
    max_marks DECIMAL(5,2),
    grade VARCHAR(5),
    remarks TEXT,
    UNIQUE (student_id, exam_id, subject_id),
    FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
    FOREIGN KEY (exam_id) REFERENCES exams(id) ON DELETE CASCADE,
    FOREIGN KEY (subject_id) REFERENCES subjects(id) ON DELETE CASCADE
);

-- 13. attendance
CREATE TABLE IF NOT EXISTS attendance (
    id INT AUTO_INCREMENT PRIMARY KEY,
    student_id INT NOT NULL,
    date DATE NOT NULL,
    class_id INT NOT NULL,
    status ENUM('PRESENT', 'ABSENT', 'LATE') NOT NULL,
    UNIQUE (student_id, date),
    FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
    FOREIGN KEY (class_id) REFERENCES classes(id) ON DELETE CASCADE
);

-- 14. remarks
CREATE TABLE IF NOT EXISTS remarks (
    id INT AUTO_INCREMENT PRIMARY KEY,
    student_id INT NOT NULL,
    sender_id INT NOT NULL,
    sender_role ENUM('ADMIN', 'CLASS_TEACHER') NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    category ENUM('Academic', 'Attendance', 'Behaviour', 'Achievement', 'General') DEFAULT 'General',
    priority ENUM('Low', 'Normal', 'Important', 'Urgent') DEFAULT 'Normal',
    read_status BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
    FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Indexes for frequently searched fields
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_students_admission_number ON students(admission_number);
CREATE INDEX idx_students_class_id ON students(class_id);
CREATE INDEX idx_parents_email ON parents(email);
CREATE INDEX idx_teachers_email ON teachers(email);
CREATE INDEX idx_marks_student_exam ON marks(student_id, exam_id);
CREATE INDEX idx_attendance_student_date ON attendance(student_id, date);
