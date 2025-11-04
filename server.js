const express = require('express');
const mongoose = require('mongoose');
require('dotenv').config();
const cors = require('cors');

const usersRoute = require('./routes/users');
const tasksRoute = require('./routes/tasks');

const app = express();
app.use(cors());
app.use(express.json());

// Avoid multiple mongoose connections on Render
if (mongoose.connection.readyState === 0) {
  const uri = process.env.MONGODB_URI;
  console.log("Connecting to MongoDB...");
  mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log("✅ Connected to MongoDB Atlas"))
    .catch(err => {
      console.error("❌ MongoDB connection error:", err.message);
      process.exit(1);
    });
}

// Routes
app.use('/api/users', usersRoute);
app.use('/api/tasks', tasksRoute);

// Root test route
app.get('/', (req, res) => res.send('API is running ✅'));

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`🚀 Server is running on port ${port}`));
