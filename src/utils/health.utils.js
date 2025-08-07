/**
 * 🏥 Utilidades avanzadas para Health Checks y Monitoreo
 * 
 * Sistema completo de monitoreo de salud que incluye:
 * - Health checks de dependencias externas
 * - Métricas de base de datos
 * - Validación de servicios críticos
 * - Alertas automáticas
 * - Reportes de estado detallados
 */

const { getPerformanceMetrics } = require('../middlewares/performance');
const { ValidationError, NotFoundError, ConflictError, InternalServerError } = require('../middlewares/error');

// Importar funciones de Firestore v9+
const { collection, getDocs, limit, query } = require('firebase/firestore');
const { db } = require('../config/db');

const { getCacheStats } = require('../config/cache');

/**
 * Estado global de health checks
 */
const healthState = {
    lastCheck: null,
    services: new Map(),
    alerts: [],
    history: [],
    dependencies: {
        database: { status: 'unknown', lastCheck: null, responseTime: 0 },
        cache: { status: 'unknown', lastCheck: null, responseTime: 0 },
        external_apis: { status: 'unknown', lastCheck: null, responseTime: 0 }
    }
};

/**
 * Verificar conectividad con Firebase/Base de datos
 */
async function checkDatabaseHealth() {
    const startTime = Date.now();
    try {
        // Verificar si el objeto db es válido
        if (!db) {
            throw new InternalServerError();
        }

        // Hacer una consulta ligera usando el nuevo SDK v9+
        const productsCollection = collection(db, 'products');
        const querySnapshot = await getDocs(query(productsCollection, limit(1)));

        const responseTime = Date.now() - startTime;

        healthState.dependencies.database = {
            status: 'healthy',
            lastCheck: new Date().toISOString(),
            responseTime: responseTime,
            details: {
                latency: `${responseTime}ms`,
                provider: 'Firebase Firestore',
                documentsChecked: querySnapshot.size
            }
        };

        return true;
    } catch (error) {
        const responseTime = Date.now() - startTime;

        healthState.dependencies.database = {
            status: 'unhealthy',
            lastCheck: new Date().toISOString(),
            responseTime: responseTime,
            error: error.message,
            details: {
                latency: `${responseTime}ms`,
                provider: 'Firebase Firestore',
                errorType: error.code || 'unknown',
                errorName: error.name
            }
        };

        return false;
    }
}

/**
 * Verificar estado del sistema de cache
 */
async function checkCacheHealth() {
    const startTime = Date.now();
    try {
        const cacheStats = getCacheStats();
        const responseTime = Date.now() - startTime;

        // Calcular hit rate como número
        const numericHitRate = cacheStats.hits + cacheStats.misses > 0
            ? cacheStats.hits / (cacheStats.hits + cacheStats.misses)
            : 0;

        const isHealthy = numericHitRate >= 0.0; // Cache funcional si responde

        healthState.dependencies.cache = {
            status: isHealthy ? 'healthy' : 'degraded',
            lastCheck: new Date().toISOString(),
            responseTime: responseTime,
            details: {
                hitRate: `${(numericHitRate * 100).toFixed(2)}%`,
                totalKeys: (cacheStats.caches?.app?.keys || 0) + (cacheStats.caches?.products?.keys || 0) + (cacheStats.caches?.auth?.keys || 0),
                hits: cacheStats.hits || 0,
                misses: cacheStats.misses || 0
            }
        };

        return isHealthy;
    } catch (error) {
        const responseTime = Date.now() - startTime;

        healthState.dependencies.cache = {
            status: 'unhealthy',
            lastCheck: new Date().toISOString(),
            responseTime: responseTime,
            error: error.message
        };

        return false;
    }
}

/**
 * Verificar conectividad con APIs externas (si las hay)
 */
async function checkExternalAPIsHealth() {
    const startTime = Date.now();
    try {
        // Por ahora solo verificamos que el proceso HTTP esté funcionando
        const responseTime = Date.now() - startTime;

        healthState.dependencies.external_apis = {
            status: 'healthy',
            lastCheck: new Date().toISOString(),
            responseTime: responseTime,
            details: {
                httpServer: 'operational',
                apis: []
            }
        };

        return true;
    } catch (error) {
        const responseTime = Date.now() - startTime;

        healthState.dependencies.external_apis = {
            status: 'unhealthy',
            lastCheck: new Date().toISOString(),
            responseTime: responseTime,
            error: error.message
        };

        return false;
    }
}

/**
 * Ejecutar todos los health checks
 */
