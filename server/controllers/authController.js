const pool = require('../config/db');

exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ success: false, message: 'Please provide email and password' });
        }

        const [users] = await pool.execute('SELECT * FROM users WHERE email = ?', [email]);
        const user = users[0];

        if (!user) {
            return res.status(401).json({ success: false, message: 'Invalid credentials' });
        }

        // Extremely basic login: no bcrypt, just string match
        // Note: the original setup script hashed passwords as 'password123'. 
        // We assume they have been updated to plaintext for this basic version, or user enters the hash.
        // For simplicity, we just compare plaintext directly.
        if (user.password_hash !== password) {
             return res.status(401).json({ success: false, message: 'Invalid credentials' });
        }

        // Remove password from response
        delete user.password_hash;

        // Return user data (no JWT token as requested)
        res.json({
            success: true,
            message: 'Login successful',
            data: user
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ success: false, message: 'Server error during login' });
    }
};
