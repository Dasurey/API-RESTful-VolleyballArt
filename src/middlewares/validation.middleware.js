const { ValidationError } = require('../utils/error.utils');

// Middleware para validar datos con Joi
const validate = (schema) => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.body);
    
    if (error) {
      // Crear ValidationError con detalles específicos
      const errorDetails = error.details.map(detail => ({
        field: detail.path[0],
        message: detail.message,
        value: detail.context?.value
      }));
      
      throw new ValidationError(undefined, { 
        validationErrors: errorDetails 
      });
    }
    
    // Reemplazar req.body con los datos validados y limpios
    req.body = value;
    next();
  };
};

module.exports = { validate };
