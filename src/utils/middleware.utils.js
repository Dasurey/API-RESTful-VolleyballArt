const { RELATIVE_PATHS, LOG_LEVELS, HTTP_HEADERS, HTTP_STATUS, CONFIG_VALUES } = require('../config/paths.js');
const { LOG_MESSAGES, SYSTEM_MESSAGES } = require('./messages.utils.js');
const { logMessage, errorResponse } = require(RELATIVE_PATHS.FROM_UTILS.RESPONSE_UTILS);

/**
 * Utilidades específicas para middlewares
 */

/**
 * Crear respuesta de error estándar para middlewares
 * @param {Object} res - Response object
 * @param {string} message - Mensaje de error
 * @param {number} statusCode - Código de estado HTTP
 * @param {Object} additionalData - Datos adicionales para la respuesta
 * @param {Object} logData - Datos adicionales para el log
 */
function middlewareError(res, message, statusCode = CONFIG_VALUES.BAD_REQUEST_CODE, additionalData = {}, logData = {}) {
    logMessage(LOG_LEVELS.WARN, message, {
        statusCode,
        middleware: true,
        ...logData
    });

    return errorResponse(res, message, statusCode, null, {
        ...additionalData,
        timestamp: new Date().toISOString()
    });
}

/**
 * Crear respuesta de validación para middlewares
 * @param {Object} res - Response object  
 * @param {string} field - Campo que falló la validación
 * @param {Array} errors - Array de errores de validación
 * @param {Object} logData - Datos adicionales para el log
 */
function validationError(res, field, errors, logData = {}) {
    const message = `${SYSTEM_MESSAGES.MIDDLEWARE_VALIDATION_ERROR} en ${field}`;

    logMessage(LOG_LEVELS.WARN, message, {
        field,
        errors,
        validationError: true,
        ...logData
    });

    return res.status(CONFIG_VALUES.BAD_REQUEST_CODE).json({
        message,
        payload: {
            errors,
            field,
            timestamp: new Date().toISOString(),
            validationError: true
        }
    });
}

/**
 * Wrapper para logging de requests con metadata estándar
 * @param {Object} req - Request object
 * @param {string} message - Mensaje del log
 * @param {string} level - Nivel del log (info, warn, error)
 * @param {Object} additionalData - Datos adicionales
 */
function logRequest(req, message, level = LOG_LEVELS.INFO, additionalData = {}) {
    const requestData = {
        method: req.method,
        url: req.originalUrl || req.url,
        ip: req.ip || req.connection?.remoteAddress,
        userAgent: req.get(HTTP_HEADERS.USER_AGENT),
        contentType: req.get(HTTP_HEADERS.CONTENT_TYPE),
        contentLength: req.get(HTTP_HEADERS.CONTENT_LENGTH),
        ...additionalData
    };

    logMessage(level, message, requestData);
}

/**
 * Wrapper para logging de responses con metadata estándar
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 * @param {string} message - Mensaje del log
 * @param {string} level - Nivel del log
 * @param {Object} additionalData - Datos adicionales
 */
function logResponse(req, res, message, level = LOG_LEVELS.INFO, additionalData = {}) {
    const responseData = {
        method: req.method,
        url: req.originalUrl || req.url,
        statusCode: res.statusCode,
        ip: req.ip || req.connection?.remoteAddress,
        responseTime: res.locals?.responseTime || null,
        ...additionalData
    };

    logMessage(level, message, responseData);
}

/**
 * Crear un middleware de logging genérico
 * @param {string} middlewareName - Nombre del middleware
 * @param {Object} options - Opciones del middleware
 */
function createLoggingMiddleware(middlewareName, options = {}) {
    const {
        logRequests = true,
        logResponses = true,
        includeBody = false,
        includeHeaders = false
    } = options;

    return (req, res, next) => {
        const startTime = Date.now();

        if (logRequests) {
            const requestData = {
                middleware: middlewareName
            };

            if (includeBody) {
                requestData.body = req.body;
            }

            if (includeHeaders) {
                requestData.headers = req.headers;
            }

            logRequest(req, `${SYSTEM_MESSAGES.MIDDLEWARE_REQUEST_INCOMING} [${middlewareName.toUpperCase()}]`, LOG_LEVELS.INFO, requestData);
        }

        // Interceptar el final de la respuesta
        if (logResponses) {
            const originalEnd = res.end;
            res.end = function (...args) {
                const endTime = Date.now();
                const responseTime = endTime - startTime;

                logResponse(req, res, `${SYSTEM_MESSAGES.MIDDLEWARE_RESPONSE_SENT} [${middlewareName.toUpperCase()}]`, LOG_LEVELS.INFO, {
                    middleware: middlewareName,
                    responseTime: `${responseTime}${CONFIG_VALUES.TIME_UNIT_MS}`
                });

                // Llamar al método original
                originalEnd.apply(this, args);
            };
        }

        next();
    };
}

