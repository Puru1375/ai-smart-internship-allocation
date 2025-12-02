const router = require('express').Router();
const pool = require('../db');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const axios = require('axios');
const fs = require('fs');
const FormData = require('form-data');
require('dotenv').config();

// Multer Config
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname)
});
const upload = multer({ storage: storage });

// POST /upload-resume
router.post('/', upload.single('resume'), async (req, res) => {
  try {
    // 1. Auth Check
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ error: "Unauthorized" });
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.user_id;

    if (!req.file) return res.status(400).json({ error: "No file uploaded" });
    const filePath = req.file.path;

    // 2. Send to Python AI
    const formData = new FormData();
    formData.append('file', fs.createReadStream(filePath));

    const aiResponse = await axios.post('http://127.0.0.1:8000/parse-resume', formData, {
      headers: { ...formData.getHeaders() }
    });
    
    const extractedSkills = aiResponse.data.extracted_skills;

    // 3. Save to DB
    let applicant = await pool.query("SELECT * FROM applicants WHERE user_id = $1", [userId]);
    
    if (applicant.rows.length === 0) {
      await pool.query(
        "INSERT INTO applicants (user_id, resume_url, skills) VALUES ($1, $2, $3)",
        [userId, filePath, JSON.stringify(extractedSkills)]
      );
    } else {
      await pool.query(
        "UPDATE applicants SET resume_url = $1, skills = $2 WHERE user_id = $3",
        [filePath, JSON.stringify(extractedSkills), userId]
      );
    }

    res.json({ message: "Processed successfully!", skills: extractedSkills });

  } catch (err) {
    console.error("Upload Error:", err.message);
    res.status(500).json({ error: "Failed to process resume." });
  }
});

module.exports = router;