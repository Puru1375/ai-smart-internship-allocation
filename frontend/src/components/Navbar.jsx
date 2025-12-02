import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  const token = localStorage.getItem('token');
  const role = localStorage.getItem('role');

  const handleLogout = () => {
    // Clear data
    localStorage.clear();
    // Redirect home
    navigate('/');
  };

  // Helper to check if link is active
  const isActive = (path) => location.pathname === path ? "text-gov-orange font-bold border-b-2 border-gov-orange" : "hover:text-gov-orange transition duration-300";

  return (
    <nav className="bg-gov-blue text-white shadow-lg sticky top-0 z-50 border-b-4 border-gov-orange">
      <div className="container mx-auto px-6 py-4 flex flex-wrap justify-between items-center">
        
        {/* --- LEFT SIDE: DYNAMIC LINKS --- */}
        <div className="hidden md:flex space-x-8 font-medium text-sm tracking-wide items-center">
          
          {/* SCENARIO A: NOT LOGGED IN (Public Links) */}
          {!token && (
            <>
              <Link to="/" className={isActive('/')}>HOME</Link>
              <Link to="#" className="hover:text-gov-orange transition duration-300">ABOUT SCHEME</Link>
              <Link to="#" className="hover:text-gov-orange transition duration-300">STATISTICS</Link>
              <Link to="#" className="hover:text-gov-orange transition duration-300">CONTACT US</Link>
            </>
          )}

          {/* SCENARIO B: LOGGED IN (Dashboard Links) */}
          {token && (
            <>
              {/* Common Link for all logged in users */}
              <span className="font-bold text-gray-300">|</span>
              
              {/* Student Links */}
              {role === 'student' && (
                <>
                  <Link to="/student-dashboard" className={isActive('/student-dashboard')}>MY DASHBOARD</Link>
                  <Link to="#" className="hover:text-gov-orange transition">MY APPLICATIONS</Link>
                </>
              )}

              {/* Company Links */}
              {role === 'company' && (
                <>
                  <Link to="/company-dashboard" className={isActive('/company-dashboard')}>COMPANY DASHBOARD</Link>
                  <Link to="#" className="hover:text-gov-orange transition">POST NEW JOB</Link>
                </>
              )}

              {/* Admin Links */}
              {role === 'admin' && (
                <>
                  <Link to="/admin-dashboard" className={isActive('/admin-dashboard')}>ADMIN CONSOLE</Link>
                  <Link to="#" className="hover:text-gov-orange transition">REPORTS</Link>
                </>
              )}
            </>
          )}
        </div>

        {/* --- MOBILE TITLE (Visible only on small screens) --- */}
        <div className="md:hidden">
          <span className="font-bold">PM INTERNSHIP SCHEME</span>
        </div>

        {/* --- RIGHT SIDE: AUTH BUTTONS --- */}
        <div className="flex items-center gap-4">
          {!token ? (
            /* SHOW LOGIN/REGISTER IF NOT LOGGED IN */
            <>
              <Link to="/login" className="text-sm font-semibold hover:text-gov-orange transition whitespace-nowrap">
                LOGIN
              </Link>
              <Link to="/signup" className="bg-white text-gov-blue px-5 py-2 rounded-full text-sm font-bold hover:bg-gov-orange hover:text-white transition shadow-md border-2 border-transparent whitespace-nowrap">
                REGISTER
              </Link>
            </>
          ) : (
            /* SHOW PROFILE/LOGOUT IF LOGGED IN */
            <div className="flex items-center gap-4">
              <div className="hidden md:flex flex-col items-end leading-tight">
                 <span className="text-[10px] text-gray-300 uppercase tracking-widest">Logged In As</span>
                 <span className="text-sm font-bold text-gov-orange uppercase">{role}</span>
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