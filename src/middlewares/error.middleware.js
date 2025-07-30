const Logger = require('../config/logger.js');

/**
 * Middleware global para manejo de errores
 * Captura todos los errores no manejados y los logea apropiadamente
 */
const errorHandler = (error, req, res, next) => {
  // Log del error completo
  Logger.error(`🚨 [ERROR] ${error.message}`, {
    error: error.message,
    stack: error.stack,
    method: req.method,
    url: req.originalUrl,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    userId: req.user?.id || 'anonymous',
    timestamp: new Date().toISOString(),
    requestBody: req.body ? JSON.stringify(req.body) : null
  });

  // Determinar el código de estado
  let statusCode = error.statusCode || error.status || 500;
  
  // Mensajes de error según el tipo
  let message = 'Error interno del servidor';
  let details = null;

  if (statusCode === 400) {
    message = 'Solicitud incorrecta';
  } else if (statusCode === 401) {
    message = 'No autorizado';
  } else if (statusCode === 403) {
    message = 'Acceso prohibido';
  } else if (statusCode === 404) {
    message = 'Recurso no encontrado';
  } else if (statusCode === 422) {
    message = 'Datos de entrada inválidos';
  }

  // En desarrollo, mostrar más detalles del error
  if (process.env.NODE_ENV === 'development') {
    details = {
      message: error.message,
      stack: error.stack,
      ...error
    };
  }

  // Respuesta al cliente
  const errorResponse = {
    success: false,
    message,
    statusCode,
    timestamp: new Date().toISOString(),
    path: req.originalUrl,
    method: req.method,
    ...(details && { details })
  };

  res.status(statusCode).json(errorResponse);
};

/**
 * Middleware para capturar errores de JSON malformado
 */
const jsonErrorHandler = (error, req, res, next) => {
  if (error instanceof SyntaxError && error.status === 400 && 'body' in error) {
    Logger.warn(`⚠️ [JSON_ERROR] JSON malformado desde ${req.ip}`, {
      error: error.message,
      method: req.method,
      url: req.originalUrl,
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      timestamp: new Date().toISOString()
    });

    return res.status(400).json({
      success: false,
      message: 'JSON malformado. Verifica la sintaxis de los datos enviados.',
      statusCode: 400,
      error: error.message,
      timestamp: new Date().toISOString(),
      path: req.originalUrl
    });
  }
  
  next(error);
};

/**
 * Middleware para rutas no encontradas (404)
 */
const notFoundHandler = (req, res, next) => {
  Logger.warn(`🔍 [404] Ruta no encontrada: ${req.method} ${req.originalUrl}`, {
    method: req.method,
    url: req.originalUrl,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    timestamp: new Date().toISOString()
  });

  res.status(404).json({
    success: false,
    message: 'Recurso no encontrado o ruta inválida',
    statusCode: 404,
    timestamp: new Date().toISOString(),
    path: req.originalUrl,
    method: req.method,
    suggestion: 'Verifica la URL y el método HTTP. Consulta /api para ver endpoints disponibles.'
  });
};


module.exports = {
  errorHandler,
  jsonErrorHandler,
  notFoundHandler
};