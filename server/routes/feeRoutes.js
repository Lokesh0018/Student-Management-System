const express = require('express');
const router = express.Router();
const feeController = require('../controllers/feeController');
const auth = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');
const adminAuth = roleMiddleware('ADMIN');

router.get('/settings', auth, adminAuth, feeController.getSettings);
router.put('/settings', auth, adminAuth, feeController.updateSettings);

router.get('/terms', auth, adminAuth, feeController.getFeeTerms);
router.post('/terms', auth, adminAuth, feeController.createFeeTerm);
router.put('/terms/:id', auth, adminAuth, feeController.updateFeeTerm);
router.delete('/terms/:id', auth, adminAuth, feeController.deleteFeeTerm);

router.post('/assign', auth, adminAuth, feeController.assignFee);

router.get('/my-children', auth, feeController.getMyChildrenFees);
router.post('/:studentFeeId/payment', auth, feeController.submitPayment);

router.get('/payments', auth, adminAuth, feeController.getPayments);
router.put('/payments/:id/verify', auth, adminAuth, feeController.verifyPayment);
router.put('/payments/:id/reject', auth, adminAuth, feeController.rejectPayment);

router.get('/analytics', auth, adminAuth, feeController.getAnalytics);

module.exports = router;
