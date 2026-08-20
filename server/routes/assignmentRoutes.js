const express = require('express');
const router = express.Router();
const assignmentController = require('../controllers/assignmentController');
const auth = require('../middleware/authMiddleware');

// Check if teacher auth middleware exists, if not, use auth and controller checks role
router.get('/', auth, assignmentController.getAssignments);
router.post('/', auth, assignmentController.createAssignment);
router.put('/:id', auth, assignmentController.updateAssignment);
router.delete('/:id', auth, assignmentController.deleteAssignment);

module.exports = router;
