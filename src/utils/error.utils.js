const { HTTP_STATUS, DATABASE_ERROR_CODES } = require('../config/paths.config.js');
const { SERVICE_MESSAGES, ERROR_CONSTANTS } = require('./messages.utils.js');

/**
 * Clase base para errores personalizados de la aplicación
 */
class AppError extends Error {
  constructor(message, statusCode, code = null, details = null) {
    super(message);
    this.name = this.constructor.name;
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith('4') ? ERROR_CONSTANTS.STATUS_FAIL : ERROR_CONSTANTS.STATUS_ERROR;
    this.isOperational = true;
    this.code = code;
    this.details = details;
    this.timestamp = new Date().toISOString();

    Error.captureStackTrace(this, this.constructor);
  }

  toJSON() {
    return {
      name: this.name,
      message: this.message,
      statusCode: this.statusCode,
      status: this.status,
      code: this.code,
      details: this.details,
      timestamp: this.timestamp,
      isOperational: this.isOperational
    };
  }
}

/**
 * Error de validación (400)
 */
class ValidationError extends AppError {
  constructor(message = SERVICE_MESSAGES.VALIDATION_ERROR_DEFAULT, details = null, code = ERROR_CONSTANTS.VALIDATION_ERROR_CODE) {
    super(message, HTTP_STATUS.BAD_REQUEST, code, details);
  }
}

/**
 * Error de autenticación (401)
 */
class AuthenticationError extends AppError {
  constructor(message = SERVICE_MESSAGES.AUTHENTICATION_ERROR_DEFAULT, code = ERROR_CONSTANTS.AUTHENTICATION_ERROR_CODE) {
    super(message, HTTP_STATUS.UNAUTHORIZED, code);
  }
}

/**
 * Error de autorización (403)
 */
class AuthorizationError extends AppError {
  constructor(message = SERVICE_MESSAGES.AUTHORIZATION_ERROR_DEFAULT, code = ERROR_CONSTANTS.AUTHORIZATION_ERROR_CODE) {
    super(message, HTTP_STATUS.FORBIDDEN, code);
  }
}

/**
 * Error de recurso no encontrado (404)
 */
class NotFoundError extends AppError {
  constructor(message = SERVICE_MESSAGES.NOT_FOUND_ERROR_DEFAULT, resource = null, code = ERROR_CONSTANTS.NOT_FOUND_ERROR_CODE) {
    super(message, HTTP_STATUS.NOT_FOUND, code, resource ? { resource } : null);
  }
}

/**
 * Error de conflicto (409)
 */
class ConflictError extends AppError {
  constructor(message = SERVICE_MESSAGES.CONFLICT_ERROR_DEFAULT, details = null, code = ERROR_CONSTANTS.CONFLICT_ERROR_CODE) {
    super(message, HTTP_STATUS.CONFLICT, code, details);
  }
}

/**
 * Error de límite de velocidad (429)
 */
class RateLimitError extends AppError {
  constructor(message = SERVICE_MESSAGES.RATE_LIMIT_ERROR_DEFAULT, retryAfter = null, code = ERROR_CONSTANTS.RATE_LIMIT_ERROR_CODE) {
    super(message, HTTP_STATUS.TOO_MANY_REQUESTS, code, retryAfter ? { retryAfter } : null);
  }
}

/**
 * Error interno del servidor (500)
 */
class InternalServerError extends AppError {
  constructor(message = SERVICE_MESSAGES.INTERNAL_SERVER_ERROR_DEFAULT, details = null, code = ERROR_CONSTANTS.INTERNAL_SERVER_ERROR_CODE) {
    super(message, HTTP_STATUS.INTERNAL_SERVER_ERROR, code, details);
  }
}

/**
 * Error de base de datos
 */
class DatabaseError extends AppError {
  constructor(message = SERVICE_MESSAGES.DATABASE_ERROR_DEFAULT, operation = null, code = ERROR_CONSTANTS.DATABASE_ERROR_CODE) {
    super(message, HTTP_STATUS.INTERNAL_SERVER_ERROR, code, operation ? { operation } : null);
  }
}

/**
 * Error de servicio externo
 */
class ExternalServiceError extends AppError {
  constructor(message = SERVICE_MESSAGES.EXTERNAL_SERVICE_ERROR_DEFAULT, service = null, code = ERROR_CONSTANTS.EXTERNAL_SERVICE_ERROR_CODE) {
    super(message, HTTP_STATUS.BAD_GATEWAY, code, service ? { service } : null);
  }
}

