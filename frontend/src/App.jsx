// frontend/src/App.jsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout'; 

// Pages
import LandingPage from './pages/LandingPage';
import Login from './pages/Login';
import Signup from './pages/Signup';
import StudentDashboard from './pages/StudentDashboard';
import CompanyDashboard from './pages/CompanyDashboard';
import AdminDashboard from './pages/AdminDashboard';

function App() {
  return (
    <Router>
      <Routes>
        {/* --- PUBLIC PAGES (Use Top Navbar & Footer) --- */}
        <Route path="/" element={<Layout><LandingPage /></Layout>} />
        <Route path="/login" element={<Layout><Login /></Layout>} />
        <Route path="/signup" element={<Layout><Signup /></Layout>} />

        {/* --- DASHBOARDS (Use Sidebar Layout ONLY) --- */}
        {/* We do NOT wrap these in <Layout> because they have their own DashboardLayout */}
        <Route path="/student-dashboard" element={<StudentDashboard />} />
        <Route path="/company-dashboard" element={<CompanyDashboard />} />
        <Route path="/admin-dashboard" element={<AdminDashboard />} />
      </Routes>
    </Router>
  );
}

export default App;