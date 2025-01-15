const jwt = require('jsonwebtoken');

const config = require('../config/config');
const secret_key = config.secretKey;

function authenticateToken(req, res, next) {
  const token = req.headers.authorization;

  if (!token) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  jwt.verify(token, secret_key, (err, decodedToken) => {
    if (err) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    req.userId = decodedToken.userId;

    next();
  });
}

module.exports = authenticateToken;