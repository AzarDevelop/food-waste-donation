const mongoose = require('mongoose');

const foodDonationSchema = new mongoose.Schema(
  {
    restaurantId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    foodName: { type: String, required: true, trim: true },
    quantity: { type: Number, required: true }, // approx. number of servings
    foodType: { type: String, required: true }, // e.g. Rice, Chapati, Vegetables, Bread, Dessert, Mixed
    image: { type: String, default: '' }, // stored filename / URL

    // Inputs used for AI Feature 2: Food Expiry Prediction
    cookingTime: { type: Date, required: true }, // when the food was cooked
    storageType: { type: String, enum: ['Room Temperature', 'Refrigerated', 'Hot Case', 'Insulated Container'], default: 'Room Temperature' },

    // Output of AI Feature 2
    expiryTime: { type: Date, required: true }, // predicted safe-until time
    riskLevel: { type: String, enum: ['Safe', 'Moderate', 'Risky', 'Expired'], default: 'Safe' },
    expiryNote: { type: String, default: '' }, // e.g. "Safe for 3 hours, risk after 5 PM"

    location: {
      address: { type: String, required: true },
      latitude: { type: Number, required: true },
      longitude: { type: Number, required: true },
    },

    status: {
      type: String,
      enum: ['Available', 'Requested', 'Accepted', 'PickedUp', 'Expired', 'Cancelled'],
      default: 'Available',
    },

    // Output of AI Feature 1: Best NGO Recommendation (top suggestions stored for transparency)
    recommendedNGOs: [
      {
        ngoId: { type: mongoose.Schema.Types.ObjectId, ref: 'NGO' },
        score: Number,
        distanceKm: Number,
      },
    ],
  },
  { timestamps: true }
);

foodDonationSchema.index({ 'location.latitude': 1, 'location.longitude': 1 });

module.exports = mongoose.model('FoodDonation', foodDonationSchema);
