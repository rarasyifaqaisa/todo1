const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { authenticateUser } = require('../utils/authMiddleware');

// User registration endpoint
router.post('/api/register', async (req, res) => {
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
router.post('/api/login', async (req, res) => {
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
      const token = jwt.sign({ user: user._id }, JWT_SECRET, { expiresIn: '1h' });
  
      res.status(200).json({ token });
    } catch (error) {
      console.error('Error logging in:', error);
      res.status(500).json({ error: 'Failed to log in' });
    }
  });

// Get current user information endpoint
router.get('/user/me', authenticateUser, authController.getCurrentUser);

module.exports = router;
