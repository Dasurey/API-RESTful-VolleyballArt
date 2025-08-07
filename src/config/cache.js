/**
 * �🗄️ Sistema de Cache Profesional
 * 
 * Implementa múltiples capas de cache:
 * - Cache en memoria para datos frecuentes
 * - Cache de respuestas HTTP
 * - Cache de consultas a Firebase
 * - Invalidación automática de cache
*/

const { InternalServerError } = require('../middlewares/error');
const { Logger, logAndExecute } = require('./log');

const NodeCache = require('node-cache');

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
      throw new InternalServerError(undefined, {
        operation: 'setProductCache',
        key,
        originalError: error.message
      });
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
      'all_products',
      `product_${productId}`,
      'products_count'
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
    hitRate: cacheStats.hits + cacheStats.misses > 0 ? ((cacheStats.hits / (cacheStats.hits + cacheStats.misses)) * 100).toFixed(2) + '%' : '0%'
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
    if (req.method === 'GET') {
      res.set('Cache-Control', `public, max-age=${maxAge}`);
      res.set('ETag', `W/"${Date.now()}"`);
    } else {
      res.set('Cache-Control', 'no-cache, no-store, must-revalidate');
    }
    next();
  };
};

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
 * Middleware para invalidar cache de productos
 */
const invalidateProductsCache = (req, res, next) => {
  res.on('finish', () => {
    if (res.statusCode >= 200 && res.statusCode < 300) {
      productsCacheManager.flushAll();
      Logger.info('�️ Cache de productos invalidado', {
        method: req.method,
        url: req.url,
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
      Logger.info('🗑️ Cache de auth invalidado', {
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
 */
function generateCacheKey(req) {
  const { method, path, query, user } = req;
  const userId = user?.uid || 'anonymous';
  const queryString = Object.keys(query)
    .sort()
    .map(key => `${key}=${query[key]}`)
    .join('&');
  let cacheKey = `${method}: ${path}`;
  if (queryString) {
    cacheKey += `?${queryString}`;
  }
  if (path.includes('/auth') || method !== 'GET') {
    cacheKey += `:user:${userId}`;
  }
  return cacheKey;
}

/**
 * Obtener TTL por tipo de cache
 */
function getTTLForCacheType(cacheType) {
  const ttlConfig = {
    products: 30 * 60,
    auth: 5 * 60,
    general: 10 * 60
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
 */
const conditionalCacheMiddleware = (condition, cacheType = 'general') => {
  return (req, res, next) => {
    if (condition(req)) {
      // Usar createCacheMiddleware con el manager adecuado
      let cacheManager;
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
      return createCacheMiddleware(cacheManager) (req, res, next);
    }
    next();
  };
};

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
 * Middleware de cache flexible y con logging integrado
 * @param {Object} cacheManager - Manager de cache (debe tener get/set)
 * @param {Object} options - Opciones: ttl, keyGenerator, middlewareName
 */
const createCacheMiddleware = (cacheManager, options = {}) => {
  const {
    ttl = 600,
    keyGenerator = null,
    middlewareName = 'cache'
  } = options;

  return (req, res, next) => {
    // Solo cachear GET requests
    if (req.method !== 'GET') {
      return next();
    }

    const cacheKey = keyGenerator ? keyGenerator(req) : `${req.method}_${req.originalUrl}`;
    const cachedData = cacheManager.get(cacheKey);

    if (cachedData) {
      logAndExecute('debug', `🎯 Cache HIT [${middlewareName.toUpperCase()}]`, {
        cacheKey,
        middleware: middlewareName,
        url: req.originalUrl,
        method: req.method
      }, 'CACHE');
      res.set('X-Cache', 'HIT');
      return res.json(cachedData);
    }

    // Interceptar la respuesta para cachear
    const originalJson = res.json;
    res.json = function (data) {
      // Solo cachear respuestas exitosas
      if (res.statusCode >= 200 && res.statusCode < 300) {
        cacheManager.set(cacheKey, data, ttl);
        logAndExecute('debug', `📦 Cache MISS - Data cached [${middlewareName.toUpperCase()}]`, {
          cacheKey,
          middleware: middlewareName,
          url: req.originalUrl,
          method: req.method,
          ttl
        }, 'CACHE');
        res.set('X-Cache', 'MISS');
      }
      return originalJson.call(this, data);
    };

    next();
  };
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
      throw new InternalServerError(undefined, {
        operation: 'setAuthCache',
        key,
        originalError: error.message
      });
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
      throw new InternalServerError(undefined, {
        operation: 'setGeneralCache',
        key,
        originalError: error.message
      });
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

module.exports = {
  appCache,
  productsCache,
  authCache,
  createCacheMiddleware,
  productsCacheManager,
  authCacheManager,
  generalCacheManager,
  getCacheStats,
  resetCacheStats,
  cacheHeaders,
  invalidateProductsCache,
  invalidateAuthCache,
  noCacheMiddleware,
  conditionalCacheMiddleware,
  generateCacheKey,
  getTTLForCacheType
};
