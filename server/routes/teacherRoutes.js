const express = require('express');
const router = express.Router();
const teacherController = require('../controllers/teacherController');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');

router.use(authMiddleware);

// Admin has full access to teachers
router.get('/', roleMiddleware('ADMIN'), teacherController.getAllTeachers);
router.get('/:id', roleMiddleware('ADMIN'), teacherController.getTeacherById);
router.post('/', roleMiddleware('ADMIN'), teacherController.createTeacher);
router.put('/:id', roleMiddleware('ADMIN'), teacherController.updateTeacher);
router.delete('/:id', roleMiddleware('ADMIN'), teacherController.deleteTeacher);

module.exports = router;
