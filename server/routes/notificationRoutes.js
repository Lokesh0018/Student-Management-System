const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notificationController');
const authMiddleware = require('../middleware/authMiddleware');

router.use(authMiddleware);

router.get('/', notificationController.getUserNotifications);
router.put('/clear', notificationController.clearAll);
router.put('/:id/read', notificationController.markAsRead);

module.exports = router;
