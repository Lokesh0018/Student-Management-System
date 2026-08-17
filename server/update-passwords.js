const mysql = require('mysql2/promise');

async function updatePasswords() {
    try {
        const connection = await mysql.createConnection({
            host: '127.0.0.1',
            port: 3306,
            user: 'root',
            password: 'password',
            database: 'sms_db'
        });

        await connection.query('UPDATE users SET password_hash = "password123"');
        console.log('Passwords updated to plain text "password123".');
        
        // Let's also update the setup-db.js so future runs don't hash either, if we wanted to fully commit to plain text.
        // For now, this just updates the db.
        
        await connection.end();
    } catch (error) {
        console.error('Error updating passwords:', error);
    }
}

updatePasswords();
