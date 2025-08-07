const { AuthenticationError } = require('../middlewares/error');

const jwt = require('jsonwebtoken');

const secret_key = process.env.JWT_SECRET_KEY;
const JWT_EXPIRATION = '1d';

const generateToken = (userData) => {
  const user = {
    id: userData.id,
    email: userData.email
  };
  const expiration = { expiresIn: JWT_EXPIRATION };

  return jwt.sign(user, secret_key, expiration);
};

const verifyToken = (token) => {
  try {
    return jwt.verify(token, secret_key);
  } catch (error) {
    throw new AuthenticationError();
  }
};

module.exports = {
  generateToken,
  verifyToken,
  JWT_EXPIRATION
};