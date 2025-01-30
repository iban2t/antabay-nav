const jwt = require('jsonwebtoken');

const config = require('../config/config');
const secret_key = config.secretKey;

function authenticateToken(req, res, next) {
  const token = req.headers.authorization;
  console.log('Middleware - Raw token:', token);

  if (!token) {
    console.log('Middleware - No token found');
    return res.status(401).json({ error: 'Unauthorized' });
  }

  jwt.verify(token, secret_key, (err, decodedToken) => {
    if (err) {
      console.error('Middleware - Token verification failed:', err);
      return res.status(403).json({ error: 'Forbidden' });
    }

    console.log('Middleware - Decoded token:', decodedToken);
    req.userId = decodedToken.userId;
    console.log('Middleware - Set userId:', req.userId);

    next();
  });
}

module.exports = authenticateToken;