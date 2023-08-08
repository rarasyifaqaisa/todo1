// Import dependensi
const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const MONGODB_URL = 'mongodb://localhost/todo_app';
const Todo = require('./models/Todo');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('./models/User');
const roleController = require('./controllers/roleController');
const authenticateUser = require('./utils/authMiddleware');
const { checkSuperadminRole, checkAdminRole } = require('./utils/checkRole');
require('dotenv').config();

// Inisialisasi aplikasi Express
const app = express();
const PORT = process.env.PORT || 3000;
const JWT_SECRET = '7086f7su46';

// Middleware
// app.use(bodyParser.urlencoded({ extended: true }));
// app.use(bodyParser.json());

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

// Endpoint untuk membuat peran baru
app.post('/api/roles', async (req, res) => {
  const { name } = req.body;

  // Validate that the name is provided
  if (!name) {
    return res.status(400).json({ error: 'Role name is required' });
  }

  try {
    // Check if the role name is already taken
    const existingRole = await Role.findOne({ name });
    if (existingRole) {
      return res.status(409).json({ error: 'Role name already exists' });
    }

    const newRole = new Role({ name });
    await newRole.save();

    res.status(201).json({ message: 'Role created successfully', role: newRole });
  } catch (error) {
    console.error('Error creating role:', error);
    res.status(500).json({ error: 'Failed to create role' });
  }
});

// Endpoint untuk mengambil daftar role (hanya boleh diakses oleh superadmin)
app.get('/api/roles', authenticateUser, checkSuperadminRole, roleController.getRoles);

// Endpoint untuk mengambil daftar peran yang ada
app.get('/api/roles', async (req, res) => {
  try {
    const roles = await Role.find({});
    res.status(200).json(roles);
  } catch (error) {
    console.error('Error fetching roles:', error);
    res.status(500).json({ error: 'Failed to fetch roles' });
  }
});

// Endpoint untuk mengambil daftar todo items (hanya boleh diakses oleh superadmin)
app.get('/api/superadmin-todos', authenticateUser, checkSuperadminRole, (req, res) => {
  Todo.find({})
    .exec()
    .then((todos) => {
      res.status(200).json(todos);
    })
    .catch((err) => {
      console.error('Error fetching todos:', err);
      res.status(500).json({ error: 'Failed to fetch todos' });
    });
});

// Endpoint untuk mengambil daftar todo items (hanya boleh diakses oleh admin)
app.get('/api/admin-todos', authenticateUser, checkAdminRole, (req, res) => {
    Todo.find({})
    .exec()
    .then((todos) => {
      res.status(200).json(todos);
    })
    .catch((err) => {
      console.error('Error fetching todos:', err);
      res.status(500).json({ error: 'Failed to fetch todos' });
    });
});

  app.listen(PORT, () => {
    console.log(`Server started on port ${PORT}`);
  });
