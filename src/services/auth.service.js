const authModel = require('../model/auth.model');
const { generateToken } = require('../config/jwt.config');

const loginUser = async (req, res, email, password) => {
  return authModel.loginUser(req, res, email, password);
};

// Registro temporalmente deshabilitado
/*
const registerUser = async (req, res, email, password) => {
  return authModel.registerUser(req, res, email, password);
};
*/

module.exports = { 
  loginUser
  // registerUser // Temporalmente deshabilitado
};
