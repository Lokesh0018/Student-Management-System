const path = require('path');
const dbPath = path.resolve(__dirname, '../config/db.js');
const pool = require(dbPath);

async function initDB() {
    try {
        await pool.execute(`
            CREATE TABLE IF NOT EXISTS student_faces (
                id INT AUTO_INCREMENT PRIMARY KEY,
                student_id INT NOT NULL,
                descriptor JSON NOT NULL,
                model_version VARCHAR(50) DEFAULT 'vladmandic/face-api',
                is_active BOOLEAN DEFAULT TRUE,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE
            )
        `);
        console.log('Successfully created student_faces table');
    } catch (error) {
        console.error('Error creating table:', error);
    } finally {
        process.exit(0);
    }
}

initDB();
