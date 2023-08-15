const express = require('express');
const router = express.Router();
const todoController = require('../controllers/todoController');
const { authenticateUser } = require('../utils/authMiddleware');
const { checkAdminRole } = require('../utils/checkRole');

// Middleware
router.use(express.json());
router.use(express.urlencoded({ extended: true }));

// Get all todo items
router.get('/api/todos', authenticateUser, (req, res) => {
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

// Create a new todo item
router.post('/api/todos', authenticateUser, async (req, res) => {
    const { title, user } = req.body;
  
    const newTodo = new Todo({
      title,
      user
    });
  
    try {
      const todo = await newTodo.save();
      res.status(201).json(todo);
    } catch (err) {
      console.error('Error saving todo:', err);
      res.status(500).json({ error: 'Failed to create a new todo' });
    }
  });

// Get a specific todo item by ID
router.get('/api/todos/:id', authenticateUser, (req, res) => {
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
router.put('/api/todos/:id', authenticateUser, async (req, res) => {
    const todoId = req.params.id;
    const user = req.user;
    const updatedTodoData = req.body;
  
    try {
      // Find the todo by ID and user ID and update it
      const updatedTodo = await Todo.findOneAndUpdate(
        { _id: todoId, user },
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
router.delete('/api/todos/:id', authenticateUser, async (req, res) => {
    const todoId = req.params.id;
    const user = req.user;
  
    try {
      // Find the todo by ID and user ID and delete it
      const deletedTodo = await Todo.findOneAndDelete({ _id: todoId, user });
  
      if (!deletedTodo) {
        return res.status(404).json({ error: 'Todo not found or unauthorized to delete' });
      }
  
      res.json({ message: 'Todo deleted successfully', todo: deletedTodo });
    } catch (error) {
      console.error('Error deleting todo:', error);
      res.status(500).json({ error: 'Failed to delete todo' });
    }
  });

module.exports = router;