async function runFullHealthCheck() {
    const checkStartTime = Date.now();

    try {
        // Ejecutar todos los checks en paralelo
        const [dbHealth, cacheHealth, apiHealth] = await Promise.allSettled([
            checkDatabaseHealth(),
            checkCacheHealth(),
            checkExternalAPIsHealth()
        ]);

        // Obtener métricas de rendimiento
        const performanceMetrics = getPerformanceMetrics();

        // Determinar estado general del sistema
        const allHealthy = [dbHealth, cacheHealth, apiHealth].every(
            result => result.status === 'fulfilled' && result.value === true
        );

        const overallStatus = allHealthy ? 'healthy' : 'degraded';

        const totalCheckTime = Date.now() - checkStartTime;

        const healthReport = {
            status: overallStatus,
            timestamp: new Date().toISOString(),
            checkDuration: `${totalCheckTime}ms`,
            version: process.env.npm_package_version || '1.0.0',
            environment: process.env.NODE_ENV || 'development',
            uptime: {
                seconds: Math.floor(process.uptime()),
                formatted: formatUptime(process.uptime())
            },
            system: {
                memory: performanceMetrics.memory,
                cpu: performanceMetrics.cpu || { usage: 'N/A' },
                nodeVersion: process.version,
                platform: process.platform
            },
            dependencies: healthState.dependencies,
            performance: {
                averageResponseTime: `${performanceMetrics.responseTime.avg.toFixed(2)}ms`,
                requestsPerMinute: calculateRequestsPerMinute(performanceMetrics),
                errorRate: `${calculateErrorRate(performanceMetrics).toFixed(2)}%`,
                throughput: calculateThroughput(performanceMetrics)
            },
            alerts: generateHealthAlerts(performanceMetrics)
        };

        // Guardar en historial
        healthState.history.push({
            timestamp: new Date().toISOString(),
            status: overallStatus,
            checkDuration: totalCheckTime
        });

        // Mantener solo los últimos 100 registros
        if (healthState.history.length > 100) {
            healthState.history.shift();
        }

        healthState.lastCheck = new Date().toISOString();

        return healthReport;

    } catch (error) {
        return {
            status: 'unhealthy',
            timestamp: new Date().toISOString(),
            error: error.message,
            checkDuration: `${Date.now() - checkStartTime}ms`
        };
    }
}

/**
 * Formatear tiempo de uptime
 */
function formatUptime(seconds) {
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);

    return `${days}d ${hours}h ${minutes}m ${secs}s`;
}

/**
 * Calcular requests por minuto
 */
function calculateRequestsPerMinute(metrics) {
    const uptimeMinutes = Math.max(process.uptime() / 60, 1);
    return Math.round(metrics.requests.total / uptimeMinutes);
}

/**
 * Calcular tasa de error
 */
function calculateErrorRate(metrics) {
    if (metrics.requests.total === 0) return 0;
    return (metrics.requests.failed / metrics.requests.total) * 100;
}

/**
 * Calcular throughput
 */
function calculateThroughput(metrics) {
    const uptimeSeconds = Math.max(process.uptime(), 1);
    const requestsPerSecond = metrics.requests.total / uptimeSeconds;
    return `${requestsPerSecond.toFixed(2)} req/s`;
}

/**
 * Generar alertas basadas en métricas
 */
function generateHealthAlerts(metrics) {
    const alerts = [];

    // Alerta de memoria alta
    if (metrics.memory.percentage > 85) {
        alerts.push({
            level: 'warning',
            type: 'memory',
            message: `High memory usage: ${metrics.memory.percentage.toFixed(2)}%`,
            threshold: '85%',
            current: `${metrics.memory.percentage.toFixed(2)}%`,
            timestamp: new Date().toISOString()
        });
    }

    // Alerta de tiempo de respuesta alto
    if (metrics.responseTime.avg > 1000) {
        alerts.push({
            level: 'warning',
            type: 'performance',
            message: `High response time: ${metrics.responseTime.avg.toFixed(2)}ms`,
            threshold: '1000ms',
            current: `${metrics.responseTime.avg.toFixed(2)}ms`,
            timestamp: new Date().toISOString()
        });
    }

    // Alerta de tasa de error alta
    const errorRate = calculateErrorRate(metrics);
    if (errorRate > 5) {
        alerts.push({
            level: 'critical',
            type: 'errors',
            message: `High error rate: ${errorRate.toFixed(2)}%`,
            threshold: '5%',
            current: `${errorRate.toFixed(2)}%`,
            timestamp: new Date().toISOString()
        });
    }

    // Alerta de requests en progreso
    if (metrics.requests.inProgress > 50) {
        alerts.push({
            level: 'critical',
            type: 'load',
            message: `Too many requests in progress: ${metrics.requests.inProgress}`,
            threshold: '50',
            current: metrics.requests.inProgress.toString(),
            timestamp: new Date().toISOString()
        });
    }

    return alerts;
}

/**
 * Health check simple para balanceadores de carga
 */
function quickHealthCheck() {
    const performanceMetrics = getPerformanceMetrics();
    const isHealthy =
        performanceMetrics.memory.percentage < 90 &&
        performanceMetrics.responseTime.avg < 2000 &&
        performanceMetrics.requests.inProgress < 100;

    return {
        status: isHealthy ? 'healthy' : 'unhealthy',
        timestamp: new Date().toISOString()
    };
}

/**
 * Obtener historial de health checks
 */
function getHealthHistory() {
    return {
        checks: healthState.history.slice(-50), // Últimos 50 checks
        summary: {
            totalChecks: healthState.history.length,
            uptime: healthState.history.filter(h => h.status === 'healthy').length,
            degraded: healthState.history.filter(h => h.status === 'degraded').length,
            unhealthy: healthState.history.filter(h => h.status === 'unhealthy').length
        }
    };
}

