const authService = require('../services/auth.service');
const { controllerWrapper } = require('../middlewares/async');
const { createSuccessWithLog } = require('../utils/success');

const loginUser = controllerWrapper(async (req, res) => {
  const { email, password } = req.body;
  const result = await authService.loginUser(email, password);
  return createSuccessWithLog(
    res,
    200,
    '🔐 Inicio de sesión exitoso',
    result,
    null,
    'info'
  ).send(res);
}, 'loginUser');

// Registro temporalmente deshabilitado - TODO: Implementar sistema de roles
/*
const registerUser = controllerWrapper(async (req, res) => {
  const { email, password } = req.body;
  const result = await authService.registerUser(email, password);
  return createSuccessWithLog(
    res,
    201,
    '👤 Usuario registrado exitosamente',
    result,
    null,
    'info'
  ).send(res);
}, 'registerUser');
*/

module.exports = {
  loginUser
  // registerUser // Temporalmente deshabilitado
};
