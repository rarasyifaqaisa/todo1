const express = require('express');
const router = express.Router();
const todoController = require('../controllers/todoController');
const authMiddleware = require('../utils/authMiddleware');

// Middleware untuk memerlukan autentikasi pada semua rute Todo
router.use(authMiddleware.requireAuth);

// Get all todos
router.get('/', todoController.getAllTodos);

// Create a new todo
router.post('/', todoController.createTodo);

// Get a single todo
router.get('/:id', todoController.getTodoById);

// Update a todo
router.put('/:id', todoController.updateTodo);

// Delete a todo
router.delete('/:id', todoController.deleteTodo);

module.exports = router;
