// frontend/src/pages/StudentDashboard.jsx
import React, { useState } from 'react';
import API from '../api';
import { useNavigate } from 'react-router-dom';

const StudentDashboard = () => {
  const [file, setFile] = useState(null);
  const [skills, setSkills] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.clear();
    navigate('/');
  };

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) return alert("Please select a file");

    const formData = new FormData();
    formData.append('resume', file);

    setLoading(true);
    try {
      // Send to Node.js (which sends to Python)
      const res = await API.post('/upload-resume', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      setSkills(res.data.skills);
      alert('Resume Scanned Successfully!');
    } catch (err) {
      console.error(err);
      alert('Upload failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '40px', maxWidth: '800px', margin: 'auto' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2>🎓 Student Dashboard</h2>
        <button onClick={handleLogout} style={{ background: 'red', color: 'white', border: 'none', padding: '5px 10px' }}>Logout</button>
      </header>

      <div style={{ marginTop: '20px', padding: '20px', border: '1px solid #ddd', borderRadius: '8px' }}>
        <h3>1. Upload Resume</h3>
        <p>Upload your PDF resume to let our AI find your skills automatically.</p>
        
        <input type="file" accept="application/pdf" onChange={handleFileChange} />
        <button 
          onClick={handleUpload} 
          disabled={loading}
          style={{ marginLeft: '10px', padding: '8px 15px', background: '#007bff', color: '#fff', border: 'none', cursor: 'pointer' }}
        >
          {loading ? 'Scanning...' : 'Upload & Analyze'}
        </button>
      </div>

      {skills.length > 0 && (
        <div style={{ marginTop: '30px' }}>
          <h3>2. Your AI Profile</h3>
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            {skills.map((skill, index) => (
              <span key={index} style={{ background: '#28a745', color: 'white', padding: '5px 15px', borderRadius: '20px' }}>
                {skill}
              </span>
            ))}
          </div>
          <p>These skills have been saved to your profile.</p>
        </div>
      )}
    </div>
  );
};

export default StudentDashboard;