const { ValidationError } = require('./error');

/**
 * Middleware para convertir errores de express-validator en ValidationError
 */
const handleValidationErrors = (req, res, next) => {
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
            undefined,
            { validationErrors: errorDetails },
            'EXPRESS_VALIDATOR_ERROR'
        );
    }

    next();
};

/**
 * Middleware para convertir errores de Joi en ValidationError
 */
const handleJoiValidationErrors = (schema, source = 'body') => (req, res, next) => {
    // Validar la fuente de datos especificada (body, params, query)
    const dataToValidate = req[source];
    const { error } = schema.validate(dataToValidate, {
        abortEarly: false,  // Recolectar todos los errores
        stripUnknown: true  // Remover campos no definidos en el schema
    });

    if (error) {
        const errorDetails = error.details.map(detail => ({
            field: detail.path.join('.'),
            message: detail.message,
            value: detail.context?.value,
            type: detail.type
        }));

        return next(new ValidationError(
            undefined,
            { validationErrors: errorDetails },
            'JOI_VALIDATION_ERROR'
        ));
    }
    next();
};

/**
 * Middleware para manejar errores de límite de archivo
 */
const handleMulterErrors = (error, req, res, next) => {
    if (error.code === 'LIMIT_FILE_SIZE') {
        throw new ValidationError(
            'El archivo es demasiado grande',
            {
                maxSize: error.limit,
                field: error.field
            },
            'FILE_TOO_LARGE'
        );
    }

    if (error.code === 'LIMIT_FILE_COUNT') {
        throw new ValidationError(
            'Demasiados archivos',
            {
                maxFiles: error.limit,
                field: error.field
            },
            'TOO_MANY_FILES'
        );
    }

    if (error.code === 'LIMIT_UNEXPECTED_FILE') {
        throw new ValidationError(
            'Campo de archivo inesperado',
            { field: error.field },
            'UNEXPECTED_FILE_FIELD'
        );
    }

    next(error);
};

module.exports = {
    handleValidationErrors,
    handleJoiValidationErrors,
    handleMulterErrors
};
