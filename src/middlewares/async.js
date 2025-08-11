/**
 * 🔄 Utilidades para Manejo de Código Asíncrono
 * 
 * Este archivo proporciona wrappers para capturar errores async/await
 * y agregar contexto útil sin modificar los errores originales.
 * 
 * Responsabilidades:
 * - Capturar errores en funciones asíncronas
 * - Agregar contexto (controlador, servicio, requestId)
 * - Pasar errores al middleware global de manejo de errores
 */

const { logAndExecute } = require('../config/log');

/**
 * Wrapper avanzado para controladores/middlewares async
 * @param {Function} fn - Función async del controlador
 * @param {string} [name='Unknown'] - Nombre para contexto/logging
 * @returns {Function} Middleware Express
 */
const controllerWrapper = (fn, name = 'Unknown') => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch((error) => {
      // Agregar contexto útil
      error.controllerContext = name;
      error.requestId = req.id || (typeof generateRequestId === 'function' ? generateRequestId() : undefined);

      // Logging automático
      logAndExecute('error', `🚨 Async error [${name.toUpperCase()}]`, {
        name,
        error: error.message,
        stack: error.stack,
        url: req.originalUrl || req.url,
        method: req.method,
        requestId: error.requestId
      }, 'ERROR');

      // Pasar el error al middleware global de manejo de errores
      next(error);
    });
  };
};

/**
 * Wrapper para servicios de base de datos
 * @param {Function} fn - Función async del servicio
 * @param {string} [serviceName='Unknown'] - Nombre para contexto/logging
 * @returns {Function} Función async con manejo de errores
 */
const dbServiceWrapper = (fn, serviceName = 'Unknown') => {
  return async (...args) => {
    try {
      return await fn(...args);
    } catch (error) {
      // Agregar contexto del servicio sin modificar el error original
      error.serviceContext = serviceName;
      error.serviceArgs = args.length > 0 ? JSON.stringify(args).slice(0, 200) : null;
      
      // Re-lanzar el error original para que error.js lo maneje globalmente
      throw error;
    }
  };
};

/**
 * Validar condición y lanzar error si se cumple
 * @param {boolean} condition - Condición a validar
 * @param {Error} ErrorClass - Clase de error a lanzar
 * @param {string} message - Mensaje de error
 * @param {any} [details=null] - Detalles adicionales
 */
const validateAndThrow = (condition, ErrorClass, message, details = null) => {
  if (condition) {
    throw new ErrorClass(message, details);
  }
};

/**
 * Generar ID único para requests
 * @returns {string} ID generado
 */
const generateRequestId = () => {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
};

/**
 * Middleware para agregar IDs únicos a las requests
 * @param {Request} req
 * @param {Response} res
 * @param {Function} next
 */
const requestIdMiddleware = (req, res, next) => {
  req.id = generateRequestId();
  res.setHeader('X-Request-ID', req.id);
  next();
};

/**
 * Wrapper simple para promesas con contexto adicional
 * @param {Function} fn - Función async
 * @param {Object} [context={}] - Contexto adicional para el error
 * @returns {Promise<any>}
 */
const withContext = async (fn, context = {}) => {
  try {
    return await fn();
  } catch (error) {
    // Agregar contexto proporcionado al error
    Object.assign(error, context);
    
    // Re-lanzar el error para que error.js lo maneje globalmente
    throw error;
  }
};

module.exports = {
  controllerWrapper,
  dbServiceWrapper,
  validateAndThrow,
  requestIdMiddleware,
  generateRequestId,
  withContext
};
