const { EXTERNAL_PACKAGES, RELATIVE_PATHS, ENV_CONFIG, HTTP_STATUS, LOGGING } = require('../config/paths.config.js');
const { LOGGING_MESSAGES } = require('../utils/messages.utils.js');
const morgan = require(EXTERNAL_PACKAGES.MORGAN);
const { Logger } = require(RELATIVE_PATHS.FROM_MIDDLEWARES.CONFIG_LOGGER);

// Formato personalizado para Morgan que incluye más información útil
const customFormat = LOGGING.MORGAN_FORMAT_CUSTOM;

// Función para determinar si logear o no según el código de estado
const skip = (req, res) => {
  // En desarrollo, logear todo
  if (process.env.NODE_ENV === ENV_CONFIG.NODE_ENV_DEVELOPMENT) {
    return false;
  }
  
  // En producción, solo logear errores y requests importantes
  return res.statusCode < HTTP_STATUS.BAD_REQUEST;
};

// Configurar Morgan con nuestro logger personalizado
const httpLogger = morgan(customFormat, {
  stream: Logger.stream,
  skip,
});

// Morgan para desarrollo con formato más simple y colorido
const devLogger = morgan(LOGGING.MORGAN_FORMAT_DEV, {
  stream: Logger.stream,
});

// Middleware personalizado para capturar información adicional de requests
const requestLogger = (req, res, next) => {
  const startTime = Date.now();
  
  // Información básica del request
  Logger.info(`${LOGGING_MESSAGES.REQUEST_PREFIX} ${req.method} ${req.originalUrl}`, {
    method: req.method,
    url: req.originalUrl,
    ip: req.ip,
    userAgent: req.get(LOGGING.USER_AGENT_HEADER),
    apiVersion: req.apiVersion,
    userId: req.user?.id || LOGGING.ANONYMOUS_USER,
    timestamp: new Date().toISOString()
  });
  
  // Capturar el final del response
  const originalSend = res.send;
  res.send = function(data) {
    const endTime = Date.now();
    const duration = endTime - startTime;
    
    Logger.info(`${LOGGING_MESSAGES.RESPONSE_PREFIX} ${req.method} ${req.originalUrl}${LOGGING.LOG_SEPARATOR}${res.statusCode}`, {
      method: req.method,
      url: req.originalUrl,
      statusCode: res.statusCode,
      duration: `${duration}${LOGGING.TIME_UNIT}`,
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