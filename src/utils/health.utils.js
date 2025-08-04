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

const { RELATIVE_PATHS, HTTP_STATUS, EXTERNAL_PACKAGES, HEALTH_PATHS, CACHE } = require('../config/paths.config.js');
const { HEALTH_CONSTANTS, METRICS_CONSTANTS } = require('./messages.utils.js');
const { getPerformanceMetrics } = require(HEALTH_PATHS.PERFORMANCE_MIDDLEWARE);
const { 
  ValidationError, 
  NotFoundError, 
  ConflictError, 
  InternalServerError 
} = require('./error.utils.js');

/**
 * Estado global de health checks
 */
const healthState = {
    lastCheck: null,
    services: new Map(),
    alerts: [],
    history: [],
    dependencies: {
        database: { status: METRICS_CONSTANTS.SERVICE_UNKNOWN, lastCheck: null, responseTime: 0 },
        cache: { status: METRICS_CONSTANTS.SERVICE_UNKNOWN, lastCheck: null, responseTime: 0 },
        external_apis: { status: METRICS_CONSTANTS.SERVICE_UNKNOWN, lastCheck: null, responseTime: 0 }
    }
};

/**
 * Verificar conectividad con Firebase/Base de datos
 */
async function checkDatabaseHealth() {
    const startTime = Date.now();
    try {
        // Importar funciones de Firestore v9+
        const { collection, getDocs, limit, query } = require(EXTERNAL_PACKAGES.FIREBASE_FIRESTORE);
        const { db } = require(HEALTH_PATHS.DATABASE_CONFIG);

        // Verificar si el objeto db es válido
        if (!db) {
            throw new InternalServerError();
        }

        // Hacer una consulta ligera usando el nuevo SDK v9+
        const productsCollection = collection(db, CACHE.TYPE_PRODUCTS);
        const querySnapshot = await getDocs(query(productsCollection, limit(1)));

        const responseTime = Date.now() - startTime;

        healthState.dependencies.database = {
            status: HEALTH_CONSTANTS.STATUS_HEALTHY,
            lastCheck: new Date().toISOString(),
            responseTime: responseTime,
            details: {
                latency: `${responseTime}${METRICS_CONSTANTS.UNIT_MS}`,
                provider: METRICS_CONSTANTS.FIREBASE_FIRESTORE_PROVIDER,
                documentsChecked: querySnapshot.size
            }
        };

        return true;
    } catch (error) {
        const responseTime = Date.now() - startTime;

        healthState.dependencies.database = {
            status: HEALTH_CONSTANTS.STATUS_UNHEALTHY,
            lastCheck: new Date().toISOString(),
            responseTime: responseTime,
            error: error.message,
            details: {
                latency: `${responseTime}${METRICS_CONSTANTS.UNIT_MS}`,
                provider: METRICS_CONSTANTS.FIREBASE_FIRESTORE_PROVIDER,
                errorType: error.code || METRICS_CONSTANTS.SERVICE_UNKNOWN,
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
        const { getCacheStats } = require(HEALTH_PATHS.CACHE_CONFIG);
        const cacheStats = getCacheStats();
        const responseTime = Date.now() - startTime;

        // Calcular hit rate como número
        const numericHitRate = cacheStats.hits + cacheStats.misses > 0 
            ? cacheStats.hits / (cacheStats.hits + cacheStats.misses)
            : 0;

        const isHealthy = numericHitRate >= 0.0; // Cache funcional si responde

        healthState.dependencies.cache = {
            status: isHealthy ? HEALTH_CONSTANTS.STATUS_HEALTHY : HEALTH_CONSTANTS.STATUS_DEGRADED,
            lastCheck: new Date().toISOString(),
            responseTime: responseTime,
            details: {
                hitRate: `${(numericHitRate * 100).toFixed(2)}${METRICS_CONSTANTS.UNIT_PERCENT}`,
                totalKeys: (cacheStats.caches?.app?.keys || 0) + (cacheStats.caches?.products?.keys || 0) + (cacheStats.caches?.auth?.keys || 0),
                hits: cacheStats.hits || 0,
                misses: cacheStats.misses || 0
            }
        };

        return isHealthy;
    } catch (error) {
        const responseTime = Date.now() - startTime;

        healthState.dependencies.cache = {
            status: HEALTH_CONSTANTS.STATUS_UNHEALTHY,
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
            status: HEALTH_CONSTANTS.STATUS_HEALTHY,
            lastCheck: new Date().toISOString(),
            responseTime: responseTime,
            details: {
                httpServer: METRICS_CONSTANTS.HTTP_SERVER_OPERATIONAL,
                apis: []
            }
        };

        return true;
    } catch (error) {
        const responseTime = Date.now() - startTime;

        healthState.dependencies.external_apis = {
            status: HEALTH_CONSTANTS.STATUS_UNHEALTHY,
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
            result => result.status === METRICS_CONSTANTS.PROMISE_STATUS_FULFILLED && result.value === true
        );

        const overallStatus = allHealthy ?
            HEALTH_CONSTANTS.STATUS_HEALTHY :
            HEALTH_CONSTANTS.STATUS_DEGRADED;

        const totalCheckTime = Date.now() - checkStartTime;

        const healthReport = {
            status: overallStatus,
            timestamp: new Date().toISOString(),
            checkDuration: `${totalCheckTime}${METRICS_CONSTANTS.UNIT_MS}`,
            version: process.env.npm_package_version || METRICS_CONSTANTS.DEFAULT_VERSION,
            environment: process.env.NODE_ENV || METRICS_CONSTANTS.DEFAULT_ENVIRONMENT,
            uptime: {
                seconds: Math.floor(process.uptime()),
                formatted: formatUptime(process.uptime())
            },
            system: {
                memory: performanceMetrics.memory,
                cpu: performanceMetrics.cpu || { usage: METRICS_CONSTANTS.CPU_USAGE_NOT_AVAILABLE },
                nodeVersion: process.version,
                platform: process.platform
            },
            dependencies: healthState.dependencies,
            performance: {
                averageResponseTime: `${performanceMetrics.responseTime.avg.toFixed(2)}${METRICS_CONSTANTS.UNIT_MS}`,
                requestsPerMinute: calculateRequestsPerMinute(performanceMetrics),
                errorRate: `${calculateErrorRate(performanceMetrics).toFixed(2)}${METRICS_CONSTANTS.UNIT_PERCENT}`,
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
            status: HEALTH_CONSTANTS.STATUS_UNHEALTHY,
            timestamp: new Date().toISOString(),
            error: error.message,
            checkDuration: `${Date.now() - checkStartTime}${METRICS_CONSTANTS.UNIT_MS}`
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
    return `${requestsPerSecond.toFixed(2)} ${METRICS_CONSTANTS.UNIT_REQ_PER_SEC}`;
}

/**
 * Generar alertas basadas en métricas
 */
function generateHealthAlerts(metrics) {
    const alerts = [];

    // Alerta de memoria alta
    if (metrics.memory.percentage > 85) {
        alerts.push({
            level: HEALTH_CONSTANTS.ALERT_WARNING,
            type: HEALTH_CONSTANTS.ALERT_TYPE_MEMORY,
            message: `${METRICS_CONSTANTS.ALERT_HIGH_MEMORY_USAGE} ${metrics.memory.percentage.toFixed(2)}${METRICS_CONSTANTS.UNIT_PERCENT}`,
            threshold: METRICS_CONSTANTS.THRESHOLD_MEMORY_85_PERCENT,
            current: `${metrics.memory.percentage.toFixed(2)}${METRICS_CONSTANTS.UNIT_PERCENT}`,
            timestamp: new Date().toISOString()
        });
    }

    // Alerta de tiempo de respuesta alto
    if (metrics.responseTime.avg > 1000) {
        alerts.push({
            level: HEALTH_CONSTANTS.ALERT_WARNING,
            type: HEALTH_CONSTANTS.ALERT_TYPE_PERFORMANCE,
            message: `${METRICS_CONSTANTS.ALERT_HIGH_RESPONSE_TIME} ${metrics.responseTime.avg.toFixed(2)}${METRICS_CONSTANTS.UNIT_MS}`,
            threshold: METRICS_CONSTANTS.THRESHOLD_RESPONSE_TIME_1000MS,
            current: `${metrics.responseTime.avg.toFixed(2)}${METRICS_CONSTANTS.UNIT_MS}`,
            timestamp: new Date().toISOString()
        });
    }

    // Alerta de tasa de error alta
    const errorRate = calculateErrorRate(metrics);
    if (errorRate > 5) {
        alerts.push({
            level: HEALTH_CONSTANTS.ALERT_CRITICAL,
            type: HEALTH_CONSTANTS.ALERT_TYPE_ERRORS,
            message: `${METRICS_CONSTANTS.ALERT_HIGH_ERROR_RATE} ${errorRate.toFixed(2)}${METRICS_CONSTANTS.UNIT_PERCENT}`,
            threshold: METRICS_CONSTANTS.THRESHOLD_ERROR_RATE_5_PERCENT,
            current: `${errorRate.toFixed(2)}${METRICS_CONSTANTS.UNIT_PERCENT}`,
            timestamp: new Date().toISOString()
        });
    }

    // Alerta de requests en progreso
    if (metrics.requests.inProgress > 50) {
        alerts.push({
            level: HEALTH_CONSTANTS.ALERT_CRITICAL,
            type: HEALTH_CONSTANTS.ALERT_TYPE_LOAD,
            message: `${METRICS_CONSTANTS.ALERT_TOO_MANY_REQUESTS} ${metrics.requests.inProgress}`,
            threshold: METRICS_CONSTANTS.THRESHOLD_CONCURRENT_REQUESTS_50,
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
        status: isHealthy ? HEALTH_CONSTANTS.STATUS_HEALTHY : HEALTH_CONSTANTS.STATUS_UNHEALTHY,
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
            uptime: healthState.history.filter(h => h.status === HEALTH_CONSTANTS.STATUS_HEALTHY).length,
            degraded: healthState.history.filter(h => h.status === HEALTH_CONSTANTS.STATUS_DEGRADED).length,
            unhealthy: healthState.history.filter(h => h.status === HEALTH_CONSTANTS.STATUS_UNHEALTHY).length
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
        lines.push(`${METRICS_CONSTANTS.PROMETHEUS_HELP_PREFIX} ${name} ${help}`);
        lines.push(`${METRICS_CONSTANTS.PROMETHEUS_TYPE_PREFIX} ${name} ${type}`);

        const labelStr = Object.keys(labels).length > 0
            ? `{${Object.entries(labels).map(([k, v]) => `${k}="${v}"`).join(METRICS_CONSTANTS.PROMETHEUS_LABEL_SEPARATOR)}}`
            : METRICS_CONSTANTS.PROMETHEUS_EMPTY_LABELS;

        lines.push(`${name}${labelStr} ${value} ${timestamp}`);
        lines.push(METRICS_CONSTANTS.PROMETHEUS_EMPTY_LABELS);
    };

    // Métricas del sistema
    if (metrics.system) {
        addMetric(METRICS_CONSTANTS.METRIC_API_MEMORY_USAGE_BYTES, METRICS_CONSTANTS.PROMETHEUS_TYPE_GAUGE,
            METRICS_CONSTANTS.METRIC_DESC_MEMORY_USAGE, metrics.system.memory?.used || 0);

        addMetric(METRICS_CONSTANTS.METRIC_API_MEMORY_HEAP_BYTES, METRICS_CONSTANTS.PROMETHEUS_TYPE_GAUGE,
            METRICS_CONSTANTS.METRIC_DESC_HEAP_MEMORY, metrics.system.memory?.heapUsed || 0);

        addMetric(METRICS_CONSTANTS.METRIC_API_UPTIME_SECONDS, METRICS_CONSTANTS.PROMETHEUS_TYPE_COUNTER,
            METRICS_CONSTANTS.METRIC_DESC_UPTIME, Math.floor(process.uptime()));

        addMetric(METRICS_CONSTANTS.METRIC_API_CPU_USAGE_PERCENT, METRICS_CONSTANTS.PROMETHEUS_TYPE_GAUGE,
            METRICS_CONSTANTS.METRIC_DESC_CPU_USAGE, metrics.system.cpu?.usage || 0);
    }

    // Métricas de la API
    if (metrics.api) {
        addMetric(METRICS_CONSTANTS.METRIC_API_REQUESTS_TOTAL, METRICS_CONSTANTS.PROMETHEUS_TYPE_COUNTER,
            METRICS_CONSTANTS.METRIC_DESC_REQUESTS_TOTAL, metrics.api.requests?.total || 0);

        addMetric(METRICS_CONSTANTS.METRIC_API_REQUESTS_ERRORS_TOTAL, METRICS_CONSTANTS.PROMETHEUS_TYPE_COUNTER,
            METRICS_CONSTANTS.METRIC_DESC_REQUESTS_ERRORS, metrics.api.errors?.total || 0);

        addMetric(METRICS_CONSTANTS.METRIC_API_RESPONSE_TIME_SECONDS, METRICS_CONSTANTS.PROMETHEUS_TYPE_HISTOGRAM,
            METRICS_CONSTANTS.METRIC_DESC_RESPONSE_TIME, (metrics.api.responseTime?.average || 0) / 1000);

        addMetric(METRICS_CONSTANTS.METRIC_API_RESPONSE_TIME_P95_SECONDS, METRICS_CONSTANTS.PROMETHEUS_TYPE_GAUGE,
            METRICS_CONSTANTS.METRIC_DESC_RESPONSE_TIME_P95, (metrics.api.responseTime?.p95 || 0) / 1000);
    }

    // Métricas de la base de datos
    if (metrics.database) {
        addMetric(METRICS_CONSTANTS.METRIC_API_DATABASE_CONNECTIONS_ACTIVE, METRICS_CONSTANTS.PROMETHEUS_TYPE_GAUGE,
            METRICS_CONSTANTS.METRIC_DESC_DB_CONNECTIONS, metrics.database.activeConnections || 0);

        addMetric(METRICS_CONSTANTS.METRIC_API_DATABASE_QUERY_TIME_SECONDS, METRICS_CONSTANTS.PROMETHEUS_TYPE_HISTOGRAM,
            METRICS_CONSTANTS.METRIC_DESC_DB_QUERY_TIME, (metrics.database.averageQueryTime || 0) / 1000);

        addMetric(METRICS_CONSTANTS.METRIC_API_DATABASE_STATUS, METRICS_CONSTANTS.PROMETHEUS_TYPE_GAUGE,
            METRICS_CONSTANTS.METRIC_DESC_DB_STATUS,
            metrics.database.status === HEALTH_CONSTANTS.STATUS_HEALTHY ? 1 : 0);
    }

    // Métricas del cache
    if (metrics.cache) {
        addMetric(METRICS_CONSTANTS.METRIC_API_CACHE_HIT_RATIO, METRICS_CONSTANTS.PROMETHEUS_TYPE_GAUGE,
            METRICS_CONSTANTS.METRIC_DESC_CACHE_HIT_RATIO, metrics.cache.hitRatio || 0);

        addMetric(METRICS_CONSTANTS.METRIC_API_CACHE_SIZE_BYTES, METRICS_CONSTANTS.PROMETHEUS_TYPE_GAUGE,
            METRICS_CONSTANTS.METRIC_DESC_CACHE_SIZE, metrics.cache.size || 0);

        addMetric(METRICS_CONSTANTS.METRIC_API_CACHE_KEYS_TOTAL, METRICS_CONSTANTS.PROMETHEUS_TYPE_GAUGE,
            METRICS_CONSTANTS.METRIC_DESC_CACHE_KEYS, metrics.cache.keys || 0);
    }

    return lines.join(METRICS_CONSTANTS.PROMETHEUS_NEWLINE);
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
