// frontend/src/components/DashboardLayout.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import GovHeader from './GovHeader';
import Footer from './Footer';

const DashboardLayout = ({ title, role, menuItems, activeTab, setActiveTab, children }) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.clear();
    navigate('/');
  };

  return (
    <div className="flex flex-col h-screen bg-gray-50 font-sans overflow-hidden">
      
      {/* 1. TOP HEADER (Fixed at Top) */}
      <div className="z-20 shadow-sm relative">
        <GovHeader />
      </div>

      {/* 2. MAIN WORKSPACE (Sidebar + Scrollable Content) */}
      <div className="flex flex-1 overflow-hidden relative">
        
        {/* SIDEBAR (Fixed Left, Full Height) */}
        <aside className="w-58 bg-gov-blue text-white flex flex-col shadow-2xl z-10 h-full">
          
          {/* Sidebar Title */}
          <div className="p-6 bg-blue-900 border-b border-blue-800">
            <h2 className="text-lg font-bold tracking-wide text-white">DASHBOARD</h2>
            <div className="flex items-center gap-2 mt-2">
                <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></span>
                <span className="text-[10px] text-blue-200 uppercase font-bold tracking-widest">{role} Portal</span>
            </div>
          </div>

          {/* Menu Items */}
          <nav className="flex-1 py-4 space-y-1 overflow-y-auto custom-scrollbar">
            {menuItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full text-left px-4 py-2.5 flex items-center transition-all duration-200 border-l-4 ${
                  activeTab === item.id 
                    ? 'bg-blue-800 border-gov-orange text-white font-bold shadow-inner' 
                    : 'border-transparent text-blue-100 hover:bg-blue-800 hover:text-white'
                }`}
              >
                <span className="mr-3 text-xl">{item.icon}</span>
                <span className="text-sm tracking-wide">{item.label}</span>
              </button>
            ))}
          </nav>

          {/* Logout Button (Fixed at Bottom of Sidebar) */}
          <div className="p-4 border-t border-blue-800 bg-gov-blue">
            <button 
                onClick={handleLogout}
                className="w-full flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white py-2 rounded-md shadow-md text-xs font-bold uppercase tracking-wider transition transform active:scale-95"
            >
                <span>🚪</span> Logout
            </button>
          </div>
        </aside>

        {/* MAIN CONTENT (Scrollable Area) */}
        <main className="flex-1 flex flex-col h-full overflow-y-auto bg-gray-50 relative w-full">
            
            {/* Title Bar - FIXED Z-INDEX HERE (Changed from z-10 to z-40) */}
            <div className="bg-white border-b px-8 py-2 flex justify-between items-center sticky top-0 z-40 shadow-sm">
                <div>
                    <h1 className="text-xl font-bold text-gray-800">{menuItems.find(m => m.id === activeTab)?.label}</h1>
                    <p className="text-xs text-gray-500 mt-1">Manage your activities and view reports.</p>
                </div>
                <div className="text-right hidden md:block">
                    <p className="text-[10px] text-gray-400 uppercase font-bold">System Date</p>
                    <p className="text-sm font-bold text-gov-blue">{new Date().toLocaleDateString()}</p>
                </div>
            </div>

            {/* Dynamic Content */}
            <div className="p-8 flex-1">
                <div className="animate-fade-in-up max-w-6xl mx-auto">
                    {children}
                </div>
            </div>

            {/* Footer (Scrolls with content) */}
            <div className="mt-auto">
               <Footer />
            </div>

        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;