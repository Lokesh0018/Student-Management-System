const pool = require('../config/db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

exports.login = async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ success: false, message: 'Please provide email and password' });
    }

    try {
        const [users] = await pool.execute('SELECT * FROM users WHERE email = ?', [email]);
        const user = users[0];

        if (!user) {
            return res.status(401).json({ success: false, message: 'Invalid credentials' });
        }

        // Check if password is valid
        const isMatch = await bcrypt.compare(password, user.password);
        
        // Fallback for plain text passwords from previous insecure implementation
        if (!isMatch && user.password !== password) {
            return res.status(401).json({ success: false, message: 'Invalid credentials' });
        }
        
        // Auto-migrate plaintext password to bcrypt (if they successfully logged in with plaintext)
        if (!isMatch && user.password === password) {
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(password, salt);
            await pool.execute('UPDATE users SET password = ? WHERE id = ?', [hashedPassword, user.id]);
        }

        // Generate JWT token
        const token = jwt.sign(
            { id: user.id, role: user.role },
            process.env.JWT_SECRET || 'fallback_secret_key_change_in_production',
            { expiresIn: '24h' }
        );

        delete user.password;

        res.json({
            success: true,
            message: 'Login successful',
            token,
            data: user
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ success: false, message: 'Server error during login' });
    }
};
