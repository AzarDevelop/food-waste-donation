# 🍲 FoodBridge — AI-Powered Food Waste Donation & Distribution Platform

An MCA mini project (MERN stack) that connects restaurants/hotels/bakeries with NGOs
to rescue surplus food before it spoils, using two AI-driven features.

## ✅ AI Features Implemented

### AI Feature 1 — Best NGO Recommendation (Smart Matching)
When a restaurant uploads a donation, `backend/services/aiService.js` (`recommendNGOs`)
scores every registered NGO using a weighted multi-factor model:

| Factor          | Weight | Logic                                                          |
|------------------|--------|------------------------------------------------------------------|
| Proximity        | 50%    | Haversine distance between donation & NGO (closer = higher score) |
| Capacity fit     | 25%    | Does the NGO's remaining capacity cover the donation quantity?    |
| Current load     | 15%    | NGOs with fewer pending pickups are prioritized (load balancing)  |
| Reliability      | 10%    | Historical rating from completed pickups                         |

The top 5 ranked NGOs are stored on the donation (`recommendedNGOs`) and are the ones
notified first — this is the platform "recommending the best NGO for pickup".

### AI Feature 2 — Food Expiry Prediction
`predictExpiry()` in the same service takes **Food Type**, **Cooking Time**, and
**Storage Type**, and:
1. Looks up a baseline safe-window (hours) per food category (e.g. Rice ≈ 4h, Bread ≈ 10h).
2. Adjusts it with a storage multiplier (Refrigerated extends safe time the most).
3. Computes the predicted expiry timestamp and a risk level: `Safe / Moderate / Risky / Expired`.
4. Generates a human-readable alert, e.g. *"Safe for approximately 3 hours. Risk increases after 5:00 PM."*

Both restaurants and NGOs see this prediction immediately after upload / in the nearby-donations feed.

> Both features are implemented as transparent, explainable rule-based scoring engines —
> a common and appropriate approach for a semester-length MCA mini project. They live
> behind a single `aiService.js` module so they can later be swapped for a trained ML
> model (e.g. scikit-learn/regression for expiry, a ranking model for NGO matching)
> without changing any controller or API contract.

## 🗂 Project Structure

```
food-donation-platform/
├── backend/
│   ├── server.js
│   ├── config/db.js
│   ├── models/            # User, FoodDonation, NGO, PickupRequest, Notification
│   ├── middleware/         # auth (JWT), errorHandler, logger, upload (multer)
│   ├── services/           # aiService (AI Feature 1 & 2), notificationService, locationService
│   ├── controllers/
│   └── routes/
└── frontend/
    └── src/
        ├── api/axios.js
        ├── context/AuthContext.js
        ├── routes/ProtectedRoute.js
        ├── components/common/  # Navbar, StatCard, Badge
        └── pages/
            ├── Login.js, Register.js
            ├── restaurant/  Dashboard, UploadFood, DonationHistory
            ├── ngo/         Dashboard, MyPickups
            └── admin/       Dashboard
```

## 🔧 Setup

### 1. Backend
```bash
cd backend
npm install
cp .env.example .env      # edit MONGO_URI / JWT_SECRET as needed
npm run dev                # starts on http://localhost:5000
```
Requires a running MongoDB instance (local `mongod` or MongoDB Atlas connection string).

### 2. Frontend
```bash
cd frontend
npm install
cp .env.example .env       # REACT_APP_API_URL=http://localhost:5000/api
npm start                  # starts on http://localhost:3000
```

### 3. Try it out
1. Register an **NGO** account first (with capacity + lat/lng) — note NGOs need admin
   approval before they can log in, so also register an **Admin** account and approve it
   via the Admin Dashboard → NGOs tab.
2. Register a **Restaurant** account.
3. As the restaurant, go to **Upload Food** → fill in food details → submit. You'll
   instantly see the AI's expiry prediction and ranked NGO recommendations.
4. Log in as the NGO to see the donation in **Nearby Donations**, accept it, and later
   mark it **Picked Up**.
5. Log in as Admin to view platform-wide analytics.

## 🗃 Database Collections (MongoDB)
`Users`, `FoodDonations`, `NGOs`, `PickupRequests`, `Notifications` — schemas match the
fields specified in the project brief, with a few AI-related fields added to
`FoodDonations` (`riskLevel`, `expiryNote`, `recommendedNGOs`) to support the two AI features.

## 🔐 Auth
JWT-based auth (`Authorization: Bearer <token>`), password hashing with bcrypt,
role-based route protection (`restaurant`, `ngo`, `admin`) via middleware.

## 📌 Notes for viva / demo
- The AI logic is intentionally rule-based and fully commented in
  `backend/services/aiService.js` — good for explaining "how the AI works" in a viva
  without needing an external paid API.
- `foodController.createDonation` is the key integration point: it calls
  `predictExpiry()` then `recommendNGOs()` and notifies the top-matched NGOs — this is
  where both AI features come together in one request/response cycle.
