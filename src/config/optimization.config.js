/**
 * ⚡ Sistema de Optimización de Rendimiento
 * 
 * Implementa técnicas avanzadas de optimización:
 * - Compresión GZIP/Brotli
 * - Throttling inteligente
 * - Optimización de respuestas
 * - Minimización de payload
 */

const { EXTERNAL_PACKAGES } = require('./paths.config.js');
const { OPTIMIZATION_CONSTANTS } = require('../utils/messages.utils.js');
const compression = require(EXTERNAL_PACKAGES.COMPRESSION);
const slowDown = require(EXTERNAL_PACKAGES.EXPRESS_SLOW_DOWN);

/**
 * Configuración de compresión avanzada
 */
const compressionMiddleware = compression({
  // Nivel de compresión (1-9, 6 es el equilibrio perfecto)
  level: 6,
  
  // Umbral mínimo para comprimir (1KB)
  threshold: 1024,
  
  // Filtro para decidir qué comprimir
  filter: (req, res) => {
    // No comprimir si el cliente no lo soporta
    if (req.headers[OPTIMIZATION_CONSTANTS.HEADER_X_NO_COMPRESSION]) {
      return false;
    }
    
    // Comprimir solo ciertos tipos de contenido
    const contentType = res.getHeader(OPTIMIZATION_CONSTANTS.HEADER_CONTENT_TYPE);
    if (!contentType) return false;
    
    return (
      contentType.includes(OPTIMIZATION_CONSTANTS.CONTENT_TYPE_JSON) ||
      contentType.includes(OPTIMIZATION_CONSTANTS.CONTENT_TYPE_TEXT) ||
      contentType.includes(OPTIMIZATION_CONSTANTS.CONTENT_TYPE_JAVASCRIPT) ||
      contentType.includes(OPTIMIZATION_CONSTANTS.CONTENT_TYPE_XML)
    );
  },
  
  // Estrategia de compresión optimizada
  strategy: 0, // Z_DEFAULT_STRATEGY equivalente
  
  // Configuraciones adicionales para mejor rendimiento
  chunkSize: 16 * 1024, // 16KB chunks
  windowBits: 15, // Ventana de compresión óptima
  memLevel: 8 // Memoria dedicada a compresión
});

/**
 * Throttling inteligente para diferentes endpoints
 */
const createSlowDown = (options = {}) => {
  const defaultOptions = {
    windowMs: 15 * 60 * 1000, // 15 minutos
    delayAfter: 50, // Permitir 50 requests sin delay
    delayMs: (hits) => hits * 100, // Incrementar delay progresivamente
    maxDelayMs: 5000, // Máximo delay de 5 segundos
    skipSuccessfulRequests: true,
    skipFailedRequests: false
  };

  return slowDown({
    ...defaultOptions,
    ...options
  });
};

/**
 * Configuraciones específicas de throttling
 */
const throttleConfigs = {
  // Para endpoints de lectura (más permisivo)
  read: createSlowDown({
    delayAfter: 100,
    delayMs: (hits) => hits * 50,
    maxDelayMs: 2000
  }),

  // Para endpoints de escritura (más restrictivo)
  write: createSlowDown({
    delayAfter: 20,
    delayMs: (hits) => hits * 200,
    maxDelayMs: 10000
  }),

  // Para autenticación (muy restrictivo)
  auth: createSlowDown({
    delayAfter: 10,
    delayMs: (hits) => hits * 500,
    maxDelayMs: 15000,
    windowMs: 5 * 60 * 1000 // 5 minutos
  })
};

/**
 * Middleware de optimización de respuestas JSON
 */
const optimizeResponse = (req, res, next) => {
  const originalJson = res.json;
  
  res.json = function(data) {
    try {
      // Añadir metadatos de rendimiento
      const optimizedData = {
        ...data,
        meta: {
          timestamp: new Date().toISOString(),
          requestId: req.headers[OPTIMIZATION_CONSTANTS.HEADER_X_REQUEST_ID] || `${OPTIMIZATION_CONSTANTS.REQUEST_ID_PREFIX}${Date.now()}`,
          cached: res.get(OPTIMIZATION_CONSTANTS.HEADER_X_CACHE) === OPTIMIZATION_CONSTANTS.CACHE_HIT,
          responseTime: Date.now() - (req.startTime || Date.now())
        }
      };

      // Configurar headers de optimización
      res.set(OPTIMIZATION_CONSTANTS.HEADER_X_RESPONSE_TIME, `${Date.now() - (req.startTime || Date.now())}${OPTIMIZATION_CONSTANTS.RESPONSE_TIME_SUFFIX}`);
      res.set(OPTIMIZATION_CONSTANTS.HEADER_X_POWERED_BY, OPTIMIZATION_CONSTANTS.API_POWERED_BY);
      
      return originalJson.call(this, optimizedData);
    } catch (error) {
      // Fallback en caso de error
      return originalJson.call(this, data);
    }
  };

  // Marcar tiempo de inicio de request
  req.startTime = Date.now();
  next();
};

