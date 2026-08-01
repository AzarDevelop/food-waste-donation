const express = require('express');
const router = express.Router();
const { getMyProfile, updateMyProfile, listNGOs } = require('../controllers/ngoController');
const { protect, authorize } = require('../middleware/auth');

router.get('/profile', protect, authorize('ngo'), getMyProfile);
router.put('/profile', protect, authorize('ngo'), updateMyProfile);
router.get('/', protect, authorize('admin'), listNGOs);

module.exports = router;
