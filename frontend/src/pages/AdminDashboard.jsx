import React, { useState, useEffect } from 'react';
import API from '../api';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Pie } from 'react-chartjs-2';
ChartJS.register(ArcElement, Tooltip, Legend);

const AdminDashboard = () => {
  const [matches, setMatches] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => { fetchData(); }, []);
  const fetchData = async () => {
    try {
      const resultsRes = await API.get('/allocations/results');
      const statsRes = await API.get('/allocations/stats');
      setMatches(resultsRes.data);
      setStats(statsRes.data);
    } catch (e) {}
  };

  const runAllocation = async () => {
    setLoading(true);
    try { await API.post('/allocations/run'); alert("Optimization Complete"); fetchData(); } catch (e) { alert("Failed"); } finally { setLoading(false); }
  };

  const pieData = stats ? {
    labels: stats.categories.map(c => c.social_category || 'General'),
    datasets: [{ data: stats.categories.map(c => c.count), backgroundColor: ['#003366', '#FF9933', '#138808', '#6c757d'] }]
  } : { labels: [], datasets: [] };

  return (
    <div className="bg-gray-100 min-h-screen pb-20">
      {/* Top Stats Bar */}
      <div className="bg-gov-blue text-white py-10 px-6">
        <div className="container mx-auto">
          <h2 className="text-3xl font-bold mb-6">🛡️ Central Admin Console</h2>
          <div className="grid md:grid-cols-4 gap-6">
            <div className="bg-white/10 p-4 rounded backdrop-blur">
              <h4 className="text-sm opacity-80">Total Matches</h4>
              <p className="text-3xl font-bold">{stats?.total_matches || 0}</p>
            </div>
            <div className="bg-white/10 p-4 rounded backdrop-blur">
              <h4 className="text-sm opacity-80">Algorithm Status</h4>
              <p className="text-xl font-bold text-green-400">● Online</p>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 -mt-10 grid md:grid-cols-3 gap-8">
        {/* Controls */}
        <div className="bg-white p-8 rounded-xl shadow-lg md:col-span-2">
          <div className="flex justify-between items-center mb-6">
             <h3 className="text-xl font-bold text-gray-800">Allocation Engine</h3>
             <button onClick={runAllocation} disabled={loading} className="bg-gov-orange text-white px-6 py-2 rounded shadow font-bold hover:bg-orange-600 transition disabled:opacity-50">
               {loading ? "Optimizing..." : "⚡ Run AI Matchmaker"}
             </button>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left text-gray-500">
              <thead className="text-xs text-white uppercase bg-gray-700">
                <tr>
                  <th className="px-6 py-3">Student</th>
                  <th className="px-6 py-3">Category</th>
                  <th className="px-6 py-3">Matched Role</th>
                  <th className="px-6 py-3">Fit Score</th>
                </tr>
              </thead>
              <tbody>
                {matches.map((m) => (
                  <tr key={m.match_id} className="bg-white border-b hover:bg-gray-50 text-gray-900">
                    <td className="px-6 py-4 font-medium">{m.full_name || `ID: ${m.match_id}`}</td>
                    <td className="px-6 py-4"><span className="bg-gray-200 px-2 py-1 rounded text-xs">{m.category || 'General'}</span></td>
                    <td className="px-6 py-4">{m.job_title}</td>
                    <td className="px-6 py-4">
                      <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
                        <div className="bg-green-600 h-2.5 rounded-full" style={{ width: `${m.match_score}%` }}></div>
                      </div>
                      <span className="text-xs">{Math.round(m.match_score)}%</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Charts */}
        <div className="bg-white p-8 rounded-xl shadow-lg flex flex-col items-center justify-center">
          <h3 className="text-lg font-bold text-gray-700 mb-4">Inclusivity Metrics</h3>
          {stats?.total_matches > 0 ? <Pie data={pieData} /> : <p className="text-gray-400">No data</p>}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;