const mysql = require('mysql2/promise');
require('dotenv').config();

async function migrate() {
    try {
        const connection = await mysql.createConnection({
            host: process.env.DB_HOST || '127.0.0.1',
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASSWORD || 'password',
            database: 'sms_db',
            port: process.env.DB_PORT || 3306
        });

        console.log("Setting all photos to NULL to clear binary data...");
        await connection.query('UPDATE students SET photo = NULL;');

        console.log("Dropping photo_type column...");
        try {
            await connection.query('ALTER TABLE students DROP COLUMN photo_type;');
            console.log("Dropped photo_type.");
        } catch (e) {
            console.log("Column photo_type might not exist or already dropped:", e.message);
        }

        console.log("Modifying photo column to VARCHAR(500)...");
        await connection.query('ALTER TABLE students MODIFY COLUMN photo VARCHAR(500);');
        console.log("Column modified.");

        await connection.end();
        console.log("Migration complete.");
    } catch (e) {
        console.error("Migration failed:", e);
    }
}

migrate();
