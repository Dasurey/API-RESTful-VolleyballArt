const { HTTP_STATUS, RELATIVE_PATHS, EXTERNAL_PACKAGES, SANITIZATION } = require('../config/paths.config.js');
const { SANITIZATION_MESSAGES } = require('../utils/messages.utils.js');
const { body, validationResult } = require(EXTERNAL_PACKAGES.EXPRESS_VALIDATOR);

// Middleware personalizado para sanitizar datos de entrada evitando problemas con req.query
const sanitizeInput = (req, res, next) => {
  try {
    // Función para eliminar caracteres peligrosos de MongoDB
    const sanitize = (obj) => {
      if (obj && typeof obj === SANITIZATION.TYPE_OBJECT) {
        for (let key in obj) {
          if (typeof obj[key] === SANITIZATION.TYPE_STRING) {
            // Remover caracteres peligrosos para MongoDB
            obj[key] = obj[key].replace(SANITIZATION.MONGO_DANGEROUS_CHARS, SANITIZATION.EMPTY_STRING);
          } else if (typeof obj[key] === SANITIZATION.TYPE_OBJECT && obj[key] !== null) {
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
      req[SANITIZATION.PROP_SANITIZED_QUERY] = sanitizedQuery;
    }

    next();
  } catch (error) {
    console.error(SANITIZATION_MESSAGES.SANITIZATION_ERROR, error.message);
    next(); // Continuar sin bloquear la request
  }
};

// Middleware para sanitizar HTML y prevenir XSS
const sanitizeHtml = (req, res, next) => {
  // Función simple para limpiar HTML básico
  const cleanHtml = (str) => {
    if (typeof str !== SANITIZATION.TYPE_STRING) return str;
    return str
      .replace(SANITIZATION.HTML_SCRIPT_TAGS, SANITIZATION.EMPTY_STRING) // Remover scripts
      .replace(SANITIZATION.HTML_ALL_TAGS, SANITIZATION.EMPTY_STRING) // Remover todas las etiquetas HTML
      .trim();
  };

  // Limpiar req.body recursivamente
  const cleanObject = (obj) => {
    if (obj && typeof obj === SANITIZATION.TYPE_OBJECT) {
      for (let key in obj) {
        if (typeof obj[key] === SANITIZATION.TYPE_STRING) {
          obj[key] = cleanHtml(obj[key]);
        } else if (typeof obj[key] === SANITIZATION.TYPE_OBJECT) {
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
const sanitizeEmail = body(SANITIZATION.FIELD_EMAIL)
  .isEmail()
  .normalizeEmail()
  .escape();

const sanitizePassword = body(SANITIZATION.FIELD_PASSWORD)
  .isLength({ min: SANITIZATION.MIN_PASSWORD_LENGTH })
  .escape();

// Middleware para verificar errores de validación
const checkValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(HTTP_STATUS.BAD_REQUEST).json({
      message: SANITIZATION_MESSAGES.INVALID_DATA,
      errors: errors.array()
    });
  }
  next();
};


module.exports = {
  sanitizeInput,
  sanitizeHtml,
  sanitizeEmail,
  sanitizePassword,
  checkValidationErrors
};