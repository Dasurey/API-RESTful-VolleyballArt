const { RELATIVE_PATHS, HTTP_STATUS } = require('../config/paths.config.js');
const { ASYNC_UTILS_CONSTANTS } = require('./messages.utils.js');
const { InternalServerError } = require(RELATIVE_PATHS.ERROR_UTILS);

/**
 * Wrapper para funciones async que automáticamente captura errores
 * y los pasa al middleware de manejo de errores
 */
const asyncHandler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

/**
 * Wrapper más específico para controladores con logging mejorado
 */
const controllerWrapper = (fn, controllerName = ASYNC_UTILS_CONSTANTS.UNKNOWN_DEFAULT) => {
  return asyncHandler(async (req, res, next) => {
    try {
      await fn(req, res, next);
    } catch (error) {
      // Agregar contexto del controlador al error
      if (error.isOperational !== true) {
        error.controllerContext = controllerName;
        error.requestId = req.id || `${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
      }
      throw new InternalServerError(undefined, {
        operation: 'controllerWrapper',
        controllerName,
        requestId: req.id,
        originalError: error.message
      });
    }
  });
};

/**
 * Wrapper para servicios de base de datos
 */
const dbServiceWrapper = (fn, serviceName = ASYNC_UTILS_CONSTANTS.UNKNOWN_DEFAULT) => {
  return async (...args) => {
    try {
      return await fn(...args);
    } catch (error) {
      // Agregar contexto del servicio al error
      if (!error.isOperational) {
        error.serviceContext = serviceName;
        error.serviceArgs = args.length > 0 ? JSON.stringify(args) : null;
      }
      throw new InternalServerError(undefined, {
        operation: 'dbServiceWrapper',
        serviceName,
        serviceArgs: args.length > 0 ? JSON.stringify(args) : null,
        originalError: error.message
      });
    }
  };
};

/**
 * Función para validar y lanzar errores de validación
 */
const validateAndThrow = (condition, ErrorClass, message, details = null) => {
  if (condition) {
    throw new ErrorClass(message, details);
  }
};

/**
 * Función para crear respuestas de error consistentes
 */
const createErrorResponse = (error, req) => {
  const isProduction = process.env.NODE_ENV === ASYNC_UTILS_CONSTANTS.PRODUCTION_ENV;
  
  return {
    message: error.message,
    payload: {
      statusCode: error.statusCode || HTTP_STATUS.INTERNAL_SERVER_ERROR,
      errorCode: error.code || ASYNC_UTILS_CONSTANTS.UNKNOWN_ERROR_CODE,
      timestamp: error.timestamp || new Date().toISOString(),
      path: req.originalUrl,
      method: req.method,
      requestId: req.id,
      ...(error.details && { details: error.details }),
      ...(!isProduction && {
        development: {
          stack: error.stack,
          isOperational: error.isOperational
        }
      })
    }
  };
};

/**
 * Middleware para agregar IDs únicos a las requests
 */
const requestIdMiddleware = (req, res, next) => {
  req.id = `${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
  res.setHeader(ASYNC_UTILS_CONSTANTS.X_REQUEST_ID_HEADER, req.id);
  next();
};

/**
 * Función para logear errores de manera consistente
 */
const logError = (error, req, logger) => {
  const logData = {
    message: error.message,
    errorCode: error.code || ASYNC_UTILS_CONSTANTS.UNKNOWN_ERROR_CODE,
    statusCode: error.statusCode || HTTP_STATUS.INTERNAL_SERVER_ERROR,
    requestId: req.id,
    method: req.method,
    url: req.originalUrl,
    ip: req.ip,
    userAgent: req.get(ASYNC_UTILS_CONSTANTS.USER_AGENT_HEADER),
    userId: req.user?.id || ASYNC_UTILS_CONSTANTS.ANONYMOUS_USER,
    timestamp: error.timestamp || new Date().toISOString(),
    isOperational: error.isOperational || false,
    ...(error.details && { details: error.details }),
    ...(error.stack && { stack: error.stack })
  };

  if (error.statusCode >= HTTP_STATUS.INTERNAL_SERVER_ERROR) {
    logger.error(ASYNC_UTILS_CONSTANTS.SERVER_ERROR_MESSAGE, logData);
  } else if (error.statusCode >= HTTP_STATUS.BAD_REQUEST) {
    logger.warn(ASYNC_UTILS_CONSTANTS.CLIENT_ERROR_MESSAGE, logData);
  } else {
    logger.info(ASYNC_UTILS_CONSTANTS.ERROR_INFO_MESSAGE, logData);
  }
};

module.exports = {
  asyncHandler,
  controllerWrapper,
  dbServiceWrapper,
  validateAndThrow,
  createErrorResponse,
  requestIdMiddleware,
  logError
};
