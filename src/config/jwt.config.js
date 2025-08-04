const { JWT_CONSTANTS, SERVICE_MESSAGES } = require('../utils/messages.utils.js');
const { EXTERNAL_PACKAGES, HTTP_STATUS, RELATIVE_PATHS } = require('./paths.config.js');
const { AuthenticationError } = require('../utils/error.utils.js');
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