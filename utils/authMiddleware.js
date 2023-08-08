const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Middleware untuk memeriksa keberadaan dan validitas token JWT
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

module.exports = authenticateUser;
