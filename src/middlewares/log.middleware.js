const { Logger, InfoLog } = require('../config/log');

const morgan = require('morgan');

// Formato personalizado para Morgan que incluye más información útil
const customFormat = ':remote-addr - :remote-user [:date[clf]] ":method :url HTTP/:http-version" :status :res[content-length] ":referrer" ":user-agent" - :response-time ms';

/**
 * Determina si Morgan debe omitir el log según el código de estado y entorno.
 * @param {import('express').Request} req - Objeto de la petición Express.
 * @param {import('express').Response} res - Objeto de la respuesta Express.
 * @returns {boolean} True si se debe omitir el log, false si se debe logear.
 */
const skip = (req, res) => {
  // En desarrollo, logear todo
  if (process.env.NODE_ENV === 'development') {
    return false;
  }
  
  // En producción, solo logear errores y requests importantes
  return res.statusCode < 400;
};

/**
 * Middleware de Morgan para logging HTTP con formato personalizado.
 * @type {import('express').RequestHandler}
 */
const httpLogger = morgan(customFormat, {
  stream: Logger.stream,
  skip,
});

/**
 * Middleware de Morgan para logging HTTP en desarrollo (formato simple y colorido).
 * @type {import('express').RequestHandler}
 */
const devLogger = morgan('dev', {
  stream: Logger.stream,
});

/**
 * Middleware personalizado para loguear información de requests y responses HTTP.
 * @param {import('express').Request} req - Objeto de la petición Express.
 * @param {import('express').Response} res - Objeto de la respuesta Express.
 * @param {Function} next - Función next de Express.
 */
const requestLogger = (req, res, next) => {
  const startTime = Date.now();
  
  // Información básica del request
  InfoLog(`📨 [REQUEST] ${req.method} ${req.originalUrl}`, {
    method: req.method,
    url: req.originalUrl,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    apiVersion: req.apiVersion,
    userId: req.user?.id || 'anonymous',
    timestamp: new Date().toISOString()
  });
  
  // Capturar el final del response
  const originalSend = res.send;
  res.send = function(data) {
    const endTime = Date.now();
    const duration = endTime - startTime;
    
    InfoLog(`📤 [RESPONSE] ${req.method} ${req.originalUrl} - ${res.statusCode}`, {
      method: req.method,
      url: req.originalUrl,
      statusCode: res.statusCode,
      duration: `${duration}ms`,
      responseSize: data ? data.length : 0,
      timestamp: new Date().toISOString()
    });
    
    return originalSend.call(this, data);
  };
  
  next();
};


module.exports = {
  httpLogger,
  devLogger,
  requestLogger
};