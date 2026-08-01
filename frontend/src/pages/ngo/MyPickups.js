import React, { useEffect, useState } from 'react';
import Navbar from '../../components/common/Navbar';
import Badge from '../../components/common/Badge';
import api from '../../api/axios';

const MyPickups = () => {
  const [pickups, setPickups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [completingId, setCompletingId] = useState(null);

  const load = () => {
    setLoading(true);
    api
      .get('/pickup/mine')
      .then((res) => setPickups(res.data))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const handleComplete = async (id) => {
    setCompletingId(id);
    try {
      await api.patch(`/pickup/${id}/complete`);
      load();
    } finally {
      setCompletingId(null);
    }
  };

  return (
    <div>
      <Navbar />
      <div className="max-w-5xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">My Pickups</h1>

        {loading ? (
          <p className="text-gray-500 text-sm">Loading...</p>
        ) : pickups.length === 0 ? (
          <p className="text-gray-500 text-sm">No accepted pickups yet.</p>
        ) : (
          <div className="space-y-3">
            {pickups.map((p) => (
              <div key={p._id} className="bg-white rounded-xl border border-gray-200 p-4 flex items-center justify-between">
                <div>
                  <p className="font-semibold text-gray-900">{p.foodId?.foodName}</p>
                  <p className="text-sm text-gray-500">{p.foodId?.location?.address}</p>
                  <p className="text-xs text-gray-400 mt-1">Accepted: {new Date(p.acceptedTime).toLocaleString()}</p>
                </div>
                <div className="flex items-center gap-3">
                  <Badge text={p.status} />
                  {p.status === 'Accepted' && (
                    <button
                      onClick={() => handleComplete(p._id)}
                      disabled={completingId === p._id}
                      className="bg-brand-600 hover:bg-brand-700 text-white rounded-lg px-3 py-1.5 text-xs font-semibold transition disabled:opacity-60"
                    >
                      {completingId === p._id ? 'Updating...' : 'Mark Picked Up'}
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyPickups;
