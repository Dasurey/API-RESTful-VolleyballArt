const { EXTERNAL_PACKAGES } = require('./paths.config.js');
const { LOGGER_CONSTANTS } = require('../utils/messages.utils.js');
const winston = require(EXTERNAL_PACKAGES.WINSTON);
const path = require(EXTERNAL_PACKAGES.PATH);

// Configuración de colores para el desarrollo
const colors = {
  error: LOGGER_CONSTANTS.COLOR_RED,
  warn: LOGGER_CONSTANTS.COLOR_YELLOW,
  info: LOGGER_CONSTANTS.COLOR_GREEN,
  http: LOGGER_CONSTANTS.COLOR_MAGENTA,
  debug: LOGGER_CONSTANTS.COLOR_WHITE,
};

winston.addColors(colors);

// Función para determinar el nivel de log según el entorno
const level = () => {
  const env = process.env.NODE_ENV;
  const isDevelopment = env === LOGGER_CONSTANTS.ENV_DEVELOPMENT;
  return isDevelopment ? LOGGER_CONSTANTS.LEVEL_DEBUG : LOGGER_CONSTANTS.LEVEL_WARN;
};

// Formato personalizado para logs legibles
const format = winston.format.combine(
  winston.format.timestamp({ format: LOGGER_CONSTANTS.TIMESTAMP_FORMAT }),
  winston.format.colorize({ all: true }),
  winston.format.printf(
    (info) => `${info.timestamp}${info.level}${LOGGER_CONSTANTS.LOG_SEPARATOR} ${info.message}`,
  ),
);

// Transports (donde se guardan los logs)
const transports = [
  // Console transport para desarrollo
  new winston.transports.Console({
    format: format,
    level: level(),
  }),
  
  // File transport para errores (siempre activo)
  new winston.transports.File({
    filename: LOGGER_CONSTANTS.ERROR_LOG_FILE,
    level: LOGGER_CONSTANTS.LEVEL_ERROR,
    format: winston.format.combine(
      winston.format.timestamp(),
      winston.format.json()
    ),
  }),
  
  // File transport para todos los logs (solo en producción)
  new winston.transports.File({
    filename: LOGGER_CONSTANTS.COMBINED_LOG_FILE,
    format: winston.format.combine(
      winston.format.timestamp(),
      winston.format.json()
    ),
  }),
];

// Crear el logger
const Logger = winston.createLogger({
  level: level(),
  levels: winston.config.npm.levels,
  format: winston.format.json(),
  transports,
  // No salir del proceso en caso de error no manejado
  exitOnError: false,
});

// Stream para Morgan (middleware de logging HTTP)
Logger.stream = {
  write: (message) => Logger.http(message.trim()),
};

module.exports = Logger;
