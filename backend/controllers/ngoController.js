const NGO = require('../models/NGO');
const User = require('../models/User');

// @route GET /api/ngo/profile
const getMyProfile = async (req, res, next) => {
  try {
    const ngo = await NGO.findOne({ userId: req.user.id });
    if (!ngo) return res.status(404).json({ message: 'NGO profile not found' });
    res.json(ngo);
  } catch (err) {
    next(err);
  }
};

// @route PUT /api/ngo/profile
const updateMyProfile = async (req, res, next) => {
  try {
    const { name, address, capacity, latitude, longitude } = req.body;
    const ngo = await NGO.findOneAndUpdate(
      { userId: req.user.id },
      { $set: { name, address, capacity, latitude, longitude } },
      { new: true }
    );
    if (!ngo) return res.status(404).json({ message: 'NGO profile not found' });
    res.json(ngo);
  } catch (err) {
    next(err);
  }
};

// @route GET /api/ngo (admin/public listing)
const listNGOs = async (req, res, next) => {
  try {
    const ngos = await NGO.find({}).populate('userId', 'name email isApproved');
    res.json(ngos);
  } catch (err) {
    next(err);
  }
};

module.exports = { getMyProfile, updateMyProfile, listNGOs };
