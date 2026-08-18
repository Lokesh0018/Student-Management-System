const pool = require('./config/db');

async function fix() {
    try {
        await pool.execute(`
            UPDATE teachers SET 
                description = 'Mathematics teacher with 5 years experience.',
                qualification = 'M.Sc. Mathematics',
                employee_id = 'T002',
                joining_date = '2021-06-15',
                assigned_classes = '10-A, 10-B'
            WHERE id = 2
        `);
        console.log("Teacher fixed!");
    } catch (e) {
        console.error(e);
    } finally {
        process.exit();
    }
}
fix();
