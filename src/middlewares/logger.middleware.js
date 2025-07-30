const morgan = require('morgan');
const Logger = require('../config/logger.js');

// Formato personalizado para Morgan que incluye más información útil
const customFormat = ':remote-addr - :remote-user [:date[clf]] ":method :url HTTP/:http-version" :status :res[content-length] ":referrer" ":user-agent" - :response-time ms';

// Función para determinar si logear o no según el código de estado
const skip = (req, res) => {
  // En desarrollo, logear todo
  if (process.env.NODE_ENV === 'development') {
    return false;
  }
  
  // En producción, solo logear errores y requests importantes
  return res.statusCode < 400;
};

// Configurar Morgan con nuestro logger personalizado
const httpLogger = morgan(customFormat, {
  stream: Logger.stream,
  skip,
});

// Morgan para desarrollo con formato más simple y colorido
const devLogger = morgan('dev', {
  stream: Logger.stream,
});

// Middleware personalizado para capturar información adicional de requests
const requestLogger = (req, res, next) => {
  const startTime = Date.now();
  
  // Información básica del request
  Logger.info(`📨 [REQUEST] ${req.method} ${req.originalUrl}`, {
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
    
    Logger.info(`📤 [RESPONSE] ${req.method} ${req.originalUrl} - ${res.statusCode}`, {
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