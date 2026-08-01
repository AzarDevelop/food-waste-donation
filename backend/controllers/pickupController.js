const PickupRequest = require('../models/PickupRequest');
const FoodDonation = require('../models/FoodDonation');
const NGO = require('../models/NGO');
const User = require('../models/User');
const { createNotification } = require('../services/notificationService');

// @route POST /api/pickup
// @desc  NGO accepts a donation -> creates a PickupRequest, marks food Accepted,
//        increments the NGO's activeLoad (used by the AI recommender for future donations)
const acceptDonation = async (req, res, next) => {
  try {
    const { foodId } = req.body;

    const ngo = await NGO.findOne({ userId: req.user.id });
    if (!ngo) return res.status(404).json({ message: 'NGO profile not found' });

    const donation = await FoodDonation.findById(foodId);
    if (!donation) return res.status(404).json({ message: 'Donation not found' });
    if (donation.status !== 'Available') {
      return res.status(400).json({ message: `Donation is no longer available (status: ${donation.status})` });
    }

    const pickup = await PickupRequest.create({
      foodId,
      ngoId: ngo._id,
      status: 'Accepted',
      acceptedTime: new Date(),
    });

    donation.status = 'Accepted';
    await donation.save();

    ngo.activeLoad += 1;
    await ngo.save();

    await createNotification({
      receiver: donation.restaurantId,
      title: 'Donation Accepted',
      message: `${ngo.name} has accepted your donation of ${donation.foodName}.`,
      meta: { foodId: donation._id, pickupId: pickup._id, type: 'accepted' },
    });

    res.status(201).json(pickup);
  } catch (err) {
    next(err);
  }
};

// @route PATCH /api/pickup/:id/complete
// @desc  NGO marks pickup as completed
const completePickup = async (req, res, next) => {
  try {
    const pickup = await PickupRequest.findById(req.params.id);
    if (!pickup) return res.status(404).json({ message: 'Pickup request not found' });

    pickup.status = 'PickedUp';
    pickup.pickupTime = new Date();
    await pickup.save();

    const donation = await FoodDonation.findByIdAndUpdate(pickup.foodId, { status: 'PickedUp' }, { new: true });

    const ngo = await NGO.findById(pickup.ngoId);
    if (ngo) {
      ngo.activeLoad = Math.max(0, ngo.activeLoad - 1);
      ngo.totalPickups += 1;
      await ngo.save();
    }

    if (donation) {
      await createNotification({
        receiver: donation.restaurantId,
        title: 'Pickup Completed',
        message: `${donation.foodName} has been successfully picked up.`,
        meta: { foodId: donation._id, pickupId: pickup._id, type: 'pickup_completed' },
      });
    }

    res.json(pickup);
  } catch (err) {
    next(err);
  }
};

// @route GET /api/pickup/mine (NGO's own accepted/pending pickups)
const getMyPickups = async (req, res, next) => {
  try {
    const ngo = await NGO.findOne({ userId: req.user.id });
    if (!ngo) return res.status(404).json({ message: 'NGO profile not found' });

    const pickups = await PickupRequest.find({ ngoId: ngo._id })
      .populate('foodId')
      .sort({ createdAt: -1 });
    res.json(pickups);
  } catch (err) {
    next(err);
  }
};

// @route GET /api/pickup/food/:foodId (restaurant tracks pickup status of one donation)
const getPickupsForFood = async (req, res, next) => {
  try {
    const pickups = await PickupRequest.find({ foodId: req.params.foodId })
      .populate('ngoId', 'name address latitude longitude')
      .sort({ createdAt: -1 });
    res.json(pickups);
  } catch (err) {
    next(err);
  }
};

module.exports = { acceptDonation, completePickup, getMyPickups, getPickupsForFood };
