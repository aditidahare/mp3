require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const userRoutes = require('./routes/users');
const taskRoutes = require('./routes/tasks');
const indexRoutes = require('./routes');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// MongoDB Connection

const safeUri = (process.env.MONGODB_URI || '').replace(/:\/\/.*:.*@/,'://<redacted>@');
console.log('Connecting to MongoDB with URI:', safeUri);

mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('Connected to MongoDB Atlas'))
  .catch(err => {
    console.error('MongoDB connection error:', err.message);
    process.exit(1);
  });

  
mongoose.connect(process.env.TOKEN, {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => {
  console.log('Connected to MongoDB Atlas');
}).catch((err) => {
  console.error('MongoDB connection error:', err);
});

// Routes
indexRoutes(app, express.Router());
app.use('/api/users', userRoutes);
app.use('/api/tasks', taskRoutes);

// 404 fallback
app.use((req, res) => {
  res.status(404).json({ message: 'Not found' });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
