const { RELATIVE_PATHS, LOG_LEVELS } = require('../config/paths.js');
const { LOG_MESSAGES, CONTROLLER_MESSAGES, SYSTEM_MESSAGES, HTTP_STATUS } = require('./messages.utils.js');
const { logMessage, successResponse, errorResponse } = require(RELATIVE_PATHS.FROM_UTILS.RESPONSE_UTILS);

/**
 * Utilidades específicas para controllers
 */

/**
 * Wrapper para operaciones async en controllers con logging automático
 * @param {Function} operation - Función async a ejecutar
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 * @param {string} successMessage - Mensaje de éxito
 * @param {string} errorMessage - Mensaje de error
 * @param {Object} logMetadata - Metadatos adicionales para el log
 */
async function executeController(operation, req, res, successMessage, errorMessage = LOG_MESSAGES.ERROR_INTERNAL, logMetadata = {}) {
    try {
        const startTime = Date.now();
        const result = await operation();

        // Log de éxito con tiempo de ejecución
        const executionTime = Date.now() - startTime;
        logMessage(LOG_LEVELS.INFO, successMessage, {
            ...logMetadata,
            executionTime: `${executionTime}${CONTROLLER_MESSAGES.EXECUTION_TIME_SUFFIX}`,
            method: req.method,
            path: req.path,
            ip: req.ip,
            timestamp: new Date().toISOString()
        });

        // Si el result es una respuesta HTTP, no enviamos nada más
        if (res.headersSent) {
            return result;
        }

        // Si el result tiene datos, enviar respuesta de éxito
        if (result) {
            return successResponse(res, successMessage, result);
        }

        return result;
    } catch (error) {
        // Log de error con detalles completos
        logMessage(LOG_LEVELS.ERROR, errorMessage, {
            error: error.message,
            stack: error.stack,
            method: req.method,
            path: req.path,
            ip: req.ip,
            userAgent: req.get(CONTROLLER_MESSAGES.USER_AGENT_HEADER),
            timestamp: new Date().toISOString(),
            ...logMetadata
        });

        return errorResponse(res, errorMessage, HTTP_STATUS.INTERNAL_SERVER_ERROR, error.message);
    }
}

/**
 * Wrapper específico para obtener recursos (GET)
 * @param {Function} getOperation - Función que obtiene los datos
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 * @param {string} resourceName - Nombre del recurso (ej: "productos", "usuario")
 * @param {Object} options - Opciones adicionales
 */
async function getResource(getOperation, req, res, resourceName, options = {}) {
    const {
        successMessage = `${resourceName} ${CONTROLLER_MESSAGES.RESOURCE_OBTAINED_SUCCESS}`,
        notFoundMessage = `${resourceName} ${CONTROLLER_MESSAGES.RESOURCE_NOT_FOUND}`,
        errorMessage = `${CONTROLLER_MESSAGES.RESOURCE_GET_ERROR} ${resourceName}`
    } = options;

    return executeController(
        async () => {
            const result = await getOperation();

            // Si no se encontró el recurso, lanzar error que será capturado por executeController
            if (!result || (Array.isArray(result) && result.length === 0)) {
                const error = new Error(notFoundMessage);
                error.statusCode = HTTP_STATUS.NOT_FOUND;
                throw error;
            }

            return result;
        },
        req,
        res,
        successMessage,
        errorMessage,
        {
            [CONTROLLER_MESSAGES.RESOURCE_NAME_FIELD]: resourceName,
            [CONTROLLER_MESSAGES.RESOURCE_ID_FIELD]: req.params.id
        }
    );
}

/**
 * Wrapper específico para crear recursos (POST)
 * @param {Function} createOperation - Función que crea el recurso
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 * @param {string} resourceName - Nombre del recurso
 * @param {Object} options - Opciones adicionales
 */
async function createResource(createOperation, req, res, resourceName, options = {}) {
    const {
        successMessage = `${resourceName} ${CONTROLLER_MESSAGES.RESOURCE_CREATED_SUCCESS}`,
        errorMessage = `${CONTROLLER_MESSAGES.RESOURCE_CREATE_ERROR} ${resourceName}`
    } = options;

    return executeController(
        async () => {
            const result = await createOperation();
            return result;
        },
        req,
        res,
        successMessage,
        errorMessage,
        {
            [CONTROLLER_MESSAGES.RESOURCE_NAME_FIELD]: resourceName,
            [CONTROLLER_MESSAGES.REQUEST_BODY_FIELD]: Object.keys(req.body || {}),
            [CONTROLLER_MESSAGES.BODY_SIZE_FIELD]: JSON.stringify(req.body || {}).length
        }
    );
}

/**
 * Wrapper específico para actualizar recursos (PUT/PATCH)
 * @param {Function} updateOperation - Función que actualiza el recurso
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 * @param {string} resourceName - Nombre del recurso
 * @param {Object} options - Opciones adicionales
 */
async function updateResource(updateOperation, req, res, resourceName, options = {}) {
    const {
        successMessage = `${resourceName} ${CONTROLLER_MESSAGES.RESOURCE_UPDATED_SUCCESS}`,
        errorMessage = `${CONTROLLER_MESSAGES.RESOURCE_UPDATE_ERROR} ${resourceName}`
    } = options;

    return executeController(
        async () => {
            const result = await updateOperation();

            if (!result) {
                return errorResponse(res, `${resourceName} ${CONTROLLER_MESSAGES.RESOURCE_NOT_FOUND}`, HTTP_STATUS.NOT_FOUND);
            }

            return result;
        },
        req,
        res,
        successMessage,
        errorMessage,
        {
            [CONTROLLER_MESSAGES.RESOURCE_NAME_FIELD]: resourceName,
            [CONTROLLER_MESSAGES.RESOURCE_ID_FIELD]: req.params.id,
            [CONTROLLER_MESSAGES.UPDATED_FIELDS_FIELD]: Object.keys(req.body || {})
        }
    );
}

/**
 * Wrapper específico para eliminar recursos (DELETE)
 * @param {Function} deleteOperation - Función que elimina el recurso
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 * @param {string} resourceName - Nombre del recurso
 * @param {Object} options - Opciones adicionales
 */
async function deleteResource(deleteOperation, req, res, resourceName, options = {}) {
    const {
        successMessage = `${resourceName} ${CONTROLLER_MESSAGES.RESOURCE_DELETED_SUCCESS}`,
        errorMessage = `${CONTROLLER_MESSAGES.RESOURCE_DELETE_ERROR} ${resourceName}`
    } = options;

    return executeController(
        async () => {
            const result = await deleteOperation();

            if (!result) {
                return errorResponse(res, `${resourceName} ${CONTROLLER_MESSAGES.RESOURCE_NOT_FOUND}`, HTTP_STATUS.NOT_FOUND);
            }

            return { deleted: CONTROLLER_MESSAGES.DELETED_FLAG, id: req.params.id };
        },
        req,
        res,
        successMessage,
        errorMessage,
        {
            [CONTROLLER_MESSAGES.RESOURCE_NAME_FIELD]: resourceName,
            [CONTROLLER_MESSAGES.RESOURCE_ID_FIELD]: req.params.id
        }
    );
}

module.exports = {
    executeController,
    getResource,
    createResource,
    updateResource,
    deleteResource
};
