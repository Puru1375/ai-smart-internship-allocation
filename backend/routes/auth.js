// backend/routes/auth.js
const router = require('express').Router();
const pool = require('../db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Simple in-memory OTP store (Use Redis for production)
const otpStore = {}; 

// 1. SEND OTP ROUTE
router.post('/send-otp', async (req, res) => {
    const { email } = req.body;
    
    // Check if user already exists
    const userCheck = await pool.query("SELECT * FROM users WHERE email = $1", [email]);
    if (userCheck.rows.length > 0) {
        return res.status(400).json({ error: "User already exists. Please Login." });
    }

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    otpStore[email] = otp;

    // --- DEMO MODE: Log to Console (So you can copy-paste it) ---
    console.log(`\n=============================`);
    console.log(`🔐 OTP for ${email}: ${otp}`);
    console.log(`=============================\n`);

    // In production, you would use Nodemailer here to send real email
    res.json({ message: "OTP sent to your email!" });
});

// 2. SIGNUP WITH OTP VERIFICATION
router.post('/signup', async (req, res) => {
    try {
        const { email, password, role, otp } = req.body;

        // Validation
        if (!['student', 'company', 'admin'].includes(role)) {
            return res.status(400).json({ error: "Invalid role" });
        }

        // Verify OTP
        if (!otpStore[email]) {
            return res.status(400).json({ error: "OTP expired or not sent" });
        }
        if (otpStore[email] !== otp) {
            return res.status(400).json({ error: "Invalid OTP" });
        }

        // Hash Password
        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(password, salt);

        // Save to Database
        const newUser = await pool.query(
            "INSERT INTO users (email, password_hash, role) VALUES ($1, $2, $3) RETURNING user_id, email, role",
            [email, passwordHash, role]
        );

        // Clear OTP after success
        delete otpStore[email];

        res.json({ message: "User registered successfully!", user: newUser.rows[0] });

    } catch (err) {
        console.error(err.message);
        res.status(500).send("Server Error");
    }
});

// 3. LOGIN (Same as before)
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await pool.query("SELECT * FROM users WHERE email = $1", [email]);
        
        if (user.rows.length === 0) return res.status(401).json({ error: "Invalid Credential" });

        const validPassword = await bcrypt.compare(password, user.rows[0].password_hash);
        if (!validPassword) return res.status(401).json({ error: "Invalid Credential" });

        const token = jwt.sign(
            { user_id: user.rows[0].user_id, role: user.rows[0].role },
            process.env.JWT_SECRET,
            { expiresIn: "1h" }
        );

        res.json({ token, role: user.rows[0].role });
    } catch (err) {
        console.error(err.message);
        res.status(500).send("Server Error");
    }
});

module.exports = router;