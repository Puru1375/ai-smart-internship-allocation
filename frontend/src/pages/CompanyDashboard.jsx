// frontend/src/pages/CompanyDashboard.jsx
import React, { useState, useEffect } from "react";
import API from "../api";
import { useNavigate } from "react-router-dom";

const CompanyDashboard = () => {
  const [jobs, setJobs] = useState([]);
  const navigate = useNavigate();

  // Form State
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    skills: "", // input as string "Python, SQL"
    capacity: 1,
    location: "Remote",
  });

  // Load existing jobs on startup
  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    try {
      // UPDATED URL HERE
      const res = await API.get("/internships/my-internships");
      setJobs(res.data);
    } catch (err) {
      console.error("Failed to load jobs");
    }
  };
  const handleLogout = () => {
    localStorage.clear();
    navigate("/");
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await API.post("/internships", formData);
      alert("Internship Posted!");
      setFormData({
        title: "",
        description: "",
        skills: "",
        capacity: 1,
        location: "Remote",
      }); // Reset form
      fetchJobs(); // Refresh list
    } catch (err) {
      alert("Failed to post job");
    }
  };

  return (
    <div style={{ padding: "40px", maxWidth: "1000px", margin: "auto" }}>
      <header
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <h2>🏢 Company Dashboard</h2>
        <button
          onClick={handleLogout}
          style={{
            background: "red",
            color: "white",
            border: "none",
            padding: "5px 10px",
          }}
        >
          Logout
        </button>
      </header>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "20px",
          marginTop: "20px",
        }}
      >
        {/* LEFT: Post New Job */}
        <div
          style={{
            padding: "20px",
            border: "1px solid #ddd",
            borderRadius: "8px",
          }}
        >
          <h3>Post New Internship</h3>
          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: "10px" }}>
              <label>Job Title</label>
              <input
                name="title"
                value={formData.title}
                onChange={handleChange}
                required
                style={{ width: "100%" }}
              />
            </div>
            <div style={{ marginBottom: "10px" }}>
              <label>Required Skills (comma separated)</label>
              <input
                name="skills"
                value={formData.skills}
                onChange={handleChange}
                placeholder="e.g. Python, React, AWS"
                required
                style={{ width: "100%" }}
              />
            </div>
            <div style={{ marginBottom: "10px" }}>
              <label>Capacity (Number of Interns)</label>
              <input
                type="number"
                name="capacity"
                value={formData.capacity}
                onChange={handleChange}
                required
                style={{ width: "100%" }}
              />
            </div>
            <div style={{ marginBottom: "10px" }}>
              <label>Location</label>
              <input
                name="location"
                value={formData.location}
                onChange={handleChange}
                required
                style={{ width: "100%" }}
              />
            </div>
            <button
              type="submit"
              style={{
                width: "100%",
                background: "#007bff",
                color: "white",
                padding: "10px",
                border: "none",
              }}
            >
              Post Internship
            </button>
          </form>
        </div>

        {/* RIGHT: List of Posted Jobs */}
        <div>
          <h3>Your Active Postings</h3>
          {jobs.length === 0 ? (
            <p>No jobs posted yet.</p>
          ) : (
            <div style={{ maxHeight: "400px", overflowY: "auto" }}>
              {jobs.map((job) => (
                <div
                  key={job.id}
                  style={{
                    border: "1px solid #eee",
                    padding: "10px",
                    marginBottom: "10px",
                    background: "#f9f9f9", // Light background
                    color: "#333", // <--- ADD THIS: Forces text to be Dark Grey
                  }}
                >
                  <h4 style={{ margin: "0 0 5px 0" }}>{job.title}</h4>

                  <p style={{ margin: "5px 0" }}>
                    <strong>Skills:</strong>{" "}
                    {Array.isArray(job.required_skills)
                      ? job.required_skills.join(", ")
                      : "No skills listed"}
                  </p>

                  <p style={{ margin: "5px 0" }}>
                    <strong>Capacity:</strong> {job.capacity} students
                  </p>
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
