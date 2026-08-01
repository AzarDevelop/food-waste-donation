import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const roleHome = { restaurant: '/restaurant', ngo: '/ngo', admin: '/admin' };

const Register = () => {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    role: 'restaurant',
    phone: '',
    address: '',
    latitude: '',
    longitude: '',
    capacity: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const update = (key) => (e) => setForm({ ...form, [key]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const payload = {
        ...form,
        latitude: form.latitude ? parseFloat(form.latitude) : undefined,
        longitude: form.longitude ? parseFloat(form.longitude) : undefined,
        capacity: form.capacity ? parseInt(form.capacity, 10) : undefined,
      };
      const user = await register(payload);
      navigate(roleHome[user.role] || '/');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-brand-50 to-white px-4 py-10">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-lg border border-gray-100 p-8">
        <h1 className="text-2xl font-bold text-center text-brand-700 mb-1">Create Account</h1>
        <p className="text-center text-sm text-gray-500 mb-6">Join the food rescue network</p>

        {error && <div className="bg-red-50 text-red-600 text-sm rounded-md p-2 mb-4">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="text-sm font-medium text-gray-700">I am a</label>
            <select
              className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
              value={form.role}
              onChange={update('role')}
            >
              <option value="restaurant">Restaurant / Hotel / Bakery</option>
              <option value="ngo">NGO / Shelter</option>
              <option value="admin">Admin</option>
            </select>
          </div>

          <Field label="Full Name" value={form.name} onChange={update('name')} required />
          <Field label="Email" type="email" value={form.email} onChange={update('email')} required />
          <Field label="Password" type="password" value={form.password} onChange={update('password')} required />
          <Field label="Phone" value={form.phone} onChange={update('phone')} />
          <Field label="Address" value={form.address} onChange={update('address')} required />

          <div className="grid grid-cols-2 gap-3">
            <Field label="Latitude" type="number" step="any" value={form.latitude} onChange={update('latitude')} required />
            <Field label="Longitude" type="number" step="any" value={form.longitude} onChange={update('longitude')} required />
          </div>

          {form.role === 'ngo' && (
            <Field
              label="Daily Capacity (meals)"
              type="number"
              value={form.capacity}
              onChange={update('capacity')}
              placeholder="e.g. 50"
            />
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-brand-600 hover:bg-brand-700 text-white rounded-lg py-2.5 text-sm font-semibold transition disabled:opacity-60 mt-2"
          >
            {loading ? 'Creating account...' : 'Register'}
          </button>
        </form>

        <p className="text-center text-sm text-gray-500 mt-5">
          Already have an account?{' '}
          <Link to="/login" className="text-brand-600 font-semibold">
            Login
          </Link>
        </p>
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

export default Register;
