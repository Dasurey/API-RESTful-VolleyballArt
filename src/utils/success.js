const { SystemError } = require('../middlewares/error');
const { logAndExecute } = require('../config/log');

/**
 * Clase base para respuestas exitosas de la aplicación
 */
class AppSuccess {
    constructor(message, statusCode, payload = null, meta = null) {
        this.status = 'success';
        this.statusCode = statusCode;
        this.message = message;
        this.payload = payload;
        this.meta = {
            timestamp: new Date().toISOString(),
            requestId: `req_${Date.now()}`,
            cached: false,
            ...meta
        };
    }

    /**
     * Envía la respuesta usando el objeto response de Express
     * @param {Object} res - Response object de Express
     * @returns {Object} - Response object de Express
     */
    send(res) {
        return res.status(this.statusCode).json(this.toJSON());
    }

    /**
     * Convierte la respuesta a formato JSON
     * @returns {Object} - Objeto JSON de la respuesta
     */
    toJSON() {
        return {
            status: this.status,
            statusCode: this.statusCode,
            message: this.message,
            ...(this.payload && { payload: { ...this.payload } }),
            meta: this.meta
        };
    }
}

/**
 * Respuesta de éxito general (200)
 */
class SuccessResponse extends AppSuccess {
    constructor(message = 'Operación exitosa', payload = null, meta = null) {
        super(message, 200, payload, meta);
    }
}

/**
 * Respuesta de recurso creado (201)
 */
class CreatedResponse extends AppSuccess {
    constructor(message = 'Creado exitosamente', payload = null, meta = null) {
        super(message, 201, payload, meta);
    }
}

/**
 * Respuesta de recurso actualizado (200)
 */
class UpdatedResponse extends AppSuccess {
    constructor(message = 'Actualizado exitosamente', payload = null, meta = null) {
        super(message, 200, payload, meta);
    }
}

/**
 * Respuesta de recurso eliminado (204/200)
 */
class DeletedResponse extends AppSuccess {
    constructor(message = 'Recurso eliminado exitosamente', payload = null, meta = null, useNoContent = true) {
        const statusCode = useNoContent ? 204 : 200;
        super(message, statusCode, payload, meta);
    }
}

/**
 * Respuesta de autenticación exitosa (200)
 */
class AuthSuccessResponse extends AppSuccess {
    constructor(message = 'Autenticación exitosa', payload = null, meta = null) {
        super(message, 200, payload, {
            ...meta,
            authType: 'bearer',
            tokenType: 'JWT'
        });
    }
}

/**
 * Respuesta con datos/lista (200)
 */
class DataResponse extends AppSuccess {
    constructor(message = 'Datos obtenidos exitosamente', payload = null, count = null, meta = null) {
        super(message, 200, payload, {
            ...meta,
            ...(count !== null && { count })
        });
    }
}

/**
 * Respuesta desde caché (200)
 */
class CacheResponse extends AppSuccess {
    constructor(message = 'Datos obtenidos desde caché', payload = null, cacheInfo = null, meta = null) {
        super(message, 200, payload, {
            ...meta,
            cached: true,
            ...(cacheInfo && { cacheInfo })
        });
    }
}

/**
 * Respuesta paginada (200)
 */
class PaginatedResponse extends AppSuccess {
    constructor(message = 'Datos paginados obtenidos exitosamente', payload = null, pagination = null, meta = null) {
        super(message, 200, payload, {
            ...meta,
            ...(pagination && { pagination })
        });
    }
}

/**
 * Respuesta de operación aceptada (202)
 */
class AcceptedResponse extends AppSuccess {
    constructor(message = 'Operación aceptada y en proceso', payload = null, meta = null) {
        super(message, 202, payload, meta);
    }
}

/**
 * Respuesta de contenido parcial (206)
 */
class PartialContentResponse extends AppSuccess {
    constructor(message = 'Contenido parcial obtenido', payload = null, range = null, meta = null) {
        super(message, 206, payload, {
            ...meta,
            ...(range && { range })
        });
    }
}

/**
 * Función para crear respuestas específicas según el código de estado
 */
const createSuccess = (statusCode, message, payload = null, meta = null) => {
    switch (statusCode) {
        case 200:
            return new SuccessResponse(message, payload, meta);
        case 201:
            return new CreatedResponse(message, payload, meta);
        case 202:
            return new AcceptedResponse(message, payload, meta);
        case 204:
            return new DeletedResponse(message, payload, meta, true);
        case 206:
            return new PartialContentResponse(message, payload, null, meta);
        default:
            return new AppSuccess(message, statusCode, payload, meta);
    }
};

/**
 * Función para determinar el tiempo de respuesta
 */
const calculateResponseTime = (startTime) => {
    return startTime ? Date.now() - startTime : 0;
};

/**
 * Función para agregar información de rendimiento
 */
const addPerformanceInfo = (meta = {}, startTime = null) => {
    return {
        ...meta,
        responseTime: calculateResponseTime(startTime),
        memoryUsage: process.memoryUsage().heapUsed
    };
};

/**
 * Función para crear respuesta de éxito con logging automático
 */
const createSuccessWithLog = (res, statusCode, message, payload = null, meta = null, logLevel = 'info') => {
    const response = createSuccess(statusCode, message, payload, meta);

    // Log automático usando log.js
    try {
        logAndExecute(logLevel, message, {
            statusCode,
            payloadPresent: !!payload,
            responseTime: meta?.responseTime || 0
        }, 'SUCCESS');
    } catch (error) {
        // Si hay error al importar o usar log.js, usar error global
        const logError = new SystemError('Error en sistema de logging de respuestas exitosas', {
            originalError: error.message,
            context: 'createSuccessWithLog',
            statusCode,
            message
        });
        console.warn('⚠️ Logging error:', logError.toJSON());
    }

    return response;
};

module.exports = {
    AppSuccess,
    SuccessResponse,
    CreatedResponse,
    UpdatedResponse,
    DeletedResponse,
    AuthSuccessResponse,
    DataResponse,
    CacheResponse,
    PaginatedResponse,
    AcceptedResponse,
    PartialContentResponse,
    createSuccess,
    calculateResponseTime,
    addPerformanceInfo,
    createSuccessWithLog
};
