// Middleware para validar datos con Joi
const validate = (schema) => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.body);
    
    if (error) {
      // Extraer solo el primer error para simplicidad
      const errorMessage = error.details[0].message;
      
      return res.status(400).json({
        message: 'Datos inválidos',
        error: errorMessage,
        field: error.details[0].path[0] // Campo que falló
      });
    }
    
    // Reemplazar req.body con los datos validados y limpios
    req.body = value;
    next();
  };
};

module.exports = { validate };
