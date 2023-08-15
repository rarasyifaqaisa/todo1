const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const Role = require('./models/Role');
const Todo = require('./models/Todo');
const authRoutes = require('./routes/authRoutes');
const todoRoutes = require('./routes/todoRoutes');
require('dotenv').config();

// Inisialisasi aplikasi Express
const app = express();
const PORT = process.env.PORT || 3000;
const MONGODB_URL = process.env.MONGODB_URL;

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Koneksi ke MongoDB
mongoose.connect(MONGODB_URL, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));
db.once('open', () => {
  console.log('Connected to MongoDB');
});

// Routes
app.use('/api', authRoutes);
app.use('/api', todoRoutes);

app.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
});
