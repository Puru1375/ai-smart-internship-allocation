import React from 'react';
import { Link } from 'react-router-dom';

const LandingPage = () => {
  return (
    <div>
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-900 to-blue-700 text-white py-20">
        <div className="container mx-auto px-6 flex flex-col md:flex-row items-center">
          <div className="md:w-1/2 space-y-6">
            <span className="bg-gov-orange text-black px-3 py-1 text-xs font-bold uppercase rounded">SIH 2025 Problem ID: 25033</span>
            <h1 className="text-5xl font-bold leading-tight">
              AI-Driven <br/>Internship Allocation
            </h1>
            <p className="text-lg text-blue-100">
              Empowering India's Youth using Smart Automation. Fair, Transparent, and Quota-Compliant matching for the PM Internship Scheme.
            </p>
            <div className="flex gap-4">
              <Link to="/signup" className="bg-gov-orange text-black px-6 py-3 rounded-lg font-bold hover:bg-orange-500 transition shadow-lg">
                Get Started
              </Link>
              <Link to="/" className="border border-white text-white px-6 py-3 rounded-lg font-bold hover:bg-white hover:text-blue-900 transition">
                Login
              </Link>
            </div>
          </div>
          <div className="md:w-1/2 mt-10 md:mt-0 flex justify-center">
            {/* You can replace this with a real illustration */}
            <div className="w-96 h-64 bg-white/10 backdrop-blur-md rounded-xl border border-white/20 flex items-center justify-center text-center p-6 shadow-2xl">
              <div>
                <h3 className="text-3xl font-bold text-gov-orange">1 Lakh+</h3>
                <p className="text-sm mb-4">Internships Allocated</p>
                <div className="h-2 bg-gray-600 rounded-full overflow-hidden">
                    <div className="h-full bg-green-500 w-3/4"></div>
                </div>
                <p className="text-xs mt-2 text-gray-300">Real-time quota tracking</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-16 bg-white">
        <div className="container mx-auto px-6">
          <h2 className="text-3xl font-bold text-center text-gray-800 mb-12">Key Features</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { title: "Smart Matching", desc: "NLP-based resume parsing to match skills accurately.", icon: "🧠" },
              { title: "Fair Allocation", desc: "Government quota & reservation rules applied automatically.", icon: "⚖️" },
              { title: "Dashboard Analytics", desc: "Real-time insights for Ministries and Universities.", icon: "📊" }
            ].map((f, i) => (
              <div key={i} className="p-6 bg-gray-50 rounded-xl border border-gray-100 hover:shadow-lg transition">
                <div className="text-4xl mb-4">{f.icon}</div>
                <h3 className="text-xl font-bold mb-2 text-gov-blue">{f.title}</h3>
                <p className="text-gray-600">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;