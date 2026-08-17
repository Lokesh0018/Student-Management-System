const express = require('express');
const router = express.Router();
const attendanceController = require('../controllers/attendanceController');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');

router.use(authMiddleware);
router.use(roleMiddleware('ADMIN', 'CLASS_TEACHER'));

router.get('/', attendanceController.getAttendanceByClassAndDate);
router.post('/', attendanceController.saveAttendance);

module.exports = router;
