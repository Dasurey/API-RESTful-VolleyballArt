const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

// Configuración básica de Helmet para headers de seguridad
const helmetConfig = helmet({
  // Configurar Content Security Policy básico
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'"],
      fontSrc: ["'self'"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'none'"],
    },
  },
  
  // Configurar otros headers de seguridad
  crossOriginEmbedderPolicy: false, // Para compatibilidad
  crossOriginResourcePolicy: { policy: "cross-origin" }
});

// Rate limiting general para toda la API
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100, // 100 requests por IP cada 15 minutos
  message: {
    error: 'Demasiadas solicitudes desde esta IP',
    retryAfter: '15 minutos'
  },
  standardHeaders: true, // Incluir rate limit en headers
  legacyHeaders: false,
});

// Rate limiting estricto para autenticación
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 5, // 5 intentos de login por IP cada 15 minutos
  message: {
    error: 'Demasiados intentos de autenticación',
    retryAfter: '15 minutos'
  },
  standardHeaders: true,
  legacyHeaders: false,
  // Solo aplicar a requests fallidos
  skipSuccessfulRequests: true,
});

// Rate limiting para crear productos
const createLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, /* 1 hora, pero en realidad no se aplica porque el skip esta en true 
  tecnicamente lo hace esta funcion es limitar cuantos productos se pueden hacer por tiempo. En
  caso de que se quiera hacer asi se debe activar de nuevo.*/
  max: 0, // Sin límite de productos por hora
  message: {
    error: 'Límite de creación de productos excedido',
    retryAfter: '1 hora'
  },
  standardHeaders: true,
  legacyHeaders: false,
  skip: () => true, // Desactivar completamente el límite
});

module.exports = {
  helmetConfig,
  generalLimiter,
  authLimiter,
  createLimiter
};
