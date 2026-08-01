import React from 'react';

const COLORS = {
  Safe: 'bg-green-100 text-green-700',
  Moderate: 'bg-yellow-100 text-yellow-700',
  Risky: 'bg-orange-100 text-orange-700',
  Expired: 'bg-red-100 text-red-700',
  Available: 'bg-blue-100 text-blue-700',
  Accepted: 'bg-purple-100 text-purple-700',
  PickedUp: 'bg-green-100 text-green-700',
  Cancelled: 'bg-gray-100 text-gray-600',
  Pending: 'bg-yellow-100 text-yellow-700',
};

const Badge = ({ text }) => (
  <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${COLORS[text] || 'bg-gray-100 text-gray-600'}`}>
    {text}
  </span>
);

export default Badge;
