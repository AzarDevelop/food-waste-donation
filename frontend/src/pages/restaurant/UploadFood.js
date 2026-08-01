import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../../components/common/Navbar';
import Badge from '../../components/common/Badge';
import api from '../../api/axios';

const FOOD_TYPES = ['Rice', 'Chapati', 'Vegetables', 'Bread', 'Dessert', 'Curry', 'Biryani', 'Mixed', 'Other'];
const STORAGE_TYPES = ['Room Temperature', 'Hot Case', 'Insulated Container', 'Refrigerated'];

// Local time -> "YYYY-MM-DDTHH:mm" for <input type="datetime-local">
const toLocalInputValue = (date) => {
  const d = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
  return d.toISOString().slice(0, 16);
};

const UploadFood = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    foodName: '',
    quantity: '',
    foodType: 'Rice',
    cookingTime: toLocalInputValue(new Date()),
    storageType: 'Room Temperature',
    address: '',
    latitude: '',
    longitude: '',
  });
  const [imageFile, setImageFile] = useState(null);
  const [result, setResult] = useState(null); // holds AI response (expiry + recommended NGOs)
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const update = (key) => (e) => setForm({ ...form, [key]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setResult(null);
    setLoading(true);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => fd.append(k, v));
      if (imageFile) fd.append('image', imageFile);

      const { data } = await api.post('/food', fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setResult(data); // { donation, aiRecommendations }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to upload donation');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <Navbar />
      <div className="max-w-2xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-1">Upload Food Donation</h1>
        <p className="text-gray-500 text-sm mb-6">
          Our AI will predict the food's safe window and suggest the best NGO for pickup.
        </p>

        {error && <div className="bg-red-50 text-red-600 text-sm rounded-md p-3 mb-4">{error}</div>}

        <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
          <Field label="Food Name" value={form.foodName} onChange={update('foodName')} required placeholder="e.g. Veg Biryani" />

          <div className="grid grid-cols-2 gap-4">
            <Field label="Quantity (servings)" type="number" value={form.quantity} onChange={update('quantity')} required />
            <div>
              <label className="text-sm font-medium text-gray-700">Food Type</label>
              <select
                className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                value={form.foodType}
                onChange={update('foodType')}
              >
                {FOOD_TYPES.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Field label="Cooking Time" type="datetime-local" value={form.cookingTime} onChange={update('cookingTime')} required />
            <div>
              <label className="text-sm font-medium text-gray-700">Storage Type</label>
              <select
                className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                value={form.storageType}
                onChange={update('storageType')}
              >
                {STORAGE_TYPES.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>
          </div>

          <Field label="Pickup Address" value={form.address} onChange={update('address')} required />
          <div className="grid grid-cols-2 gap-4">
            <Field label="Latitude" type="number" step="any" value={form.latitude} onChange={update('latitude')} required />
            <Field label="Longitude" type="number" step="any" value={form.longitude} onChange={update('longitude')} required />
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700">Food Image (optional)</label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setImageFile(e.target.files[0])}
              className="mt-1 w-full text-sm"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-brand-600 hover:bg-brand-700 text-white rounded-lg py-2.5 text-sm font-semibold transition disabled:opacity-60"
          >
            {loading ? 'Analyzing with AI...' : 'Submit Donation'}
          </button>
        </form>

        {result && (
          <div className="mt-6 space-y-4">
            <div className="bg-white rounded-xl border border-gray-200 p-5">
              <h3 className="font-semibold text-gray-900 mb-2">🧠 AI Feature 2 — Expiry Prediction</h3>
              <div className="flex items-center gap-2 mb-1">
                <Badge text={result.donation.riskLevel} />
                <span className="text-sm text-gray-600">Safe until {new Date(result.donation.expiryTime).toLocaleString()}</span>
              </div>
              <p className="text-sm text-gray-500">{result.donation.expiryNote}</p>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 p-5">
              <h3 className="font-semibold text-gray-900 mb-3">🎯 AI Feature 1 — Recommended NGOs</h3>
              {result.aiRecommendations?.length ? (
                <div className="space-y-2">
                  {result.aiRecommendations.map((r, i) => (
                    <div key={r.ngoId} className="flex items-center justify-between text-sm border-b last:border-0 border-gray-100 pb-2">
                      <span className="font-medium text-gray-800">
                        #{i + 1} {r.ngoName}
                      </span>
                      <span className="text-gray-500">{r.distanceKm} km &bull; match score {r.score}/100</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500">No NGOs registered nearby yet.</p>
              )}
            </div>

            <button
              onClick={() => navigate('/restaurant')}
              className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg py-2.5 text-sm font-semibold transition"
            >
              Back to Dashboard
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

const Field = ({ label, ...props }) => (
  <div>
    <label className="text-sm font-medium text-gray-700">{label}</label>
    <input
      className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
      {...props}
    />
  </div>
);

export default UploadFood;
