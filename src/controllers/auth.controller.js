const authService = require('../services/auth.service.js');

const loginUser = async (req, res) => {
  const { email, password } = req.body;
  return authService.loginUser(req, res, email, password);
};

const registerUser = async (req, res) => {
  const { email, password } = req.body;
  return authService.registerUser(req, res, email, password);
};

module.exports = {
  loginUser,
  registerUser
};
