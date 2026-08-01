const User = require('../models/User');
const NGO = require('../models/NGO');
const FoodDonation = require('../models/FoodDonation');
const PickupRequest = require('../models/PickupRequest');

// @route GET /api/admin/dashboard
const getDashboardStats = async (req, res, next) => {
  try {
    const [totalDonations, totalNGOs, activeRequests, pickedUpDonations, totalRestaurants] = await Promise.all([
      FoodDonation.countDocuments(),
      NGO.countDocuments(),
      FoodDonation.countDocuments({ status: { $in: ['Available', 'Accepted'] } }),
      FoodDonation.find({ status: 'PickedUp' }),
      User.countDocuments({ role: 'restaurant' }),
    ]);

    // "Food Saved" estimated as total servings successfully picked up
    const foodSaved = pickedUpDonations.reduce((sum, d) => sum + (d.quantity || 0), 0);

    const expiredCount = await FoodDonation.countDocuments({ status: 'Expired' });

    res.json({
      totalDonations,
      totalNGOs,
      totalRestaurants,
      activeRequests,
      foodSavedServings: foodSaved,
      completedPickups: pickedUpDonations.length,
      expiredDonations: expiredCount,
    });
  } catch (err) {
    next(err);
  }
};

// @route GET /api/admin/users
const listUsers = async (req, res, next) => {
  try {
    const { role } = req.query;
    const filter = role ? { role } : {};
    const users = await User.find(filter).sort({ createdAt: -1 });
    res.json(users);
  } catch (err) {
    next(err);
  }
};

// @route PATCH /api/admin/ngo/:id/approve
const approveNGO = async (req, res, next) => {
  try {
    const user = await User.findOneAndUpdate(
      { _id: req.params.id, role: 'ngo' },
      { isApproved: true },
      { new: true }
    );
    if (!user) return res.status(404).json({ message: 'NGO user not found' });
    res.json(user);
  } catch (err) {
    next(err);
  }
};

// @route PATCH /api/admin/restaurant/:id/verify
const verifyRestaurant = async (req, res, next) => {
  try {
    const user = await User.findOneAndUpdate(
      { _id: req.params.id, role: 'restaurant' },
      { isVerified: true },
      { new: true }
    );
    if (!user) return res.status(404).json({ message: 'Restaurant user not found' });
    res.json(user);
  } catch (err) {
    next(err);
  }
};

// @route GET /api/admin/reports
const getReports = async (req, res, next) => {
  try {
    const donationsByStatus = await FoodDonation.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 }, totalServings: { $sum: '$quantity' } } },
    ]);
    const donationsByType = await FoodDonation.aggregate([
      { $group: { _id: '$foodType', count: { $sum: 1 } } },
    ]);
    const topNGOs = await NGO.find({}).sort({ totalPickups: -1 }).limit(5).select('name totalPickups rating');

    res.json({ donationsByStatus, donationsByType, topNGOs });
  } catch (err) {
    next(err);
  }
};

module.exports = { getDashboardStats, listUsers, approveNGO, verifyRestaurant, getReports };
