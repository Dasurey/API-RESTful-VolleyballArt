const authService = require('../services/auth.service.js');
const { AUTH_MESSAGES } = require('../utils/messages.utils.js');
const { executeController } = require("../utils/controller.utils.js");

const loginUser = async (req, res) => {
  const { email, password } = req.body;
  
  return executeController(
    () => authService.loginUser(req, res, email, password),
    req,
    res,
    AUTH_MESSAGES.LOGIN_SUCCESS,
    AUTH_MESSAGES.LOGIN_ERROR,
    { 
      operation: AUTH_MESSAGES.OPERATION_LOGIN,
      email: email // No incluir password por seguridad
    }
  );
};

const registerUser = async (req, res) => {
  const { email, password } = req.body;
  
  return executeController(
    () => authService.registerUser(req, res, email, password),
    req,
    res,
    AUTH_MESSAGES.REGISTER_SUCCESS,
    AUTH_MESSAGES.REGISTER_ERROR,
    { 
      operation: AUTH_MESSAGES.OPERATION_REGISTER,
      email: email // No incluir password por seguridad
    }
  );
};

module.exports = {
  loginUser,
  registerUser
};
