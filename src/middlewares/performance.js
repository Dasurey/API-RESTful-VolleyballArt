/**
 * 📊 Middleware de Monitoreo de Rendimiento
 * 
 * Recolecta métricas de rendimiento en tiempo real:
 * - Tiempo de respuesta
 * - Uso de memoria
 * - Rate de cache
 * - Throughput
 */

const { getCacheStats } = require('../config/cache');

/**
 * Métricas globales de rendimiento
 */
const performanceMetrics = {
  requests: {
    total: 0,
    successful: 0,
    failed: 0,
    inProgress: 0
  },
  responseTime: {
    min: Infinity,
    max: 0,
    avg: 0,
    p95: 0,
    samples: []
  },
  memory: {
    used: 0,
    free: 0,
    total: 0,
    percentage: 0
  },
  uptime: {
    start: Date.now(),
    current: 0
  },
  endpoints: new Map(),
  errors: new Map()
};

/**
 * Middleware principal de monitoreo
 */
const performanceMonitor = (req, res, next) => {
  const startTime = Date.now();
  const originalSend = res.send;
  const originalJson = res.json;

  // Incrementar requests en progreso
  performanceMetrics.requests.inProgress++;
  performanceMetrics.requests.total++;

  // Monitorear endpoint específico
  const endpoint = `${req.method} ${req.route?.path || req.path}`;
  
  if (!performanceMetrics.endpoints.has(endpoint)) {
    performanceMetrics.endpoints.set(endpoint, {
      count: 0,
      avgResponseTime: 0,
      errors: 0,
      lastAccessed: Date.now()
    });
  }

  const endpointStats = performanceMetrics.endpoints.get(endpoint);
  endpointStats.count++;
  endpointStats.lastAccessed = Date.now();

  // Interceptar respuesta
  const interceptResponse = function(data) {
    const endTime = Date.now();
    const responseTime = endTime - startTime;

    // Decrementar requests en progreso
    performanceMetrics.requests.inProgress--;

    // Actualizar métricas de tiempo de respuesta
    updateResponseTimeMetrics(responseTime);

    // Actualizar métricas del endpoint
    endpointStats.avgResponseTime = 
      (endpointStats.avgResponseTime * (endpointStats.count - 1) + responseTime) / endpointStats.count;

    // Clasificar respuesta
    if (res.statusCode >= 200 && res.statusCode < 400) {
      performanceMetrics.requests.successful++;
    } else {
      performanceMetrics.requests.failed++;
      endpointStats.errors++;
      
      // Registrar error
      const errorKey = `${res.statusCode}`;
      const errorCount = performanceMetrics.errors.get(errorKey) || 0;
      performanceMetrics.errors.set(errorKey, errorCount + 1);
    }

    // Headers de rendimiento
    res.set('X-Response-Time', `${responseTime}ms`);
    res.set('X-Request-ID', req.headers['x-request-id'] || `req_${startTime}`);

    return data;
  };

  // Interceptar res.send
  res.send = function(data) {
    const result = interceptResponse(data);
    return originalSend.call(this, result);
  };

  // Interceptar res.json
  res.json = function(data) {
    const result = interceptResponse(data);
    return originalJson.call(this, result);
  };

  next();
};

/**
 * Actualizar métricas de tiempo de respuesta
 */
function updateResponseTimeMetrics(responseTime) {
  const metrics = performanceMetrics.responseTime;
  
  metrics.min = Math.min(metrics.min, responseTime);
  metrics.max = Math.max(metrics.max, responseTime);
  
  // Mantener solo las últimas 1000 muestras para calcular percentiles
  metrics.samples.push(responseTime);
  if (metrics.samples.length > 1000) {
    metrics.samples.shift();
  }
  
  // Calcular promedio
  metrics.avg = metrics.samples.reduce((a, b) => a + b, 0) / metrics.samples.length;
  
  // Calcular percentil 95
  const sorted = [...metrics.samples].sort((a, b) => a - b);
  const p95Index = Math.floor(sorted.length * 0.95);
  metrics.p95 = sorted[p95Index] || 0;
}

/**
 * Monitoreo de memoria
 */
