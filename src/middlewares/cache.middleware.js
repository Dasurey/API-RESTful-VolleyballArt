/**
 * 🔄 Middleware de Cache
 * Middleware para aplicar cache a rutas específicas
 */

const { productsCacheManager, authCacheManager, generalCacheManager } = require(RELATIVE_PATHS.FROM_MIDDLEWARES.CONFIG_CACHE);
const { RELATIVE_PATHS, HTTP_STATUS, CACHE, HTTP_METHODS, VERSION_MIDDLEWARE } = require('../config/paths.config.js');
const { CACHE_MESSAGES } = require('../utils/messages.utils.js');
const { Logger } = require(RELATIVE_PATHS.FROM_MIDDLEWARES.CONFIG_LOGGER);

/**
 * Middleware de cache genérico
 * @param {string} cacheType - Tipo de cache: 'products', 'auth', 'general'
 * @param {number} customTTL - TTL personalizado en segundos (opcional)
 * @returns {Function} Middleware function
 */
const cacheMiddleware = (cacheType = CACHE.TYPE_GENERAL, customTTL = null) => {
  return (req, res, next) => {
    const cacheKey = generateCacheKey(req);
    let cacheManager;

    // Seleccionar el manager de cache apropiado
    switch (cacheType) {
      case CACHE.TYPE_PRODUCTS:
        cacheManager = productsCacheManager;
        break;
      case CACHE.TYPE_AUTH:
        cacheManager = authCacheManager;
        break;
      default:
        cacheManager = generalCacheManager;
    }

    // Intentar obtener del cache
    const cachedData = cacheManager.get(cacheKey);
    
    if (cachedData) {
      // Cache hit
      Logger.debug(`${CACHE_MESSAGES.CACHE_HIT} ${cacheKey}`, {
        cacheType,
        key: cacheKey,
        method: req.method,
        url: req.url
      });

      res.set(CACHE.HEADER_CACHE, CACHE.STATUS_HIT);
      res.set(CACHE.HEADER_CACHE_KEY, cacheKey);
      return res.json(cachedData);
    }

    // Cache miss - interceptar la respuesta
    const originalJson = res.json;
    res.json = function(data) {
      // Solo cachear respuestas exitosas
      if (res.statusCode >= HTTP_STATUS.OK && res.statusCode < HTTP_STATUS.MULTIPLE_CHOICES) {
        const ttl = customTTL || getTTLForCacheType(cacheType);
        cacheManager.set(cacheKey, data, ttl);
        
        Logger.debug(CACHE_MESSAGES.CACHE_MISS, {
          cacheType,
          key: cacheKey,
          ttl,
          method: req.method,
          url: req.url
        });

        res.set(CACHE.HEADER_CACHE, CACHE.STATUS_MISS);
        res.set(CACHE.HEADER_CACHE_KEY, cacheKey);
        res.set(CACHE.HEADER_CACHE_TTL, ttl.toString());
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
const productsCacheMiddleware = cacheMiddleware(CACHE.TYPE_PRODUCTS);

/**
 * Middleware específico para autenticación
 */
const authCacheMiddleware = cacheMiddleware(CACHE.TYPE_AUTH);

/**
 * Middleware para invalidar cache de productos
 */
const invalidateProductsCache = (req, res, next) => {
  // Ejecutar después de la respuesta
  res.on(CACHE.FINISH_EVENT, () => {
    if (res.statusCode >= HTTP_STATUS.OK && res.statusCode < HTTP_STATUS.MULTIPLE_CHOICES) {
      const invalidatedKeys = productsCacheManager.flushAll();
      Logger.info(CACHE_MESSAGES.CACHE_INVALIDATED_PRODUCTS, {
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
  res.on(CACHE.FINISH_EVENT, () => {
    if (res.statusCode >= HTTP_STATUS.OK && res.statusCode < HTTP_STATUS.MULTIPLE_CHOICES) {
      authCacheManager.flushAll();
      Logger.info(CACHE_MESSAGES.CACHE_INVALIDATED_AUTH, {
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
    .join(CACHE.QUERY_SEPARATOR);
  
  let cacheKey = `${method}: ${path}`;
  
  if (queryString) {
    cacheKey += `?${queryString}`;
  }
  
  // Para endpoints que dependen del usuario, incluir user ID
  if (path.includes(VERSION_MIDDLEWARE.AUTH_ROUTE) || method !== 'GET') {
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
    'Cache-Control': CACHE.NO_STORE_VALUE,
    'Pragma': CACHE.NO_CACHE_VALUE,
    'Expires': CACHE.EXPIRES_VALUE,
    'Surrogate-Control': CACHE.NO_STORE_SURROGATE
  });
  next();
};

/**
 * Middleware de cache condicional
 * Solo cachea si se cumple la condición
 */
const conditionalCacheMiddleware = (condition, cacheType = CACHE.TYPE_GENERAL) => {
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
