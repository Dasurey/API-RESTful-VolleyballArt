// Importar constantes centralizadas primero
const { CONFIG_VALUES } = require('../config/paths');
const { logError } = require('../config/log');
const { swaggerSpec } = require('../config/swagger');

const { dirname, join } = require('path');
require('dotenv').config();

// Equivalente CommonJS a:
// const __filename = fileURLToPath(import.meta.url);
// const __dirname = join(dirname(__filename), "..");
const projectDir = join(dirname(__filename), "..");
const PORT = process.env.PORT || CONFIG_VALUES.DEFAULT_PORT;

/**
 * Función para obtener la URL base desde .env o localhost con puerto del .env
 * @returns {string} URL base completa
 */
function getBaseUrl() {
  // Si BASE_DOMAIN está definida en .env, usarla
  if (process.env.BASE_DOMAIN) {
    return process.env.BASE_DOMAIN;
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
    // Usar la URL base desde .env
    const baseUrl = getBaseUrl();

    // Actualizar la configuración de Swagger
    if (swaggerSpec && swaggerSpec.servers && swaggerSpec.servers[0]) {
      swaggerSpec.servers[0].url = baseUrl;
    }

    next();
  } catch (error) {
    // Log error usando sistema global - middleware no crítico, continuar
    logError('Error al actualizar URL de Swagger', {
      operation: 'updateSwaggerUrl',
      originalError: error.message,
      middleware: 'swagger_url_update'
    }, 'SYSTEM');
    next();
  }
}

/**
 * URLs de endpoints centralizadas
 * @param {string} baseUrl - URL base del servidor
 * @returns {Object} - Objeto con todas las URLs de endpoints
 */
function getEndpointUrls(baseUrl) {
  return {
    api: `${baseUrl}/api`,
    documentation: `${baseUrl}/api/docs`,
    products: `${baseUrl}/api/products`,
    categoryHierarchy: `${baseUrl}/api/category/hierarchy`,
    system: `${baseUrl}/api/status`,
    cache: `${baseUrl}/api/cache/stats`,
    health: `${baseUrl}/api/health`,
    metrics: `${baseUrl}/api/metrics`,
    debug: `${baseUrl}/api/debug`,
    swagger: `${baseUrl}/api/swagger.json`
  };
}

module.exports = {
  __dirname: projectDir,
  join,
  getBaseUrl,
  getEndpointUrls,
  updateSwaggerUrl,
  PORT
};
