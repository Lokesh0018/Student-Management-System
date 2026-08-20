const express = require('express');
const router = express.Router();
const assignmentController = require('../controllers/assignmentController');
const auth = require('../middleware/authMiddleware');

router.get('/my-children', auth, assignmentController.getParentAssignments);
router.post('/', auth, assignmentController.addHomework);
router.put('/:id/status', auth, assignmentController.updateHomeworkStatus);

module.exports = router;
