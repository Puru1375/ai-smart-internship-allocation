// frontend/src/components/GovHeader.jsx
import React from 'react';

const GovHeader = () => {
  return (
    <div className="bg-white border-b border-gray-200">
      {/* Top Micro Bar */}

      {/* Main Logo Bar */}
      <div className="container mx-auto py-2 px-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          {/* Use a placeholder Embelm or actual image if you have one */}
          <img src="https://upload.wikimedia.org/wikipedia/commons/5/55/Emblem_of_India.svg" alt="Gov Emblem" className="h-16" />
          <div>
            <h1 className="text-2xl font-bold text-gov-blue uppercase tracking-wide">PM Internship Scheme</h1>
            <p className="text-sm text-gray-600 font-medium">Smart Allocation Engine (SIH 2025)</p>
          </div>
        </div>
        <div className="hidden md:flex items-center gap-6">
           <img src="https://www.sih.gov.in/img1/SIH-Logo.png" alt="SIH Logo" className="h-14" />
        </div>
      </div>
    </div>
  );
};

export default GovHeader;