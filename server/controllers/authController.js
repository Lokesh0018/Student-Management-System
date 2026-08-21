const pool = require('../config/db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'munakalalokesh222@gmail.com',
        pass: 'pvah qhsi ujpo sfkf'
    }
});

exports.login = async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ success: false, message: 'Please provide email and password' });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        return res.status(400).json({ success: false, message: 'Invalid email format' });
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

exports.forgotPassword = async (req, res) => {
    const { email } = req.body;
    
    if (!email) {
        return res.status(400).json({ success: false, message: 'Please provide an email address' });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        return res.status(400).json({ success: false, message: 'Invalid email format' });
    }

    try {
        const [users] = await pool.execute('SELECT * FROM users WHERE email = ?', [email]);
        if (users.length === 0) {
            return res.status(404).json({ success: false, message: 'No user found with that email address' });
        }

        // Generate 4-digit OTP
        const resetToken = Math.floor(1000 + Math.random() * 9000).toString();
        
        // 15 minutes expiration
        const expiresAt = new Date(Date.now() + 15 * 60 * 1000); 

        // Invalidate old tokens for this email
        await pool.execute('DELETE FROM password_resets WHERE email = ?', [email]);
        
        // Save new token
        await pool.execute(
            'INSERT INTO password_resets (email, token, expires_at) VALUES (?, ?, ?)',
            [email, resetToken, expiresAt]
        );

        // Send email with OTP
        const mailOptions = {
            from: 'munakalalokesh222@gmail.com',
            to: email,
            subject: 'Password Reset OTP - School Management System',
            html: `
                <div style="font-family: Arial, sans-serif; padding: 20px; color: #333; max-width: 500px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 8px;">
                    <h2 style="color: #075CB8; text-align: center;">Password Reset</h2>
                    <p>We received a request to reset your password for the School Management System.</p>
                    <p>Please use the following 4-digit OTP to reset your password:</p>
                    <div style="text-align: center; margin: 20px 0;">
                        <span style="font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #001E54; background-color: #f8fafc; padding: 15px 30px; border-radius: 8px; display: inline-block;">${resetToken}</span>
                    </div>
                    <p style="color: #64748b; font-size: 14px; text-align: center;">This code will expire in 15 minutes.</p>
                    <p style="font-size: 14px;">If you did not request this, please ignore this email and your password will remain unchanged.</p>
                </div>
            `
        };

        await transporter.sendMail(mailOptions);

        res.json({
            success: true,
            message: 'An OTP has been sent to your email.'
        });
    } catch (error) {
        console.error('Forgot password error:', error);
        res.status(500).json({ success: false, message: 'Server error during forgot password' });
    }
};

exports.verifyOTP = async (req, res) => {
    const { token } = req.body;
    
    if (!token) {
        return res.status(400).json({ success: false, message: 'Please provide the OTP' });
    }

    try {
        const [resets] = await pool.execute(
            'SELECT * FROM password_resets WHERE token = ? AND expires_at > NOW()',
            [token]
        );

        if (resets.length === 0) {
            return res.status(400).json({ success: false, message: 'Invalid or expired OTP' });
        }

        res.json({ success: true, message: 'OTP verified successfully' });
    } catch (error) {
        console.error('Verify OTP error:', error);
        res.status(500).json({ success: false, message: 'Server error during OTP verification' });
    }
};

exports.resetPassword = async (req, res) => {
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
        return res.status(400).json({ success: false, message: 'Please provide token and new password' });
    }

    if (newPassword.length < 4) {
        return res.status(400).json({ success: false, message: 'Password must be at least 4 characters long' });
    }

    try {
        const [resets] = await pool.execute(
            'SELECT * FROM password_resets WHERE token = ? AND expires_at > NOW()',
            [token]
        );

        if (resets.length === 0) {
            return res.status(400).json({ success: false, message: 'Invalid or expired password reset token' });
        }

        const email = resets[0].email;

        // Hash new password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newPassword, salt);

        // Update password
        await pool.execute('UPDATE users SET password = ? WHERE email = ?', [hashedPassword, email]);

        // Delete used token
        await pool.execute('DELETE FROM password_resets WHERE token = ?', [token]);

        res.json({
            success: true,
            message: 'Password has been successfully reset'
        });
    } catch (error) {
        console.error('Reset password error:', error);
        res.status(500).json({ success: false, message: 'Server error during password reset' });
    }
};
