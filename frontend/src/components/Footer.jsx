// frontend/src/components/Footer.jsx
import React from 'react';

const Footer = () => {
  return (
    <footer className="bg-gov-dark text-white pt-10 pb-4 mt-auto">
      <div className="container mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-8 text-sm">
        <div>
          <h3 className="font-bold text-lg mb-4 text-gov-orange">PM Internship Scheme</h3>
          <p className="text-gray-400">
            Bridging the gap between academic learning and industry requirements through AI-driven allocation.
          </p>
        </div>
        <div>
          <h4 className="font-bold mb-3">Quick Links</h4>
          <ul className="space-y-2 text-gray-400">
            <li><a href="#" className="hover:text-white">Ministry of Education</a></li>
            <li><a href="#" className="hover:text-white">AICTE Portal</a></li>
            <li><a href="#" className="hover:text-white">NATS 2.0</a></li>
          </ul>
        </div>
        <div>
          <h4 className="font-bold mb-3">Support</h4>
          <ul className="space-y-2 text-gray-400">
            <li>User Manual</li>
            <li>FAQs</li>
            <li>Raise a Ticket</li>
          </ul>
        </div>
        <div>
          <h4 className="font-bold mb-3">Contact</h4>
          <p className="text-gray-400">New Delhi, India</p>
          <p className="text-gray-400">Email: helpdesk@sih.gov.in</p>
          <p className="text-gray-400">Toll Free: 1800-111-222</p>
        </div>
      </div>
      <div className="border-t border-gray-700 mt-8 pt-4 text-center text-xs text-gray-500">
        © 2025 Tech Tonic Team (SIH 25033). All Rights Reserved.
      </div>
    </footer>
  );
};

export default Footer;