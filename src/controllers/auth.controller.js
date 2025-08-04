const { RELATIVE_PATHS } = require('../config/paths.config.js');
const { AUTH_MESSAGES } = require('../utils/messages.utils.js');
const authService = require(RELATIVE_PATHS.FROM_CONTROLLERS.SERVICES_AUTH);
const { controllerWrapper } = require('../utils/async.utils.js');

const loginUser = controllerWrapper(async (req, res) => {
  const { email, password } = req.body;
  
  const result = await authService.loginUser(req, res, email, password);
  
  // El servicio ya maneja la respuesta HTTP directamente
  return result;
});

// Registro temporalmente deshabilitado - TODO: Implementar sistema de roles
/*
const registerUser = controllerWrapper(async (req, res) => {
  const { email, password } = req.body;
  
  const result = await authService.registerUser(req, res, email, password);
  
  // El servicio ya maneja la respuesta HTTP directamente
  return result;
});
*/

module.exports = {
  loginUser
  // registerUser // Temporalmente deshabilitado
};
