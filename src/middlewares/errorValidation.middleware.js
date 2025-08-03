const { SYSTEM_MESSAGES, ERROR_VALIDATION_MIDDLEWARE_CONSTANTS } = require('../utils/messages.utils.js');
const { RELATIVE_PATHS } = require('../config/paths.config.js');
const { ValidationError } = require(RELATIVE_PATHS.FROM_UTILS.UTILS_ERROR_PATH);

/**
 * Middleware para convertir errores de express-validator en ValidationError
 */
const handleValidationErrors = (req, res, next) => {
    const { validationResult } = require(ERROR_VALIDATION_MIDDLEWARE_CONSTANTS.EXPRESS_VALIDATOR_PACKAGE);
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        const errorDetails = errors.array().map(error => ({
            field: error.path || error.param,
            message: error.message,
            value: error.value,
            location: error.location
        }));

        throw new ValidationError(
            SYSTEM_MESSAGES.VALIDATION_ERROR_DEFAULT,
            { validationErrors: errorDetails },
            ERROR_VALIDATION_MIDDLEWARE_CONSTANTS.EXPRESS_VALIDATOR_ERROR_CODE
        );
    }

    next();
};

/**
 * Middleware para convertir errores de Joi en ValidationError
 */
const handleJoiValidationErrors = (error, req, res, next) => {
    if (error.isJoi) {
        const errorDetails = error.details.map(detail => ({
            field: detail.path.join(ERROR_VALIDATION_MIDDLEWARE_CONSTANTS.JOI_PATH_SEPARATOR),
            message: detail.message,
            value: detail.context?.value,
            type: detail.type
        }));

        const validationError = new ValidationError(
            SYSTEM_MESSAGES.VALIDATION_ERROR_DEFAULT,
            { validationErrors: errorDetails },
            ERROR_VALIDATION_MIDDLEWARE_CONSTANTS.JOI_VALIDATION_ERROR_CODE
        );

        return next(validationError);
    }

    next(error);
};

/**
 * Middleware para manejar errores de límite de archivo
 */
const handleMulterErrors = (error, req, res, next) => {
    if (error.code === ERROR_VALIDATION_MIDDLEWARE_CONSTANTS.MULTER_LIMIT_FILE_SIZE) {
        throw new ValidationError(
            ERROR_VALIDATION_MIDDLEWARE_CONSTANTS.FILE_TOO_LARGE_MESSAGE,
            {
                maxSize: error.limit,
                field: error.field
            },
            ERROR_VALIDATION_MIDDLEWARE_CONSTANTS.FILE_TOO_LARGE_CODE
        );
    }

    if (error.code === ERROR_VALIDATION_MIDDLEWARE_CONSTANTS.MULTER_LIMIT_FILE_COUNT) {
        throw new ValidationError(
            ERROR_VALIDATION_MIDDLEWARE_CONSTANTS.TOO_MANY_FILES_MESSAGE,
            {
                maxFiles: error.limit,
                field: error.field
            },
            ERROR_VALIDATION_MIDDLEWARE_CONSTANTS.TOO_MANY_FILES_CODE
        );
    }

    if (error.code === ERROR_VALIDATION_MIDDLEWARE_CONSTANTS.MULTER_LIMIT_UNEXPECTED_FILE) {
        throw new ValidationError(
            ERROR_VALIDATION_MIDDLEWARE_CONSTANTS.UNEXPECTED_FILE_FIELD_MESSAGE,
            { field: error.field },
            ERROR_VALIDATION_MIDDLEWARE_CONSTANTS.UNEXPECTED_FILE_FIELD_CODE
        );
    }

    next(error);
};

module.exports = {
    handleValidationErrors,
    handleJoiValidationErrors,
    handleMulterErrors
};
