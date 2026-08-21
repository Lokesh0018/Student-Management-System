const express = require('express');
const router = express.Router();
const faceController = require('../controllers/faceController');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');

router.use(authMiddleware);

// Only admins can register faces for now
router.post('/register', roleMiddleware('ADMIN', 'CLASS_TEACHER'), faceController.registerFace);

// Admins and teachers can fetch class faces
router.get('/class/:classId', roleMiddleware('ADMIN', 'CLASS_TEACHER'), faceController.getFacesByClass);

module.exports = router;
