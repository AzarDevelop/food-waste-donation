const express = require('express');
const router = express.Router();
const {
  createDonation,
  getMyDonations,
  getNearbyDonations,
  getDonationById,
  updateDonationStatus,
} = require('../controllers/foodController');
const { protect, authorize } = require('../middleware/auth');
const upload = require('../middleware/upload');

router.post('/', protect, authorize('restaurant'), upload.single('image'), createDonation);
router.get('/mine', protect, authorize('restaurant'), getMyDonations);
router.get('/nearby', protect, authorize('ngo'), getNearbyDonations);
router.get('/:id', protect, getDonationById);
router.patch('/:id/status', protect, authorize('restaurant', 'admin'), updateDonationStatus);

module.exports = router;
