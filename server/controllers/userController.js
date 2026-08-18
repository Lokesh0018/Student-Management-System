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
