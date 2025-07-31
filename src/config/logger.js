const winston = require('winston');
const { EXTERNAL_PACKAGES } = require('./paths.js');
const path = require(EXTERNAL_PACKAGES.PATH);

// Configuración de colores para el desarrollo
const colors = {
  error: 'red',
  warn: 'yellow',
  info: 'green',
  http: 'magenta',
  debug: 'white',
};

winston.addColors(colors);

// Función para determinar el nivel de log según el entorno
const level = () => {
  const env = process.env.NODE_ENV;
  const isDevelopment = env === 'development';
  return isDevelopment ? 'debug' : 'warn';
};

// Formato personalizado para logs legibles
const format = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss:ms' }),
  winston.format.colorize({ all: true }),
  winston.format.printf(
    (info) => `${info.timestamp} ${info.level}: ${info.message}`,
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
    filename: 'logs/error.log',
    level: 'error',
    format: winston.format.combine(
      winston.format.timestamp(),
      winston.format.json()
    ),
  }),
  
  // File transport para todos los logs (solo en producción)
  new winston.transports.File({
    filename: 'logs/combined.log',
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
