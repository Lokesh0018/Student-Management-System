const pool = require('./config/db');

async function run() {
    try {
        console.log('Adding indexes...');
        await pool.query('ALTER TABLE students ADD INDEX idx_class_id (class_id)');
        await pool.query('ALTER TABLE classes ADD INDEX idx_teacher_id (teacher_id)');
        await pool.query('ALTER TABLE students ADD INDEX idx_parent_user_id (parent_user_id)');
        console.log('Indexes added successfully.');
    } catch (e) {
        console.log('Error or indexes already exist:', e.message);
    } finally {
        process.exit(0);
    }
}

run();
