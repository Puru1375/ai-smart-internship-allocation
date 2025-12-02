// backend/server.js
const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// --- IMPORT ROUTES ---
const authRoutes = require('./routes/auth');
const resumeRoutes = require('./routes/resume');
const internshipRoutes = require('./routes/internships');
const allocationRoutes = require('./routes/allocation'); // <--- MAKE SURE THIS IS HERE

// --- USE ROUTES ---
app.use('/auth', authRoutes);
app.use('/upload-resume', resumeRoutes);
app.use('/internships', internshipRoutes);
app.use('/allocations', allocationRoutes); // <--- AND THIS IS HERE

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});