const mongoose = require('mongoose');

const pickupRequestSchema = new mongoose.Schema(
  {
    foodId: { type: mongoose.Schema.Types.ObjectId, ref: 'FoodDonation', required: true },
    ngoId: { type: mongoose.Schema.Types.ObjectId, ref: 'NGO', required: true },
    status: {
      type: String,
      enum: ['Pending', 'Accepted', 'Rejected', 'PickedUp', 'Cancelled'],
      default: 'Pending',
    },
    acceptedTime: { type: Date, default: null },
    pickupTime: { type: Date, default: null },
  },
  { timestamps: true }
);

module.exports = mongoose.model('PickupRequest', pickupRequestSchema);
