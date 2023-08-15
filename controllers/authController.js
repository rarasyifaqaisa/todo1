const jwt = require('jsonwebtoken');
const User = require('../models/User');

const handleErrors = (message) => {
  throw new Error(message);
};

const maxAge = 24 * 60 * 60; // Token berlaku selama 24 jam

const createToken = (user) => {
  return jwt.sign({ user }, process.env.JWT_SECRET, {
    expiresIn: maxAge,
  });
};

// Controller untuk melakukan registrasi pengguna baru
const register = async (req, res) => {
  try {
    const { username, password } = req.body;

    // Buat instansi user baru
    const user = new User({ username, password });

    // Simpan user ke database
    await user.save();

    // Buat token
    const token = createToken(user._id);

    // Kirim token sebagai response
    res.status(201).json({ token });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Controller untuk melakukan login
const login = async (req, res) => {
  try {
    const { username, password } = req.body;

    // Cari user berdasarkan username
    const user = await User.findOne({ username });

    // Jika user ditemukan, verifikasi password
    if (user) {
      const isPasswordValid = await user.comparePassword(password);
      if (isPasswordValid) {
        // Buat token
        const token = createToken(user._id);

        // Kirim token sebagai response
        res.status(200).json({ token });
      } else {
        throw new Error('Invalid username or password');
      }
    } else {
      throw new Error('Invalid username or password');
    }
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Controller to get the current user's information based on req.user
const getCurrentUser = async (req, res) => {
  try {
    // Check if req.user is populated with user data
    if (!req.user) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    // User data should be available in req.user
    const user = req.user;
    
    // Send the user object back as the response
    res.status(200).json({ user });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  register,
  login,
  getCurrentUser,
};
