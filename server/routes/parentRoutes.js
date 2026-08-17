const express = require('express');
const router = express.Router();
const parentController = require('../controllers/parentController');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');

router.use(authMiddleware);

// Admin has full access to parents
router.get('/', roleMiddleware('ADMIN'), parentController.getAllParents);
router.post('/', roleMiddleware('ADMIN'), parentController.createParent);
router.put('/:id', roleMiddleware('ADMIN'), parentController.updateParent);
router.delete('/:id', roleMiddleware('ADMIN'), parentController.deleteParent);

module.exports = router;
