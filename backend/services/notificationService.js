const Notification = require('../models/Notification');

/**
 * Creates a notification document. In a production app this would also
 * push over WebSockets/FCM; for this mini-project it persists to MongoDB
 * and the frontend polls / fetches on demand.
 */
const createNotification = async ({ receiver, title, message, meta = {} }) => {
  return Notification.create({ receiver, title, message, meta });
};

/**
 * Notify every NGO user in the list (used when a new donation is uploaded,
 * so nearby NGOs are alerted).
 */
const notifyNGOs = async (ngoUserIds, { title, message, foodId }) => {
  const docs = ngoUserIds.map((receiver) => ({
    receiver,
    title,
    message,
    meta: { foodId, type: 'new_donation' },
  }));
  if (docs.length) await Notification.insertMany(docs);
};

module.exports = { createNotification, notifyNGOs };
