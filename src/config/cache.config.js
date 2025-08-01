/**
 * 🗄️ Sistema de Cache Profesional
 * 
 * Implementa múltiples capas de cache:
 * - Cache en memoria para datos frecuentes
 * - Cache de respuestas HTTP
 * - Cache de consultas a Firebase
 * - Invalidación automática de cache
 */

const { 
  CACHE_KEY_ALL_PRODUCTS, 
  CACHE_KEY_PRODUCT_PREFIX, 
  CACHE_KEY_PRODUCTS_COUNT,
  ERROR_SETTING_PRODUCT_CACHE,
  ERROR_SETTING_GENERAL_CACHE,
  PERCENTAGE_SYMBOL,
  ZERO_PERCENTAGE
} = require('../utils/messages.utils');
const { 
  EXTERNAL_PACKAGES,
  CACHE,
  HTTP_METHODS,
  HTTP_STATUS
} = require('./paths.config');

const NodeCache = require(EXTERNAL_PACKAGES.NODE_CACHE);

/**
 * Cache principal de la aplicación
 * TTL: 10 minutos por defecto
 * checkperiod: Limpia cache expirado cada 2 minutos
 */
const appCache = new NodeCache({
  stdTTL: 600, // 10 minutos
  checkperiod: 120, // 2 minutos
  useClones: false, // Mejor rendimiento
  deleteOnExpire: true,
  maxKeys: 1000 // Límite de memoria
});

/**
 * Cache específico para productos
 * TTL más largo ya que los productos cambian menos frecuentemente
 */
const productsCache = new NodeCache({
  stdTTL: 1800, // 30 minutos
  checkperiod: 300, // 5 minutos
  useClones: false,
  deleteOnExpire: true,
  maxKeys: 500
});

/**
 * Cache para autenticación y tokens
 * TTL más corto por seguridad
 */
const authCache = new NodeCache({
  stdTTL: 300, // 5 minutos
  checkperiod: 60, // 1 minuto
  useClones: false,
  deleteOnExpire: true,
  maxKeys: 200
});

/**
 * Estadísticas de cache para monitoreo
 */
const cacheStats = {
  hits: 0,
  misses: 0,
  sets: 0,
  deletes: 0,
  errors: 0
};

/**
 * Middleware de cache para respuestas HTTP
 */
const cacheMiddleware = (duration = 600) => {
  return (req, res, next) => {
    // Solo cachear GET requests
    if (req.method !== HTTP_METHODS.GET) {
      return next();
    }

    const key = `${CACHE.ROUTE_PREFIX}${req.originalUrl}`;
    const cachedResponse = appCache.get(key);

    if (cachedResponse) {
      cacheStats.hits++;
      res.set(CACHE.HEADER_CACHE, CACHE.STATUS_HIT);
      res.set(CACHE.HEADER_CACHE_TTL, appCache.getTtl(key));
      return res.json(cachedResponse);
    }

    // Interceptar res.json para cachear la respuesta
    const originalJson = res.json;
    res.json = function(data) {
      // Solo cachear respuestas exitosas
      if (res.statusCode === HTTP_STATUS.OK) {
        appCache.set(key, data, duration);
        cacheStats.sets++;
        res.set(CACHE.HEADER_CACHE, CACHE.STATUS_MISS);
      }
      return originalJson.call(this, data);
    };

    cacheStats.misses++;
    next();
  };
};

/**
 * Cache específico para productos
 */
