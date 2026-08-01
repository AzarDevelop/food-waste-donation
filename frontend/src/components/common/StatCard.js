import React from 'react';

const StatCard = ({ label, value, icon, accent = 'brand' }) => (
  <div className="bg-white rounded-xl border border-gray-200 p-5 flex items-center gap-4 shadow-sm">
    <div className={`w-11 h-11 rounded-lg bg-${accent}-100 text-${accent}-700 flex items-center justify-center text-xl`}>
      {icon}
    </div>
    <div>
      <p className="text-2xl font-bold text-gray-900">{value}</p>
      <p className="text-sm text-gray-500">{label}</p>
    </div>
  </div>
);

export default StatCard;
