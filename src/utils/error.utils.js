/**
 * Clase base para errores personalizados de la aplicación
 */
class AppError extends Error {
  constructor(message, statusCode, code = null, details = null) {
    super(message);
    this.name = this.constructor.name;
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
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
  constructor(message = '📝 Datos de entrada inválidos', details = null, code = 'VALIDATION_ERROR') {
    super(message, 400, code, details);
  }
}

/**
 * Error de autenticación (401)
 */
class AuthenticationError extends AppError {
  constructor(message = '🔐 Credenciales de autenticación inválidas', code = 'AUTHENTICATION_ERROR') {
    super(message, 401, code);
  }
}

/**
 * Error de autorización (403)
 */
class AuthorizationError extends AppError {
  constructor(message = '🚫 No tienes permisos para acceder a este recurso', code = 'AUTHORIZATION_ERROR') {
    super(message, 403, code);
  }
}

/**
 * Error de recurso no encontrado (404)
 */
class NotFoundError extends AppError {
  constructor(message = '🔍 Recurso no encontrado', resource = null, code = 'NOT_FOUND_ERROR') {
    super(message, 404, code, resource ? { resource } : null);
  }
}

/**
 * Error de conflicto (409)
 */
class ConflictError extends AppError {
  constructor(message = '🚨 Conflicto en la solicitud', details = null, code = 'CONFLICT_ERROR') {
    super(message, 409, code, details);
  }
}

/**
 * Error de límite de velocidad (429)
 */
class RateLimitError extends AppError {
  constructor(message = '⏳ Límite de velocidad excedido', retryAfter = null, code = 'RATE_LIMIT_ERROR') {
    super(message, 429, code, retryAfter ? { retryAfter } : null);
  }
}

/**
 * Error interno del servidor (500)
 */
class InternalServerError extends AppError {
  constructor(message = '🚨 Error interno del servidor', details = null, code = 'INTERNAL_SERVER_ERROR') {
    super(message, 500, code, details);
  }
}

/**
 * Error de base de datos
 */
class DatabaseError extends AppError {
  constructor(message = '💾 Error en la base de datos', operation = null, code = 'DATABASE_ERROR') {
    super(message, 500, code, operation ? { operation } : null);
  }
}

/**
 * Error de servicio externo
 */
class ExternalServiceError extends AppError {
  constructor(message = '🌐 Error en servicio externo', service = null, code = 'EXTERNAL_SERVICE_ERROR') {
    super(message, 502, code, service ? { service } : null);
  }
}

/**
 * Error de configuración
 */
class ConfigurationError extends AppError {
  constructor(message = '⚙️ Error de configuración del sistema', config = null, code = 'CONFIGURATION_ERROR') {
    super(message, 500, code, config ? { config } : null);
  }
}

/**
 * Función para crear errores específicos según el código de estado
 */
const createError = (statusCode, message, details = null, code = null) => {
  switch (statusCode) {
    case 400:
      return new ValidationError(message, details, code);
    case 401:
      return new AuthenticationError(message, code);
    case 403:
      return new AuthorizationError(message, code);
    case 404:
      return new NotFoundError(message, details, code);
    case 409:
      return new ConflictError(message, details, code);
    case 429:
      return new RateLimitError(message, details, code);
    case 502:
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
    return new ConflictError(`🔄 Campo duplicado: ${field}`, { field, value, duplicate: true }, 'DUPLICATE_FIELD');
  }

  if (error.name === 'ValidationError') {
    // Error de validación de Mongoose
    const errors = Object.values(error.errors).map(err => ({
      field: err.path,
      message: err.message,
      value: err.value
    }));
    return new ValidationError(undefined, { validationErrors: errors }, 'MONGOOSE_VALIDATION');
  }

  if (error.name === 'CastError') {
    // Error de cast en Mongoose (ej: ObjectId inválido)
    return new ValidationError(`📋 Formato de campo inválido: ${error.path}`, { field: error.path, value: error.value }, 'INVALID_FORMAT');
  }

  // Error genérico de base de datos
  return new DatabaseError('💾 Error en la base de datos', { originalError: error.message }, 'DATABASE_OPERATION_FAILED');
};

/**
 * Función para formatear errores de JWT
 */
const formatJWTError = (error) => {
  if (error.name === 'JsonWebTokenError') {
    return new AuthenticationError('🚫 Token inválido', 'INVALID_JWT');
  }

  if (error.name === 'TokenExpiredError') {
    return new AuthenticationError('⏰ Token expirado', 'EXPIRED_JWT');
  }

  return new AuthenticationError('🔐 Error en el token de autenticación', 'JWT_ERROR');
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
