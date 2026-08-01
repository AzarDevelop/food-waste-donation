const { getDistanceKm } = require('./locationService');

/**
 * ============================================================
 * AI FEATURE 1: Best NGO Recommendation
 * ============================================================
 * Given a food donation and a list of candidate NGOs, this scores
 * and ranks NGOs so the platform can suggest the best match for
 * pickup instead of a restaurant/admin choosing manually.
 *
 * Scoring model (weighted multi-factor score, 0-100):
 *   - Proximity (50%)   -> closer NGOs score higher (biggest factor,
 *                          since travel time directly affects whether
 *                          food is rescued before it spoils)
 *   - Capacity fit (25%) -> NGOs whose remaining capacity comfortably
 *                          covers the donation quantity score higher
 *   - Current load (15%) -> NGOs with fewer pending pickups are
 *                          preferred, to balance distribution
 *   - Reliability (10%)  -> historical rating from past pickups
 *
 * This is a transparent, explainable rule-based AI/ML-style scoring
 * engine (a common, lightweight approach for recommendation systems
 * in student/mini-projects). It can later be swapped for a trained
 * ML model without changing the API contract.
 * ============================================================
 */

const MAX_REASONABLE_DISTANCE_KM = 15; // beyond this, proximity score ~ 0

const scoreNGO = (donation, ngo) => {
  const distanceKm = getDistanceKm(
    donation.location.latitude,
    donation.location.longitude,
    ngo.latitude,
    ngo.longitude
  );

  // Proximity score: 100 at 0km, decaying linearly to 0 at MAX_REASONABLE_DISTANCE_KM
  const proximityScore = Math.max(0, 100 - (distanceKm / MAX_REASONABLE_DISTANCE_KM) * 100);

  // Capacity fit: how comfortably the NGO's remaining capacity covers this donation
  const remainingCapacity = Math.max(0, ngo.capacity - ngo.activeLoad);
  let capacityScore;
  if (remainingCapacity <= 0) capacityScore = 0;
  else if (remainingCapacity >= donation.quantity) capacityScore = 100;
  else capacityScore = (remainingCapacity / donation.quantity) * 100;

  // Load score: fewer active pending pickups -> higher score
  const loadScore = Math.max(0, 100 - ngo.activeLoad * 5);

  // Reliability score, from 0-5 rating -> 0-100
  const reliabilityScore = (ngo.rating / 5) * 100;

  const finalScore =
    proximityScore * 0.5 + capacityScore * 0.25 + loadScore * 0.15 + reliabilityScore * 0.1;

  return {
    ngoId: ngo._id,
    ngoName: ngo.name,
    score: Math.round(finalScore * 100) / 100,
    distanceKm: Math.round(distanceKm * 100) / 100,
    remainingCapacity,
  };
};

/**
 * Ranks all candidate NGOs for a given donation and returns the sorted
 * list (best match first). Only NGOs within MAX_REASONABLE_DISTANCE_KM * 3
 * are considered "in range"; others are still scored but will rank low.
 */
const recommendNGOs = (donation, ngoList, topN = 5) => {
  const scored = ngoList.map((ngo) => scoreNGO(donation, ngo));
  scored.sort((a, b) => b.score - a.score);
  return scored.slice(0, topN);
};

/**
 * ============================================================
 * AI FEATURE 2: Food Expiry Prediction
 * ============================================================
 * Given food type, cooking time, and storage type, predicts how long
 * the food remains safe to eat, and generates a human-readable alert
 * such as "Safe for 3 Hours" / "Risk after 5 PM".
 *
 * Baseline safe-window hours by food category (based on common food
 * safety guidance for cooked food held outside strict refrigeration),
 * then adjusted by a storage-type multiplier.
 * ============================================================
 */

// Baseline hours a freshly cooked item stays safe at room temperature
const BASE_SAFE_HOURS = {
  Rice: 4,
  Chapati: 6,
  Vegetables: 5,
  Bread: 10,
  Dessert: 3,
  Curry: 4,
  Biryani: 3.5,
  Mixed: 4,
  Other: 4,
};

// Storage type changes how long the base safe-window can be extended
const STORAGE_MULTIPLIER = {
  'Room Temperature': 1,
  'Hot Case': 1.3,
  'Insulated Container': 1.5,
  Refrigerated: 2.5,
};

const predictExpiry = ({ foodType, cookingTime, storageType }) => {
  const baseHours = BASE_SAFE_HOURS[foodType] || BASE_SAFE_HOURS.Other;
  const multiplier = STORAGE_MULTIPLIER[storageType] || 1;
  const safeHours = Math.round(baseHours * multiplier * 10) / 10;

  const cookedAt = new Date(cookingTime);
  const expiryTime = new Date(cookedAt.getTime() + safeHours * 60 * 60 * 1000);

  const now = new Date();
  const hoursRemaining = (expiryTime.getTime() - now.getTime()) / (1000 * 60 * 60);

  let riskLevel;
  if (hoursRemaining <= 0) riskLevel = 'Expired';
  else if (hoursRemaining <= 1) riskLevel = 'Risky';
  else if (hoursRemaining <= 2) riskLevel = 'Moderate';
  else riskLevel = 'Safe';

  const expiryTimeStr = expiryTime.toLocaleTimeString('en-IN', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });

  const expiryNote =
    riskLevel === 'Expired'
      ? `This food has passed its predicted safe window (expired at ${expiryTimeStr}).`
      : `Safe for approximately ${Math.max(0, Math.round(hoursRemaining * 10) / 10)} more hour(s). Risk increases after ${expiryTimeStr}.`;

  return { safeHours, expiryTime, riskLevel, expiryNote };
};

module.exports = { recommendNGOs, scoreNGO, predictExpiry };
