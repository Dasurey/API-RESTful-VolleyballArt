const { EXTERNAL_PACKAGES, HTTP_STATUS } = require('../config/paths.config.js');
const { JOI_ERROR_KEYS, VALIDATION_MESSAGES, SERVICE_MESSAGES } = require('../utils/messages.utils.js');
const { ValidationError } = require('../utils/error.utils.js');
const Joi = require(EXTERNAL_PACKAGES.JOI);

// Validación para parámetros de ID
const idParamSchema = Joi.object({
  id: Joi.string()
    .pattern(SERVICE_MESSAGES.PRODUCT_ID_PATTERN)
    .required()
    .messages({
      [JOI_ERROR_KEYS.STRING_PATTERN_BASE]: VALIDATION_MESSAGES.ID_FORMAT_INVALID,
      [JOI_ERROR_KEYS.STRING_EMPTY]: VALIDATION_MESSAGES.ID_REQUIRED
    })
});

// Validación para query parameters (futura paginación)
const querySchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(10),
  search: Joi.string().allow(''),
  category: Joi.number().integer().min(1),
  outstanding: Joi.boolean()
});

// Middleware para validar parámetros de URL
const validateParams = (schema) => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.params);
    
    if (error) {
      const validationError = new ValidationError();
      validationError.details = error.details;
      return next(validationError);
    }
    
    req.params = value;
    next();
  };
};

// Middleware para validar query parameters
const validateQuery = (schema) => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.query);
    
    if (error) {
      const validationError = new ValidationError();
      validationError.details = error.details;
      return next(validationError);
    }
    
    req.query = value;
    next();
  };
};

module.exports = {
  idParamSchema,
  querySchema,
  validateParams,
  validateQuery
};