/**
 * Middleware para minificar respuestas JSON
 */
const minifyJson = (req, res, next) => {
  const originalJson = res.json;
  
  res.json = function(data) {
    try {
      // Solo minificar en producción
      if (process.env.NODE_ENV === OPTIMIZATION_CONSTANTS.NODE_ENV_PRODUCTION) {
        // Eliminar campos null/undefined
        const minified = JSON.parse(JSON.stringify(data, (key, value) => {
          if (value === null || value === undefined) return undefined;
          return value;
        }));
        
        return originalJson.call(this, minified);
      }
      
      return originalJson.call(this, data);
    } catch (error) {
      return originalJson.call(this, data);
    }
  };

  next();
};

/**
 * Middleware de paginación automática
 */
const autoPagination = (defaultLimit = 20, maxLimit = 100) => {
  return (req, res, next) => {
    // Extraer parámetros de paginación
    const page = parseInt(req.query.page) || 1;
    const limit = Math.min(parseInt(req.query.limit) || defaultLimit, maxLimit);
    const offset = (page - 1) * limit;

    // Añadir a req para uso en controladores
    req.pagination = {
      page,
      limit,
      offset,
      maxLimit
    };

    // Middleware para respuestas paginadas
    const originalJson = res.json;
    res.json = function(data) {
      // Si es un array, aplicar paginación automática
      if (Array.isArray(data)) {
        const total = data.length;
        const paginatedData = data.slice(offset, offset + limit);
        
        const paginatedResponse = {
          data: paginatedData,
          pagination: {
            [OPTIMIZATION_CONSTANTS.PAGINATION_CURRENT_PAGE]: page,
            [OPTIMIZATION_CONSTANTS.PAGINATION_TOTAL_PAGES]: Math.ceil(total / limit),
            [OPTIMIZATION_CONSTANTS.PAGINATION_TOTAL_ITEMS]: total,
            [OPTIMIZATION_CONSTANTS.PAGINATION_ITEMS_PER_PAGE]: limit,
            [OPTIMIZATION_CONSTANTS.PAGINATION_HAS_NEXT_PAGE]: offset + limit < total,
            [OPTIMIZATION_CONSTANTS.PAGINATION_HAS_PREV_PAGE]: page > 1
          }
        };
        
        return originalJson.call(this, paginatedResponse);
      }
      
      return originalJson.call(this, data);
    };

    next();
  };
};

/**
 * Middleware para lazy loading de datos
 */
const lazyLoad = (fields = []) => {
  return (req, res, next) => {
    // Determinar campos a cargar basado en query params
    const fieldsToLoad = req.query.fields
      ? req.query.fields.split(OPTIMIZATION_CONSTANTS.FIELD_SEPARATOR).filter(f => fields.includes(f))
      : fields;

    req.lazyLoad = {
      fields: fieldsToLoad,
      includeAll: !req.query.fields
    };

    next();
  };
};

/**
 * Configuración de headers de rendimiento
 */
const performanceHeaders = (req, res, next) => {
  // DNS prefetch para recursos externos
  res.set(OPTIMIZATION_CONSTANTS.HEADER_X_DNS_PREFETCH_CONTROL, OPTIMIZATION_CONSTANTS.DNS_PREFETCH_ON);
  
  // Preconnect a servicios externos
  res.set(OPTIMIZATION_CONSTANTS.HEADER_LINK, OPTIMIZATION_CONSTANTS.FIRESTORE_PRECONNECT);
  
  // Resource hints
  res.set(OPTIMIZATION_CONSTANTS.HEADER_X_CONTENT_TYPE_OPTIONS, OPTIMIZATION_CONSTANTS.CONTENT_TYPE_NOSNIFF);
  res.set(OPTIMIZATION_CONSTANTS.HEADER_X_FRAME_OPTIONS, OPTIMIZATION_CONSTANTS.FRAME_OPTIONS_DENY);
  
  next();
};

module.exports = {
  compressionMiddleware,
  throttleConfigs,
  optimizeResponse,
  minifyJson,
  autoPagination,
  lazyLoad,
  performanceHeaders,
  createSlowDown
};
