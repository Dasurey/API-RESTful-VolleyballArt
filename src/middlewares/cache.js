/**
 * 🔄 Middleware de Cache
 * Middleware para aplicar cache a rutas específicas
 */

const { productsCacheManager, authCacheManager, generalCacheManager } = require('../config/cache.js');
const Logger = require('../config/logger.js');

/**
 * Middleware de cache genérico
 * @param {string} cacheType - Tipo de cache: 'products', 'auth', 'general'
 * @param {number} customTTL - TTL personalizado en segundos (opcional)
 * @returns {Function} Middleware function
 */
const cacheMiddleware = (cacheType = 'general', customTTL = null) => {
  return (req, res, next) => {
    const cacheKey = generateCacheKey(req);
    let cacheManager;

    // Seleccionar el manager de cache apropiado
    switch (cacheType) {
      case 'products':
        cacheManager = productsCacheManager;
        break;
      case 'auth':
        cacheManager = authCacheManager;
        break;
      default:
        cacheManager = generalCacheManager;
    }

    // Intentar obtener del cache
    const cachedData = cacheManager.get(cacheKey);
    
    if (cachedData) {
      // Cache hit
      Logger.debug(`🎯 Cache HIT para ${cacheKey}`, {
        cacheType,
        key: cacheKey,
        method: req.method,
        url: req.url
      });

      res.set('X-Cache', 'HIT');
      res.set('X-Cache-Key', cacheKey);
      return res.json(cachedData);
    }

    // Cache miss - interceptar la respuesta
    const originalJson = res.json;
    res.json = function(data) {
      // Solo cachear respuestas exitosas
      if (res.statusCode >= 200 && res.statusCode < 300) {
        const ttl = customTTL || getTTLForCacheType(cacheType);
        cacheManager.set(cacheKey, data, ttl);
        
        Logger.debug(`📦 Cache MISS - Guardando en cache`, {
          cacheType,
          key: cacheKey,
          ttl,
          method: req.method,
          url: req.url
        });

        res.set('X-Cache', 'MISS');
        res.set('X-Cache-Key', cacheKey);
        res.set('X-Cache-TTL', ttl.toString());
      }

      // Llamar al método json original
      return originalJson.call(this, data);
    };

    next();
  };
};

/**
 * Middleware específico para productos
 */
const productsCacheMiddleware = cacheMiddleware('products');

/**
 * Middleware específico para autenticación
 */
const authCacheMiddleware = cacheMiddleware('auth');

/**
 * Middleware para invalidar cache de productos
 */
const invalidateProductsCache = (req, res, next) => {
  // Ejecutar después de la respuesta
  res.on('finish', () => {
    if (res.statusCode >= 200 && res.statusCode < 300) {
      const invalidatedKeys = productsCacheManager.flushAll();
      Logger.info(`🗑️ Cache de productos invalidado`, {
        method: req.method,
        url: req.url,
        invalidatedKeys: productsCacheManager.keys().length,
        userId: req.user?.uid
      });
    }
  });
  
  next();
};

/**
 * Middleware para invalidar cache de autenticación
 */
const invalidateAuthCache = (req, res, next) => {
  res.on('finish', () => {
    if (res.statusCode >= 200 && res.statusCode < 300) {
      authCacheManager.flushAll();
      Logger.info(`🗑️ Cache de auth invalidado`, {
        method: req.method,
        url: req.url,
        userId: req.user?.uid
      });
    }
  });
  
  next();
};

/**
 * Generar clave de cache basada en la request
 * @param {Object} req - Request object
 * @returns {string} Cache key
 */
function generateCacheKey(req) {
  const { method, path, query, user } = req;
  
  // Para requests autenticadas, incluir user ID
  const userId = user?.uid || 'anonymous';
  
  // Crear clave única basada en método, path, query params y usuario
  const queryString = Object.keys(query)
    .sort()
    .map(key => `${key}=${query[key]}`)
    .join('&');
  
  let cacheKey = `${method}:${path}`;
  
  if (queryString) {
    cacheKey += `?${queryString}`;
  }
  
  // Para endpoints que dependen del usuario, incluir user ID
  if (path.includes('/auth') || method !== 'GET') {
    cacheKey += `:user:${userId}`;
  }
  
  return cacheKey;
}

/**
 * Obtener TTL por tipo de cache
 * @param {string} cacheType - Tipo de cache
 * @returns {number} TTL en segundos
 */
function getTTLForCacheType(cacheType) {
  const ttlConfig = {
    products: 30 * 60,    // 30 minutos
    auth: 5 * 60,         // 5 minutos
    general: 10 * 60      // 10 minutos
  };
  
  return ttlConfig[cacheType] || ttlConfig.general;
}

/**
 * Middleware para no cachear
 */
const noCacheMiddleware = (req, res, next) => {
  res.set({
    'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
    'Pragma': 'no-cache',
    'Expires': '0',
    'Surrogate-Control': 'no-store'
  });
  next();
};

/**
 * Middleware de cache condicional
 * Solo cachea si se cumple la condición
 */
const conditionalCacheMiddleware = (condition, cacheType = 'general') => {
  return (req, res, next) => {
    if (condition(req)) {
      return cacheMiddleware(cacheType)(req, res, next);
    }
    next();
  };
};

module.exports = {
  cacheMiddleware,
  productsCacheMiddleware,
  authCacheMiddleware,
  invalidateProductsCache,
  invalidateAuthCache,
  noCacheMiddleware,
  conditionalCacheMiddleware
};
