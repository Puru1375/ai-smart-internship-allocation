const router = require('express').Router();
const pool = require('../db');
const jwt = require('jsonwebtoken');

// Middleware to check if user is Company
const verifyCompany = (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ error: "Unauthorized" });
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        if (decoded.role !== 'company') return res.status(403).json({ error: "Access denied" });
        req.user = decoded; // Save user info to request
        next();
    } catch (err) {
        res.status(401).json({ error: "Invalid Token" });
    }
};

// 1. POST INTERNSHIP
router.post('/', verifyCompany, async (req, res) => {
  try {
    const { title, description, skills, capacity, location } = req.body;
    const skillArray = skills.split(',').map(s => s.trim());

    const newInternship = await pool.query(
      "INSERT INTO internships (company_user_id, title, description, required_skills, capacity, location) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *",
      [req.user.user_id, title, description, JSON.stringify(skillArray), capacity, location]
    );
    res.json(newInternship.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).send("Server Error");
  }
});

// 2. GET MY INTERNSHIPS
router.get('/my-internships', verifyCompany, async (req, res) => {
  try {
    const jobs = await pool.query("SELECT * FROM internships WHERE company_user_id = $1 ORDER BY id DESC", [req.user.user_id]);
    res.json(jobs.rows);
  } catch (err) {
    console.error(err);
    res.status(500).send("Server Error");
  }
});

// 3. GET ALL (Public/Student)
router.get('/', async (req, res) => {
    try {
      const jobs = await pool.query("SELECT * FROM internships");
      res.json(jobs.rows);
    } catch (err) {
      res.status(500).send("Server Error");
    }
});

module.exports = router;