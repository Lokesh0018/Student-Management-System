const pool = require('./config/db');

async function migrate() {
    try {
        await pool.execute('ALTER TABLE students ADD COLUMN photo LONGBLOB');
        await pool.execute('ALTER TABLE students ADD COLUMN photo_type VARCHAR(50)');
        console.log("Migration successful");
    } catch(e) {
        if(e.code === 'ER_DUP_FIELDNAME') {
             console.log("Column already exists");
        } else {
             console.error("Migration failed:", e);
        }
    } finally {
        process.exit();
    }
}
migrate();
