import * as authModel from '../model/auth.model.js';
import { generateToken } from '../utils/tokenGenerator.js';

const loginUser = async (req, res, email, password) => {
  return authModel.loginUser(req, res, email, password);
};

const registerUser = async (req, res, email, password) => {
  return authModel.registerUser(req, res, email, password);
};

export default { loginUser, registerUser };
