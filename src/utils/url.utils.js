const { dirname, join } = require("path");
require('dotenv').config();

// Equivalente CommonJS a:
// const __filename = fileURLToPath(import.meta.url);
// const __dirname = join(dirname(__filename), "..");
const projectDir = join(dirname(__filename), "..");
const PORT = process.env.PORT || 5000;

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
  return `http://localhost:${PORT}`;
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
    const { swaggerSpec } = require('../config/swagger.js');
    
    // Usar la URL base desde .env
    const baseUrl = getBaseUrl();
    
    // Actualizar la configuración de Swagger
    if (swaggerSpec && swaggerSpec.servers && swaggerSpec.servers[0]) {
      swaggerSpec.servers[0].url = baseUrl;
    }
    
    next();
  } catch (error) {
    console.error('Error actualizando URL de Swagger:', error);
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
