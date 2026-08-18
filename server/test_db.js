const pool = require('./config/db');

async function test() {
    try {
        await pool.execute('UPDATE teachers SET description = "test" WHERE id = 2');
        console.log("Fetching teachers...");
        const [teachers] = await pool.execute('SELECT * FROM teachers WHERE id = 2');
        console.log("Last teacher:", teachers[0]);
    } catch (e) {
        console.error(e);
    } finally {
        process.exit();
    }
}
test();
