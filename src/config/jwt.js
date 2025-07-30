const jwt = require('jsonwebtoken');

const secret_key = process.env.JWT_SECRET_KEY;

const generateToken = (userData) => {
  const user = { id: userData.id, email: userData.email };
  const expiration = { expiresIn: '1h' };

  return jwt.sign(user, secret_key, expiration);
};

const verifyToken = (token, res) => {
  try {
    return jwt.verify(token, secret_key);
  } catch (error) {
    return res.status(401).json({
      message: 'Token inválido',
      error: error.message
    });
  }
};

module.exports = {
  generateToken,
  verifyToken
};