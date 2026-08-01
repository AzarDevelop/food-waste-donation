import React, { useEffect, useState } from 'react';
import Navbar from '../../components/common/Navbar';
import Badge from '../../components/common/Badge';
import api from '../../api/axios';
import { Link } from 'react-router-dom';

const RestaurantDashboard = () => {
  const [donations, setDonations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get('/food/mine')
      .then((res) => setDonations(res.data))
      .finally(() => setLoading(false));
  }, []);

  const stats = {
    total: donations.length,
    available: donations.filter((d) => d.status === 'Available').length,
    pickedUp: donations.filter((d) => d.status === 'PickedUp').length,
  };

  return (
    <div>
      <Navbar />
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Restaurant Dashboard</h1>
            <p className="text-gray-500 text-sm">Manage your food donations and track pickups</p>
          </div>
          <Link
            to="/restaurant/upload"
            className="bg-brand-600 hover:bg-brand-700 text-white px-4 py-2.5 rounded-lg text-sm font-semibold transition"
          >
            + Upload Food
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <p className="text-2xl font-bold">{stats.total}</p>
            <p className="text-sm text-gray-500">Total Donations</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <p className="text-2xl font-bold text-blue-600">{stats.available}</p>
            <p className="text-sm text-gray-500">Currently Available</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <p className="text-2xl font-bold text-green-600">{stats.pickedUp}</p>
            <p className="text-sm text-gray-500">Picked Up</p>
          </div>
        </div>

        <h2 className="font-semibold text-gray-800 mb-3">Recent Donations</h2>
        {loading ? (
          <p className="text-gray-500 text-sm">Loading...</p>
        ) : donations.length === 0 ? (
          <p className="text-gray-500 text-sm">No donations yet. Upload your first one!</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {donations.map((d) => (
              <div key={d._id} className="bg-white rounded-xl border border-gray-200 p-4">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-semibold text-gray-900">{d.foodName}</h3>
                  <Badge text={d.status} />
                </div>
                <p className="text-sm text-gray-500 mb-1">
                  {d.quantity} servings &bull; {d.foodType}
                </p>
                <div className="flex items-center gap-2 mt-2">
                  <Badge text={d.riskLevel} />
                  <span className="text-xs text-gray-500">{d.expiryNote}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default RestaurantDashboard;
