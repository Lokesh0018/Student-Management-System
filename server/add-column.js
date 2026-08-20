const pool = require('./config/db');

async function addColumn() {
    try {
        await pool.query("ALTER TABLE students ADD COLUMN blood_group VARCHAR(10) DEFAULT NULL AFTER gender");
        console.log("Column blood_group added successfully.");
    } catch (e) {
        console.error('Error:', e);
    } finally {
        process.exit();
    }
}
addColumn();
