const { AuthenticationError } = require('../middlewares/error');

const jwt = require('jsonwebtoken');

const secret_key = process.env.JWT_SECRET_KEY;
const JWT_EXPIRATION = '1d';

/**
 * Genera un token JWT para el usuario proporcionado.
 * @param {Object} userData - Datos del usuario (debe incluir id y email).
 * @returns {string} Token JWT generado.
 */
const generateToken = (userData) => {
  const user = {
    id: userData.id,
    email: userData.email
  };
  const expiration = { expiresIn: JWT_EXPIRATION };

  return jwt.sign(user, secret_key, expiration);
};

/**
 * Verifica y decodifica un token JWT.
 * @param {string} token - Token JWT a verificar.
 * @returns {Object} Datos decodificados del usuario si el token es válido.
 * @throws {AuthenticationError} Si el token no es válido o expiró.
 */
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