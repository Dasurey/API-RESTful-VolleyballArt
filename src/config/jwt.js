const jwt = require('jsonwebtoken');
const { AUTH_MESSAGES } = require('../utils/messages.utils.js');

const secret_key = process.env.JWT_SECRET_KEY;
const JWT_EXPIRATION = '1d';

const generateToken = (userData) => {
  const user = { id: userData.id, email: userData.email };
  const expiration = { expiresIn: JWT_EXPIRATION };

  return jwt.sign(user, secret_key, expiration);
};

const verifyToken = (token, res) => {
  try {
    return jwt.verify(token, secret_key);
  } catch (error) {
    return res.status(401).json({
      message: AUTH_MESSAGES.TOKEN_INVALID,
      error: error.message
    });
  }
};

module.exports = {
  generateToken,
  verifyToken,
  JWT_EXPIRATION
};