/**
 * Error de configuración
 */
class ConfigurationError extends AppError {
  constructor(message = SERVICE_MESSAGES.CONFIGURATION_ERROR_DEFAULT, config = null, code = ERROR_CONSTANTS.CONFIGURATION_ERROR_CODE) {
    super(message, HTTP_STATUS.INTERNAL_SERVER_ERROR, code, config ? { config } : null);
  }
}

/**
 * Función para crear errores específicos según el código de estado
 */
const createError = (statusCode, message, details = null, code = null) => {
  switch (statusCode) {
    case HTTP_STATUS.BAD_REQUEST:
      return new ValidationError(message, details, code);
    case HTTP_STATUS.UNAUTHORIZED:
      return new AuthenticationError(message, code);
    case HTTP_STATUS.FORBIDDEN:
      return new AuthorizationError(message, code);
    case HTTP_STATUS.NOT_FOUND:
      return new NotFoundError(message, details, code);
    case HTTP_STATUS.CONFLICT:
      return new ConflictError(message, details, code);
    case HTTP_STATUS.TOO_MANY_REQUESTS:
      return new RateLimitError(message, details, code);
    case HTTP_STATUS.BAD_GATEWAY:
      return new ExternalServiceError(message, details, code);
    default:
      return new AppError(message, statusCode, code, details);
  }
};

/**
 * Función para determinar si un error es operacional
 */
const isOperationalError = (error) => {
  if (error instanceof AppError) {
    return error.isOperational;
  }
  return false;
};

/**
 * Función para formatear errores de Mongoose/Firebase
 */
const formatDatabaseError = (error) => {
  if (error.code === 11000) {
    // Error de duplicado en MongoDB
    const field = Object.keys(error.keyValue)[0];
    const value = error.keyValue[field];
    return new ConflictError(
      `${SERVICE_MESSAGES.DUPLICATE_FIELD_ERROR}: ${field}`,
      { field, value, duplicate: true },
      ERROR_CONSTANTS.DUPLICATE_FIELD_CODE
    );
  }

  if (error.name === ERROR_CONSTANTS.VALIDATION_ERROR_NAME) {
    // Error de validación de Mongoose
    const errors = Object.values(error.errors).map(err => ({
      field: err.path,
      message: err.message,
      value: err.value
    }));
    return new ValidationError(
      SERVICE_MESSAGES.VALIDATION_ERROR_DEFAULT,
      { validationErrors: errors },
      ERROR_CONSTANTS.MONGOOSE_VALIDATION_CODE
    );
  }

  if (error.name === ERROR_CONSTANTS.CAST_ERROR_NAME) {
    // Error de cast en Mongoose (ej: ObjectId inválido)
    return new ValidationError(
      `${SERVICE_MESSAGES.INVALID_FIELD_FORMAT}: ${error.path}`,
      { field: error.path, value: error.value },
      ERROR_CONSTANTS.INVALID_FORMAT_CODE
    );
  }

  // Error genérico de base de datos
  return new DatabaseError(
    SERVICE_MESSAGES.DATABASE_ERROR_DEFAULT,
    { originalError: error.message },
    ERROR_CONSTANTS.DATABASE_OPERATION_FAILED_CODE
  );
};

/**
 * Función para formatear errores de JWT
 */
const formatJWTError = (error) => {
  if (error.name === ERROR_CONSTANTS.JSON_WEB_TOKEN_ERROR_NAME) {
    return new AuthenticationError(
      SERVICE_MESSAGES.INVALID_TOKEN,
      ERROR_CONSTANTS.INVALID_JWT_CODE
    );
  }

  if (error.name === ERROR_CONSTANTS.TOKEN_EXPIRED_ERROR_NAME) {
    return new AuthenticationError(
      SERVICE_MESSAGES.EXPIRED_TOKEN,
      ERROR_CONSTANTS.EXPIRED_JWT_CODE
    );
  }

  return new AuthenticationError(
    SERVICE_MESSAGES.TOKEN_ERROR,
    ERROR_CONSTANTS.JWT_ERROR_CODE
  );
};

module.exports = {
  AppError,
  ValidationError,
  AuthenticationError,
  AuthorizationError,
  NotFoundError,
  ConflictError,
  RateLimitError,
  InternalServerError,
  DatabaseError,
  ExternalServiceError,
  ConfigurationError,
  createError,
  isOperationalError,
  formatDatabaseError,
  formatJWTError
};
