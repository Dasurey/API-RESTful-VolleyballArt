const { logAndExecute } = require('./log.utils');
/**
 * Utilidades específicas para middlewares
*/

/**
 * Wrapper para operaciones async en middlewares
 * @param {Function} asyncFn - Función async del middleware
 * @param {string} middlewareName - Nombre del middleware para logging
 */
function asyncMiddleware(asyncFn, middlewareName = 'unknown') {
    return (req, res, next) => {
        Promise.resolve(asyncFn(req, res, next))
            .catch(error => {
                logAndExecute('error', `🚨 Async middleware error [${middlewareName.toUpperCase()}]`, {
                    middleware: middlewareName,
                    error: error.message,
                    stack: error.stack,
                    url: req.originalUrl || req.url,
                    method: req.method
                }, 'ERROR');
                next(error);
            });
    };
}

/**
 * Crear middleware de cache con logging integrado
 * @param {Object} cacheManager - Manager de cache
 * @param {Object} options - Opciones del cache
 */
function createCacheMiddleware(cacheManager, options = {}) {
    const {
        ttl = 300,
        keyGenerator = null,
        middlewareName = 'cache'
    } = options;

    return (req, res, next) => {
        const cacheKey = keyGenerator ? keyGenerator(req) : `${req.method}_${req.originalUrl}`;
        const cachedData = cacheManager.get(cacheKey);

        if (cachedData) {
            logAndExecute('debug', `🎯 Cache HIT [${middlewareName.toUpperCase()}]`, {
                cacheKey,
                middleware: middlewareName,
                url: req.originalUrl,
                method: req.method
            }, 'CACHE');

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
            }

            // Llamar al método original
            return originalJson.call(this, data);
        };

        next();
    };
}

module.exports = {
    asyncMiddleware,
    createCacheMiddleware
};
