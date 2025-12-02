// frontend/src/pages/Login.jsx
import React, { useState } from 'react';
import API from '../api';
import { useNavigate, Link } from 'react-router-dom';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await API.post('/auth/login', { email, password });
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('role', res.data.role);
      
      if(res.data.role === 'student') navigate('/student-dashboard');
      else if(res.data.role === 'company') navigate('/company-dashboard');
      else navigate('/admin-dashboard');

    } catch (err) {
      alert('Login Failed: ' + (err.response?.data?.error || 'Error'));
    }
  };

  return (
    <div className="flex justify-center items-center min-h-[80vh]">
      <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md border-t-4 border-gov-blue">
        <h2 className="text-2xl font-bold text-center mb-6 text-gray-800">Login to Portal</h2>
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Email Address</label>
            <input 
              type="email" 
              className="mt-1 w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-gov-blue focus:outline-none"
              value={email} onChange={(e) => setEmail(e.target.value)} required 
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Password</label>
            <input 
              type="password" 
              className="mt-1 w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-gov-blue focus:outline-none"
              value={password} onChange={(e) => setPassword(e.target.value)} required 
            />
          </div>
          <button type="submit" className="w-full bg-gov-blue text-white py-2 rounded-md font-bold hover:bg-blue-900 transition">
            Login
          </button>
        </form>
        <p className="mt-4 text-center text-sm">
          Don't have an account? <Link to="/signup" className="text-gov-orange font-bold hover:underline">Register here</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;