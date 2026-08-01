const express = require('express');
const router = express.Router();
const {
  getDashboardStats,
  listUsers,
  approveNGO,
  verifyRestaurant,
  getReports,
} = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect, authorize('admin'));

router.get('/dashboard', getDashboardStats);
router.get('/users', listUsers);
router.patch('/ngo/:id/approve', approveNGO);
router.patch('/restaurant/:id/verify', verifyRestaurant);
router.get('/reports', getReports);

module.exports = router;
