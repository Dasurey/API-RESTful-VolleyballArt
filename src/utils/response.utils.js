const {
    RELATIVE_PATHS,
    COMMON_VALUES,
    ENV_VARIABLES,
    CONFIG_VALUES,
    ENV_CONFIG,
    LOG_LEVELS,
    FORMAT_PATTERNS,
    API_ENDPOINTS
} = require('../config/paths.config.js');
const { LOG_MESSAGES, SYSTEM_MESSAGES, RESPONSE_FIELDS } = require('./messages.utils.js');
const Logger = require(RELATIVE_PATHS.FROM_UTILS.CONFIG_LOGGER);

/**
 * Utilidades centralizadas para respuestas y logging
 */

/**
 * Función centralizada para logging que respeta ENABLE_CONSOLE_LOGS
 * @param {string} level - Nivel de log (info, warn, error, debug)
 * @param {string} message - Mensaje a loggear
 * @param {Object} metadata - Datos adicionales para el log
 */
function logMessage(level, message, metadata = {}) {
    // Usar Logger de winston para todos los logs
    Logger[level](message, metadata);

    // Si ENABLE_CONSOLE_LOGS está habilitado, también mostrar en consola
    if (process.env[ENV_VARIABLES.ENABLE_CONSOLE_LOGS] === CONFIG_VALUES.TRUE_STRING) {
        const timestamp = new Date().toISOString();
        console.log(`[${timestamp}] ${level.toUpperCase()}${FORMAT_PATTERNS.COLON_SEPARATOR} ${message}`);
    }
}

/**
 * Respuesta de éxito estandarizada
 * @param {Object} res - Response object de Express
 * @param {string} message - Mensaje de éxito
 * @param {*} payload - Datos de respuesta
 * @param {number} statusCode - Código de estado HTTP (por defecto 200)
 */
function successResponse(res, message, payload = null, statusCode = COMMON_VALUES.DEFAULT_STATUS_CODE) {
    const response = {
        [RESPONSE_FIELDS.MESSAGE]: message,
        ...(payload && { [RESPONSE_FIELDS.PAYLOAD]: payload }),
        [RESPONSE_FIELDS.META]: {
            [RESPONSE_FIELDS.TIMESTAMP]: new Date().toISOString(),
            [RESPONSE_FIELDS.REQUEST_ID]: `${CONFIG_VALUES.REQ_PREFIX}${Date.now()}`,
            [RESPONSE_FIELDS.CACHED]: false,
            [RESPONSE_FIELDS.RESPONSE_TIME]: Date.now() - (res.locals.startTime || Date.now())
        }
    };

    return res.status(statusCode).json(response);
}

/**
 * Respuesta de error estandarizada
 * @param {Object} res - Response object de Express
 * @param {string} message - Mensaje de error
 * @param {number} statusCode - Código de estado HTTP
 * @param {Array|string} errors - Errores específicos
 */
function errorResponse(res, message, statusCode = COMMON_VALUES.SERVER_ERROR_CODE, errors = null) {
    const response = {
        [RESPONSE_FIELDS.MESSAGE]: message,
        [RESPONSE_FIELDS.PAYLOAD]: {
            [RESPONSE_FIELDS.STATUS_CODE]: statusCode,
            [RESPONSE_FIELDS.TIMESTAMP]: new Date().toISOString(),
            ...(errors && { [RESPONSE_FIELDS.ERRORS]: Array.isArray(errors) ? errors : [errors] }),
            [RESPONSE_FIELDS.META]: {
                [RESPONSE_FIELDS.TIMESTAMP]: new Date().toISOString(),
                [RESPONSE_FIELDS.REQUEST_ID]: `${CONFIG_VALUES.REQ_PREFIX}${Date.now()}`,
                [RESPONSE_FIELDS.CACHED]: false,
                [RESPONSE_FIELDS.RESPONSE_TIME]: Date.now() - (res.locals.startTime || Date.now())
            }
        }
    };

    return res.status(statusCode).json(response);
}

/**
 * Wrapper para try-catch con logging automático
 * @param {Function} asyncFn - Función async a ejecutar
 * @param {Object} res - Response object de Express
 * @param {string} errorMessage - Mensaje de error personalizado
 */
async function safeAsync(asyncFn, res, errorMessage = LOG_MESSAGES.ERROR_INTERNAL) {
    try {
        return await asyncFn();
    } catch (error) {
        logMessage(LOG_LEVELS.ERROR, `${errorMessage}${FORMAT_PATTERNS.COLON_SEPARATOR}`, {
            [RESPONSE_FIELDS.ERROR]: error.message,
            [RESPONSE_FIELDS.STACK]: error.stack,
            [RESPONSE_FIELDS.TIMESTAMP]: new Date().toISOString()
        });

        return errorResponse(res, errorMessage, COMMON_VALUES.SERVER_ERROR_CODE, error.message);
    }
}

