const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema(
  {
    receiver: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    title: { type: String, required: true },
    message: { type: String, required: true },
    isRead: { type: Boolean, default: false },
    meta: {
      foodId: { type: mongoose.Schema.Types.ObjectId, ref: 'FoodDonation', default: null },
      pickupId: { type: mongoose.Schema.Types.ObjectId, ref: 'PickupRequest', default: null },
      type: { type: String, default: 'general' }, // e.g. 'new_donation', 'accepted', 'expiry_alert'
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Notification', notificationSchema);
