import authService from '../services/auth.service.js';

export const loginUser = async (req, res) => {
  const { email, password } = req.body;
  return authService.loginUser(req, res, email, password);
};

export const registerUser = async (req, res) => {
  const { email, password } = req.body;
  return authService.registerUser(req, res, email, password);
};
