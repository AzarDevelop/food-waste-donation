import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const roleHome = {
  restaurant: '/restaurant',
  ngo: '/ngo',
  admin: '/admin',
};

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-10">
      <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
        <Link to={user ? roleHome[user.role] : '/'} className="flex items-center gap-2 font-bold text-brand-700">
          <span className="text-xl">🍲</span> FoodBridge
        </Link>
        {user && (
          <div className="flex items-center gap-4 text-sm">
            <span className="text-gray-600">
              {user.name} <span className="uppercase text-xs text-brand-600 font-semibold">({user.role})</span>
            </span>
            <button
              onClick={handleLogout}
              className="px-3 py-1.5 rounded-md bg-gray-100 hover:bg-gray-200 text-gray-700 transition"
            >
              Logout
            </button>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
