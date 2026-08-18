const express = require('express');
const router = express.Router();
const studentController = require('../controllers/studentController');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');
const multer = require('multer');
const upload = multer({ storage: multer.memoryStorage() });

router.use(authMiddleware);

// Admin has full access. Teachers and Parents should have limited access, but we'll restrict those in their own routes or modify later.
// For Phase 7, standard Admin management.
router.get('/', roleMiddleware('ADMIN', 'CLASS_TEACHER'), studentController.getAllStudents);
router.get('/:id/photo', studentController.getStudentPhoto);
router.get('/:id', roleMiddleware('ADMIN', 'CLASS_TEACHER'), studentController.getStudentById);
router.post('/', roleMiddleware('ADMIN'), upload.single('photo'), studentController.createStudent);
router.put('/:id', roleMiddleware('ADMIN'), upload.single('photo'), studentController.updateStudent);
router.delete('/:id', roleMiddleware('ADMIN'), studentController.deleteStudent);

module.exports = router;
