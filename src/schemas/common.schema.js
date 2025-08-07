const { ValidationError } = require('../middlewares/error.js');
const Joi = require('joi');

// Validación para parámetros de ID
const idParamSchema = Joi.object({
  id: Joi.string()
    .pattern(/^VA-\d{7}$/)
    .required()
    .messages({
      'string.pattern.base': '🆔 El ID debe tener el formato VA-XXXXXXX',
      'string.empty': '🆔 El ID es obligatorio'
    })
});

// Validación para query parameters (futura paginación)
const querySchema = Joi.object({
  page: Joi.number().integer().min(1).default(1).messages({
    'number.base': '🔢 El número de página debe ser un número',
    'number.min': '🔢 La página debe ser mayor o igual a 1'
  }),
  limit: Joi.number().integer().min(1).max(100).default(10).messages({
    'number.base': '🔢 El límite debe ser un número',
    'number.min': '🔢 El límite debe ser mayor o igual a 1',
    'number.max': '🔢 El límite máximo es 100'
  }),
  search: Joi.string().allow('').messages({
    'string.base': '🔍 El término de búsqueda debe ser texto'
  }),
  category: Joi.number().integer().min(1).messages({
    'number.base': '🏷️ La categoría debe ser un número',
    'number.min': '🏷️ La categoría debe ser mayor o igual a 1'
  }),
  outstanding: Joi.boolean().messages({
    'boolean.base': '⭐ El campo destacado debe ser booleano'
  })
});

// Middleware para validar parámetros de URL
const validateParams = (schema) => {
  return (req, res, next) => {
    const { error, value } = schema.handleJoiValidationErrors(req.params);
    
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
    const { error, value } = schema.handleJoiValidationErrors(req.query);

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
