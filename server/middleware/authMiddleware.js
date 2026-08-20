const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
    try {
        // Get token from header
        const authHeader = req.header('Authorization');
        
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            // Check for older header style for backwards compatibility just in case
            const oldToken = req.header('x-auth-token');
            if (!oldToken) {
                return res.status(401).json({ success: false, message: 'Authentication required!!! No token provided.' });
            }
            req.token = oldToken;
        } else {
            req.token = authHeader.split(' ')[1];
        }

        // Verify token
        const decoded = jwt.verify(req.token, process.env.JWT_SECRET || 'fallback_secret_key_change_in_production');
        
        req.user = decoded;
        next();
    } catch (err) {
        console.error('Auth middleware error:', err.message);
        return res.status(401).json({ success: false, message: 'Invalid or expired token' });
    }
};

module.exports = authMiddleware;
