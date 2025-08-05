// Importar constantes centralizadas primero
const { CONFIG_VALUES, API_ENDPOINTS, API_ENDPOINTS_PATHS } = require('../config/paths.config');
const { logError } = require('./log.utils');
// Importar swaggerSpec de forma lazy para evitar dependencias circulares
    const { swaggerSpec } = require('../config/swagger.config');

// Usar paquetes centralizados
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
    api: `${baseUrl}${API_ENDPOINTS.API_ROOT}`,
    documentation: `${baseUrl}${API_ENDPOINTS.API_DOCS}`,
    products: `${baseUrl}${API_ENDPOINTS.PRODUCTS_BASE}`,
    categoryHierarchy: `${baseUrl}${API_ENDPOINTS.CATEGORY_HIERARCHY_FULL}`,
    system: `${baseUrl}${API_ENDPOINTS_PATHS.STATUS}`,
    cache: `${baseUrl}${API_ENDPOINTS.CACHE_STATS}`,
    health: `${baseUrl}${API_ENDPOINTS.HEALTH}`,
    metrics: `${baseUrl}${API_ENDPOINTS.METRICS}`,
    debug: `${baseUrl}${API_ENDPOINTS.DEBUG}`,
    swagger: `${baseUrl}${API_ENDPOINTS.SWAGGER_JSON}`
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
