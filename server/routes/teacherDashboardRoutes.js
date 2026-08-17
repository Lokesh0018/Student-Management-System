const express = require('express');
const router = express.Router();
const teacherDashboardController = require('../controllers/teacherDashboardController');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');

router.use(authMiddleware);
router.use(roleMiddleware('CLASS_TEACHER'));

router.get('/stats', teacherDashboardController.getTeacherDashboardStats);

module.exports = router;
