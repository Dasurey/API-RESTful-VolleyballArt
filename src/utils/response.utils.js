const {
    RELATIVE_PATHS,
    COMMON_VALUES,
    ENV_VARIABLES,
    CONFIG_VALUES,
    ENV_CONFIG,
    LOG_LEVELS,
    FORMAT_PATTERNS,
    API_ENDPOINTS,
    API_ENDPOINTS_PATHS
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
 * URLs de endpoints centralizadas
 * @param {string} baseUrl - URL base del servidor
 * @returns {Object} - Objeto con todas las URLs de endpoints
 */
function getEndpointUrls(baseUrl) {
    return {
        [RESPONSE_FIELDS.API]: `${baseUrl}${API_ENDPOINTS.API_ROOT}`,
        [RESPONSE_FIELDS.DOCUMENTATION]: `${baseUrl}${API_ENDPOINTS.API_DOCS}`,
        [RESPONSE_FIELDS.PRODUCTS]: `${baseUrl}${API_ENDPOINTS.PRODUCTS_BASE}`,
        [RESPONSE_FIELDS.CATEGORY_HIERARCHY]: `${baseUrl}${API_ENDPOINTS.CATEGORY_HIERARCHY_FULL}`,
        [RESPONSE_FIELDS.SYSTEM]: `${baseUrl}${API_ENDPOINTS_PATHS.STATUS}`,
        [RESPONSE_FIELDS.CACHE]: `${baseUrl}${API_ENDPOINTS.CACHE_STATS}`,
        [RESPONSE_FIELDS.HEALTH]: `${baseUrl}${API_ENDPOINTS.HEALTH}`,
        [RESPONSE_FIELDS.METRICS]: `${baseUrl}${API_ENDPOINTS.METRICS}`,
        [RESPONSE_FIELDS.DEBUG]: `${baseUrl}${API_ENDPOINTS.DEBUG}`,
        [RESPONSE_FIELDS.SWAGGER]: `${baseUrl}${API_ENDPOINTS.SWAGGER_JSON}`
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
        console.log(`${SYSTEM_MESSAGES.API_ROOT} ${baseUrl}${API_ENDPOINTS.API_ROOT}`);
        console.log(`${SYSTEM_MESSAGES.API_DOCUMENTATION} ${baseUrl}${API_ENDPOINTS.API_DOCS}`);
        console.log(`${SYSTEM_MESSAGES.PRODUCTS} ${baseUrl}${API_ENDPOINTS.PRODUCTS_BASE}`);
        console.log(`${SYSTEM_MESSAGES.CATEGORY_HIERARCHY} ${baseUrl}${API_ENDPOINTS.CATEGORY_HIERARCHY_FULL}`);
        console.log(`${SYSTEM_MESSAGES.SYSTEM} ${baseUrl}${API_ENDPOINTS_PATHS.STATUS}`);
        console.log(`${SYSTEM_MESSAGES.CACHE_STATS} ${baseUrl}${API_ENDPOINTS.CACHE_STATS}`);
        console.log(`${SYSTEM_MESSAGES.HEALTH_CHECK} ${baseUrl}${API_ENDPOINTS.HEALTH}`);
        console.log(`${SYSTEM_MESSAGES.PERFORMANCE_METRICS} ${baseUrl}${API_ENDPOINTS.METRICS}`);
        console.log(`${SYSTEM_MESSAGES.DEBUG} ${baseUrl}${API_ENDPOINTS.DEBUG}`);
        console.log(`${SYSTEM_MESSAGES.OPENAPI_SPEC} ${baseUrl}${API_ENDPOINTS.SWAGGER_JSON}`);

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
    getEndpointUrls,
    logServerInfo
};
