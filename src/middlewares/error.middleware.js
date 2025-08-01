const { AUTH_MESSAGES, GENERAL_MESSAGES, LOG_MESSAGES, SYSTEM_CONSTANTS } = require('../utils/messages.utils.js');
const { RELATIVE_PATHS, HTTP_STATUS, ERROR_HANDLING } = require('../config/paths.config.js');
const Logger = require(RELATIVE_PATHS.FROM_MIDDLEWARES.CONFIG_LOGGER);

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
  let statusCode = error.statusCode || error.status || ERROR_HANDLING.DEFAULT_ERROR_STATUS;
  
  // Mensajes de error según el tipo usando mensajes centralizados
  let message = GENERAL_MESSAGES.INTERNAL_ERROR;
  let details = null;

  if (statusCode === HTTP_STATUS.BAD_REQUEST) {
    message = GENERAL_MESSAGES.VALIDATION_ERROR;
  } else if (statusCode === HTTP_STATUS.UNAUTHORIZED) {
    message = AUTH_MESSAGES.UNAUTHORIZED;
  } else if (statusCode === HTTP_STATUS.FORBIDDEN) {
    message = GENERAL_MESSAGES.FORBIDDEN;
  } else if (statusCode === HTTP_STATUS.NOT_FOUND) {
    message = GENERAL_MESSAGES.NOT_FOUND_GENERIC;
  } else if (statusCode === HTTP_STATUS.UNPROCESSABLE_ENTITY) {
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
  if (error instanceof SyntaxError && error.status === HTTP_STATUS.BAD_REQUEST && ERROR_HANDLING.BODY_PROPERTY in error) {
    Logger.warn(`${LOG_MESSAGES.JSON_ERROR_LOG} ${req.ip}`, {
      error: error.message,
      method: req.method,
      url: req.originalUrl,
      ip: req.ip,
      userAgent: req.get(SYSTEM_CONSTANTS.USER_AGENT_HEADER),
      timestamp: new Date().toISOString()
    });

    return res.status(HTTP_STATUS.BAD_REQUEST).json({
      message: GENERAL_MESSAGES.JSON_MALFORMED,
      payload: {
        statusCode: HTTP_STATUS.BAD_REQUEST,
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

  res.status(HTTP_STATUS.NOT_FOUND).json({
    message: GENERAL_MESSAGES.NOT_FOUND_ROUTE,
    payload: {
      statusCode: HTTP_STATUS.NOT_FOUND,
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