const productsCacheManager = {
  get: (key) => {
    const result = productsCache.get(key);
    if (result) {
      cacheStats.hits++;
      return result;
    }
    cacheStats.misses++;
    return null;
  },

  set: (key, value, ttl = 1800) => {
    try {
      productsCache.set(key, value, ttl);
      cacheStats.sets++;
      return true;
    } catch (error) {
      cacheStats.errors++;
      console.error(ERROR_SETTING_PRODUCT_CACHE, error);
      return false;
    }
  },

  del: (key) => {
    try {
      const result = productsCache.del(key);
      if (result) cacheStats.deletes++;
      return result;
    } catch (error) {
      cacheStats.errors++;
      return false;
    }
  },

  flush: () => {
    try {
      productsCache.flushAll();
      return true;
    } catch (error) {
      cacheStats.errors++;
      return false;
    }
  },

  // Invalidar cache cuando se modifica un producto
  invalidateProduct: (productId) => {
    const keysToDelete = [
      CACHE_KEY_ALL_PRODUCTS,
      `${CACHE_KEY_PRODUCT_PREFIX}${productId}`,
      CACHE_KEY_PRODUCTS_COUNT
    ];
    
    keysToDelete.forEach(key => {
      productsCache.del(key);
    });
  },

  // Invalidar todo el cache de productos
  invalidateAll: () => {
    productsCache.flushAll();
  }
};

/**
 * Cache para autenticación
 */
const authCacheManager = {
  get: (key) => {
    const result = authCache.get(key);
    if (result) cacheStats.hits++;
    else cacheStats.misses++;
    return result;
  },

  set: (key, value, ttl = 300) => {
    try {
      authCache.set(key, value, ttl);
      cacheStats.sets++;
      return true;
    } catch (error) {
      cacheStats.errors++;
      return false;
    }
  },

  del: (key) => {
    try {
      const result = authCache.del(key);
      if (result) cacheStats.deletes++;
      return result;
    } catch (error) {
      cacheStats.errors++;
      return false;
    }
  }
};

/**
 * Cache general para otros usos
 */
const generalCacheManager = {
  get: (key) => {
    const result = appCache.get(key);
    if (result) cacheStats.hits++;
    else cacheStats.misses++;
    return result;
  },

  set: (key, value, ttl = 600) => {
    try {
      appCache.set(key, value, ttl);
      cacheStats.sets++;
      return true;
    } catch (error) {
      Logger.error(ERROR_SETTING_GENERAL_CACHE, error);
      return false;
    }
  },

  del: (key) => {
    const result = appCache.del(key);
    if (result > 0) cacheStats.deletes++;
    return result;
  },

  has: (key) => appCache.has(key),
  
  keys: () => appCache.keys(),
  
  getTtl: (key) => appCache.getTtl(key),
  
  getStats: () => appCache.getStats(),
  
  flushAll: () => {
    cacheStats.flushes++;
    appCache.flushAll();
  }
};

/**
 * Obtener estadísticas de cache
 */
const getCacheStats = () => {
  return {
    ...cacheStats,
    caches: {
      app: {
        keys: appCache.keys().length,
        size: appCache.getStats()
      },
      products: {
        keys: productsCache.keys().length,
        size: productsCache.getStats()
      },
      auth: {
        keys: authCache.keys().length,
        size: authCache.getStats()
      }
    },
    hitRate: cacheStats.hits + cacheStats.misses > 0 
      ? ((cacheStats.hits / (cacheStats.hits + cacheStats.misses)) * 100).toFixed(2) + PERCENTAGE_SYMBOL
      : ZERO_PERCENTAGE
  };
};

/**
 * Limpiar estadísticas de cache
 */
const resetCacheStats = () => {
  cacheStats.hits = 0;
  cacheStats.misses = 0;
  cacheStats.sets = 0;
  cacheStats.deletes = 0;
  cacheStats.errors = 0;
};

/**
 * Middleware para headers de cache HTTP
 */
const cacheHeaders = (maxAge = 600) => {
  return (req, res, next) => {
    if (req.method === HTTP_METHODS.GET) {
      res.set(CACHE.CACHE_CONTROL, `${CACHE.PUBLIC_MAX_AGE_PREFIX}${maxAge}`);
      res.set(CACHE.HEADER_ETAG, `${CACHE.ETAG_PREFIX}${Date.now()}${CACHE.QUOTE_SYMBOL}`);
    } else {
      res.set(CACHE.CACHE_CONTROL, CACHE.NO_CACHE_NO_STORE_MUST_REVALIDATE);
    }
    next();
  };
};

module.exports = {
  appCache,
  productsCache,
  authCache,
  cacheMiddleware,
  productsCacheManager,
  authCacheManager,
  getCacheStats,
  resetCacheStats,
  cacheHeaders
};
