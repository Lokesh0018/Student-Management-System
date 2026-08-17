const express = require('express');
const router = express.Router();
const markController = require('../controllers/markController');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');

router.use(authMiddleware);
router.use(roleMiddleware('ADMIN', 'CLASS_TEACHER'));

router.get('/', markController.getMarksByExamAndClass);
router.post('/', markController.saveMarks);

module.exports = router;
