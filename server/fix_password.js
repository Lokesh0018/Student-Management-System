const pool = require('./config/db');

async function fix() {
    try {
        await pool.execute('UPDATE users SET password = "teacher123" WHERE id = 3');
        console.log("Password fixed!");
    } catch (e) {
        console.error(e);
    } finally {
        process.exit();
    }
}
fix();
