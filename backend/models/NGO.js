const mongoose = require('mongoose');

// Extended NGO profile, linked 1:1 with a User (role='ngo')
const ngoSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    name: { type: String, required: true },
    address: { type: String, required: true },
    capacity: { type: Number, required: true, default: 50 }, // meals/day the NGO can typically handle
    latitude: { type: Number, required: true },
    longitude: { type: Number, required: true },
    activeLoad: { type: Number, default: 0 }, // meals currently pending pickup (used by AI recommender)
    rating: { type: Number, default: 4.5, min: 0, max: 5 },
    totalPickups: { type: Number, default: 0 },
  },
  { timestamps: true }
);

module.exports = mongoose.model('NGO', ngoSchema);
