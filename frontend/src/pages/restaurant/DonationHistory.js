import React, { useEffect, useState } from 'react';
import Navbar from '../../components/common/Navbar';
import Badge from '../../components/common/Badge';
import api from '../../api/axios';

const DonationHistory = () => {
  const [donations, setDonations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get('/food/mine')
      .then((res) => setDonations(res.data))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <Navbar />
      <div className="max-w-5xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Donation History</h1>

        {loading ? (
          <p className="text-gray-500 text-sm">Loading...</p>
        ) : (
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-gray-500 text-left">
                <tr>
                  <th className="px-4 py-3">Food</th>
                  <th className="px-4 py-3">Quantity</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Risk</th>
                  <th className="px-4 py-3">Uploaded</th>
                </tr>
              </thead>
              <tbody>
                {donations.map((d) => (
                  <tr key={d._id} className="border-t border-gray-100">
                    <td className="px-4 py-3 font-medium text-gray-900">{d.foodName}</td>
                    <td className="px-4 py-3 text-gray-600">{d.quantity} servings</td>
                    <td className="px-4 py-3">
                      <Badge text={d.status} />
                    </td>
                    <td className="px-4 py-3">
                      <Badge text={d.riskLevel} />
                    </td>
                    <td className="px-4 py-3 text-gray-500">{new Date(d.createdAt).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default DonationHistory;
