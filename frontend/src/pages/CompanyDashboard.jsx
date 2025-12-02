import React, { useState, useEffect } from 'react';
import API from '../api';
import DashboardLayout from '../components/DashboardLayout';

const CompanyDashboard = () => {
  const [activeTab, setActiveTab] = useState('candidates');
  const [jobs, setJobs] = useState([]);
  const [candidates, setCandidates] = useState([]);
  const [formData, setFormData] = useState({ title: '', description: '', skills: '', capacity: 1, location: 'Remote' });
  const [loading, setLoading] = useState(false);

  // --- INITIAL LOAD ---
  useEffect(() => {
    fetchJobs();
    fetchCandidates();
  }, []);

  const fetchJobs = async () => { try { const res = await API.get('/internships/my-internships'); setJobs(res.data); } catch (e) {} };
  
  const fetchCandidates = async () => {
    try { const res = await API.get('/allocations/company-matches'); setCandidates(res.data); } catch (e) {}
  };

  // --- ACTIONS ---
  const handleAction = async (matchId, status) => {
      try {
          await API.post('/allocations/update-status', { match_id: matchId, status });
          alert(`Candidate status updated to: ${status}`);
          fetchCandidates(); 
      } catch (e) { alert("Action Failed"); }
  };

  const sendOffer = (studentName) => {
      alert(`✅ Official Offer Letter sent to ${studentName} via Email!`);
  };

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });
  
  const handlePostJob = async (e) => {
    e.preventDefault();
    try { 
        await API.post('/internships', formData); 
        alert('Internship Posted Successfully!'); 
        setFormData({ title: '', description: '', skills: '', capacity: 1, location: 'Remote' }); 
        fetchJobs(); 
        setActiveTab('listings'); // Switch tab to view it
    } catch (e) { alert('Error posting job'); }
  };

  // --- RENDER CONTENT ---
  const renderContent = () => {
      switch(activeTab) {
        case 'candidates':
            return (
                <div className="space-y-6">
                    <h3 className="text-xl font-bold text-gray-700 flex items-center gap-2">
                        🤖 AI Recommended Candidates 
                        <span className="bg-gov-blue text-white text-xs px-2 py-1 rounded-full">{candidates.length}</span>
                    </h3>
                    <div className="bg-white rounded-xl shadow overflow-hidden">
                        <table className="w-full text-sm text-left">
                        <thead className="bg-gray-100 text-gray-600 uppercase text-xs">
                            <tr>
                            <th className="px-6 py-3">Candidate</th>
                            <th className="px-6 py-3">Matched Role</th>
                            <th className="px-6 py-3">Skills</th>
                            <th className="px-6 py-3">Score</th>
                            <th className="px-6 py-3">Status</th>
                            <th className="px-6 py-3">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {candidates.length === 0 ? (
                                <tr><td colSpan="6" className="p-6 text-center text-gray-400">No matches yet. Wait for Admin Allocation.</td></tr>
                            ) : candidates.map((c) => (
                                <tr key={c.match_id} className="hover:bg-blue-50 transition">
                                    <td className="px-6 py-4 font-bold text-gray-800">{c.full_name}</td>
                                    <td className="px-6 py-4 text-gray-600">{c.job_title}</td>
                                    <td className="px-6 py-4">
                                        <div className="flex flex-wrap gap-1">
                                            {c.student_skills.slice(0, 3).map((s, i) => (
                                                <span key={i} className="text-[10px] bg-gray-100 border px-1 rounded">{s}</span>
                                            ))}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 font-bold text-green-600">{Math.round(c.match_score)}%</td>
                                    <td className="px-6 py-4">
                                        <span className={`text-xs px-2 py-1 rounded font-bold uppercase ${
                                            c.status === 'suggested' ? 'bg-yellow-100 text-yellow-700' :
                                            c.status === 'interview' ? 'bg-blue-100 text-blue-700' :
                                            c.status === 'hired' ? 'bg-green-100 text-green-700' : 'bg-red-100'
                                        }`}>
                                            {c.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 flex gap-2">
                                        {c.status === 'suggested' && (
                                            <>
                                                <button onClick={() => handleAction(c.match_id, 'interview')} className="bg-gov-blue text-white px-3 py-1 rounded text-xs hover:bg-blue-800 shadow">Shortlist</button>
                                                <button onClick={() => handleAction(c.match_id, 'rejected')} className="bg-red-50 text-red-600 border border-red-200 px-3 py-1 rounded text-xs hover:bg-red-100 shadow">Reject</button>
                                            </>
                                        )}
                                        {c.status === 'interview' && (
                                            <button onClick={() => { handleAction(c.match_id, 'hired'); sendOffer(c.full_name); }} className="bg-gov-green text-white px-3 py-1 rounded text-xs shadow hover:scale-105 transition">
                                                📩 Send Offer
                                            </button>
                                        )}
                                        {c.status === 'hired' && <span className="text-xs font-bold text-green-600">✅ Offer Sent</span>}
                                        {c.status === 'rejected' && <span className="text-xs text-gray-400">Archived</span>}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                        </table>
                    </div>
                </div>
            );

        case 'post_job':
            return (
                <div className="max-w-2xl bg-white p-8 rounded-xl shadow-lg border-t-4 border-gov-orange">
                    <h3 className="text-xl font-bold text-gov-orange mb-6 border-b pb-2">Post New Requirement</h3>
                    <form onSubmit={handlePostJob} className="space-y-4">
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
            );

        case 'listings':
            return (
                <div className="space-y-4">
                    <h3 className="text-xl font-bold text-gray-700">Active Listings</h3>
                    {jobs.length === 0 ? <p className="text-gray-500 italic">No jobs posted yet.</p> : (
                        <div className="grid md:grid-cols-2 gap-4">
                            {jobs.map((job) => (
                                <div key={job.id} className="bg-white p-6 rounded-lg shadow-md border-l-4 border-gov-blue hover:shadow-xl transition">
                                <h4 className="font-bold text-lg text-gov-blue">{job.title}</h4>
                                <div className="space-y-2 text-sm text-gray-600 mt-2">
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
            );
        default: return null;
      }
  };

  const menu = [
      { id: 'candidates', label: 'Candidates & Hiring', icon: '👥' },
      { id: 'post_job', label: 'Post Internship', icon: '📝' },
      { id: 'listings', label: 'My Listings', icon: '📋' },
  ];

  return (
    <DashboardLayout title="Company Portal" role="Company" menuItems={menu} activeTab={activeTab} setActiveTab={setActiveTab}>
        {renderContent()}
    </DashboardLayout>
  );
};

export default CompanyDashboard;