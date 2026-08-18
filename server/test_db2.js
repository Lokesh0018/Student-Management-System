const pool = require('./config/db');

async function test() {
    try {
        const [teachers] = await pool.execute('SELECT * FROM teachers ORDER BY id DESC LIMIT 1');
        console.log("Last teacher:", teachers[0]);
    } catch (e) {
        console.error(e);
    } finally {
        process.exit();
    }
}
test();