/**
 * URLs de endpoints centralizadas
 * @param {string} baseUrl - URL base del servidor
 * @returns {Object} - Objeto con todas las URLs de endpoints
 */
function getEndpointUrls(baseUrl) {
    return {
        [RESPONSE_FIELDS.DOCUMENTATION]: `${baseUrl}${API_ENDPOINTS.API_DOCS}`,
        [RESPONSE_FIELDS.HEALTH]: `${baseUrl}${API_ENDPOINTS.HEALTH}`,
        [RESPONSE_FIELDS.METRICS]: `${baseUrl}${API_ENDPOINTS.METRICS}`,
        [RESPONSE_FIELDS.CACHE]: `${baseUrl}${API_ENDPOINTS.CACHE_STATS}`,
        [RESPONSE_FIELDS.SWAGGER]: `${baseUrl}${API_ENDPOINTS.SWAGGER_JSON}`,
        [RESPONSE_FIELDS.API]: `${baseUrl}${API_ENDPOINTS.API_ROOT}`
    };
}

/**
 * Información del servidor para logging
 * @param {string} baseUrl - URL base del servidor
 * @param {number} port - Puerto del servidor
 */
function logServerInfo(baseUrl, port) {
    const urls = getEndpointUrls(baseUrl);

    logMessage(LOG_LEVELS.INFO, LOG_MESSAGES.SERVER_STARTED, {
        [RESPONSE_FIELDS.PORT]: port,
        [RESPONSE_FIELDS.URL]: baseUrl,
        [RESPONSE_FIELDS.ENVIRONMENT]: process.env[ENV_VARIABLES.NODE_ENV],
        [RESPONSE_FIELDS.PID]: process.pid,
        [RESPONSE_FIELDS.TIMESTAMP]: new Date().toISOString()
    });

    // URLs principales (usar console.log directo para inicio del servidor)
    if (process.env[ENV_VARIABLES.ENABLE_CONSOLE_LOGS] === CONFIG_VALUES.TRUE_STRING || process.env[ENV_VARIABLES.NODE_ENV] === ENV_CONFIG.NODE_ENV_DEVELOPMENT) {
        console.log(`${SYSTEM_MESSAGES.SERVER_RUNNING} ${baseUrl}`);
        console.log(`${SYSTEM_MESSAGES.API_DOCUMENTATION} ${urls[RESPONSE_FIELDS.DOCUMENTATION]}`);
        console.log(`${SYSTEM_MESSAGES.SWAGGER_DOCS} ${urls[RESPONSE_FIELDS.DOCUMENTATION]}`);
        console.log(`${SYSTEM_MESSAGES.HEALTH_CHECK} ${urls[RESPONSE_FIELDS.HEALTH]}`);
        console.log(`${SYSTEM_MESSAGES.PERFORMANCE_METRICS} ${urls[RESPONSE_FIELDS.METRICS]}`);
        console.log(`${SYSTEM_MESSAGES.CACHE_STATS} ${urls[RESPONSE_FIELDS.CACHE]}`);
        console.log(`${SYSTEM_MESSAGES.OPENAPI_SPEC} ${urls[RESPONSE_FIELDS.SWAGGER]}`);

        // Información adicional según el entorno
        if (process.env[ENV_VARIABLES.NODE_ENV] !== ENV_CONFIG.NODE_ENV_PRODUCTION) {
            console.log(`${FORMAT_PATTERNS.NEWLINE}${SYSTEM_MESSAGES.DEVELOPMENT_MODE}`);
            console.log(`${FORMAT_PATTERNS.BULLET_INDENT}${SYSTEM_MESSAGES.AUTO_RELOAD}`);
            console.log(`${FORMAT_PATTERNS.BULLET_INDENT}${SYSTEM_MESSAGES.DEBUG_LOGGING}`);
            console.log(`${FORMAT_PATTERNS.BULLET_INDENT}${SYSTEM_MESSAGES.CACHE_TTL_SHORT}`);
            console.log(`${FORMAT_PATTERNS.BULLET_INDENT}${SYSTEM_MESSAGES.CORS_PERMISSIVE}`);
        } else {
            console.log(`${FORMAT_PATTERNS.NEWLINE}${SYSTEM_MESSAGES.PRODUCTION_MODE}`);
            console.log(`${FORMAT_PATTERNS.BULLET_INDENT}${SYSTEM_MESSAGES.OPTIMIZATIONS_ACTIVE}`);
            console.log(`${FORMAT_PATTERNS.BULLET_INDENT}${SYSTEM_MESSAGES.COMPRESSION_ENABLED}`);
            console.log(`${FORMAT_PATTERNS.BULLET_INDENT}${SYSTEM_MESSAGES.CACHE_LONG_TTL}`);
            console.log(`${FORMAT_PATTERNS.BULLET_INDENT}${SYSTEM_MESSAGES.SECURITY_ENHANCED}`);
        }
    }
}

module.exports = {
    logMessage,
    successResponse,
    errorResponse,
    safeAsync,
    getEndpointUrls,
    logServerInfo
};
