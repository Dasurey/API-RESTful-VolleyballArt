const { ValidationError } = require('./error');

/**
 * Middleware para convertir errores de express-validator en ValidationError
 * @param {Object} options - { message, code, details }
 */
const handleValidationErrors = (options = {}) => (req, res, next) => {
    const { validationResult } = require('express-validator');
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        const errorDetails = errors.array().map(error => ({
            field: error.path || error.param,
            message: error.message,
            value: error.value,
            location: error.location
        }));

        throw new ValidationError(
            options.message || undefined,
            { validationErrors: errorDetails, ...options.details },
            options.code || 'EXPRESS_VALIDATOR_ERROR'
        );
    }
    next();
};

/**
 * Middleware para convertir errores de Joi en ValidationError
 * @param {Object} schema - Esquema Joi para validar
 * @param {Object} options - { message, code, details, source }
 */
const handleJoiValidationErrors = (schema, options = {}) => (req, res, next) => {
    const source = options.source || 'body';
    const dataToValidate = req[source];
    const { error } = schema.validate(dataToValidate, {
        abortEarly: false,
        stripUnknown: true
    });

    if (error) {
        const errorDetails = error.details.map(detail => ({
            field: detail.path.join('.'),
            message: detail.message,
            value: detail.context?.value,
            type: detail.type
        }));

        return next(new ValidationError(
            options.message || undefined,
            { validationErrors: errorDetails, ...options.details },
            options.code || 'JOI_VALIDATION_ERROR'
        ));
    }
    next();
};

/**
 * Middleware para manejar errores de límite de archivo al subir imagenes o documentos.
 * @param {Object} options - { message, code, details }
 */
const handleMulterErrors = (options = {}) => (error, req, res, next) => {
    if (error.code === 'LIMIT_FILE_SIZE') {
        throw new ValidationError(
            options.message || 'El archivo es demasiado grande',
            { maxSize: error.limit, field: error.field, ...options.details },
            options.code || 'FILE_TOO_LARGE'
        );
    }
    if (error.code === 'LIMIT_FILE_COUNT') {
        throw new ValidationError(
            options.message || 'Demasiados archivos',
            { maxFiles: error.limit, field: error.field, ...options.details },
            options.code || 'TOO_MANY_FILES'
        );
    }
    if (error.code === 'LIMIT_UNEXPECTED_FILE') {
        throw new ValidationError(
            options.message || 'Campo de archivo inesperado',
            { field: error.field, ...options.details },
            options.code || 'UNEXPECTED_FILE_FIELD'
        );
    }
    next(error);
};

module.exports = {
    handleValidationErrors,
    handleJoiValidationErrors,
    handleMulterErrors
};