/**
 * Crear middleware de manejo de errores estándar
 * @param {string} middlewareName - Nombre del middleware
 * @param {Object} options - Opciones del middleware
 */
function createErrorMiddleware(middlewareName, options = {}) {
    const {
        includeStack = false,
        logLevel = LOG_LEVELS.ERROR,
        defaultMessage = LOG_MESSAGES.ERROR_INTERNAL
    } = options;

    return (error, req, res, next) => {
        const errorData = {
            middleware: middlewareName,
            error: error.message,
            url: req.originalUrl || req.url,
            method: req.method,
            ip: req.ip || req.connection?.remoteAddress
        };

        if (includeStack && error.stack) {
            errorData.stack = error.stack;
        }

        logMessage(logLevel, `${SYSTEM_MESSAGES.MIDDLEWARE_ERROR} [${middlewareName.toUpperCase()}] ${SYSTEM_MESSAGES.MIDDLEWARE_ERROR_OCCURRED}`, errorData);

        // Si ya se envió una respuesta, pasar al siguiente middleware
        if (res.headersSent) {
            return next(error);
        }

        const statusCode = error.statusCode || error.status || HTTP_STATUS.INTERNAL_SERVER_ERROR;
        const message = error.message || defaultMessage;

        return errorResponse(res, message, statusCode, includeStack ? error.stack : null);
    };
}

/**
 * Wrapper para operaciones async en middlewares
 * @param {Function} asyncFn - Función async del middleware
 * @param {string} middlewareName - Nombre del middleware para logging
 */
function asyncMiddleware(asyncFn, middlewareName = CONFIG_VALUES.UNKNOWN) {
    return (req, res, next) => {
        Promise.resolve(asyncFn(req, res, next))
            .catch(error => {
                logMessage(LOG_LEVELS.ERROR, `${SYSTEM_MESSAGES.MIDDLEWARE_ASYNC_ERROR} [${middlewareName.toUpperCase()}]`, {
                    middleware: middlewareName,
                    error: error.message,
                    stack: error.stack,
                    url: req.originalUrl || req.url,
                    method: req.method
                });

                next(error);
            });
    };
}

/**
 * Crear middleware de cache con logging integrado
 * @param {Object} cacheManager - Manager de cache
 * @param {Object} options - Opciones del cache
 */
function createCacheMiddleware(cacheManager, options = {}) {
    const {
        ttl = CONFIG_VALUES.DEFAULT_TTL,
        keyGenerator = null,
        middlewareName = CONFIG_VALUES.CACHE_DEFAULT_NAME
    } = options;

    return (req, res, next) => {
        const cacheKey = keyGenerator ? keyGenerator(req) : `${req.method}_${req.originalUrl}`;
        const cachedData = cacheManager.get(cacheKey);

        if (cachedData) {
            logMessage(LOG_LEVELS.DEBUG, `${SYSTEM_MESSAGES.CACHE_HIT} [${middlewareName.toUpperCase()}]`, {
                cacheKey,
                middleware: middlewareName,
                url: req.originalUrl,
                method: req.method
            });

            return res.json(cachedData);
        }

        // Interceptar la respuesta para cachear
        const originalJson = res.json;
        res.json = function (data) {
            // Solo cachear respuestas exitosas
            if (res.statusCode >= HTTP_STATUS.OK && res.statusCode < HTTP_STATUS.MULTIPLE_CHOICES) {
                cacheManager.set(cacheKey, data, ttl);

                logMessage(LOG_LEVELS.DEBUG, `${SYSTEM_MESSAGES.CACHE_MISS} [${middlewareName.toUpperCase()}]`, {
                    cacheKey,
                    middleware: middlewareName,
                    url: req.originalUrl,
                    method: req.method,
                    ttl
                });
            }

            // Llamar al método original
            return originalJson.call(this, data);
        };

        next();
    };
}

module.exports = {
    middlewareError,
    validationError,
    logRequest,
    logResponse,
    createLoggingMiddleware,
    createErrorMiddleware,
    asyncMiddleware,
    createCacheMiddleware
};
