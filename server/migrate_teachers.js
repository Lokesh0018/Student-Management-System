const pool = require('./config/db');

async function migrate() {
    try {
        console.log('Starting migration...');
        
        // Add new columns to teachers
        const alterQuery = `
            ALTER TABLE teachers 
            ADD COLUMN description TEXT,
            ADD COLUMN qualification VARCHAR(100),
            ADD COLUMN employee_id VARCHAR(50),
            ADD COLUMN joining_date DATE,
            ADD COLUMN assigned_classes VARCHAR(255);
        `;
        
        await pool.execute(alterQuery);
        console.log('Migration successful!');
    } catch (error) {
        if (error.code === 'ER_DUP_FIELDNAME') {
            console.log('Columns already exist. Skipping.');
        } else {
            console.error('Migration failed:', error);
        }
    } finally {
        process.exit();
    }
}

migrate();
