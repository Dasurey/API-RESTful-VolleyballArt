const { RELATIVE_PATHS } = require('../config/paths.js');
const authModel = require(RELATIVE_PATHS.FROM_SERVICES.MODELS_AUTH);
const { generateToken } = require(RELATIVE_PATHS.FROM_SERVICES.CONFIG_JWT);

const loginUser = async (req, res, email, password) => {
  return authModel.loginUser(req, res, email, password);
};

const registerUser = async (req, res, email, password) => {
  return authModel.registerUser(req, res, email, password);
};

module.exports = { loginUser, registerUser };
