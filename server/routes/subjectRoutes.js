const express = require('express');
const router = express.Router();
const subjectController = require('../controllers/subjectController');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');

router.use(authMiddleware);
router.get('/', roleMiddleware('ADMIN', 'CLASS_TEACHER'), subjectController.getAllSubjects);
router.get('/:id', roleMiddleware('ADMIN', 'CLASS_TEACHER'), subjectController.getSubjectById);
router.post('/', roleMiddleware('ADMIN'), subjectController.createSubject);
router.put('/:id', roleMiddleware('ADMIN'), subjectController.updateSubject);
router.delete('/:id', roleMiddleware('ADMIN'), subjectController.deleteSubject);

module.exports = router;
