const express = require('express');
const router = express.Router();
const reportController = require('../controllers/reportController');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');

router.use(authMiddleware);
router.use(roleMiddleware('ADMIN')); // Only admin can access these reports

router.get('/students', reportController.getStudentReport);
router.get('/attendance', reportController.getAttendanceReport);
router.get('/performance', reportController.getPerformanceReport);

module.exports = router;
