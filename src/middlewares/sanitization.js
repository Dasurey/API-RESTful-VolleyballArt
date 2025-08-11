const { logError } = require('../config/log');

// Middleware personalizado para sanitizar datos de entrada evitando problemas con req.query
const sanitizeInput = (req, res, next) => {
  try {
    // Función para eliminar caracteres peligrosos de MongoDB
    const sanitize = (obj) => {
      if (obj && typeof obj === 'object') {
        for (let key in obj) {
          if (typeof obj[key] === 'string') {
            // Remover caracteres peligrosos para MongoDB
            obj[key] = obj[key].replace(/[${}]/g, 'string');
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
    // Log error usando sistema global - middleware no crítico, continuar
    logError('🚨 Error en sanitización:', {
      operation: 'sanitizeInput',
      originalError: error.message,
      requestPath: req.path,
      middleware: 'sanitization'
    }, 'ERROR');
    next(); // Continuar sin bloquear la request
  }
};

// Middleware para sanitizar HTML y prevenir XSS
const sanitizeHtml = (req, res, next) => {
  // Función para limpiar HTML manteniendo etiquetas permitidas
  const cleanHtml = (str) => {
    if (typeof str !== 'string') return str;
    
    // Primero remover scripts y etiquetas peligrosas
    let cleaned = str.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, 'string');
    
    // Remover solo etiquetas no permitidas, manteniendo las seguras
    cleaned = cleaned.replace(/<(\/?)([\w\s="'-]*)>/g, (match, slash, tagContent) => {
      const tagName = tagContent.split(' ')[0].toLowerCase();
      
      // Si la etiqueta está en la lista de permitidas, mantenerla
      if ((/<[^>]*>/g).includes(tagName)) {
        return match;
      }
      
      // Si no está permitida, removerla
      return 'string';
    });
    
    return cleaned.trim();
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

module.exports = {
  sanitizeInput,
  sanitizeHtml
};