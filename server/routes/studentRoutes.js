const express = require('express');
const router = express.Router();
const studentController = require('../controllers/studentController');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');

// Public routes (used by <img> tags which can't send JWT headers)
router.get('/preview', studentController.previewImage);
router.get('/:id/image', studentController.getStudentImage);

router.use(authMiddleware);

// Admin has full access. Teachers have access to CRUD but are restricted in controller.
router.get('/', roleMiddleware('ADMIN', 'CLASS_TEACHER', 'PARENT'), studentController.getAllStudents);
router.get('/:id', roleMiddleware('ADMIN', 'CLASS_TEACHER', 'PARENT'), studentController.getStudentById);
router.post('/', roleMiddleware('ADMIN', 'CLASS_TEACHER'), studentController.createStudent);
router.put('/:id', roleMiddleware('ADMIN', 'CLASS_TEACHER'), studentController.updateStudent);
router.delete('/:id', roleMiddleware('ADMIN', 'CLASS_TEACHER'), studentController.deleteStudent);

module.exports = router;
