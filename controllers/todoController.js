const Todo = require('../models/Todo');

// Controller untuk mendapatkan semua todos
const getAllTodos = async (req, res) => {
  try {
    const todos = await Todo.find({ userId: req.user._id });
    res.status(200).json({ todos });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Controller untuk membuat todo baru
const createTodo = async (req, res) => {
  try {
    const { title } = req.body;

    // Buat instansi todo baru
    const todo = new Todo({
      title,
      userId: req.user._id,
    });

    // Simpan todo ke database
    await todo.save();

    res.status(201).json({ todo });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Controller untuk mendapatkan todo berdasarkan ID
const getTodoById = async (req, res) => {
  try {
    const { id } = req.params;

    // Cari todo berdasarkan ID dan userId
    const todo = await Todo.findOne({ _id: id, userId: req.user._id });

    if (todo) {
      res.status(200).json({ todo });
    } else {
      throw new Error('Todo not found');
    }
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Controller untuk mengupdate todo
const updateTodo = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, completed } = req.body;

    // Cari dan update todo berdasarkan ID dan userId
    const todo = await Todo.findOneAndUpdate(
      { _id: id, userId: req.user._id },
      { title, completed },
      { new: true }
    );

    if (todo) {
      res.status(200).json({ todo });
    } else {
      throw new Error('Todo not found');
    }
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Controller untuk menghapus todo
const deleteTodo = async (req, res) => {
  try {
    const { id } = req.params;

    // Hapus todo berdasarkan ID dan userId
    await Todo.findOneAndDelete({ _id: id, userId: req.user._id });

    res.status(200).json({ message: 'Todo deleted successfully' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

module.exports = {
  getAllTodos,
  createTodo,
  getTodoById,
  updateTodo,
  deleteTodo,
};
