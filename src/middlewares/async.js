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
 * - Captura errores
 * - Agrega contexto (nombre, requestId)
 * - Hace logging automático
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
 * Solo agrega contexto y re-lanza el error para que error.js lo maneje
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
 * Función de utilidad para validar condiciones y lanzar errores
 * (sin crear nuevos errores, solo para conveniencia)
 */
const validateAndThrow = (condition, ErrorClass, message, details = null) => {
  if (condition) {
    throw new ErrorClass(message, details);
  }
};

/**
 * Generar ID único para requests
 */
const generateRequestId = () => {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
};

/**
 * Middleware para agregar IDs únicos a las requests
 */
const requestIdMiddleware = (req, res, next) => {
  req.id = generateRequestId();
  res.setHeader('X-Request-ID', req.id);
  next();
};

/**
 * Wrapper simple para promesas que necesitan contexto adicional
 * Solo agrega contexto y re-lanza el error
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
