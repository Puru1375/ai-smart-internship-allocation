import React, { useState, useEffect } from 'react';
import API from '../api';

const CompanyDashboard = () => {
  const [jobs, setJobs] = useState([]);
  const [formData, setFormData] = useState({ title: '', description: '', skills: '', capacity: 1, location: 'Remote' });

  useEffect(() => { fetchJobs(); }, []);
  const fetchJobs = async () => { try { const res = await API.get('/internships/my-internships'); setJobs(res.data); } catch (e) {} };

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });
  const handleSubmit = async (e) => {
    e.preventDefault();
    try { await API.post('/internships', formData); alert('Posted!'); setFormData({ title: '', description: '', skills: '', capacity: 1, location: 'Remote' }); fetchJobs(); } catch (e) { alert('Error'); }
  };

  return (
    <div className="container mx-auto px-6 py-10">
      <h2 className="text-3xl font-bold text-gray-800 mb-8">🏢 Industry Partner Dashboard</h2>
      
      <div className="grid lg:grid-cols-3 gap-8">
        {/* Post Job Form */}
        <div className="lg:col-span-1 bg-white p-6 rounded-xl shadow-lg border-t-4 border-gov-orange h-fit">
          <h3 className="text-xl font-bold text-gov-orange mb-6 border-b pb-2">Post New Requirement</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-sm font-semibold text-gray-700">Role Title</label>
              <input name="title" value={formData.title} onChange={handleChange} className="w-full border p-2 rounded focus:ring-2 focus:ring-orange-200 outline-none" placeholder="e.g. Python Intern" required />
            </div>
            <div>
              <label className="text-sm font-semibold text-gray-700">Required Skills</label>
              <input name="skills" value={formData.skills} onChange={handleChange} className="w-full border p-2 rounded focus:ring-2 focus:ring-orange-200 outline-none" placeholder="Python, SQL (Comma separated)" required />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-semibold text-gray-700">Capacity</label>
                <input type="number" name="capacity" value={formData.capacity} onChange={handleChange} className="w-full border p-2 rounded focus:ring-2 focus:ring-orange-200 outline-none" required />
              </div>
              <div>
                <label className="text-sm font-semibold text-gray-700">Location</label>
                <input name="location" value={formData.location} onChange={handleChange} className="w-full border p-2 rounded focus:ring-2 focus:ring-orange-200 outline-none" required />
              </div>
            </div>
            <button type="submit" className="w-full bg-gov-orange text-white py-2 rounded font-bold hover:bg-orange-600 transition shadow">Post Opportunity</button>
          </form>
        </div>

        {/* Job List */}
        <div className="lg:col-span-2">
          <h3 className="text-xl font-bold text-gray-700 mb-4">Active Listings</h3>
          {jobs.length === 0 ? <p className="text-gray-500 italic">No active listings.</p> : (
            <div className="grid md:grid-cols-2 gap-4">
              {jobs.map((job) => (
                <div key={job.id} className="bg-white p-6 rounded-lg shadow-md border-l-4 border-gov-blue hover:shadow-xl transition">
                  <h4 className="font-bold text-lg text-gov-blue">{job.title}</h4>
                  <p className="text-xs text-gray-400 mb-3">{new Date().toLocaleDateString()}</p>
                  <div className="space-y-2 text-sm text-gray-600">
                    <p><strong>Skills:</strong> {Array.isArray(job.required_skills) ? job.required_skills.join(', ') : job.required_skills}</p>
                    <div className="flex justify-between items-center mt-4">
                      <span className="bg-gray-100 px-2 py-1 rounded">📍 {job.location}</span>
                      <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded font-bold">Slots: {job.capacity}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CompanyDashboard;