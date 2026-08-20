const mysql = require('mysql2/promise');
require('dotenv').config();

async function check() {
    const conn = await mysql.createConnection({
        host: process.env.DB_HOST || '127.0.0.1',
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || 'password',
        database: 'sms_db'
    });
    const [rows] = await conn.query('SHOW TABLES;');
    console.log(rows);
    process.exit();
}
check();
