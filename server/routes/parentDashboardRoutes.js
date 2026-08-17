const express = require('express');
const router = express.Router();
const parentDashboardController = require('../controllers/parentDashboardController');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');

router.use(authMiddleware);
router.use(roleMiddleware('PARENT'));

router.get('/stats', parentDashboardController.getParentDashboardStats);

module.exports = router;
