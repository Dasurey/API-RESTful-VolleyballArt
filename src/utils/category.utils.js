const { RELATIVE_PATHS, ENV_VARIABLES, ENV_CONFIG, COMMON_VALUES, CONFIG_VALUES, LOG_LEVELS, HTTP_STATUS } = require('../config/paths.config.js');
const { RESPONSE_FIELDS, CONTROLLER_MESSAGES } = require('./messages.utils.js');
const { logMessage } = require(RELATIVE_PATHS.FROM_UTILS.RESPONSE_UTILS);

/**
 * Respuesta de éxito con formato específico para categoria (message + payload)
 * @param {Object} res - Response object de Express
 * @param {string} message - Mensaje de la respuesta
 * @param {*} payload - Datos de la respuesta
 * @param {number} statusCode - Código de estado HTTP (default 200)
 */
function categorySuccessResponse(res, message, payload, statusCode = COMMON_VALUES.DEFAULT_STATUS_CODE) {
    const response = {
        [RESPONSE_FIELDS.MESSAGE]: message,
        [RESPONSE_FIELDS.PAYLOAD]: payload,
        [RESPONSE_FIELDS.META]: {
            [RESPONSE_FIELDS.TIMESTAMP]: new Date().toISOString(),
            [RESPONSE_FIELDS.REQUEST_ID]: `${CONFIG_VALUES.REQ_PREFIX}${Date.now()}`,
            [RESPONSE_FIELDS.CACHED]: false,
            [RESPONSE_FIELDS.RESPONSE_TIME]: 0
        }
    };

    return res.status(statusCode).json(response);
}

/**
 * Respuesta de error con formato específico para categoria
 * @param {Object} res - Response object de Express
 * @param {string} message - Mensaje de error
 * @param {number} statusCode - Código de estado HTTP
 * @param {string} errorDetails - Detalles adicionales del error
 */
function categoryErrorResponse(res, message, statusCode = COMMON_VALUES.SERVER_ERROR_CODE, errorDetails = null) {
    const response = {
        [RESPONSE_FIELDS.MESSAGE]: message,
        [RESPONSE_FIELDS.META]: {
            [RESPONSE_FIELDS.TIMESTAMP]: new Date().toISOString(),
            [RESPONSE_FIELDS.REQUEST_ID]: `${CONFIG_VALUES.REQ_PREFIX}${Date.now()}`,
            [RESPONSE_FIELDS.CACHED]: false,
            [RESPONSE_FIELDS.RESPONSE_TIME]: 0
        }
    };

    if (errorDetails && process.env[ENV_VARIABLES.NODE_ENV] === ENV_CONFIG.NODE_ENV_DEVELOPMENT) {
        response[RESPONSE_FIELDS.ERROR] = errorDetails;
    }

    return res.status(statusCode).json(response);
}

/**
 * Wrapper para operaciones de obtener recursos en categoria
 * @param {Function} operation - Función que obtiene los datos
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 * @param {string} resourceName - Nombre del recurso
 * @param {Object} options - Opciones adicionales
 */
