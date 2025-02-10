// require("dotenv").config(); // Load environment variables
// // const mongoose = require("mongoose");

// const express = require("express");
// const mongoose = require("./config/db");
// const cors = require("cors");

// const app = express();
// app.use(cors());
// app.use(express.json());

// // mongoose
// //   .connect("mongodb+srv://manishsj289:gawE725YZsH70LnF@cluster0.jusby.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0")
// //   .then(() => console.log("Database connected"))
// //   .catch((err) => console.error("Database connection error:", err));

// // Routes
// // app.use("/users", require("./routes/userRoutes"));
// // app.use("/apartments", require("./routes/apartmentRoutes"));

// const PORT = process.env.PORT || 5000;
// app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");
const { initGridFS } = require("./config/gridfs");
const { setSecurityHeaders } = require('./middleware/securityMiddleware');
const apartmentRoutes = require('./routes/apartmentRoutes');
const errorHandler = require('./middleware/errorMiddleware');

const app = express();

// Middleware
app.use(cors({
  origin: 'http://localhost:5173', // Frontend URL
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// API Routes
const apiRouter = require('./routes/api');
app.use('/api', apiRouter);

// Routes
app.use('/api/apartments', apartmentRoutes);

// Basic route for testing
app.get('/', (req, res) => {
  res.json({ message: 'API is running' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    error: err.message || 'Something went wrong!',
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
});

// Handle 404
app.use((req, res) => {
  res.status(404).json({ 
    error: 'Route not found',
    path: req.path,
    method: req.method
  });
});

// Add this after other middleware
app.use(setSecurityHeaders);

// Add this after your routes
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

// Connect to database and start server
const startServer = async () => {
  try {
    const dbConnection = await connectDB();
    await initGridFS(dbConnection);
    
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
      console.log(`API documentation available at http://localhost:${PORT}/api`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
