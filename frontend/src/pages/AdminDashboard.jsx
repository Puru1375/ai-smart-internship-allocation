import React, { useState, useEffect } from 'react';
import API from '../api';
import DashboardLayout from '../components/DashboardLayout';
import { jsPDF } from "jspdf";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Pie } from 'react-chartjs-2';

ChartJS.register(ArcElement, Tooltip, Legend);

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('engine');
  const [matches, setMatches] = useState([]);
  const [stats, setStats] = useState(null);
  const [logs, setLogs] = useState([]);
  const [quota, setQuota] = useState(0);
  const [loading, setLoading] = useState(false);
  
  // Mock Data for Verification (Since we didn't build full backend for this part)
  const [users, setUsers] = useState([
    { id: 101, name: "Rahul Kumar", role: "student", is_verified: false, document: "ID_Card.pdf" },
    { id: 102, name: "Tech Solutions Ltd", role: "company", is_verified: false, document: "Reg_Cert.pdf" },
    { id: 103, name: "Priya Singh", role: "student", is_verified: true, document: "ID_Card.pdf" }
  ]);

  useEffect(() => {
    fetchData();
  }, []);

  const downloadCSV = () => {
    window.open('http://localhost:5000/allocations/export-csv', '_blank');
};

  const fetchData = async () => {
    try {
      const resultsRes = await API.get('/allocations/results');
      const statsRes = await API.get('/allocations/stats');
      const logsRes = await API.get('/allocations/audit-logs');
      setMatches(resultsRes.data);
      setStats(statsRes.data);
      setLogs(logsRes.data);
    } catch (e) {}
  };

  const runAllocation = async () => {
    setLoading(true);
    try { 
      await API.post('/allocations/run', { quotaPercent: quota }); 
      alert("Optimization Complete!"); 
      fetchData(); 
    } catch (e) { alert("Failed"); } finally { setLoading(false); }
  };

  const verifyUser = (id) => {
    setUsers(users.map(u => u.id === id ? { ...u, is_verified: true } : u));
    alert("User Verified Successfully ✅");
  };

  const issueCertificate = (studentName, companyName) => {
    const doc = new jsPDF({ orientation: "landscape" });
    doc.setFontSize(30); doc.setTextColor(0, 51, 102);
    doc.text("CERTIFICATE OF INTERNSHIP", 148, 50, null, null, "center");
    doc.setFontSize(16); doc.setTextColor(0,0,0);
    doc.text("This is to certify that", 148, 80, null, null, "center");
    doc.setFontSize(24); doc.setFont("helvetica", "bold");
    doc.text(studentName, 148, 95, null, null, "center");
    doc.setFont("helvetica", "normal"); doc.setFontSize(16);
    doc.text(`Has successfully completed the internship allocation via PM Scheme`, 148, 115, null, null, "center");
    doc.text(`at ${companyName}`, 148, 125, null, null, "center");
    doc.save(`${studentName}_Certificate.pdf`);
    alert("Certificate Downloaded!");
  };

  const pieData = stats ? {
    labels: stats.categories.map(c => c.social_category || 'General'),
    datasets: [{ data: stats.categories.map(c => c.count), backgroundColor: ['#003366', '#FF9933', '#138808', '#6c757d'] }]
  } : { labels: [], datasets: [] };

  const renderContent = () => {
    switch(activeTab) {
      case 'engine':
        return (
          <div className="grid md:grid-cols-3 gap-6">
             {/* LEFT: CONTROLS */}
             <div className="md:col-span-2 space-y-6">
                <div className="bg-white p-6 rounded shadow border-t-4 border-gov-orange">
                    <h3 className="font-bold mb-4">Fairness Policy Slider</h3>
                    <p className="text-sm text-gray-500 mb-4">Set Minimum Reservation Quota for Rural/SC/ST students.</p>
                    <div className="flex items-center gap-4">
                        <input type="range" className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-gov-orange" 
                               value={quota} onChange={e=>setQuota(e.target.value)} max="50"/>
                        <span className="font-bold">{quota}%</span>
                    </div>
                    <button onClick={runAllocation} disabled={loading} className="w-full bg-gov-blue text-white py-3 mt-6 rounded font-bold hover:bg-blue-900 transition">
                        {loading ? "Running AI..." : "⚡ Run AI Allocation"}
                    </button>
                </div>

                {/* MATCH TABLE */}
                <div className="bg-white rounded shadow overflow-hidden">
                    <div className="p-4 bg-gray-50 border-b font-bold">Live Allocation Feed</div>
                    <div className="h-64 overflow-y-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-gray-100 sticky top-0">
                                <tr><th className="p-3">Student</th><th className="p-3">Category</th><th className="p-3">Role</th><th className="p-3">Score</th></tr>
                            </thead>
                            <tbody>
                                {matches.map(m => (
                                    <tr key={m.match_id} className="border-b">
                                        <td className="p-3 font-bold">{m.full_name}</td>
                                        <td className="p-3"><span className="bg-gray-100 px-2 py-1 rounded text-xs">{m.category}</span></td>
                                        <td className="p-3">{m.job_title}</td>
                                        <td className="p-3 text-green-600 font-bold">{Math.round(m.match_score)}%</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
             </div>

             {/* RIGHT: STATS */}
             <div className="bg-white p-6 rounded shadow h-fit">
                 <h3 className="font-bold mb-4 text-center">Inclusivity Metrics</h3>
                 {stats?.total_matches > 0 ? <Pie data={pieData} /> : <p className="text-center text-gray-400 py-10">Run AI to see data.</p>}
                 <div className="mt-4 text-center">
                    <h4 className="text-2xl font-bold text-gov-green">{stats?.total_matches || 0}</h4>
                    <span className="text-xs uppercase text-gray-500">Total Allocations</span>
                 </div>
             </div>
          </div>
        );

        case 'logs':
  return (
      <div className="space-y-6">
          {/* EXPORT SECTION */}
          <div className="bg-white p-6 rounded shadow border-l-4 border-blue-600 flex justify-between items-center">
              <div>
                  <h3 className="font-bold text-lg text-gray-800">📥 Official Allocation Report</h3>
                  <p className="text-sm text-gray-500">Download the full list of matches and scores for Ministry review.</p>
              </div>
              <button 
                  onClick={downloadCSV}
                  className="bg-gray-800 text-white px-6 py-3 rounded shadow hover:bg-black transition font-bold flex items-center gap-2"
              >
                  <span>📄</span> Download CSV / Excel
              </button>
          </div>

          {/* LOGS LIST */}
          <div className="bg-white p-6 rounded shadow">
              <h3 className="font-bold mb-4">System Audit Trail</h3>
              <div className="h-96 overflow-y-auto bg-gray-50 border rounded p-4 font-mono text-xs">
                  {logs.length === 0 ? <p className="text-gray-400">No logs found.</p> : logs.map(log => (
                      <div key={log.id} className="mb-2 border-b pb-1">
                          <span className="text-gray-500">[{new Date(log.created_at).toLocaleString()}]</span> 
                          <span className="text-blue-600 font-bold ml-2">{log.action}:</span> 
                          <span className="ml-2">{log.details}</span>
                      </div>
                  ))}
              </div>
          </div>
      </div>
  );

      case 'verification':
        return (
           <div className="bg-white rounded shadow overflow-hidden">
              <div className="p-4 border-b"><h3 className="font-bold">Pending Verifications</h3></div>
              <table className="w-full text-left">
                  <thead className="bg-gray-100 border-b">
                      <tr><th className="p-4">Name</th><th className="p-4">Role</th><th className="p-4">Document</th><th className="p-4">Action</th></tr>
                  </thead>
                  <tbody>
                      {users.map(u => (
                          <tr key={u.id} className="border-b hover:bg-gray-50">
                              <td className="p-4 font-bold">{u.name}</td>
                              <td className="p-4 uppercase text-xs">{u.role}</td>
                              <td className="p-4 text-blue-600 underline cursor-pointer">View PDF</td>
                              <td className="p-4">
                                  {u.is_verified ? <span className="text-green-600 font-bold bg-green-50 px-3 py-1 rounded">Verified</span> : 
                                  <button onClick={()=>verifyUser(u.id)} className="bg-gov-green text-white px-3 py-1 rounded text-sm hover:bg-green-700">Verify</button>}
                              </td>
                          </tr>
                      ))}
                  </tbody>
              </table>
           </div>
        );

      case 'certificates':
         return (
             <div className="bg-white rounded shadow p-6">
                 <h3 className="font-bold mb-4 text-gray-700">Issued Allocations ready for Certification</h3>
                 <p className="text-sm text-gray-500 mb-4">Certificates can be issued to students who have been accepted by companies.</p>
                 <table className="w-full text-left border rounded">
                     <thead className="bg-gray-100"><tr><th className="p-3">Match ID</th><th className="p-3">Student</th><th className="p-3">Company</th><th className="p-3">Action</th></tr></thead>
                     <tbody>
                         {matches.slice(0, 10).map(m => (
                             <tr key={m.match_id} className="border-b hover:bg-gray-50">
                                 <td className="p-3">{m.match_id}</td>
                                 <td className="p-3 font-bold">{m.full_name}</td>
                                 <td className="p-3 text-gray-600">{m.job_title}</td>
                                 <td className="p-3">
                                     <button onClick={()=>issueCertificate(m.full_name, "Tech Corp")} className="bg-gov-blue text-white px-3 py-1 rounded text-xs flex items-center gap-2 hover:bg-blue-800">
                                         <span>📜</span> Issue Cert
                                     </button>
                                 </td>
                             </tr>
                         ))}
                     </tbody>
                 </table>
             </div>
         );

      case 'logs':
        return (
            <div className="bg-white p-6 rounded shadow">
                <h3 className="font-bold mb-4">System Audit Logs</h3>
                <div className="h-96 overflow-y-auto bg-gray-50 border rounded p-4 font-mono text-xs">
                    {logs.map(log => (
                        <div key={log.id} className="mb-2 border-b pb-1">
                            <span className="text-gray-500">[{new Date(log.created_at).toLocaleString()}]</span> 
                            <span className="text-blue-600 font-bold ml-2">{log.action}:</span> 
                            <span className="ml-2">{log.details}</span>
                        </div>
                    ))}
                </div>
            </div>
        );

      default: return null;
    }
  };

  const menu = [
      { id: 'engine', label: 'Allocation Engine', icon: '⚡' },
      { id: 'verification', label: 'User Verification', icon: '✅' },
      { id: 'certificates', label: 'Certificates', icon: '🎓' },
      { id: 'logs', label: 'Audit Logs', icon: '👁️' },
  ];

  return (
    <DashboardLayout title="Admin Console" role="Admin" menuItems={menu} activeTab={activeTab} setActiveTab={setActiveTab}>
        {renderContent()}
    </DashboardLayout>
  );
};

export default AdminDashboard;