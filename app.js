// Import dependensi
const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const MONGODB_URL = 'mongodb://localhost/todo_app';
const Todo = require('./models/Todo');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('./models/User');

// Inisialisasi aplikasi Express
const app = express();
const PORT = process.env.PORT || 3000;
const JWT_SECRET = '7086f7su46';

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

// User registration endpoint
app.post('/api/register', async (req, res) => {
  const { username, password } = req.body;

  // Validate that both username and password are provided
  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password are required fields' });
  }

  try {
    // Check if the username is already taken
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(409).json({ error: 'Username already taken' });
    }

    // Hash the password before saving
    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      username,
      password: hashedPassword,
    });

    await newUser.save();

    res.status(201).json({ message: 'User registration successful' });
  } catch (error) {
    console.error('Error registering user:', error);
    res.status(500).json({ error: 'Failed to register user' });
  }
});

// User login endpoint
app.post('/api/login', async (req, res) => {
  const { username, password } = req.body;

  try {
    // Check if the user exists
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    console.log(user)

    // Compare the provided password with the hashed password in the database
    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    console.log(passwordMatch)

    // Generate a JSON Web Token (JWT) for user authentication
    const token = jwt.sign({ userId: user._id }, JWT_SECRET, { expiresIn: '1h' });

    res.status(200).json({ token });
  } catch (error) {
    console.error('Error logging in:', error);
    res.status(500).json({ error: 'Failed to log in' });
  }
});

const authenticateUser = (req, res, next) => {
  const token = req.headers.authorization;

  if (!token) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    const [bearer, accessToken] = token.split(' ');

    if (bearer !== 'Bearer' || !accessToken) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    req.userId = jwt.verify(accessToken, JWT_SECRET).userId;
    next();
  } catch (error) {
    console.error('Error verifying token:', error);
    res.status(401).json({ error: 'Unauthorized' });
  }
};

// Create a new todo item
app.post('/api/todos', authenticateUser, async (req, res) => {
  const { title, userId } = req.body;

  const newTodo = new Todo({
    title,
    userId
  });

  try {
    const todo = await newTodo.save();
    res.status(201).json(todo);
  } catch (err) {
    console.error('Error saving todo:', err);
    res.status(500).json({ error: 'Failed to create a new todo' });
  }
});

// Get all todo items
app.get('/api/todos', authenticateUser, (req, res) => {
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

// Get a specific todo item by ID
app.get('/api/todos/:id', authenticateUser, (req, res) => {
  const todoId = req.params.id;

  Todo.findById(todoId)
  .exec()
  .then((todo) => {
    if (!todo) {
      res.status(404).json({ error: 'Todo not found' });
    } else {
      res.status(200).json(todo);
    }
  })
  .catch((err) => {
    console.error('Error fetching todo:', err);
    res.status(500).json({ error: 'Failed to fetch todo' });
  });
});

// Update a todo item
app.put('/api/todos/:id', authenticateUser, async (req, res) => {
  const todoId = req.params.id;
  const userId = req.userId;
  const updatedTodoData = req.body;

  try {
    // Find the todo by ID and user ID and update it
    const updatedTodo = await Todo.findOneAndUpdate(
      { _id: todoId, userId },
      { $set: updatedTodoData },
      { new: true }
    );

    if (!updatedTodo) {
      return res.status(404).json({ error: 'Todo not found or unauthorized to update' });
    }

    res.json({ message: 'Todo updated successfully', todo: updatedTodo });
  } catch (error) {
    console.error('Error updating todo:', error);
    res.status(500).json({ error: 'Failed to update todo' });
  }
});

// Delete a todo item
app.delete('/api/todos/:id', authenticateUser, async (req, res) => {
  const todoId = req.params.id;
  const userId = req.userId;

  try {
    // Find the todo by ID and user ID and delete it
    const deletedTodo = await Todo.findOneAndDelete({ _id: todoId, userId });

    if (!deletedTodo) {
      return res.status(404).json({ error: 'Todo not found or unauthorized to delete' });
    }

    res.json({ message: 'Todo deleted successfully', todo: deletedTodo });
  } catch (error) {
    console.error('Error deleting todo:', error);
    res.status(500).json({ error: 'Failed to delete todo' });
  }
});

  app.listen(PORT, () => {
    console.log(`Server started on port ${PORT}`);
  });
