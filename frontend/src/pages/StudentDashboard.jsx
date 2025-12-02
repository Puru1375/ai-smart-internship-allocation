import React, { useState, useEffect } from 'react';
import API from '../api';
import DashboardLayout from '../components/DashboardLayout';
import { jsPDF } from "jspdf";

const StudentDashboard = () => {
  const [activeTab, setActiveTab] = useState('status');
  
  // Data States
  const [file, setFile] = useState(null);
  const [skills, setSkills] = useState([]);
  const [myMatch, setMyMatch] = useState(null);
  const [gaps, setGaps] = useState([]);
  const [loading, setLoading] = useState(false);
  const [preferLocal, setPreferLocal] = useState(false);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => { fetchProfileData(); }, []);

  const fetchProfileData = async () => {
    try {
      try { const matchRes = await API.get('/allocations/my-match'); setMyMatch(matchRes.data); } catch (e) { setMyMatch(null); }
      // Mock fetching skills if we had a dedicated endpoint, for now relies on upload response
    } catch (err) {}
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) return alert("Please select a file");
    const formData = new FormData();
    formData.append('resume', file);
    setLoading(true);
    try {
      const res = await API.post('/upload-resume', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      setSkills(res.data.skills);
      alert('Resume Scanned Successfully!');
    } catch (err) { alert('Upload failed.'); } finally { setLoading(false); }
  };

  const fetchGaps = async () => {
    setLoading(true);
    try { const res = await API.get('/allocations/skill-gap'); setGaps(res.data); } catch(e){ alert("Could not analyze gaps."); } finally { setLoading(false); }
  };

  const generateResume = () => {
    const doc = new jsPDF();
    doc.setFontSize(22); doc.setTextColor(0, 51, 102); doc.text("CURRICULUM VITAE", 105, 20, null, null, "center");
    doc.setFontSize(14); doc.setTextColor(0,0,0); doc.text("Generated via PM Internship Portal", 105, 30, null, null, "center");
    doc.text(`Skills: ${skills.join(", ") || "Not updated"}`, 20, 50);
    doc.save("Gov_Resume.pdf");
  };

  const menu = [
      { id: 'status', label: 'Application Status', icon: '📊' },
      { id: 'profile', label: 'Resume & Profile', icon: '👤' },
      { id: 'analysis', label: 'Skill Gap Analysis', icon: '📉' },
  ];

  const renderContent = () => {
    switch(activeTab) {
      case 'status':
        return (
          <div className="space-y-8">
             {/* TIMELINE */}
             <div className="bg-white p-6 rounded-xl shadow border-t-4 border-gov-green">
                <h3 className="font-bold text-gray-700 mb-6">Live Tracker</h3>
                <div className="relative flex items-center justify-between">
                    <div className="absolute left-0 top-1/2 w-full h-1 bg-gray-200 -z-0"></div>
                    {[{ label: "Registered", active: true }, { label: "Resume Verified", active: skills.length > 0 }, { label: "In Pool", active: true }, { label: "Allocated", active: !!myMatch }, { label: "Accepted", active: myMatch?.status === 'hired' }].map((step, i) => (
                        <div key={i} className="flex flex-col items-center bg-white z-10 px-2">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-white ${step.active ? 'bg-gov-green scale-110' : 'bg-gray-300'}`}>{step.active ? '✓' : i + 1}</div>
                            <span className={`text-xs mt-2 font-bold ${step.active ? 'text-gov-green' : 'text-gray-400'}`}>{step.label}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* MATCH RESULT */}
            <div className="bg-white p-8 rounded-xl shadow border-t-4 border-gov-orange">
                {!myMatch ? (
                    <div className="bg-yellow-50 border-l-4 border-yellow-400 p-6">
                        <h4 className="text-lg font-bold text-yellow-800">⏳ Pending Allocation</h4>
                        <p className="text-sm text-yellow-700 mt-2">You are in the candidate pool. The AI is scanning for the best match.</p>
                        <button onClick={() => setActiveTab('analysis')} className="mt-4 text-sm underline text-yellow-800 font-bold">Check Skill Gaps →</button>
                    </div>
                ) : (
                    <div>
                        <div className="flex justify-between">
                            <div>
                                <h4 className="text-2xl font-bold text-gray-800">{myMatch.job_title}</h4>
                                <p className="text-gray-600">at <span className="font-semibold">{myMatch.company_name}</span></p>
                                <p className="text-sm text-gray-400 mt-1">📍 {myMatch.location}</p>
                            </div>
                            <span className="bg-green-100 text-green-800 px-4 py-1 h-fit rounded-full text-sm font-bold">{Math.round(myMatch.match_score)}% Match</span>
                        </div>
                        <div className="bg-blue-50 p-4 rounded mt-4 border border-blue-100">
                             <p className="text-sm font-bold text-blue-800 mb-2">💡 Why AI selected this:</p>
                             <div className="flex gap-2 flex-wrap">
                                {(() => {
                                    let reasons = [];
                                    try { reasons = typeof myMatch.match_reason === 'string' ? JSON.parse(myMatch.match_reason) : myMatch.match_reason; } catch(e) {}
                                    return reasons.map((r, i) => <span key={i} className="bg-white text-blue-600 px-2 py-1 rounded text-xs border border-blue-200 font-bold">{r}</span>)
                                })()}
                             </div>
                        </div>
                        <button onClick={()=>setShowModal(true)} className="mt-4 bg-gov-blue text-white px-6 py-2 rounded font-bold shadow hover:bg-blue-900">View Offer Details</button>
                    </div>
                )}
            </div>

             {/* MODAL */}
             {showModal && myMatch && (
                <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
                    <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full overflow-hidden">
                        <div className="bg-gov-blue text-white p-6"><h2 className="text-2xl font-bold">{myMatch.job_title}</h2></div>
                        <div className="p-6 text-gray-700 space-y-2">
                            <p><strong>Company:</strong> {myMatch.company_name}</p>
                            <p><strong>Stipend:</strong> ₹15,000 / Month</p>
                            <p className="bg-gray-50 p-3 rounded text-sm mt-4">Automated allocation based on skill profile.</p>
                        </div>
                        <div className="p-6 bg-gray-50 flex justify-end gap-3 border-t">
                            <button onClick={()=>setShowModal(false)} className="px-5 py-2 border rounded font-bold">Close</button>
                            <button className="px-5 py-2 bg-gov-green text-white rounded font-bold">Accept</button>
                        </div>
                    </div>
                </div>
            )}
          </div>
        );

      case 'profile':
        return (
          <div className="grid md:grid-cols-2 gap-8">
             <div className="bg-white p-6 rounded shadow border-t-4 border-gov-blue">
                 <h3 className="font-bold mb-4">📄 Resume Upload</h3>
                 <div className="border-2 border-dashed border-gray-300 bg-gray-50 rounded p-6 text-center cursor-pointer relative">
                    <input type="file" accept="application/pdf" onChange={e => setFile(e.target.files[0])} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                    <span className="text-2xl">📂</span>
                    <p className="font-bold text-gray-600 mt-2">{file ? file.name : "Click to Upload PDF"}</p>
                 </div>
                 <button onClick={handleUpload} disabled={loading} className="w-full mt-4 bg-gov-blue text-white py-2 rounded font-bold">
                    {loading ? "Scanning..." : "Scan Resume"}
                 </button>
                 <div className="mt-4 text-center">
                    <button onClick={generateResume} className="text-xs text-gov-orange underline font-bold">Generate Digital Resume</button>
                 </div>
             </div>

             <div className="bg-white p-6 rounded shadow border-t-4 border-gov-orange">
                 <h3 className="font-bold mb-4">Detected Skills</h3>
                 <div className="flex flex-wrap gap-2 mb-6">
                     {skills.length > 0 ? skills.map((s, i) => <span key={i} className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-xs font-bold">{s}</span>) : <p className="text-gray-400 italic text-sm">No skills yet.</p>}
                 </div>
                 <div className="pt-4 border-t">
                     <label className="flex items-center space-x-3 cursor-pointer">
                        <input type="checkbox" checked={preferLocal} onChange={e => setPreferLocal(e.target.checked)} className="w-4 h-4" />
                        <span className="text-sm font-bold text-gray-700">Restrict to Home District</span>
                     </label>
                 </div>
             </div>
          </div>
        );

      case 'analysis':
        return (
           <div className="bg-white p-8 rounded shadow border-t-4 border-red-500">
               <div className="flex justify-between items-center mb-6">
                   <div>
                       <h3 className="text-xl font-bold text-gray-800">📉 AI Skill Gap Analysis</h3>
                       <p className="text-sm text-gray-500">Analysis based on 500+ open government internships.</p>
                   </div>
                   <button onClick={fetchGaps} disabled={loading} className="bg-red-50 text-red-600 border border-red-200 px-4 py-2 rounded font-bold hover:bg-red-100">
                       {loading ? "Analyzing..." : "Run Analysis"}
                   </button>
               </div>

               {gaps.length === 0 ? (
                   <p className="text-center text-gray-400 py-10">Click 'Run Analysis' to see what skills you are missing.</p>
               ) : (
                   <div className="grid md:grid-cols-3 gap-4">
                       {gaps.map((gap, i) => (
                           <div key={i} className="border p-4 rounded hover:shadow-lg transition bg-gray-50">
                               <span className="block font-bold text-2xl text-red-600 mb-1">{gap.skill}</span>
                               <span className="bg-red-100 text-red-800 text-[10px] px-2 py-1 rounded uppercase font-bold">High Demand</span>
                               <p className="text-xs text-gray-500 mt-3">You missed <strong>{gap.missed_opportunities}</strong> opportunities because of this.</p>
                           </div>
                       ))}
                   </div>
               )}
           </div>
        );

      default: return null;
    }
  };

  return (
    <DashboardLayout title="Student Portal" role="Student" menuItems={menu} activeTab={activeTab} setActiveTab={setActiveTab}>
        {renderContent()}
    </DashboardLayout>
  );
};

export default StudentDashboard;