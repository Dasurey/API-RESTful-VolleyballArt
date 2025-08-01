const { AUTH_MESSAGES, JWT_CONSTANTS } = require('../utils/messages.utils.js');
const { EXTERNAL_PACKAGES, HTTP_STATUS } = require('./paths.config.js');
const jwt = require(EXTERNAL_PACKAGES.JSONWEBTOKEN);

const secret_key = process.env.JWT_SECRET_KEY;
const JWT_EXPIRATION = JWT_CONSTANTS.EXPIRATION_1_DAY;

const generateToken = (userData) => {
  const user = {
    id: userData.id,
    email: userData.email
  };
  const expiration = { expiresIn: JWT_EXPIRATION };

  return jwt.sign(user, secret_key, expiration);
};

const verifyToken = (token, res) => {
  try {
    return jwt.verify(token, secret_key);
  } catch (error) {
    return res.status(HTTP_STATUS.UNAUTHORIZED).json({
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