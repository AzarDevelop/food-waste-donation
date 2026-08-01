const FoodDonation = require('../models/FoodDonation');
const NGO = require('../models/NGO');
const User = require('../models/User');
const { predictExpiry, recommendNGOs } = require('../services/aiService');
const { notifyNGOs, createNotification } = require('../services/notificationService');
const { getDistanceKm } = require('../services/locationService');

// @route POST /api/food
// @desc  Restaurant uploads a food donation. Runs AI Feature 2 (expiry prediction)
//        and AI Feature 1 (NGO recommendation), then notifies nearby NGOs.
const createDonation = async (req, res, next) => {
  try {
    const { foodName, quantity, foodType, cookingTime, storageType, address, latitude, longitude } = req.body;

    if (!foodName || !quantity || !foodType || !cookingTime || !address || !latitude || !longitude) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    // ---- AI Feature 2: Food Expiry Prediction ----
    const { expiryTime, riskLevel, expiryNote } = predictExpiry({
      foodType,
      cookingTime,
      storageType: storageType || 'Room Temperature',
    });

    const donation = await FoodDonation.create({
      restaurantId: req.user.id,
      foodName,
      quantity,
      foodType,
      image: req.file ? `/uploads/${req.file.filename}` : req.body.image || '',
      cookingTime,
      storageType: storageType || 'Room Temperature',
      expiryTime,
      riskLevel,
      expiryNote,
      location: { address, latitude, longitude },
      status: 'Available',
    });

    // ---- AI Feature 1: Best NGO Recommendation ----
    const ngos = await NGO.find({});
    const ranked = recommendNGOs(donation, ngos, 5);
    donation.recommendedNGOs = ranked.map((r) => ({ ngoId: r.ngoId, score: r.score, distanceKm: r.distanceKm }));
    await donation.save();

    // Notify the top recommended NGOs (nearby, best-fit NGOs get priority alerts)
    const topNgoDocs = await NGO.find({ _id: { $in: ranked.map((r) => r.ngoId) } });
    await notifyNGOs(
      topNgoDocs.map((n) => n.userId),
      {
        title: 'New Food Donation Nearby',
        message: `${foodName} (${quantity} servings) is available. ${expiryNote}`,
        foodId: donation._id,
      }
    );

    res.status(201).json({ donation, aiRecommendations: ranked });
  } catch (err) {
    next(err);
  }
};

// @route GET /api/food/mine
// @desc  Restaurant's own donation history
const getMyDonations = async (req, res, next) => {
  try {
    const donations = await FoodDonation.find({ restaurantId: req.user.id }).sort({ createdAt: -1 });
    res.json(donations);
  } catch (err) {
    next(err);
  }
};

// @route GET /api/food/nearby
// @desc  NGO views nearby available donations, sorted by distance from their registered location
const getNearbyDonations = async (req, res, next) => {
  try {
    const ngo = await NGO.findOne({ userId: req.user.id });
    if (!ngo) return res.status(404).json({ message: 'NGO profile not found' });

    const donations = await FoodDonation.find({ status: 'Available' }).sort({ createdAt: -1 });

    const withDistance = donations.map((d) => ({
      ...d.toObject(),
      distanceKm:
        Math.round(
          getDistanceKm(ngo.latitude, ngo.longitude, d.location.latitude, d.location.longitude) * 100
        ) / 100,
    }));

    withDistance.sort((a, b) => a.distanceKm - b.distanceKm);
    res.json(withDistance);
  } catch (err) {
    next(err);
  }
};

// @route GET /api/food/:id
const getDonationById = async (req, res, next) => {
  try {
    const donation = await FoodDonation.findById(req.params.id).populate('restaurantId', 'name phone location');
    if (!donation) return res.status(404).json({ message: 'Donation not found' });
    res.json(donation);
  } catch (err) {
    next(err);
  }
};

// @route PATCH /api/food/:id/status
const updateDonationStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const donation = await FoodDonation.findById(req.params.id);
    if (!donation) return res.status(404).json({ message: 'Donation not found' });

    // Only the owning restaurant or an admin can force-update status directly
    if (req.user.role !== 'admin' && String(donation.restaurantId) !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to update this donation' });
    }

    donation.status = status;
    await donation.save();
    res.json(donation);
  } catch (err) {
    next(err);
  }
};

module.exports = { createDonation, getMyDonations, getNearbyDonations, getDonationById, updateDonationStatus };
