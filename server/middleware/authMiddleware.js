const authMiddleware = (req, res, next) => {
    // Simulated authentication since JWT is skipped
    const userId = req.header('x-user-id');
    const userRole = req.header('x-user-role');

    if (!userId || !userRole) {
        return res.status(401).json({ success: false, message: 'Authentication required!!!' });
    }

    req.user = {
        id: userId,
        role: userRole
    };

    next();
};

module.exports = authMiddleware;
