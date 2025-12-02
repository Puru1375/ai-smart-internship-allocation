// backend/routes/allocation.js
const router = require('express').Router();
const pool = require('../db');
const axios = require('axios');
const jwt = require('jsonwebtoken'); // Fixed missing import
require('dotenv').config();

// 1. RUN ALLOCATION (Admin Only)
router.post('/run', async (req, res) => {
  try {
    const { quotaPercent } = req.body; 
    const quotaValue = quotaPercent ? (quotaPercent / 100) : 0; 

    // Fetch Students
    const studentsRes = await pool.query("SELECT id, skills, social_category, district, prefer_local FROM applicants");
    const students = studentsRes.rows.map(s => ({
      id: s.id,
      skills: typeof s.skills === 'string' ? JSON.parse(s.skills) : s.skills,
      category: s.social_category || "General",
      district: s.district || "",       // <--- Pass to Python
      prefer_local: s.prefer_local || false // <--- Pass to Python
    }));

    // Fetch Internships
    const jobsRes = await pool.query("SELECT id, required_skills, capacity FROM internships");
    const internships = jobsRes.rows.map(j => ({
      id: j.id,
      required_skills: typeof j.required_skills === 'string' ? JSON.parse(j.required_skills) : j.required_skills,
      capacity: j.capacity
    }));

    if(students.length === 0 || internships.length === 0) {
        return res.status(400).json({ error: "Not enough data" });
    }

    // Send to Python
    const payload = { 
        students, 
        internships,
        min_category_quota: quotaValue 
    };

    const aiRes = await axios.post('http://127.0.0.1:8000/optimize', payload);
    const matches = aiRes.data.matches;

    // Save Matches
    await pool.query("DELETE FROM matches");
    for (let match of matches) {
      await pool.query(
        "INSERT INTO matches (applicant_id, internship_id, match_score, match_reason, status) VALUES ($1, $2, $3, $4, 'suggested')",
        [match.student_id, match.internship_id, match.score, JSON.stringify(match.reasons)]
      );
    }

    await pool.query(
        "INSERT INTO audit_logs (action, details) VALUES ($1, $2)",
        [
            "RUN_ALLOCATION", 
            `Executed AI Model with Quota: ${quotaPercent || 0}% | Matches Generated: ${matches.length}`
        ]
    );

    res.json({ message: "Allocation complete!", total_matches: matches.length });

  } catch (err) {
    console.error("Allocation Error:", err.message);
    res.status(500).json({ error: "Failed to run allocation" });
  }
});

// 2. GET MY MATCH (Student Only)
router.get('/my-match', async (req, res) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];
        if (!token) return res.status(401).json({ error: "Unauthorized" });
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Find applicant ID
        const applicant = await pool.query("SELECT id FROM applicants WHERE user_id = $1", [decoded.user_id]);
        if (applicant.rows.length === 0) return res.status(404).json({ error: "Profile not found" });
        const applicantId = applicant.rows[0].id;

        // Find match
        const match = await pool.query(`
            SELECT m.*, i.title as job_title, i.company_user_id 
            FROM matches m
            JOIN internships i ON m.internship_id = i.id
            WHERE m.applicant_id = $1
        `, [applicantId]);

        // If no match found, this returns 404 (which is handled by Frontend as "Pending")
        if (match.rows.length === 0) return res.status(404).json({ message: "No match" });

        // Get Company Name (Optional enhancement)
        const companyRes = await pool.query("SELECT email FROM users WHERE user_id = $1", [match.rows[0].company_user_id]);
        const result = match.rows[0];
        result.company_name = companyRes.rows[0]?.email.split('@')[0] || "Industry Partner";

        res.json(result);
    } catch (err) {
        console.error(err);
        res.status(500).send("Server Error");
    }
});

// 3. GET STATS (Admin Charts)
router.get('/stats', async (req, res) => {
    try {
        const categoryStats = await pool.query(`
            SELECT a.social_category, COUNT(*) as count 
            FROM matches m
            JOIN applicants a ON m.applicant_id = a.id
            GROUP BY a.social_category
        `);
        const totalMatches = await pool.query("SELECT COUNT(*) FROM matches");
        res.json({
            categories: categoryStats.rows,
            total_matches: parseInt(totalMatches.rows[0].count)
        });
    } catch (err) {
        res.status(500).send("Server Error");
    }
});

