const mongoose = require('mongoose');
const express = require('express');
const cors = require('cors');
const path = require('path'); // Require the 'path' module
const app = express();
require('dotenv').config(); // Load environment variables

// Connect to MongoDB using environment variables
const { MONGO_URI, PORT } = process.env;
mongoose.connect(MONGO_URI, {
  dbName: 'StockData',
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => console.log('Connected to MongoDB'))
  .catch((err) => console.error('Error connecting to MongoDB:', err.message));

// Middleware
app.use(express.json());
app.use(cors());

// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, '../build')));

// Routes
const stockDataRoutes = require('./routes/stockdata');
app.use('/api', stockDataRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something went wrong!');
});

// Start the server
const port = PORT || 5000;
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
