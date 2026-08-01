import React, { useEffect, useState } from 'react';
import Navbar from '../../components/common/Navbar';
import Badge from '../../components/common/Badge';
import api from '../../api/axios';

const NGODashboard = () => {
  const [donations, setDonations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [acceptingId, setAcceptingId] = useState(null);
  const [message, setMessage] = useState('');

  const load = () => {
    setLoading(true);
    api
      .get('/food/nearby')
      .then((res) => setDonations(res.data))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const handleAccept = async (foodId) => {
    setAcceptingId(foodId);
    setMessage('');
    try {
      await api.post('/pickup', { foodId });
      setMessage('Donation accepted! Head over to the pickup location.');
      load();
    } catch (err) {
      setMessage(err.response?.data?.message || 'Failed to accept donation');
    } finally {
      setAcceptingId(null);
    }
  };

  return (
    <div>
      <Navbar />
      <div className="max-w-6xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-1">Nearby Food Donations</h1>
        <p className="text-gray-500 text-sm mb-6">Sorted by distance from your registered location</p>

        {message && <div className="bg-brand-50 text-brand-700 text-sm rounded-md p-3 mb-4">{message}</div>}

        {loading ? (
          <p className="text-gray-500 text-sm">Loading...</p>
        ) : donations.length === 0 ? (
          <p className="text-gray-500 text-sm">No available donations right now. Check back soon!</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {donations.map((d) => (
              <div key={d._id} className="bg-white rounded-xl border border-gray-200 p-4 flex flex-col">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-semibold text-gray-900">{d.foodName}</h3>
                  <Badge text={d.riskLevel} />
                </div>
                <p className="text-sm text-gray-500 mb-1">
                  {d.quantity} servings &bull; {d.foodType}
                </p>
                <p className="text-xs text-gray-400 mb-1">{d.location.address}</p>
                <p className="text-xs text-brand-600 font-semibold mb-2">{d.distanceKm} km away</p>
                <p className="text-xs text-gray-500 mb-3 flex-1">{d.expiryNote}</p>
                <button
                  onClick={() => handleAccept(d._id)}
                  disabled={acceptingId === d._id}
                  className="w-full bg-brand-600 hover:bg-brand-700 text-white rounded-lg py-2 text-sm font-semibold transition disabled:opacity-60"
                >
                  {acceptingId === d._id ? 'Accepting...' : 'Accept Donation'}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default NGODashboard;