async function getCategoryResource(operation, req, res, resourceName, options = {}) {
    const {
        successMessage = `${resourceName} ${CONTROLLER_MESSAGES.RESOURCE_OBTAINED_SUCCESS}`,
        notFoundMessage = `${resourceName} ${CONTROLLER_MESSAGES.RESOURCE_NOT_FOUND}`,
        errorMessage = `${CONTROLLER_MESSAGES.RESOURCE_GET_ERROR} ${resourceName}`
    } = options;

    try {
        const startTime = Date.now();
        const result = await operation();
        const executionTime = Date.now() - startTime;

        // Si no se encontró el recurso
        if (!result || (Array.isArray(result) && result.length === 0)) {
            logMessage(LOG_LEVELS.WARN, notFoundMessage, {
                [CONTROLLER_MESSAGES.RESOURCE_NAME_FIELD]: resourceName,
                [CONTROLLER_MESSAGES.RESOURCE_ID_FIELD]: req.params.id || req.params.parentId,
                method: req.method,
                path: req.path,
                executionTime: `${executionTime}${CONTROLLER_MESSAGES.EXECUTION_TIME_SUFFIX}`
            });

            return categoryErrorResponse(res, notFoundMessage, HTTP_STATUS.NOT_FOUND);
        }

        // Log de éxito
        logMessage(LOG_LEVELS.INFO, successMessage, {
            [CONTROLLER_MESSAGES.RESOURCE_NAME_FIELD]: resourceName,
            [CONTROLLER_MESSAGES.RESOURCE_ID_FIELD]: req.params.id || req.params.parentId,
            totalResults: Array.isArray(result) ? result.length : 1,
            executionTime: `${executionTime}${CONTROLLER_MESSAGES.EXECUTION_TIME_SUFFIX}`,
            method: req.method,
            path: req.path,
            ip: req.ip
        });

        return categorySuccessResponse(res, successMessage, result);

    } catch (error) {
        logMessage(LOG_LEVELS.ERROR, errorMessage, {
            error: error.message,
            stack: error.stack,
            [CONTROLLER_MESSAGES.RESOURCE_NAME_FIELD]: resourceName,
            method: req.method,
            path: req.path,
            ip: req.ip
        });

        return categoryErrorResponse(res, errorMessage, HTTP_STATUS.INTERNAL_SERVER_ERROR, error.message);
    }
}

/**
 * Wrapper para operaciones de crear recursos en categoria
 * @param {Function} operation - Función que crea el recurso
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 * @param {string} resourceName - Nombre del recurso
 * @param {Object} options - Opciones adicionales
 */
async function createCategoryResource(operation, req, res, resourceName, options = {}) {
    const {
        successMessage = `${resourceName} ${CONTROLLER_MESSAGES.RESOURCE_CREATED_SUCCESS}`,
        errorMessage = `${CONTROLLER_MESSAGES.RESOURCE_CREATE_ERROR} ${resourceName}`
    } = options;

    try {
        const startTime = Date.now();
        const result = await operation();
        const executionTime = Date.now() - startTime;

        logMessage(LOG_LEVELS.INFO, successMessage, {
            [CONTROLLER_MESSAGES.RESOURCE_NAME_FIELD]: resourceName,
            [CONTROLLER_MESSAGES.RESOURCE_ID_FIELD]: result?.id,
            [CONTROLLER_MESSAGES.REQUEST_BODY_FIELD]: Object.keys(req.body || {}),
            executionTime: `${executionTime}${CONTROLLER_MESSAGES.EXECUTION_TIME_SUFFIX}`,
            method: req.method,
            path: req.path,
            ip: req.ip
        });

        return categorySuccessResponse(res, successMessage, result, HTTP_STATUS.CREATED);

    } catch (error) {
        logMessage(LOG_LEVELS.ERROR, errorMessage, {
            error: error.message,
            stack: error.stack,
            [CONTROLLER_MESSAGES.RESOURCE_NAME_FIELD]: resourceName,
            [CONTROLLER_MESSAGES.REQUEST_BODY_FIELD]: req.body,
            method: req.method,
            path: req.path,
            ip: req.ip
        });

        return categoryErrorResponse(res, errorMessage, HTTP_STATUS.INTERNAL_SERVER_ERROR, error.message);
    }
}

/**
 * Wrapper para operaciones de actualizar recursos en categoria
 * @param {Function} operation - Función que actualiza el recurso
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 * @param {string} resourceName - Nombre del recurso
 * @param {Object} options - Opciones adicionales
 */
