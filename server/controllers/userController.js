const pool = require('../config/db');

exports.getUsersForDropdown = async (req, res) => {
    try {
        const { id, role } = req.user;
        // Don't fetch ADMINs for typical messaging (or maybe do? Usually users can't message admin or admin doesn't need to be in the list, but let's allow it for now).
        // Let's just fetch all active users except the current user themselves
        const [users] = await pool.execute(
            'SELECT id, name, role FROM users WHERE id != ? AND role IN ("CLASS_TEACHER", "PARENT") ORDER BY name ASC',
            [id]
        );
        res.json({ success: true, data: users });
    } catch (error) {
        console.error('Error fetching users:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

exports.getProfile = async (req, res) => {
    try {
        const userId = req.user.id;
        const [users] = await pool.execute('SELECT id, name, email, role, created_at FROM users WHERE id = ?', [userId]);
        
        if (users.length === 0) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }
        
        res.json({ success: true, data: users[0] });
    } catch (error) {
        console.error('Error fetching profile:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

const bcrypt = require('bcrypt');

exports.updateProfile = async (req, res) => {
    try {
        const userId = req.user.id;
        const { name, email, currentPassword, newPassword } = req.body;

        // Fetch current user
        const [users] = await pool.execute('SELECT * FROM users WHERE id = ?', [userId]);
        if (users.length === 0) return res.status(404).json({ success: false, message: 'User not found' });
        const user = users[0];

        // Update name and email if provided
        if (name || email) {
            const updateName = name || user.name;
            const updateEmail = email || user.email;
            
            // Check email uniqueness if changing email
            if (email && email !== user.email) {
                const [existing] = await pool.execute('SELECT id FROM users WHERE email = ?', [email]);
                if (existing.length > 0) return res.status(400).json({ success: false, message: 'Email already in use' });
            }

            await pool.execute('UPDATE users SET name = ?, email = ? WHERE id = ?', [updateName, updateEmail, userId]);
        }

        // Update password if requested
        if (currentPassword && newPassword) {
            const isMatch = await bcrypt.compare(currentPassword, user.password);
            // Fallback for plain text from older insecure state
            const isMatchPlain = user.password === currentPassword;

            if (!isMatch && !isMatchPlain) {
                return res.status(400).json({ success: false, message: 'Incorrect current password' });
            }

            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(newPassword, salt);
            await pool.execute('UPDATE users SET password = ? WHERE id = ?', [hashedPassword, userId]);
        }

        // Fetch updated user to return
        const [updatedUsers] = await pool.execute('SELECT id, name, email, role, created_at FROM users WHERE id = ?', [userId]);
        res.json({ success: true, message: 'Profile updated successfully', data: updatedUsers[0] });

    } catch (error) {
        console.error('Error updating profile:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};
