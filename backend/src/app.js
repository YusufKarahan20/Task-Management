require('dotenv').config();
require('./config/db');
const express = require('express');
const cors = require('cors');

const app = express();

// Routes
const authRoutes = require('./routes/authRoutes');

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);

// Test Route
app.get('/', (req, res) => {
  res.send('TaskFlow Backend is running 🚀');
});

module.exports = app;