async function updateCategoryResource(operation, req, res, resourceName, options = {}) {
    const {
        successMessage = `${resourceName} ${CONTROLLER_MESSAGES.RESOURCE_UPDATED_SUCCESS}`,
        errorMessage = `${CONTROLLER_MESSAGES.RESOURCE_UPDATE_ERROR} ${resourceName}`
    } = options;

    try {
        const startTime = Date.now();
        const result = await operation();
        const executionTime = Date.now() - startTime;

        if (!result) {
            const notFoundMessage = `${resourceName} ${CONTROLLER_MESSAGES.RESOURCE_NOT_FOUND}`;
            logMessage(LOG_LEVELS.WARN, notFoundMessage, {
                [CONTROLLER_MESSAGES.RESOURCE_NAME_FIELD]: resourceName,
                [CONTROLLER_MESSAGES.RESOURCE_ID_FIELD]: req.params.id,
                method: req.method,
                path: req.path
            });

            return categoryErrorResponse(res, notFoundMessage, HTTP_STATUS.NOT_FOUND);
        }

        logMessage(LOG_LEVELS.INFO, successMessage, {
            [CONTROLLER_MESSAGES.RESOURCE_NAME_FIELD]: resourceName,
            [CONTROLLER_MESSAGES.RESOURCE_ID_FIELD]: req.params.id,
            [CONTROLLER_MESSAGES.UPDATED_FIELDS_FIELD]: Object.keys(req.body || {}),
            executionTime: `${executionTime}${CONTROLLER_MESSAGES.EXECUTION_TIME_SUFFIX}`,
            method: req.method,
            path: req.path,
            ip: req.ip
        });

        return categorySuccessResponse(res, successMessage, result);

    } catch (error) {
        logMessage(LOG_LEVELS.ERROR, errorMessage, {
            error: error.message,
            stack: error.stack,
            [CONTROLLER_MESSAGES.RESOURCE_NAME_FIELD]: resourceName,
            [CONTROLLER_MESSAGES.RESOURCE_ID_FIELD]: req.params.id,
            method: req.method,
            path: req.path,
            ip: req.ip
        });

        return categoryErrorResponse(res, errorMessage, HTTP_STATUS.INTERNAL_SERVER_ERROR, error.message);
    }
}

/**
 * Wrapper para operaciones de eliminar recursos en categoria
 * @param {Function} operation - Función que elimina el recurso
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 * @param {string} resourceName - Nombre del recurso
 * @param {Object} options - Opciones adicionales
 */
async function deleteCategoryResource(operation, req, res, resourceName, options = {}) {
    const {
        successMessage = `${resourceName} ${CONTROLLER_MESSAGES.RESOURCE_DELETED_SUCCESS}`,
        errorMessage = `${CONTROLLER_MESSAGES.RESOURCE_DELETE_ERROR} ${resourceName}`
    } = options;

    try {
        const startTime = Date.now();
        const result = await operation();
        const executionTime = Date.now() - startTime;

        if (!result) {
            const notFoundMessage = `${resourceName} ${CONTROLLER_MESSAGES.RESOURCE_NOT_FOUND}`;
            logMessage(LOG_LEVELS.WARN, notFoundMessage, {
                [CONTROLLER_MESSAGES.RESOURCE_NAME_FIELD]: resourceName,
                [CONTROLLER_MESSAGES.RESOURCE_ID_FIELD]: req.params.id,
                method: req.method,
                path: req.path
            });

            return categoryErrorResponse(res, notFoundMessage, HTTP_STATUS.NOT_FOUND);
        }

        logMessage(LOG_LEVELS.INFO, successMessage, {
            [CONTROLLER_MESSAGES.RESOURCE_NAME_FIELD]: resourceName,
            [CONTROLLER_MESSAGES.RESOURCE_ID_FIELD]: req.params.id,
            executionTime: `${executionTime}${CONTROLLER_MESSAGES.EXECUTION_TIME_SUFFIX}`,
            method: req.method,
            path: req.path,
            ip: req.ip
        });

        // Para delete, el payload es un objeto simple indicando que se eliminó
        const payload = { deleted: CONTROLLER_MESSAGES.DELETED_FLAG, id: req.params.id };

        return categorySuccessResponse(res, successMessage, payload);

    } catch (error) {
        logMessage(LOG_LEVELS.ERROR, errorMessage, {
            error: error.message,
            stack: error.stack,
            [CONTROLLER_MESSAGES.RESOURCE_NAME_FIELD]: resourceName,
            [CONTROLLER_MESSAGES.RESOURCE_ID_FIELD]: req.params.id,
            method: req.method,
            path: req.path,
            ip: req.ip
        });

        return categoryErrorResponse(res, errorMessage, HTTP_STATUS.INTERNAL_SERVER_ERROR, error.message);
    }
}

module.exports = {
    categorySuccessResponse,
    categoryErrorResponse,
    getCategoryResource,
    createCategoryResource,
    updateCategoryResource,
    deleteCategoryResource
};
