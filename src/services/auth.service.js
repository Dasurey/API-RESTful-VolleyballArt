const authModel = require('../model/auth.model.js');
const { generateToken } = require('../config/jwt.js');

const loginUser = async (req, res, email, password) => {
  return authModel.loginUser(req, res, email, password);
};

const registerUser = async (req, res, email, password) => {
  return authModel.registerUser(req, res, email, password);
};

module.exports = { loginUser, registerUser };;
