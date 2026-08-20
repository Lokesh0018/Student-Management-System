const pool = require('./config/db');

async function test() {
    try {
        const [columns] = await pool.query('DESCRIBE students');
        console.log(columns.map(c => c.Field));
    } catch (e) {
        console.error('Error:', e);
    } finally {
        process.exit();
    }
}
test();
