require('dotenv').config();
const pool = require('./config/db');

async function run() {
    try {
        const [rows] = await pool.execute('DESCRIBE exams');
        console.log(rows);
    } catch(err) {
        console.error(err);
    }
    process.exit(0);
}
run();