const memoryMonitor = () => {
  const memUsage = process.memoryUsage();
  const totalMem = process.platform === 'linux' ? 
    parseInt(require('fs').readFileSync('/proc/meminfo', 'utf8').match(/MemTotal:\s*(\d+)/)?.[1] || 0) * 1024 :
    require('os').totalmem();

  performanceMetrics.memory = {
    used: memUsage.heapUsed,
    free: totalMem - memUsage.heapUsed,
    total: totalMem,
    percentage: (memUsage.heapUsed / totalMem * 100).toFixed(2),
    heap: {
      used: memUsage.heapUsed,
      total: memUsage.heapTotal
    },
    external: memUsage.external,
    rss: memUsage.rss
  };
};

/**
 * Obtener métricas completas
 */
const getPerformanceMetrics = () => {
  // Actualizar uptime
  performanceMetrics.uptime.current = Date.now() - performanceMetrics.uptime.start;
  
  // Actualizar memoria
  memoryMonitor();
  
  // Obtener estadísticas de cache
  const cacheStats = getCacheStats();
  
  return {
    ...performanceMetrics,
    cache: cacheStats,
    timestamp: new Date().toISOString(),
    uptime: {
      milliseconds: performanceMetrics.uptime.current,
      seconds: Math.floor(performanceMetrics.uptime.current / 1000),
      minutes: Math.floor(performanceMetrics.uptime.current / 60000),
      hours: Math.floor(performanceMetrics.uptime.current / 3600000)
    },
    endpoints: Object.fromEntries(performanceMetrics.endpoints),
    errors: Object.fromEntries(performanceMetrics.errors)
  };
};

/**
 * Resetear métricas
 */
const resetPerformanceMetrics = () => {
  performanceMetrics.requests.total = 0;
  performanceMetrics.requests.successful = 0;
  performanceMetrics.requests.failed = 0;
  performanceMetrics.responseTime.min = Infinity;
  performanceMetrics.responseTime.max = 0;
  performanceMetrics.responseTime.samples = [];
  performanceMetrics.endpoints.clear();
  performanceMetrics.errors.clear();
  performanceMetrics.uptime.start = Date.now();
};

/**
 * Middleware de health check con métricas
 */
const healthCheckWithMetrics = (req, res) => {
  const metrics = getPerformanceMetrics();
  const isHealthy = 
    metrics.memory.percentage < 90 && 
    metrics.responseTime.avg < 1000 &&
    metrics.requests.inProgress < 50;

  res.status(isHealthy ? 200 : 503).json({
    status: isHealthy ? 'healthy' : 'unhealthy',
    timestamp: new Date().toISOString(),
    uptime: metrics.uptime,
    memory: metrics.memory,
    performance: {
      averageResponseTime: `${metrics.responseTime.avg.toFixed(2)}ms`,
      requestsInProgress: metrics.requests.inProgress,
      totalRequests: metrics.requests.total,
      successRate: `${((metrics.requests.successful / metrics.requests.total) * 100).toFixed(2)}%`
    },
    cache: {
      hitRate: metrics.cache.hitRate,
      totalKeys: metrics.cache.caches.app.keys + metrics.cache.caches.products.keys
    }
  });
};

/**
 * Alertas automáticas basadas en métricas
 */
const performanceAlerts = () => {
  const metrics = getPerformanceMetrics();
  const alerts = [];

  // Alerta de memoria alta
  if (metrics.memory.percentage > 85) {
    alerts.push({
      level: 'warning',
      message: `High memory usage:${metrics.memory.percentage}%`,
      timestamp: new Date().toISOString()
    });
  }

  // Alerta de tiempo de respuesta alto
  if (metrics.responseTime.avg > 1000) {
    alerts.push({
      level: 'warning',
      message: `High average response time:${metrics.responseTime.avg.toFixed(2)}ms`,
      timestamp: new Date().toISOString()
    });
  }

  // Alerta de muchos requests en progreso
  if (metrics.requests.inProgress > 50) {
    alerts.push({
      level: 'critical',
      message: `Too many requests in progress:${metrics.requests.inProgress}`,
      timestamp: new Date().toISOString()
    });
  }

  return alerts;
};

module.exports = {
  performanceMonitor,
  memoryMonitor,
  getPerformanceMetrics,
  resetPerformanceMetrics,
  healthCheckWithMetrics,
  performanceAlerts
};
