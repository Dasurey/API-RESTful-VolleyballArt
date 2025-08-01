const { EXTERNAL_PACKAGES } = require('./paths.config.js');
const { SECURITY_CONSTANTS } = require('../utils/messages.utils.js');
const helmet = require(EXTERNAL_PACKAGES.HELMET);
const rateLimit = require(EXTERNAL_PACKAGES.EXPRESS_RATE_LIMIT);

// Configuración básica de Helmet para headers de seguridad
const helmetConfig = helmet({
  // Configurar Content Security Policy básico
  contentSecurityPolicy: {
    directives: {
      defaultSrc: [SECURITY_CONSTANTS.CSP_SELF],
      styleSrc: [SECURITY_CONSTANTS.CSP_SELF, SECURITY_CONSTANTS.CSP_UNSAFE_INLINE],
      scriptSrc: [SECURITY_CONSTANTS.CSP_SELF],
      imgSrc: [SECURITY_CONSTANTS.CSP_SELF, SECURITY_CONSTANTS.CSP_DATA, SECURITY_CONSTANTS.CSP_HTTPS],
      connectSrc: [SECURITY_CONSTANTS.CSP_SELF],
      fontSrc: [SECURITY_CONSTANTS.CSP_SELF],
      objectSrc: [SECURITY_CONSTANTS.CSP_NONE],
      mediaSrc: [SECURITY_CONSTANTS.CSP_SELF],
      frameSrc: [SECURITY_CONSTANTS.CSP_NONE],
    },
  },
  
  // Configurar otros headers de seguridad
  crossOriginEmbedderPolicy: false, // Para compatibilidad
  crossOriginResourcePolicy: { policy: SECURITY_CONSTANTS.CROSS_ORIGIN }
});

// Rate limiting general para toda la API
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100, // 100 requests por IP cada 15 minutos
  message: {
    error: SECURITY_CONSTANTS.RATE_LIMIT_GENERAL_ERROR,
    retryAfter: SECURITY_CONSTANTS.RETRY_AFTER_15_MIN
  },
  standardHeaders: true, // Incluir rate limit en headers
  legacyHeaders: false,
});

// Rate limiting estricto para autenticación
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 5, // 5 intentos de login por IP cada 15 minutos
  message: {
    error: SECURITY_CONSTANTS.RATE_LIMIT_AUTH_ERROR,
    retryAfter: SECURITY_CONSTANTS.RETRY_AFTER_15_MIN
  },
  standardHeaders: true,
  legacyHeaders: false,
  // Solo aplicar a requests fallidos
  skipSuccessfulRequests: SECURITY_CONSTANTS.SKIP_SUCCESSFUL_REQUESTS,
});

// Rate limiting para crear productos
const createLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, /* 1 hora, pero en realidad no se aplica porque el skip esta en true 
  tecnicamente lo hace esta funcion es limitar cuantos productos se pueden hacer por tiempo. En
  caso de que se quiera hacer asi se debe activar de nuevo.*/
  max: 0, // Sin límite de productos por hora
  message: {
    error: SECURITY_CONSTANTS.RATE_LIMIT_CREATE_ERROR,
    retryAfter: SECURITY_CONSTANTS.RETRY_AFTER_1_HOUR
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
