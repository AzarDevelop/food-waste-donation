const express = require('express');
const router = express.Router();
const {
  acceptDonation,
  completePickup,
  getMyPickups,
  getPickupsForFood,
} = require('../controllers/pickupController');
const { protect, authorize } = require('../middleware/auth');

router.post('/', protect, authorize('ngo'), acceptDonation);
router.patch('/:id/complete', protect, authorize('ngo'), completePickup);
router.get('/mine', protect, authorize('ngo'), getMyPickups);
router.get('/food/:foodId', protect, getPickupsForFood);

module.exports = router;
