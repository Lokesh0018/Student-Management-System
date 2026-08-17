const express = require('express');
const router = express.Router();
const examController = require('../controllers/examController');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');

router.use(authMiddleware);

// Admin has full access, Teachers can view
router.get('/', roleMiddleware('ADMIN', 'CLASS_TEACHER'), examController.getAllExams);
router.post('/', roleMiddleware('ADMIN'), examController.createExam);
router.put('/:id', roleMiddleware('ADMIN'), examController.updateExam);
router.delete('/:id', roleMiddleware('ADMIN'), examController.deleteExam);

module.exports = router;
