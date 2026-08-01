import React, { useEffect, useState } from 'react';
import Navbar from '../../components/common/Navbar';
import StatCard from '../../components/common/StatCard';
import api from '../../api/axios';

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [tab, setTab] = useState('ngo');
  const [loading, setLoading] = useState(true);

  const loadAll = () => {
    setLoading(true);
    Promise.all([api.get('/admin/dashboard'), api.get(`/admin/users?role=${tab}`)])
      .then(([s, u]) => {
        setStats(s.data);
        setUsers(u.data);
      })
      .finally(() => setLoading(false));
  };

  useEffect(loadAll, [tab]);

  const handleApproveNGO = async (id) => {
    await api.patch(`/admin/ngo/${id}/approve`);
    loadAll();
  };

  const handleVerifyRestaurant = async (id) => {
    await api.patch(`/admin/restaurant/${id}/verify`);
    loadAll();
  };

  return (
    <div>
      <Navbar />
      <div className="max-w-6xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Admin Dashboard</h1>

        {stats && (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
            <StatCard label="Total Donations" value={stats.totalDonations} icon="🍱" />
            <StatCard label="Total NGOs" value={stats.totalNGOs} icon="🏠" />
            <StatCard label="Restaurants" value={stats.totalRestaurants} icon="🍴" />
            <StatCard label="Active Requests" value={stats.activeRequests} icon="⏳" />
            <StatCard label="Food Saved (servings)" value={stats.foodSavedServings} icon="🌱" />
            <StatCard label="Expired" value={stats.expiredDonations} icon="⚠️" />
          </div>
        )}

        <div className="flex gap-2 mb-4">
          <TabButton active={tab === 'ngo'} onClick={() => setTab('ngo')}>
            NGOs
          </TabButton>
          <TabButton active={tab === 'restaurant'} onClick={() => setTab('restaurant')}>
            Restaurants
          </TabButton>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-500 text-left">
              <tr>
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Email</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Action</th>
              </tr>
            </thead>
            <tbody>
              {!loading &&
                users.map((u) => (
                  <tr key={u._id} className="border-t border-gray-100">
                    <td className="px-4 py-3 font-medium text-gray-900">{u.name}</td>
                    <td className="px-4 py-3 text-gray-600">{u.email}</td>
                    <td className="px-4 py-3">
                      {tab === 'ngo' ? (
                        <span className={u.isApproved ? 'text-green-600' : 'text-yellow-600'}>
                          {u.isApproved ? 'Approved' : 'Pending Approval'}
                        </span>
                      ) : (
                        <span className={u.isVerified ? 'text-green-600' : 'text-yellow-600'}>
                          {u.isVerified ? 'Verified' : 'Pending Verification'}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {tab === 'ngo' && !u.isApproved && (
                        <button
                          onClick={() => handleApproveNGO(u._id)}
                          className="bg-brand-600 hover:bg-brand-700 text-white rounded-md px-3 py-1.5 text-xs font-semibold"
                        >
                          Approve
                        </button>
                      )}
                      {tab === 'restaurant' && !u.isVerified && (
                        <button
                          onClick={() => handleVerifyRestaurant(u._id)}
                          className="bg-brand-600 hover:bg-brand-700 text-white rounded-md px-3 py-1.5 text-xs font-semibold"
                        >
                          Verify
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

const TabButton = ({ active, onClick, children }) => (
  <button
    onClick={onClick}
    className={`px-4 py-2 rounded-lg text-sm font-semibold transition ${
      active ? 'bg-brand-600 text-white' : 'bg-white border border-gray-200 text-gray-600'
    }`}
  >
    {children}
  </button>
);

export default AdminDashboard;
