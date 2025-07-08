const express = require('express');
const mongoose = require('mongoose');
const userRoutes = require('./routes/userRoutes');
require('dotenv').config();
const app = express();
const PORT  = process.env.PORT || 5000;

// Middleware to parse JSON
app.use(express.json());
// MongoDB connection
app.use('/users', userRoutes);

mongoose.connect('mongodb://localhost:27017/Database')
  .then(() => {
    console.log(' MongoDB connected successfully');
  })
  .catch((err) => {
    console.error('MongoDB connection error:', err);
  });

// Routes

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});