/**
 * Calcular métricas detalladas de rendimiento del sistema
 * @returns {Promise<Object>} Métricas completas del sistema
 */
async function calculatePerformanceMetrics() {
    const performanceMetrics = getPerformanceMetrics();
    const memoryUsage = process.memoryUsage();

    return {
        timestamp: new Date().toISOString(),
        system: {
            cpu: {
                usage: performanceMetrics.cpu?.usage || 0,
                loadAverage: performanceMetrics.cpu?.loadAverage || [0, 0, 0]
            },
            memory: {
                used: memoryUsage.heapUsed,
                total: memoryUsage.heapTotal,
                percentage: (memoryUsage.heapUsed / memoryUsage.heapTotal) * 100,
                rss: memoryUsage.rss,
                external: memoryUsage.external
            },
            uptime: process.uptime(),
            platform: process.platform,
            nodeVersion: process.version
        },
        api: {
            requests: {
                total: performanceMetrics.requests?.total || 0,
                inProgress: performanceMetrics.requests?.inProgress || 0,
                completed: performanceMetrics.requests?.completed || 0
            },
            responseTime: {
                average: performanceMetrics.responseTime?.avg || 0,
                min: performanceMetrics.responseTime?.min || 0,
                max: performanceMetrics.responseTime?.max || 0,
                p95: performanceMetrics.responseTime?.p95 || 0
            },
            errors: {
                total: performanceMetrics.errors?.total || 0,
                rate: ((performanceMetrics.errors?.total || 0) / (performanceMetrics.requests?.total || 1)) * 100,
                recent: performanceMetrics.errors?.recent || []
            }
        },
        database: await checkDatabaseHealth(),
        cache: checkCacheHealth()
    };
}

/**
 * Formatea métricas para el formato Prometheus
 * @param {Object} metrics - Métricas del sistema
 * @returns {string} Métricas en formato Prometheus
 */
function formatMetricsForPrometheus(metrics) {
    const lines = [];
    const timestamp = Date.now();

    // Helper para agregar métrica
    const addMetric = (name, type, help, value, labels = {}) => {
        lines.push(`# HELP ${name} ${help}`);
        lines.push(`# TYPE ${name} ${type}`);

        const labelStr = Object.keys(labels).length > 0 ? `{${Object.entries(labels).map(([k, v]) => `${k}="${v}"`).join(',')}}` : '';

        lines.push(`${name}${labelStr} ${value} ${timestamp}`);
        lines.push('');
    };

    // Métricas del sistema
    if (metrics.system) {
        addMetric('api_memory_usage_bytes', 'gauge', 'Memory usage in bytes', metrics.system.memory?.used || 0);

        addMetric('api_memory_heap_bytes', 'gauge', 'Heap memory usage in bytes', metrics.system.memory?.heapUsed || 0);

        addMetric('api_uptime_seconds', 'counter', 'Application uptime in seconds', Math.floor(process.uptime()));

        addMetric('api_cpu_usage_percent', 'gauge', 'CPU usage percentage', metrics.system.cpu?.usage || 0);
    }

    // Métricas de la API
    if (metrics.api) {
        addMetric('api_requests_total', 'counter', 'Total API requests', metrics.api.requests?.total || 0);

        addMetric('api_requests_errors_total', 'counter', 'Total API request errors', metrics.api.errors?.total || 0);

        addMetric('api_response_time_seconds', 'histogram', 'API response time in seconds', (metrics.api.responseTime?.average || 0) / 1000);

        addMetric('api_response_time_p95_seconds', 'gauge', 'API response time p95 in seconds', (metrics.api.responseTime?.p95 || 0) / 1000);
    }

    // Métricas de la base de datos
    if (metrics.database) {
        addMetric('api_database_connections_active', 'gauge', 'Active database connections', metrics.database.activeConnections || 0);

        addMetric('api_database_query_time_seconds', 'histogram', 'Database query time in seconds', (metrics.database.averageQueryTime || 0) / 1000);

        addMetric('api_database_status', 'gauge', 'Database status', metrics.database.status === 'healthy' ? 1 : 0);
    }

    // Métricas del cache
    if (metrics.cache) {
        addMetric('api_cache_hit_ratio', 'gauge', 'Cache hit ratio (0-1)', metrics.cache.hitRatio || 0);

        addMetric('api_cache_size_bytes', 'gauge', 'Cache size in bytes', metrics.cache.size || 0);

        addMetric('api_cache_keys_total', 'gauge', 'Total cache keys', metrics.cache.keys || 0);
    }

    return lines.join('\n');
}

module.exports = {
    runFullHealthCheck,
    quickHealthCheck,
    getHealthHistory,
    checkDatabaseHealth,
    checkCacheHealth,
    checkExternalAPIsHealth,
    calculatePerformanceMetrics,
    generateHealthAlerts,
    formatMetricsForPrometheus,
    healthState
};