// 4. GET ALL RESULTS (Admin Table)
router.get('/results', async (req, res) => {
    try {
        const results = await pool.query(`
            SELECT 
                m.match_id, 
                m.match_score, 
                a.full_name, 
                a.social_category as category,
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

router.post('/update-status', async (req, res) => {
    try {
        const { match_id, status } = req.body; // status = 'interview' or 'rejected'
        await pool.query("UPDATE matches SET status = $1 WHERE match_id = $2", [status, match_id]);
        res.json({ message: "Status updated" });
    } catch (err) {
        res.status(500).send("Server Error");
    }
});


// 5. GET COMPANY MATCHES (Company Only)
router.get('/company-matches', async (req, res) => {
    try {
        // 1. Verify Company Token
        const token = req.headers.authorization?.split(' ')[1];
        if (!token) return res.status(401).json({ error: "Unauthorized" });
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        if (decoded.role !== 'company') return res.status(403).json({ error: "Access denied" });

        // 2. Fetch matches for internships owned by THIS company
        const matches = await pool.query(`
            SELECT 
                m.match_id, 
                m.match_score, 
                m.match_reason, 
                m.status,
                a.full_name, 
                a.skills as student_skills,
                i.title as job_title
            FROM matches m
            JOIN internships i ON m.internship_id = i.id
            JOIN applicants a ON m.applicant_id = a.id
            WHERE i.company_user_id = $1
            ORDER BY m.match_score DESC
        `, [decoded.user_id]);

        // 3. Parse JSON skills before sending
        const results = matches.rows.map(row => ({
            ...row,
            student_skills: typeof row.student_skills === 'string' ? JSON.parse(row.student_skills) : row.student_skills,
            match_reason: typeof row.match_reason === 'string' ? JSON.parse(row.match_reason) : row.match_reason
        }));

        res.json(results);
    } catch (err) {
        console.error(err);
        res.status(500).send("Server Error");
    }
});

// 7. GET SKILL GAP (Student Only)
router.get('/skill-gap', async (req, res) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];
        if (!token) return res.status(401).json({ error: "Unauthorized" });
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // 1. Get Student Skills (Handle NULL case)
        const studentRes = await pool.query("SELECT skills FROM applicants WHERE user_id = $1", [decoded.user_id]);
        if (studentRes.rows.length === 0) return res.status(404).json({ error: "Profile not found" });
        
        const rawSkills = studentRes.rows[0].skills;
        // FIX 1: If skills are null, send empty array []
        const studentSkills = rawSkills 
            ? (typeof rawSkills === 'string' ? JSON.parse(rawSkills) : rawSkills) 
            : [];

        // 2. Get All Active Internships (Include location just in case)
        const jobsRes = await pool.query("SELECT id, required_skills, capacity, location FROM internships");
        const internships = jobsRes.rows.map(j => ({
            id: j.id,
            required_skills: j.required_skills ? (typeof j.required_skills === 'string' ? JSON.parse(j.required_skills) : j.required_skills) : [],
            capacity: j.capacity,
            location: j.location || "" // FIX 2: Ensure location isn't undefined
        }));

        // 3. Ask Python
        const payload = { student_skills: studentSkills, internships };
        
        const aiRes = await axios.post('http://127.0.0.1:8000/analyze-gap', payload);

        res.json(aiRes.data.gaps);

    } catch (err) {
        // Log the full error from Python if available
        console.error("Gap Analysis Error:", err.response?.data || err.message);
        res.status(500).json({ error: "Failed to analyze gaps" });
    }
});

// 2. ADD NEW ROUTE: GET LOGS (Add at the bottom)
router.get('/audit-logs', async (req, res) => {
    try {
        const logs = await pool.query("SELECT * FROM audit_logs ORDER BY created_at DESC LIMIT 50");
        res.json(logs.rows);
    } catch (err) {
        res.status(500).send("Server Error");
    }
});

// 3. ADD NEW ROUTE: EXPORT CSV
router.get('/export-csv', async (req, res) => {
    try {
        const results = await pool.query(`
            SELECT m.match_id, a.full_name, a.social_category, i.title, m.match_score 
            FROM matches m
            JOIN applicants a ON m.applicant_id = a.id
            JOIN internships i ON m.internship_id = i.id
        `);
        
        // Convert JSON to CSV String
        const fields = ['Match ID', 'Student Name', 'Category', 'Job Role', 'Score'];
        const rows = results.rows.map(row => 
            `${row.match_id},"${row.full_name}",${row.social_category},"${row.title}",${Math.round(row.match_score)}`
        );
        
        const csv = [fields.join(','), ...rows].join('\n');
        
        res.header('Content-Type', 'text/csv');
        res.attachment('allocation_report.csv');
        res.send(csv);
    } catch (err) {
        res.status(500).send("Export Failed");
    }
});

module.exports = router;