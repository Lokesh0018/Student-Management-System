const mysql = require('mysql2/promise');
require('dotenv').config();

async function migrate() {
    try {
        const connection = await mysql.createConnection({
            host: process.env.DB_HOST || '127.0.0.1',
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASSWORD || 'password',
            database: process.env.DB_NAME || 'sms_db',
            port: process.env.DB_PORT || 3306
        });

        console.log("Adding teacher_id to classes table...");
        try {
            await connection.query(`
                ALTER TABLE classes 
                ADD COLUMN teacher_id INT,
                ADD FOREIGN KEY (teacher_id) REFERENCES teachers(id) ON DELETE SET NULL;
            `);
            console.log("Migration successful!");
        } catch (err) {
            if (err.code === 'ER_DUP_FIELDNAME') {
                console.log("Column teacher_id already exists.");
            } else {
                throw err;
            }
        }
        
        await connection.end();
        process.exit();
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
}

migrate();
