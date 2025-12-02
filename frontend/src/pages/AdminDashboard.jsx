// frontend/src/pages/AdminDashboard.jsx
import React, { useState, useEffect } from 'react';
import API from '../api';
import { useNavigate } from 'react-router-dom';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title } from 'chart.js';
import { Pie, Bar } from 'react-chartjs-2';

// Register Chart components
ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title);

const AdminDashboard = () => {
  const [matches, setMatches] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const resultsRes = await API.get('/allocations/results');
      const statsRes = await API.get('/allocations/stats');
      setMatches(resultsRes.data);
      setStats(statsRes.data);
    } catch (err) {
      console.error("Failed to fetch data");
    }
  };

  const runAllocation = async () => {
    setLoading(true);
    try {
      const res = await API.post('/allocations/run');
      alert(`Success! Generated ${res.data.total_matches} matches.`);
      fetchData(); // Refresh all data
    } catch (err) {
      alert("Allocation failed.");
    } finally {
      setLoading(false);
    }
  };

  // --- PREPARE CHART DATA ---
  const getPieData = () => {
    if (!stats) return { labels: [], datasets: [] };
    
    // Extract labels (e.g., 'General', 'OBC') and counts
    const labels = stats.categories.map(c => c.social_category || 'General');
    const data = stats.categories.map(c => c.count);
    
    return {
      labels: labels,
      datasets: [{
        data: data,
        backgroundColor: ['#007bff', '#28a745', '#ffc107', '#dc3545'],
        hoverBackgroundColor: ['#0056b3', '#218838', '#e0a800', '#c82333']
      }]
    };
  };

  return (
    <div style={{ padding: '40px', maxWidth: '1200px', margin: 'auto', fontFamily: 'Arial, sans-serif' }}>
      
      {/* HEADER */}
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        <div>
          <h2 style={{ margin: 0 }}>🛡️ Admin Control Center</h2>
          <p style={{ color: '#666', margin: 0 }}>Monitor Allocations, Fairness & Quotas</p>
        </div>
        <button onClick={() => navigate('/')} style={{ background: '#dc3545', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '5px', cursor: 'pointer' }}>Logout</button>
      </header>

      {/* ACTION SECTION */}
      <div style={{ display: 'flex', gap: '20px', marginBottom: '30px' }}>
        <div style={{ flex: 1, padding: '30px', background: '#f8f9fa', borderRadius: '10px', textAlign: 'center', border: '1px solid #dee2e6' }}>
          <h3>🤖 AI Allocation Engine</h3>
          <p>Run linear optimization with fairness constraints.</p>
          <button 
            onClick={runAllocation} 
            disabled={loading}
            style={{ 
              fontSize: '16px', padding: '12px 24px', 
              background: loading ? '#6c757d' : '#007bff', 
              color: 'white', border: 'none', borderRadius: '5px', cursor: loading ? 'not-allowed' : 'pointer' 
            }}
          >
            {loading ? 'Crunching Numbers...' : '⚡ Run Allocation'}
          </button>
        </div>

        {/* STATS CHARTS */}
        <div style={{ flex: 1, padding: '20px', background: 'white', borderRadius: '10px', border: '1px solid #dee2e6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
           {stats && stats.total_matches > 0 ? (
             <div style={{ width: '300px' }}>
               <h4 style={{ textAlign: 'center' }}>Inclusivity (Category Split)</h4>
               <Pie data={getPieData()} />
             </div>
           ) : <p>No data to visualize yet.</p>}
        </div>
      </div>

      {/* TABLE SECTION */}
      <h3>📋 Match Results ({matches.length})</h3>
      <div style={{ overflowX: 'auto', boxShadow: '0 2px 5px rgba(0,0,0,0.1)', borderRadius: '8px' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', background: 'white' }}>
          <thead>
            <tr style={{ background: '#343a40', color: 'white' }}>
              <th style={{ padding: '15px', textAlign: 'left' }}>Student Name</th>
              <th style={{ padding: '15px', textAlign: 'left' }}>Social Category</th>
              <th style={{ padding: '15px', textAlign: 'left' }}>Matched Internship</th>
              <th style={{ padding: '15px', textAlign: 'left' }}>Fit Score</th>
              <th style={{ padding: '15px', textAlign: 'left' }}>Location</th>
            </tr>
          </thead>
          <tbody>
            {matches.length === 0 ? (
              <tr><td colSpan="5" style={{ padding: '20px', textAlign: 'center' }}>No matches found.</td></tr>
            ) : matches.map((m) => (
              <tr key={m.match_id} style={{ borderBottom: '1px solid #eee', color: '#333' }}>
                <td style={{ padding: '15px' }}>{m.full_name || 'Student #' + m.match_id}</td>
                <td style={{ padding: '15px' }}>
                  <span style={{ padding: '3px 8px', borderRadius: '10px', background: '#e9ecef', fontSize: '12px' }}>
                     {/* We need to fetch category in result query to show here, otherwise it might be blank */}
                     {m.category || 'General'} 
                  </span>
                </td>
                <td style={{ padding: '15px' }}>{m.job_title}</td>
                <td style={{ padding: '15px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{ width: '50px', height: '6px', background: '#e9ecef', borderRadius: '3px' }}>
                      <div style={{ width: `${m.match_score}%`, height: '100%', background: m.match_score > 70 ? '#28a745' : '#ffc107', borderRadius: '3px' }}></div>
                    </div>
                    {Math.round(m.match_score)}%
                  </div>
                </td>
                <td style={{ padding: '15px' }}>{m.location}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminDashboard;