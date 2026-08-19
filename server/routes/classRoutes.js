const express = require('express');
const router = express.Router();
const classController = require('../controllers/classController');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');

router.use(authMiddleware);

router.get('/', roleMiddleware('ADMIN', 'CLASS_TEACHER'), classController.getAllClasses);
router.get('/:id', roleMiddleware('ADMIN', 'CLASS_TEACHER'), classController.getClassById);
router.post('/', roleMiddleware('ADMIN'), classController.createClass);
router.put('/:id', roleMiddleware('ADMIN'), classController.updateClass);
router.delete('/:id', roleMiddleware('ADMIN'), classController.deleteClass);

module.exports = router;
