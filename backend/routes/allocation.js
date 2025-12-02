const router = require('express').Router();
const pool = require('../db');
const axios = require('axios');

// POST /allocations/run
router.post('/run', async (req, res) => {
  try {
    // 1. Fetch Students with Category
    const studentsRes = await pool.query("SELECT id, skills, social_category FROM applicants");
    
    const students = studentsRes.rows.map(s => ({
      id: s.id,
      skills: typeof s.skills === 'string' ? JSON.parse(s.skills) : s.skills,
      category: s.social_category || "General" // Default to General if null
    }));

    // 2. Fetch Internships (Same as before)
    const jobsRes = await pool.query("SELECT id, required_skills, capacity FROM internships");
    const internships = jobsRes.rows.map(j => ({
      id: j.id,
      required_skills: typeof j.required_skills === 'string' ? JSON.parse(j.required_skills) : j.required_skills,
      capacity: j.capacity
    }));

    if(students.length === 0 || internships.length === 0) {
        return res.status(400).json({ error: "Not enough data" });
    }

    // 3. Send to Python AI with QUOTA (e.g., 0.2 = 20%)
    const payload = { 
        students, 
        internships,
        min_category_quota: 0.2 // <--- HARDCODED FAIRNESS RULE (Can be made dynamic later)
    };

    const aiRes = await axios.post('http://127.0.0.1:8000/optimize', payload);
    const matches = aiRes.data.matches;

    // 4. Save Matches (Same as before)
    await pool.query("DELETE FROM matches");

    for (let match of matches) {
      await pool.query(
        "INSERT INTO matches (applicant_id, internship_id, match_score, status) VALUES ($1, $2, $3, 'suggested')",
        [match.student_id, match.internship_id, match.score]
      );
    }

    res.json({ message: "Fair Allocation complete!", total_matches: matches.length, details: matches });

  } catch (err) {
    console.error("Allocation Error:", err.message);
    res.status(500).json({ error: "Failed to run allocation" });
  }
});

// GET /allocations/results (For Admin Dashboard)
router.get('/results', async (req, res) => {
    try {
        const results = await pool.query(`
            SELECT 
                m.match_id, 
                m.match_score, 
                a.full_name, 
                a.social_category as category, -- <--- ADDED THIS
                i.title as job_title, 
                i.location
            FROM matches m
            JOIN applicants a ON m.applicant_id = a.id
            JOIN internships i ON m.internship_id = i.id
            ORDER BY m.match_score DESC
        `);
        res.json(results.rows);
    } catch (err) {
        res.status(500).send("Server Error");
    }
});

router.get('/stats', async (req, res) => {
    try {
        // 1. Count Matches by Social Category (For Fairness Pie Chart)
        const categoryStats = await pool.query(`
            SELECT a.social_category, COUNT(*) as count 
            FROM matches m
            JOIN applicants a ON m.applicant_id = a.id
            GROUP BY a.social_category
        `);

        // 2. Count Total Matches vs Total Capacity
        const totalMatches = await pool.query("SELECT COUNT(*) FROM matches");
        
        // Format data for frontend
        const stats = {
            categories: categoryStats.rows,
            total_matches: parseInt(totalMatches.rows[0].count)
        };

        res.json(stats);
    } catch (err) {
        console.error(err);
        res.status(500).send("Server Error");
    }
});

module.exports = router;