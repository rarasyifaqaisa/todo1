const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Middleware untuk memeriksa keberadaan dan validitas token JWT
const requireAuth = async (req, res, next) => {
  const token = req.headers.authorization;

  if (token) {
    try {
      const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decodedToken.userId);
      if (user) {
        req.user = user;
        next();
      } else {
        throw new Error('User not found');
      }
    } catch (error) {
      res.status(401).json({ error: 'Invalid token' });
    }
  } else {
    res.status(401).json({ error: 'Authentication required' });
  }
};

module.exports = {
  requireAuth,
};
