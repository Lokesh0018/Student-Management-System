const mysql = require('mysql2/promise');
require('dotenv').config();

async function alterRemarks() {
    try {
        const connection = await mysql.createConnection({
            host: process.env.DB_HOST || '127.0.0.1',
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASSWORD || 'password',
            database: 'sms_db',
            port: process.env.DB_PORT || 3306
        });

        console.log("Adding category and priority to remarks...");
        try {
            await connection.query('ALTER TABLE remarks ADD COLUMN category VARCHAR(50) DEFAULT "General";');
        } catch(e) { console.log(e.message); }
        try {
            await connection.query('ALTER TABLE remarks ADD COLUMN priority VARCHAR(50) DEFAULT "Normal";');
        } catch(e) { console.log(e.message); }

        console.log("Done");
        process.exit(0);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
}
alterRemarks();
