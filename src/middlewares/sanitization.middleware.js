const { body, validationResult } = require('express-validator');

// Middleware personalizado para sanitizar datos de entrada evitando problemas con req.query
const sanitizeInput = (req, res, next) => {
  try {
    // Función para eliminar caracteres peligrosos de MongoDB
    const sanitize = (obj) => {
      if (obj && typeof obj === 'object') {
        for (let key in obj) {
          if (typeof obj[key] === 'string') {
            // Remover caracteres peligrosos para MongoDB
            obj[key] = obj[key].replace(/[${}]/g, '');
          } else if (typeof obj[key] === 'object' && obj[key] !== null) {
            sanitize(obj[key]);
          }
        }
      }
      return obj;
    };

    // Sanitizar solo req.body y req.params (evitar req.query que puede ser readonly)
    if (req.body) {
      req.body = sanitize({ ...req.body });
    }
    
    if (req.params) {
      req.params = sanitize({ ...req.params });
    }

    // Para req.query, crear una copia sanitizada sin modificar el original
    if (req.query && Object.keys(req.query).length > 0) {
      const sanitizedQuery = sanitize({ ...req.query });
      // No modificar req.query directamente, usar una propiedad personalizada
      req.sanitizedQuery = sanitizedQuery;
    }

    next();
  } catch (error) {
    console.error('🚨 Error en sanitización:', error.message);
    next(); // Continuar sin bloquear la request
  }
};

// Middleware para sanitizar HTML y prevenir XSS
const sanitizeHtml = (req, res, next) => {
  // Función simple para limpiar HTML básico
  const cleanHtml = (str) => {
    if (typeof str !== 'string') return str;
    return str
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '') // Remover scripts
      .replace(/<[^>]*>/g, '') // Remover todas las etiquetas HTML
      .trim();
  };

  // Limpiar req.body recursivamente
  const cleanObject = (obj) => {
    if (obj && typeof obj === 'object') {
      for (let key in obj) {
        if (typeof obj[key] === 'string') {
          obj[key] = cleanHtml(obj[key]);
        } else if (typeof obj[key] === 'object') {
          cleanObject(obj[key]);
        }
      }
    }
  };

  if (req.body) {
    cleanObject(req.body);
  }

  next();
};

// Validadores específicos para campos sensibles
const sanitizeEmail = body('email')
  .isEmail()
  .normalizeEmail()
  .escape();

const sanitizePassword = body('password')
  .isLength({ min: 6 })
  .escape();

// Middleware para verificar errores de validación
const checkValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      message: 'Datos inválidos',
      errors: errors.array()
    });
  }
  next();
};


module.exports = {
  sanitizeInput,
  sanitizeHtml
};