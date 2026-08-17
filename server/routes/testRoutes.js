const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');

// Apply auth middleware to all routes in this file
router.use(authMiddleware);

// Admin only route
router.get('/admin', roleMiddleware('ADMIN'), (req, res) => {
    res.json({ success: true, message: 'Welcome Admin. You have access to this route.' });
});

// Teacher only route
router.get('/teacher', roleMiddleware('CLASS_TEACHER'), (req, res) => {
    res.json({ success: true, message: 'Welcome Teacher. You have access to this route.' });
});

// Parent only route
router.get('/parent', roleMiddleware('PARENT'), (req, res) => {
    res.json({ success: true, message: 'Welcome Parent. You have access to this route.' });
});

// Admin or Teacher route
router.get('/staff', roleMiddleware('ADMIN', 'CLASS_TEACHER'), (req, res) => {
    res.json({ success: true, message: 'Welcome Staff. You have access to this route.' });
});

module.exports = router;
