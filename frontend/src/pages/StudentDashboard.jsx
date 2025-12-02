import React, { useState } from 'react';
import API from '../api';
import { useNavigate } from 'react-router-dom';

const StudentDashboard = () => {
  const [file, setFile] = useState(null);
  const [skills, setSkills] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleFileChange = (e) => setFile(e.target.files[0]);

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

  return (
    <div className="container mx-auto px-6 py-10">
      <h2 className="text-3xl font-bold text-gray-800 mb-2">🎓 Student Portal</h2>
      <p className="text-gray-600 mb-8">Manage your profile, upload resume, and view automated matches.</p>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Upload Section */}
        <div className="bg-white p-8 rounded-xl shadow-lg border-t-4 border-gov-blue">
          <h3 className="text-xl font-bold text-gov-blue mb-4">1. Resume Analysis</h3>
          <p className="text-sm text-gray-500 mb-6">Upload your latest PDF resume. Our AI will automatically extract your skills to match you with internships.</p>
          
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:bg-blue-50 transition cursor-pointer relative">
            <input type="file" accept="application/pdf" onChange={handleFileChange} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
            <div className="text-4xl mb-2">📄</div>
            <span className="text-gov-blue font-bold">Click to Upload PDF</span>
            <p className="text-xs text-gray-400 mt-2">{file ? file.name : "Max Size: 5MB"}</p>
          </div>

          <button onClick={handleUpload} disabled={loading} className="w-full mt-6 bg-gov-blue text-white py-3 rounded-lg font-bold shadow hover:bg-blue-800 transition disabled:bg-gray-400">
            {loading ? 'Analyzing with AI...' : 'Upload & Scan Resume'}
          </button>
        </div>

        {/* Profile Section */}
        <div className="bg-white p-8 rounded-xl shadow-lg border-t-4 border-gov-green">
          <h3 className="text-xl font-bold text-gov-green mb-4">2. Your Digital Skill Profile</h3>
          {skills.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-48 text-gray-400">
              <span className="text-4xl mb-2">🔍</span>
              <p>No skills detected yet. Upload resume to begin.</p>
            </div>
          ) : (
            <div>
              <p className="mb-4 text-sm text-gray-600">The AI detected the following skills from your resume:</p>
              <div className="flex flex-wrap gap-2">
                {skills.map((skill, i) => (
                  <span key={i} className="bg-green-100 text-green-800 px-4 py-2 rounded-full text-sm font-semibold shadow-sm border border-green-200">
                    {skill}
                  </span>
                ))}
              </div>
              <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-100 text-sm text-blue-800">
                ✅ Profile is Active. You will be automatically considered for the next allocation round.
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;