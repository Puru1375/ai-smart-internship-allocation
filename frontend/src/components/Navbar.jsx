// frontend/src/components/Navbar.jsx
import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  const token = localStorage.getItem('token');
  const role = localStorage.getItem('role');

  const handleLogout = () => {
    localStorage.clear();
    navigate('/');
  };

  // Helper for active link styling
  const navLinkClass = (path) => 
    location.pathname === path 
      ? "text-gov-orange font-bold border-b-2 border-gov-orange pb-1" 
      : "text-white hover:text-gov-orange transition duration-300 pb-1";

  return (
    <nav className="bg-gov-blue text-white shadow-lg sticky top-0 z-50 border-b-4 border-gov-orange font-sans">
      <div className="container mx-auto px-6 py-4 flex justify-between items-center">
        
        {/* LOGO AREA */}
        <div className="flex items-center gap-3">
            {/* Gov Emblem Placeholder */}
            <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-black font-bold text-xs border-2 border-gov-orange">
                GOV
            </div>
            <div>
                <h1 className="text-lg font-bold leading-tight">PM INTERNSHIP SCHEME</h1>
                <p className="text-[10px] text-gray-300 tracking-wider">AI-BASED ALLOCATION ENGINE</p>
            </div>
        </div>

        {/* NAVIGATION LINKS */}
        <div className="hidden md:flex space-x-8 text-sm font-medium tracking-wide">
          
          {/* Public Links (Only if NOT logged in) */}
          {!token && (
            <>
              <Link to="/" className={navLinkClass('/')}>HOME</Link>
              <Link to="#" className={navLinkClass('/about')}>ABOUT</Link>
              <Link to="#" className={navLinkClass('/stats')}>STATISTICS</Link>
            </>
          )}

          {/* Student Links */}
          {token && role === 'student' && (
            <>
              <Link to="/student-dashboard" className={navLinkClass('/student-dashboard')}>DASHBOARD</Link>
              <Link to="#" className={navLinkClass('/applications')}>MY APPLICATIONS</Link>
              <Link to="#" className={navLinkClass('/profile')}>PROFILE</Link>
            </>
          )}

          {/* Company Links */}
          {token && role === 'company' && (
            <>
              <Link to="/company-dashboard" className={navLinkClass('/company-dashboard')}>DASHBOARD</Link>
              <Link to="#" className={navLinkClass('/post-job')}>POST JOB</Link>
            </>
          )}

           {/* Admin Links */}
           {token && role === 'admin' && (
            <>
              <Link to="/admin-dashboard" className={navLinkClass('/admin-dashboard')}>ADMIN CONSOLE</Link>
            </>
          )}
        </div>

        {/* RIGHT SIDE: AUTH BUTTONS */}
        <div className="flex items-center gap-4">
          {!token ? (
            <>
              <Link to="/login" className="text-sm font-semibold hover:text-gov-orange transition">LOGIN</Link>
              <Link to="/signup" className="bg-white text-gov-blue px-5 py-2 rounded-full text-sm font-bold hover:bg-gov-orange hover:text-white transition shadow-md">
                REGISTER
              </Link>
            </>
          ) : (
            <div className="flex items-center gap-4">
              <div className="hidden md:block text-right">
                  <span className="block text-[10px] text-gray-400 uppercase tracking-widest">Logged In As</span>
                  <span className="block text-xs font-bold text-gov-orange uppercase">{role}</span>
              </div>
              <button 
                onClick={handleLogout} 
                className="bg-red-600 hover:bg-red-700 text-white text-xs px-4 py-2 rounded shadow font-bold uppercase tracking-wider transition"
              >
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;