const express = require('express');
const router = express.Router();
const remarkController = require('../controllers/remarkController');
const authMiddleware = require('../middleware/authMiddleware');

router.use(authMiddleware);

router.get('/', remarkController.getRemarksForUser);
router.post('/', remarkController.sendRemark);
router.put('/:id/read', remarkController.markAsRead);
router.put('/:id/unread', remarkController.markAsUnread);

module.exports = router;
