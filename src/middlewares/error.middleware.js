const Logger = require('../config/logger.js');
const { AUTH_MESSAGES, GENERAL_MESSAGES, LOG_MESSAGES, SYSTEM_CONSTANTS } = require('../utils/messages.utils.js');

/**
 * Middleware global para manejo de errores
 * Captura todos los errores no manejados y los logea apropiadamente
 */
const errorHandler = (error, req, res, next) => {
  // Log del error completo
  Logger.error(`${LOG_MESSAGES.ERROR_LOG} ${error.message}`, {
    error: error.message,
    stack: error.stack,
    method: req.method,
    url: req.originalUrl,
    ip: req.ip,
    userAgent: req.get(SYSTEM_CONSTANTS.USER_AGENT_HEADER),
    userId: req.user?.id || SYSTEM_CONSTANTS.ANONYMOUS_USER,
    timestamp: new Date().toISOString(),
    requestBody: req.body ? JSON.stringify(req.body) : null
  });

  // Determinar el código de estado
  let statusCode = error.statusCode || error.status || 500;
  
  // Mensajes de error según el tipo usando mensajes centralizados
  let message = GENERAL_MESSAGES.INTERNAL_ERROR;
  let details = null;

  if (statusCode === 400) {
    message = GENERAL_MESSAGES.VALIDATION_ERROR;
  } else if (statusCode === 401) {
    message = AUTH_MESSAGES.UNAUTHORIZED;
  } else if (statusCode === 403) {
    message = GENERAL_MESSAGES.FORBIDDEN;
  } else if (statusCode === 404) {
    message = GENERAL_MESSAGES.NOT_FOUND_GENERIC;
  } else if (statusCode === 422) {
    message = GENERAL_MESSAGES.VALIDATION_ERROR;
  }

  // En desarrollo, mostrar más detalles del error
  if (process.env.NODE_ENV === SYSTEM_CONSTANTS.DEVELOPMENT_ENV) {
    details = {
      message: error.message,
      stack: error.stack,
      ...error
    };
  }

  // Respuesta al cliente con formato message + payload
  const errorResponse = {
    message,
    payload: {
      statusCode,
      timestamp: new Date().toISOString(),
      path: req.originalUrl,
      method: req.method,
      ...(details && { details })
    }
  };

  res.status(statusCode).json(errorResponse);
};

/**
 * Middleware para capturar errores de JSON malformado
 */
const jsonErrorHandler = (error, req, res, next) => {
  if (error instanceof SyntaxError && error.status === 400 && 'body' in error) {
    Logger.warn(`${LOG_MESSAGES.JSON_ERROR_LOG} ${req.ip}`, {
      error: error.message,
      method: req.method,
      url: req.originalUrl,
      ip: req.ip,
      userAgent: req.get(SYSTEM_CONSTANTS.USER_AGENT_HEADER),
      timestamp: new Date().toISOString()
    });

    return res.status(400).json({
      message: GENERAL_MESSAGES.JSON_MALFORMED,
      payload: {
        statusCode: 400,
        error: error.message,
        timestamp: new Date().toISOString(),
        path: req.originalUrl,
        method: req.method
      }
    });
  }
  
  next(error);
};

/**
 * Middleware para rutas no encontradas (404)
 */
const notFoundHandler = (req, res, next) => {
  Logger.warn(`${LOG_MESSAGES.ROUTE_NOT_FOUND_LOG} ${req.method} ${req.originalUrl}`, {
    method: req.method,
    url: req.originalUrl,
    ip: req.ip,
    userAgent: req.get(SYSTEM_CONSTANTS.USER_AGENT_HEADER),
    timestamp: new Date().toISOString()
  });

  res.status(404).json({
    message: GENERAL_MESSAGES.NOT_FOUND_ROUTE,
    payload: {
      statusCode: 404,
      timestamp: new Date().toISOString(),
      path: req.originalUrl,
      method: req.method,
      suggestion: SYSTEM_CONSTANTS.API_ENDPOINT_HELP
    }
  });
};


module.exports = {
  errorHandler,
  jsonErrorHandler,
  notFoundHandler
};