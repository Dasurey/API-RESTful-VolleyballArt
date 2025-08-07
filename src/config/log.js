// ============================================================
/**
 * 📊 Sistema Unificado de Logging
 * Sistema centralizado de logging con Winston integrado
 * Incluye configuración completa de Winston y clases de logging categorizadas
 */
// ============================================================

let Logger = null;
try {
    const winston = require('winston');
    const path = require('path');

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
        winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
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

        // File transport para todos los logs
        new winston.transports.File({
            filename: 'logs/combined.log',
            format: winston.format.combine(
                winston.format.timestamp(),
                winston.format.json()
            ),
        }),
    ];

    // Crear el logger
    Logger = winston.createLogger({
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

} catch (error) {
    // Si Winston no está disponible, continuar sin él
    console.warn('Winston logger no disponible, usando solo console:', error.message);
}

// ============================================================
// CLASES DE LOGGING GLOBALIZADAS
// ============================================================

/**
 * Clase base para logs de la aplicación
 */
class AppLog {
    constructor(level, message, metadata = null, category = 'GENERAL') {
        this.level = level;
        this.message = message;
        this.metadata = metadata;
        this.category = category;
        this.timestamp = new Date().toISOString();
        this.pid = process.pid;
        this.environment = process.env.NODE_ENV || 'development';
    }

    /**
     * Convierte el log a formato JSON estructurado
     * @returns {Object} - Objeto JSON del log
     */
    toJSON() {
        return {
            timestamp: this.timestamp,
            level: this.level,
            category: this.category,
            message: this.message,
            ...(this.metadata && { metadata: this.metadata }),
            pid: this.pid,
            environment: this.environment
        };
    }

    /**
     * Ejecuta el log en consola y Winston si está disponible
     */
    execute() {
        const logData = this.toJSON();

        // Logging con Winston (archivos + configuración profesional)
        if (Logger) {
            Logger[this.level](this.message, {
                category: this.category,
                metadata: this.metadata,
                timestamp: this.timestamp,
                pid: this.pid,
                environment: this.environment
            });
        }

        // Logging en consola si está habilitado (para desarrollo)
        if (process.env.ENABLE_CONSOLE_LOGS === 'true' || process.env.NODE_ENV === 'development') {
            const consoleMethod = this.level === 'error' ? console.error :
                this.level === 'warn' ? console.warn : console.log;

            consoleMethod(`[${this.timestamp}] ${this.level.toUpperCase()}[${this.category}]: ${this.message}`,
                this.metadata ? this.metadata : '');
        }
    }
}

/**
 * Log de información (INFO)
 */
class InfoLog extends AppLog {
    constructor(message = 'Información general', metadata = null, category = 'INFO') {
        super('info', message, metadata, category);
    }
}

/**
 * Log de advertencia (WARN)
 */
class WarnLog extends AppLog {
    constructor(message = 'Advertencia del sistema', metadata = null, category = 'WARN') {
        super('warn', message, metadata, category);
    }
}

/**
 * Log de error (ERROR)
 */
class ErrorLog extends AppLog {
    constructor(message = 'Error del sistema', metadata = null, category = 'ERROR') {
        super('error', message, metadata, category);
    }
}

/**
 * Log de depuración (DEBUG)
 */
class DebugLog extends AppLog {
    constructor(message = 'Información de depuración', metadata = null, category = 'DEBUG') {
        super('debug', message, metadata, category);
    }
}

/**
 * Log de éxito (SUCCESS)
 */
class SuccessLog extends AppLog {
    constructor(message = 'Operación exitosa', metadata = null, category = 'SUCCESS') {
        super('info', message, metadata, category);
    }
}

/**
 * Log de autenticación (AUTH)
 */
class AuthLog extends AppLog {
    constructor(message = 'Evento de autenticación', metadata = null, category = 'AUTH') {
        super('info', message, metadata, category);
    }
}

/**
 * Log de base de datos (DATABASE)
 */
class DatabaseLog extends AppLog {
    constructor(message = 'Operación de base de datos', metadata = null, category = 'DATABASE') {
        super('info', message, metadata, category);
    }
}

/**
 * Log de API (API)
 */
class ApiLog extends AppLog {
    constructor(message = 'Evento de API', metadata = null, category = 'API') {
        super('info', message, metadata, category);
    }
}

/**
 * Log de caché (CACHE)
 */
class CacheLog extends AppLog {
    constructor(message = 'Operación de caché', metadata = null, category = 'CACHE') {
        super('info', message, metadata, category);
    }
}

/**
 * Log de sistema (SYSTEM)
 */
class SystemLog extends AppLog {
    constructor(message = 'Evento del sistema', metadata = null, category = 'SYSTEM') {
        super('info', message, metadata, category);
    }
}

/**
 * Log de rendimiento (PERFORMANCE)
 */
class PerformanceLog extends AppLog {
    constructor(message = 'Métrica de rendimiento', metadata = null, category = 'PERFORMANCE') {
        super('info', message, metadata, category);
    }
}

/**
 * Log de seguridad (SECURITY)
 */
class SecurityLog extends AppLog {
    constructor(message = 'Evento de seguridad', metadata = null, category = 'SECURITY') {
        super('warn', message, metadata, category);
    }
}

/**
 * Función para crear logs específicos según el nivel
 */
const createLog = (level, message, metadata = null, category = 'GENERAL') => {
    switch (level.toLowerCase()) {
        case 'info':
            return new InfoLog(message, metadata, category);
        case 'warn':
            return new WarnLog(message, metadata, category);
        case 'error':
            return new ErrorLog(message, metadata, category);
        case 'debug':
            return new DebugLog(message, metadata, category);
        case 'success':
            return new SuccessLog(message, metadata, category);
        case 'auth':
            return new AuthLog(message, metadata, category);
        case 'database':
            return new DatabaseLog(message, metadata, category);
        case 'api':
            return new ApiLog(message, metadata, category);
        case 'cache':
            return new CacheLog(message, metadata, category);
        case 'system':
            return new SystemLog(message, metadata, category);
        case 'performance':
            return new PerformanceLog(message, metadata, category);
        case 'security':
            return new SecurityLog(message, metadata, category);
        default:
            return new AppLog(level, message, metadata, category);
    }
};

/**
 * Función para loggear y ejecutar inmediatamente
 */
const logAndExecute = (level, message, metadata = null, category = 'GENERAL') => {
    const logInstance = createLog(level, message, metadata, category);
    logInstance.execute();
    return logInstance;
};

/**
 * Funciones de conveniencia para logging directo
 */
const logInfo = (message, metadata = null, category = 'INFO') => {
    return logAndExecute('info', message, metadata, category);
};

const logWarn = (message, metadata = null, category = 'WARN') => {
    return logAndExecute('warn', message, metadata, category);
};

const logError = (message, metadata = null, category = 'ERROR') => {
    return logAndExecute('error', message, metadata, category);
};

const logDebug = (message, metadata = null, category = 'DEBUG') => {
    return logAndExecute('debug', message, metadata, category);
};

const logSuccess = (message, metadata = null, category = 'SUCCESS') => {
    return logAndExecute('success', message, metadata, category);
};

const logAuth = (message, metadata = null, category = 'AUTH') => {
    return logAndExecute('auth', message, metadata, category);
};

const logDatabase = (message, metadata = null, category = 'DATABASE') => {
    return logAndExecute('database', message, metadata, category);
};

const logApi = (message, metadata = null, category = 'API') => {
    return logAndExecute('api', message, metadata, category);
};

const logCache = (message, metadata = null, category = 'CACHE') => {
    return logAndExecute('cache', message, metadata, category);
};

const logSystem = (message, metadata = null, category = 'SYSTEM') => {
    return logAndExecute('system', message, metadata, category);
};

const logPerformance = (message, metadata = null, category = 'PERFORMANCE') => {
    return logAndExecute('performance', message, metadata, category);
};

const logSecurity = (message, metadata = null, category = 'SECURITY') => {
    return logAndExecute('security', message, metadata, category);
};

/**
 * Función para determinar si el logging está habilitado
 */
const isLoggingEnabled = () => {
    return process.env.ENABLE_CONSOLE_LOGS === 'true' || process.env.NODE_ENV === 'development';
};

/**
 * Función para formatear el formato de salida del log
 */
const formatLogOutput = (logInstance) => {
    return `[${logInstance.timestamp}] ${logInstance.level.toUpperCase()}[${logInstance.category}]: ${logInstance.message}`;
};

/**
 * Función para obtener información del logger Winston
 */
const getLoggerInfo = () => {
    if (!Logger) {
        return { available: false, reason: 'Winston not configured' };
    }

    return {
        available: true,
        level: Logger.level,
        transports: Logger.transports.length,
        environment: process.env.NODE_ENV
    };
};

/**
 * Función para cambiar el nivel de log dinámicamente
 */
const setLogLevel = (level) => {
    if (Logger && ['error', 'warn', 'info', 'http', 'debug'].includes(level)) {
        Logger.level = level;
        return true;
    }
    return false;
};

/**
 * Función para forzar la escritura de logs pendientes
 */
const flushLogs = () => {
    return new Promise((resolve) => {
        if (Logger && Logger.transports) {
            let pending = 0;
            Logger.transports.forEach((transport) => {
                if (transport.close) {
                    pending++;
                    transport.close(() => {
                        pending--;
                        if (pending === 0) resolve();
                    });
                }
            });
            if (pending === 0) resolve();
        } else {
            resolve();
        }
    });
};

/**
 * Función para obtener el logger Winston directamente
 * (Para compatibilidad con middleware HTTP y otros usos directos)
 */
const getWinstonLogger = () => {
    return Logger;
};

module.exports = {
    // Clases de logging
    AppLog,
    InfoLog,
    WarnLog,
    ErrorLog,
    DebugLog,
    SuccessLog,
    AuthLog,
    DatabaseLog,
    ApiLog,
    CacheLog,
    SystemLog,
    PerformanceLog,
    SecurityLog,

    // Funciones de creación
    createLog,
    logAndExecute,

    // Funciones de conveniencia
    logInfo,
    logWarn,
    logError,
    logDebug,
    logSuccess,
    logAuth,
    logDatabase,
    logApi,
    logCache,
    logSystem,
    logPerformance,
    logSecurity,

    // Utilidades
    isLoggingEnabled,
    formatLogOutput,
    getLoggerInfo,
    setLogLevel,
    flushLogs,

    // Compatibilidad Winston
    getWinstonLogger,
    Logger // Exportar directamente para retrocompatibilidad
};
