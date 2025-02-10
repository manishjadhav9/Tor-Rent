const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const { initializeGridFS } = require('./config/gridfs');
const apartmentsRouter = require('./routes/apartments');

const app = express();

// Enable CORS
app.use(cors({
  origin: 'http://localhost:5173', // Update this to match your frontend URL
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type']
}));

// Parse JSON bodies
app.use(express.json());

// Parse URL-encoded bodies
app.use(express.urlencoded({ extended: true }));

// Initialize GridFS
mongoose.connect('mongodb://localhost:27017/torrent', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => {
  console.log('Connected to MongoDB');
  return initializeGridFS();
})
.then(() => {
  console.log('GridFS initialized');
})
.catch(err => console.error('MongoDB connection error:', err));

// Routes
app.use('/api/apartments', apartmentsRouter);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something broke!' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
}); 