const Joi = require('joi');

// Validación para parámetros de ID
const idParamSchema = Joi.object({
  id: Joi.string()
    .pattern(/^VA-\d{7}$/)
    .required()
    .messages({
      'string.pattern.base': 'El ID debe tener el formato VA-0000001',
      'string.empty': 'El ID es obligatorio'
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
      return res.status(400).json({
        message: 'Parámetro inválido',
        error: error.details[0].message
      });
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
      return res.status(400).json({
        message: 'Query parameter inválido',
        error: error.details[0].message
      });
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
