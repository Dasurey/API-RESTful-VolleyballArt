import * as authModel from '../model/auth.model.js';
import { generateToken } from '../utils/tokenGenerator.js';

const loginUser = async (user) => {
  const userData = await authModel.loginUser(user);
  return generateToken(userData);
};

export default { loginUser };
