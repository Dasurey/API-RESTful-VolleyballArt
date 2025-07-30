import winston from 'winston';

// Configuración simple de colores
const colors = {
  error: 'red',
  warn: 'yellow', 
  info: 'green',
  debug: 'blue'
};

winston.addColors(colors);

// Crear el logger con configuración simple
const Logger = winston.createLogger({
  level: 'info', // Nivel básico
  format: winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.colorize(),
    winston.format.printf(({ timestamp, level, message }) => {
      return `${timestamp} [${level}]: ${message}`;
    })
  ),
  transports: [
    // Solo consola para desarrollo
    new winston.transports.Console(),
    // Archivo solo para errores
    new winston.transports.File({ 
      filename: 'logs/error.log', 
      level: 'error',
      format: winston.format.json()
    })
  ]
});

export default Logger;
