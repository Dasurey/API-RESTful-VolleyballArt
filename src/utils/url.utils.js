// Importar constantes centralizadas primero
const {
  RELATIVE_PATHS,
  ENV_VARIABLES,
  CONFIG_VALUES,
  LOG_LEVELS,
  EXTERNAL_PACKAGES
} = require('../config/paths.config.js');
const { SYSTEM_MESSAGES } = require('./messages.utils.js');
const { InternalServerError } = require('./error.utils.js');

// Usar paquetes centralizados
const { dirname, join } = require(EXTERNAL_PACKAGES.PATH);
require(EXTERNAL_PACKAGES.DOTENV).config();

// Equivalente CommonJS a:
// const __filename = fileURLToPath(import.meta.url);
// const __dirname = join(dirname(__filename), "..");
const projectDir = join(dirname(__filename), "..");
const PORT = process.env[ENV_VARIABLES.PORT] || CONFIG_VALUES.DEFAULT_PORT;

/**
 * Función para obtener la URL base desde .env o localhost con puerto del .env
 * @returns {string} URL base completa
 */
function getBaseUrl() {
  // Si BASE_DOMAIN está definida en .env, usarla
  if (process.env[ENV_VARIABLES.BASE_DOMAIN]) {
    return process.env[ENV_VARIABLES.BASE_DOMAIN];
  }

  // Si no, construir localhost con el puerto del .env
  return `${CONFIG_VALUES.LOCALHOST_PROTOCOL}${PORT}`;
}

/**
 * Middleware para actualizar dinámicamente la URL de Swagger
 * @param {Object} req - Request object de Express
 * @param {Object} res - Response object de Express  
 * @param {Function} next - Next function
 */
function updateSwaggerUrl(req, res, next) {
  try {
    // Importar swaggerSpec de forma lazy para evitar dependencias circulares
    const { swaggerSpec } = require(RELATIVE_PATHS.FROM_UTILS.CONFIG_SWAGGER);
    const { logMessage } = require(RELATIVE_PATHS.FROM_UTILS.RESPONSE_UTILS);

    // Usar la URL base desde .env
    const baseUrl = getBaseUrl();

    // Actualizar la configuración de Swagger
    if (swaggerSpec && swaggerSpec.servers && swaggerSpec.servers[0]) {
      swaggerSpec.servers[0].url = baseUrl;
    }

    next();
  } catch (error) {
    // Usar error globalizado de error.utils.js
    const internalError = new InternalServerError(undefined, {
      operation: 'updateSwaggerUrl',
      originalError: error.message
    });
    console.error(internalError);
    next();
  }
}

module.exports = {
  __dirname: projectDir,
  join,
  getBaseUrl,
  updateSwaggerUrl,
  PORT
};
