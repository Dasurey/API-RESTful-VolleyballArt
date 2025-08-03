# 🔧 Guía Técnica - Health Checks y Métricas

## 📋 Índice Técnico

1. [API Reference](#api-reference)
2. [Configuración Técnica](#configuración-técnica)
3. [Implementación de Nuevos Health Checks](#implementación-de-nuevos-health-checks)
4. [Customización de Métricas](#customización-de-métricas)
5. [Troubleshooting](#troubleshooting)
6. [Testing](#testing)

---

## 📚 API Reference

### Health Check Endpoints

#### `GET /api/health`
**Descripción**: Health check básico para load balancers
**Autenticación**: No requerida
**Parámetros**: Ninguno

**Respuesta Exitosa (200)**:
```json
{
  "status": "healthy",
  "timestamp": "2025-08-03T04:43:30.983Z",
  "meta": {
    "timestamp": "2025-08-03T04:43:30.983Z",
    "requestId": "req_1754196210983",
    "cached": false,
    "responseTime": 1
  }
}
```

**Respuesta de Error (503)**:
```json
{
  "status": "unhealthy",
  "timestamp": "2025-08-03T04:43:30.983Z",
  "meta": {
    "timestamp": "2025-08-03T04:43:30.983Z",
    "requestId": "req_1754196210983",
    "cached": false,
    "responseTime": 1
  }
}
```

#### `GET /api/health/full`
**Descripción**: Health check completo del sistema
**Autenticación**: No requerida
**Parámetros**: Ninguno

**Respuesta (200/503)**:
```json
{
  "status": "healthy|degraded|unhealthy",
  "timestamp": "2025-08-03T04:23:36.178Z",
  "checkDuration": "2ms",
  "version": "1.0.0",
  "environment": "production",
  "uptime": {
    "seconds": 48,
    "formatted": "0d 0h 0m 48s"
  },
  "system": {
    "memory": {
      "used": 28819504,
      "free": 34109968336,
      "total": 34138787840,
      "percentage": "0.08%",
      "heap": {
        "used": 28819504,
        "total": 30687232
      },
      "external": 3583428,
      "rss": 76341248
    },
    "cpu": {
      "usage": "N/A"
    },
    "nodeVersion": "v22.16.0",
    "platform": "win32"
  },
  "dependencies": {
    "database": {
      "status": "healthy|degraded|unhealthy",
      "lastCheck": "2025-08-03T04:23:36.177Z",
      "responseTime": 1,
      "details": {
        "latency": "1ms",
        "provider": "Firebase Firestore",
        "errorType": "MODULE_NOT_FOUND"
      }
    },
    "cache": {
      "status": "healthy|degraded|unhealthy",
      "lastCheck": "2025-08-03T04:23:36.177Z",
      "responseTime": 0,
      "details": {
        "hitRate": "89%",
        "memoryUsage": "52MB"
      }
    },
    "external_apis": {
      "status": "healthy|degraded|unhealthy",
      "lastCheck": "2025-08-03T04:23:36.177Z",
      "responseTime": 0,
      "details": {
        "httpServer": "operational",
        "apis": []
      }
    }
  },
  "performance": {
    "averageResponseTime": "4.00ms",
    "requestsPerMinute": 2,
    "errorRate": "0.00%",
    "throughput": "0.04 req/s"
  },
  "alerts": [
    {
      "level": "warning|critical",
      "type": "memory|performance|errors|load",
      "message": "High memory usage detected",
      "threshold": "85%",
      "current": "87%",
      "timestamp": "2025-08-03T04:23:36.177Z"
    }
  ],
  "meta": {
    "timestamp": "2025-08-03T04:23:36.178Z",
    "requestId": "req_1754195016178",
    "cached": false,
    "responseTime": 3
  }
}
```

#### `GET /api/health/history`
**Descripción**: Historial de health checks
**Autenticación**: ✅ Bearer Token requerido
**Parámetros**: Ninguno

**Headers Requeridos**:
```http
Authorization: Bearer <token>
```

**Respuesta (200)**:
```json
{
  "checks": [
    {
      "timestamp": "2025-08-03T04:23:36.178Z",
      "status": "healthy",
      "duration": "2ms",
      "services": {
        "database": "healthy",
        "cache": "degraded",
        "external_apis": "healthy"
      }
    }
  ],
  "summary": {
    "totalChecks": 150,
    "uptime": 147,
    "degraded": 2,
    "unhealthy": 1,
    "availabilityPercentage": 98.0
  }
}
```

### Metrics Endpoints

#### `GET /api/metrics`
**Descripción**: Métricas del sistema en tiempo real
**Autenticación**: ✅ Bearer Token requerido
**Formato**: JSON

**Headers Requeridos**:
```http
Authorization: Bearer <token>
```

**Respuesta (200)**:
```json
{
  "timestamp": "2025-08-03T04:43:45.123Z",
  "system": {
    "cpu": {
      "usage": 12.5,
      "loadAverage": [0.5, 0.8, 1.2]
    },
    "memory": {
      "used": 134217728,
      "total": 268435456,
      "percentage": 50.0,
      "heap": {
        "used": 125829120,
        "total": 134217728
      },
      "rss": 150994944,
      "external": 8388608
    },
    "uptime": 3600,
    "platform": "linux",
    "nodeVersion": "v18.17.0"
  },
  "api": {
    "requests": {
      "total": 1250,
      "inProgress": 3,
      "completed": 1247
    },
    "responseTime": {
      "average": 145.6,
      "min": 12,
      "max": 2340,
      "p95": 890
    },
    "errors": {
      "total": 15,
      "rate": 1.2,
      "recent": [
        {
          "timestamp": "2025-08-03T04:43:40.123Z",
          "endpoint": "/api/products",
          "error": "Validation failed",
          "statusCode": 400
        }
      ]
    }
  },
  "database": {
    "status": "healthy",
    "activeConnections": 5,
    "averageQueryTime": 45.2,
    "slowQueries": 2,
    "lastError": null
  },
  "cache": {
    "status": "healthy",
    "hitRatio": 0.89,
    "size": 52428800,
    "keys": 1540,
    "evictions": 12
  }
}
```

#### `GET /api/metrics/prometheus`
**Descripción**: Métricas en formato Prometheus
**Autenticación**: ✅ Bearer Token requerido
**Formato**: text/plain

**Headers Requeridos**:
```http
Authorization: Bearer <token>
```

**Headers de Respuesta**:
```http
Content-Type: text/plain
```

**Respuesta (200)**:
```
# HELP api_requests_total Total number of API requests
# TYPE api_requests_total counter
api_requests_total 1250 1754196225123

# HELP api_requests_errors_total Total number of API request errors
# TYPE api_requests_errors_total counter
api_requests_errors_total 15 1754196225123

# HELP api_memory_usage_bytes Memory usage in bytes
# TYPE api_memory_usage_bytes gauge
api_memory_usage_bytes 134217728 1754196225123

# HELP api_memory_heap_bytes Heap memory usage in bytes
# TYPE api_memory_heap_bytes gauge
api_memory_heap_bytes 125829120 1754196225123

# HELP api_uptime_seconds Application uptime in seconds
# TYPE api_uptime_seconds counter
api_uptime_seconds 3600 1754196225123

# HELP api_cpu_usage_percent CPU usage percentage
# TYPE api_cpu_usage_percent gauge
api_cpu_usage_percent 12.5 1754196225123

# HELP api_response_time_seconds API response time in seconds
# TYPE api_response_time_seconds histogram
api_response_time_seconds 0.1456 1754196225123

# HELP api_response_time_p95_seconds 95th percentile response time in seconds
# TYPE api_response_time_p95_seconds gauge
api_response_time_p95_seconds 0.89 1754196225123

# HELP api_database_connections_active Active database connections
# TYPE api_database_connections_active gauge
api_database_connections_active 5 1754196225123

# HELP api_database_query_time_seconds Database query time in seconds
# TYPE api_database_query_time_seconds histogram
api_database_query_time_seconds 0.0452 1754196225123

# HELP api_database_status Database status (1=healthy, 0=unhealthy)
# TYPE api_database_status gauge
api_database_status 1 1754196225123

# HELP api_cache_hit_ratio Cache hit ratio (0-1)
# TYPE api_cache_hit_ratio gauge
api_cache_hit_ratio 0.89 1754196225123

# HELP api_cache_size_bytes Cache size in bytes
# TYPE api_cache_size_bytes gauge
api_cache_size_bytes 52428800 1754196225123

# HELP api_cache_keys_total Total number of cache keys
# TYPE api_cache_keys_total gauge
api_cache_keys_total 1540 1754196225123
```

### Status Endpoints

#### `GET /api/status`
**Descripción**: Estado público del sistema
**Autenticación**: No requerida
**Parámetros**: Ninguno

**Respuesta (200/503)**:
```json
{
  "status": "operational|degraded|down",
  "services": {
    "api": "healthy|degraded|unhealthy|unknown|error",
    "database": "healthy|degraded|unhealthy|unknown|error",
    "cache": "healthy|degraded|unhealthy|unknown|error"
  },
  "lastUpdated": "2025-08-03T04:43:19.461Z",
  "meta": {
    "timestamp": "2025-08-03T04:43:19.462Z",
    "requestId": "req_1754196199462",
    "cached": false,
    "responseTime": 5
  }
}
```

#### `GET /api/debug/info`
**Descripción**: Información de debug del sistema
**Autenticación**: ✅ Bearer Token requerido
**Parámetros**: Ninguno

**Headers Requeridos**:
```http
Authorization: Bearer <token>
```

**Respuesta (200)**:
```json
{
  "environment": "production|development|staging",
  "version": "1.0.0",
  "nodeVersion": "v18.17.0",
  "platform": "linux",
  "architecture": "x64",
  "startTime": "2025-08-03T04:00:00.000Z",
  "uptime": 2619.123,
  "workingDirectory": "/app",
  "config": {
    "port": 5000,
    "timezone": "UTC",
    "locale": "en-US"
  },
  "memoryUsage": {
    "rss": 150994944,
    "heapTotal": 134217728,
    "heapUsed": 125829120,
    "external": 8388608,
    "arrayBuffers": 1048576
  },
  "resourceUsage": {
    "userCPUTime": 12345678,
    "systemCPUTime": 2345678,
    "maxRSS": 167772160,
    "sharedMemorySize": 0,
    "unsharedDataSize": 0,
    "unsharedStackSize": 0,
    "minorPageFault": 15234,
    "majorPageFault": 123,
    "swappedOut": 0,
    "fsRead": 1234,
    "fsWrite": 567,
    "ipcSent": 89,
    "ipcReceived": 12,
    "signalsCount": 3,
    "voluntaryContextSwitches": 45678,
    "involuntaryContextSwitches": 1234
  }
}
```

---

## ⚙️ Configuración Técnica

### 🏗️ Estructura de Archivos

```
src/
├── config/
│   ├── paths.config.js           # Configuración centralizada de rutas
│   ├── swagger.config.js         # Configuración de documentación
│   └── ...
├── utils/
│   ├── health.utils.js           # Funciones de health checking
│   ├── messages.utils.js         # Constantes centralizadas
│   ├── middleware.utils.js       # Utilidades de middleware
│   └── ...
├── middlewares/
│   ├── performance.middleware.js # Middleware de métricas
│   ├── authentication.middleware.js
│   └── ...
└── index.js                     # Servidor principal
```

### 🔧 Configuración de Constantes

#### En `src/utils/messages.utils.js`:

```javascript
// Estados de salud del sistema
const HEALTH_CONSTANTS = {
  // Estados básicos
  STATUS_HEALTHY: 'healthy',
  STATUS_DEGRADED: 'degraded',
  STATUS_UNHEALTHY: 'unhealthy',
  
  // Estados para endpoint público
  STATUS_OPERATIONAL: 'operational',
  STATUS_DOWN: 'down',
  
  // Estados de servicios individuales
  SERVICE_UNKNOWN: 'unknown',
  SERVICE_ERROR: 'error',
  
  // Niveles de alerta
  ALERT_WARNING: 'warning',
  ALERT_CRITICAL: 'critical',
  
  // Tipos de alertas
  ALERT_TYPE_MEMORY: 'memory',
  ALERT_TYPE_PERFORMANCE: 'performance',
  ALERT_TYPE_ERRORS: 'errors',
  ALERT_TYPE_LOAD: 'load',
  
  // Tipos de servicios
  SERVICE_TYPE_API: 'api',
  SERVICE_TYPE_DATABASE: 'database',
  SERVICE_TYPE_CACHE: 'cache',
  
  // Umbrales configurables
  MEMORY_THRESHOLD: 85,                    // Porcentaje
  RESPONSE_TIME_THRESHOLD: 1000,           // Milisegundos
  ERROR_RATE_THRESHOLD: 5,                 // Porcentaje
  CONCURRENT_REQUESTS_THRESHOLD: 50        // Número de requests
};

// Constantes para métricas
const METRICS_CONSTANTS = {
  // Mensajes de error localizados
  ERROR_OBTAINING_METRICS: 'Error al obtener métricas',
  ERROR_GENERATING_METRICS: 'Error generating metrics',
  
  // Headers HTTP
  CONTENT_TYPE_HEADER: 'Content-Type',
  CONTENT_TYPE_TEXT_PLAIN: 'text/plain',
  
  // Valores por defecto
  DEFAULT_VERSION: '1.0.0',
  DEFAULT_ENVIRONMENT: 'development'
};

// Endpoints centralizados
const API_ENDPOINTS_PATHS = {
  HEALTH_FULL: '/api/health/full',
  HEALTH_HISTORY: '/api/health/history',
  METRICS: '/api/metrics',
  METRICS_PROMETHEUS: '/api/metrics/prometheus',
  STATUS: '/api/status',
  DEBUG_INFO: '/api/debug/info'
};
```

### 🔗 Importación en `src/index.js`:

```javascript
const { 
  GENERAL_MESSAGES, 
  LOG_MESSAGES, 
  SYSTEM_MESSAGES,
  HEALTH_CONSTANTS,
  METRICS_CONSTANTS,
  API_ENDPOINTS_PATHS
} = require('./utils/messages.utils.js');
```

---

## 🛠️ Implementación de Nuevos Health Checks

### 📝 Agregar un Nuevo Health Check

#### 1. Definir la función de verificación en `src/utils/health.utils.js`:

```javascript
/**
 * Verificar salud de un servicio externo
 * @returns {Object} Estado del servicio
 */
async function checkExternalServiceHealth() {
  const startTime = Date.now();
  
  try {
    // Realizar verificación del servicio
    const response = await fetch('https://external-service.com/health', {
      timeout: 3000
    });
    
    const responseTime = Date.now() - startTime;
    
    if (response.ok) {
      return {
        status: HEALTH_CONSTANTS.STATUS_HEALTHY,
        lastCheck: new Date().toISOString(),
        responseTime,
        details: {
          latency: `${responseTime}ms`,
          statusCode: response.status,
          endpoint: 'https://external-service.com/health'
        }
      };
    } else {
      return {
        status: HEALTH_CONSTANTS.STATUS_DEGRADED,
        lastCheck: new Date().toISOString(),
        responseTime,
        error: `HTTP ${response.status}: ${response.statusText}`,
        details: {
          latency: `${responseTime}ms`,
          statusCode: response.status,
          endpoint: 'https://external-service.com/health'
        }
      };
    }
  } catch (error) {
    const responseTime = Date.now() - startTime;
    
    return {
      status: HEALTH_CONSTANTS.STATUS_UNHEALTHY,
      lastCheck: new Date().toISOString(),
      responseTime,
      error: error.message,
      details: {
        latency: `${responseTime}ms`,
        endpoint: 'https://external-service.com/health',
        errorType: error.name
      }
    };
  }
}
```

#### 2. Integrar en la función principal:

```javascript
async function runFullHealthCheck() {
  const startTime = Date.now();
  
  // Health checks existentes
  const databaseHealth = await checkDatabaseHealth();
  const cacheHealth = checkCacheHealth();
  
  // Nuevo health check
  const externalServiceHealth = await checkExternalServiceHealth();
  
  // Determinar estado general
  const allStatuses = [
    databaseHealth.status,
    cacheHealth.status,
    externalServiceHealth.status
  ];
  
  let overallStatus = HEALTH_CONSTANTS.STATUS_HEALTHY;
  
  if (allStatuses.includes(HEALTH_CONSTANTS.STATUS_UNHEALTHY)) {
    overallStatus = HEALTH_CONSTANTS.STATUS_UNHEALTHY;
  } else if (allStatuses.includes(HEALTH_CONSTANTS.STATUS_DEGRADED)) {
    overallStatus = HEALTH_CONSTANTS.STATUS_DEGRADED;
  }
  
  const checkDuration = Date.now() - startTime;
  
  const healthReport = {
    status: overallStatus,
    timestamp: new Date().toISOString(),
    checkDuration: `${checkDuration}ms`,
    // ... otros campos
    dependencies: {
      database: databaseHealth,
      cache: cacheHealth,
      external_service: externalServiceHealth  // Nuevo servicio
    }
    // ... resto del reporte
  };
  
  // Guardar en historial
  healthState.history.push({
    timestamp: healthReport.timestamp,
    status: overallStatus,
    duration: checkDuration,
    services: {
      database: databaseHealth.status,
      cache: cacheHealth.status,
      external_service: externalServiceHealth.status
    }
  });
  
  // Mantener solo los últimos 100 registros
  if (healthState.history.length > 100) {
    healthState.history = healthState.history.slice(-100);
  }
  
  return healthReport;
}
```

#### 3. Agregar métricas Prometheus (opcional):

```javascript
function formatMetricsForPrometheus(metrics) {
  const lines = [];
  const timestamp = Date.now();
  
  // ... métricas existentes
  
  // Nueva métrica para servicio externo
  if (metrics.externalService) {
    addMetric('api_external_service_status', 'gauge', 
      'External service status (1=healthy, 0=unhealthy)', 
      metrics.externalService.status === 'healthy' ? 1 : 0);
      
    addMetric('api_external_service_response_time_seconds', 'histogram', 
      'External service response time in seconds', 
      (metrics.externalService.responseTime || 0) / 1000);
  }
  
  return lines.join('\n');
}
```

### 🎯 Mejores Prácticas para Health Checks

1. **Timeouts Apropiados**: Siempre incluir timeouts para evitar bloqueos
2. **Información Útil**: Proveer detalles suficientes para debugging
3. **Estados Granulares**: Usar degraded para servicios parcialmente funcionales
4. **Logging**: Loggear errores importantes sin spam
5. **Performance**: Minimizar overhead en verificaciones frecuentes

---

## 📊 Customización de Métricas

### 🔧 Agregar Nuevas Métricas

#### 1. Definir recolección de datos en middleware:

```javascript
// En src/middlewares/performance.middleware.js

const customMetrics = {
  businessMetrics: {
    ordersProcessed: 0,
    revenue: 0,
    userSessions: new Set()
  }
};

function trackBusinessMetric(type, value, userId = null) {
  switch (type) {
    case 'order':
      customMetrics.businessMetrics.ordersProcessed++;
      customMetrics.businessMetrics.revenue += value;
      break;
    case 'session':
      if (userId) {
        customMetrics.businessMetrics.userSessions.add(userId);
      }
      break;
  }
}

function getBusinessMetrics() {
  return {
    ordersProcessed: customMetrics.businessMetrics.ordersProcessed,
    revenue: customMetrics.businessMetrics.revenue,
    activeUsers: customMetrics.businessMetrics.userSessions.size
  };
}
```

#### 2. Integrar en endpoint de métricas:

```javascript
// En src/utils/health.utils.js

async function calculatePerformanceMetrics() {
  const performanceMetrics = getPerformanceMetrics();
  const businessMetrics = getBusinessMetrics();
  const memoryUsage = process.memoryUsage();
  
  return {
    timestamp: new Date().toISOString(),
    system: {
      // ... métricas existentes
    },
    api: {
      // ... métricas existentes
    },
    business: businessMetrics,  // Nuevas métricas de negocio
    database: await checkDatabaseHealth(),
    cache: checkCacheHealth()
  };
}
```

#### 3. Exportar en formato Prometheus:

```javascript
function formatMetricsForPrometheus(metrics) {
  // ... código existente
  
  // Métricas de negocio
  if (metrics.business) {
    addMetric('api_orders_processed_total', 'counter',
      'Total number of orders processed',
      metrics.business.ordersProcessed);
      
    addMetric('api_revenue_total', 'counter',
      'Total revenue generated',
      metrics.business.revenue);
      
    addMetric('api_active_users', 'gauge',
      'Number of active users',
      metrics.business.activeUsers);
  }
  
  return lines.join('\n');
}
```

### 📈 Métricas Personalizadas por Endpoint

```javascript
// Middleware para métricas específicas de endpoint
function endpointMetrics(endpointName) {
  return (req, res, next) => {
    const startTime = Date.now();
    
    // Incrementar contador de requests para este endpoint
    incrementEndpointCounter(endpointName);
    
    res.on('finish', () => {
      const duration = Date.now() - startTime;
      
      // Registrar tiempo de respuesta por endpoint
      recordEndpointResponseTime(endpointName, duration);
      
      // Registrar códigos de estado por endpoint
      recordEndpointStatusCode(endpointName, res.statusCode);
    });
    
    next();
  };
}

// Uso en endpoints específicos
app.get('/api/products', 
  endpointMetrics('products_list'), 
  productsController.getAll
);

app.post('/api/products', 
  endpointMetrics('products_create'), 
  productsController.create
);
```

---

## 🔧 Troubleshooting

### 🐛 Problemas Comunes

#### 1. **Health Check Devuelve 503 Constantemente**

**Síntomas**:
- Endpoint `/api/health` siempre devuelve `unhealthy`
- Logs muestran errores de memoria o performance

**Diagnóstico**:
```javascript
// Verificar métricas en /api/debug/info
// Revisar uso de memoria y CPU
```

**Soluciones**:
- Ajustar umbrales en `HEALTH_CONSTANTS`
- Optimizar uso de memoria
- Verificar memory leaks

#### 2. **Métricas Prometheus No Se Generan**

**Síntomas**:
- Endpoint `/api/metrics/prometheus` devuelve error 500
- Función `formatMetricsForPrometheus` falla

**Diagnóstico**:
```javascript
// Verificar logs de error en el servidor
// Comprobar estructura de datos de métricas
```

**Soluciones**:
- Validar que todas las métricas tengan valores numéricos
- Manejar valores `null` o `undefined`
- Agregar try-catch en formateo

#### 3. **Database Health Check Falla**

**Síntomas**:
- Dependencia `database` siempre muestra `unhealthy`
- Error "Cannot find module '../config/db.js'"

**Diagnóstico**:
```javascript
// Verificar que existe el archivo de configuración de DB
// Comprobar conexión a Firebase
```

**Soluciones**:
- Crear configuración de base de datos
- Verificar credenciales de Firebase
- Implementar fallback para cuando DB no esté disponible

#### 4. **Cache Health Check Degraded**

**Síntomas**:
- Cache siempre muestra estado `degraded`
- Hit rate aparece como "NaN%"

**Diagnóstico**:
```javascript
// Verificar configuración de cache
// Comprobar que el cache esté inicializado
```

**Soluciones**:
- Inicializar cache correctamente
- Verificar que las métricas de cache se recolecten
- Implementar valores por defecto

### 🔍 Debug Avanzado

#### Habilitar Logging Detallado

```javascript
// En src/utils/health.utils.js
const DEBUG_HEALTH = process.env.DEBUG_HEALTH === 'true';

function debugLog(message, data = {}) {
  if (DEBUG_HEALTH) {
    console.log(`[HEALTH DEBUG] ${message}`, data);
  }
}

async function checkDatabaseHealth() {
  debugLog('Starting database health check');
  
  try {
    // ... código de verificación
    debugLog('Database health check completed', { status: 'healthy' });
  } catch (error) {
    debugLog('Database health check failed', { error: error.message });
  }
}
```

#### Métricas de Debug

```javascript
// Endpoint temporal para debug
app.get('/api/debug/health', authentication, async (req, res) => {
  const debugInfo = {
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    healthConstants: HEALTH_CONSTANTS,
    performanceMetrics: getPerformanceMetrics(),
    memoryUsage: process.memoryUsage(),
    uptime: process.uptime()
  };
  
  res.json(debugInfo);
});
```

---

## 🧪 Testing

### 🔬 Unit Tests

#### Testing Health Check Functions

```javascript
// tests/health.test.js
const { quickHealthCheck, runFullHealthCheck } = require('../src/utils/health.utils');

describe('Health Checks', () => {
  describe('quickHealthCheck', () => {
    it('should return healthy status when system is ok', () => {
      const result = quickHealthCheck();
      
      expect(result).toHaveProperty('status');
      expect(result).toHaveProperty('timestamp');
      expect(['healthy', 'unhealthy']).toContain(result.status);
    });
  });
  
  describe('runFullHealthCheck', () => {
    it('should return complete health report', async () => {
      const result = await runFullHealthCheck();
      
      expect(result).toHaveProperty('status');
      expect(result).toHaveProperty('dependencies');
      expect(result).toHaveProperty('system');
      expect(result).toHaveProperty('performance');
      expect(result.dependencies).toHaveProperty('database');
      expect(result.dependencies).toHaveProperty('cache');
    });
    
    it('should include alerts when thresholds are exceeded', async () => {
      // Mock high memory usage
      jest.spyOn(process, 'memoryUsage').mockReturnValue({
        heapUsed: 900 * 1024 * 1024, // 900MB
        heapTotal: 1000 * 1024 * 1024 // 1GB
      });
      
      const result = await runFullHealthCheck();
      
      expect(result.alerts).toBeDefined();
      expect(result.alerts.length).toBeGreaterThan(0);
    });
  });
});
```

#### Testing API Endpoints

```javascript
// tests/endpoints.test.js
const request = require('supertest');
const app = require('../src/index');

describe('Health Endpoints', () => {
  describe('GET /api/health', () => {
    it('should return basic health status', async () => {
      const response = await request(app)
        .get('/api/health')
        .expect(200);
      
      expect(response.body).toHaveProperty('status');
      expect(response.body).toHaveProperty('timestamp');
      expect(['healthy', 'unhealthy']).toContain(response.body.status);
    });
  });
  
  describe('GET /api/health/full', () => {
    it('should return comprehensive health report', async () => {
      const response = await request(app)
        .get('/api/health/full')
        .expect((res) => {
          expect([200, 503]).toContain(res.status);
        });
      
      expect(response.body).toHaveProperty('status');
      expect(response.body).toHaveProperty('dependencies');
      expect(response.body).toHaveProperty('system');
    });
  });
  
  describe('GET /api/metrics', () => {
    it('should require authentication', async () => {
      await request(app)
        .get('/api/metrics')
        .expect(401);
    });
    
    it('should return metrics with valid token', async () => {
      const token = 'valid-bearer-token'; // Mock token
      
      const response = await request(app)
        .get('/api/metrics')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);
      
      expect(response.body).toHaveProperty('timestamp');
      expect(response.body).toHaveProperty('system');
      expect(response.body).toHaveProperty('api');
    });
  });
  
  describe('GET /api/status', () => {
    it('should return public system status', async () => {
      const response = await request(app)
        .get('/api/status')
        .expect((res) => {
          expect([200, 503]).toContain(res.status);
        });
      
      expect(response.body).toHaveProperty('status');
      expect(response.body).toHaveProperty('services');
      expect(response.body.services).toHaveProperty('api');
      expect(response.body.services).toHaveProperty('database');
      expect(response.body.services).toHaveProperty('cache');
    });
  });
});
```

### 🔄 Integration Tests

#### Testing with Real Dependencies

```javascript
// tests/integration/health.integration.test.js
describe('Health Integration Tests', () => {
  beforeAll(async () => {
    // Setup test database
    await setupTestDatabase();
    // Setup test cache
    await setupTestCache();
  });
  
  afterAll(async () => {
    // Cleanup
    await cleanupTestDatabase();
    await cleanupTestCache();
  });
  
  it('should detect database connectivity issues', async () => {
    // Simulate database down
    await shutdownTestDatabase();
    
    const response = await request(app)
      .get('/api/health/full');
    
    expect(response.body.dependencies.database.status).toBe('unhealthy');
    
    // Restore database
    await startupTestDatabase();
  });
  
  it('should handle cache degradation gracefully', async () => {
    // Simulate cache issues
    await simulateCacheIssues();
    
    const response = await request(app)
      .get('/api/health/full');
    
    expect(response.body.dependencies.cache.status).toBe('degraded');
  });
});
```

### 📊 Load Testing

#### Performance Under Load

```javascript
// tests/load/health-load.test.js
const autocannon = require('autocannon');

describe('Health Endpoints Load Tests', () => {
  it('should handle high load on /api/health', async () => {
    const result = await autocannon({
      url: 'http://localhost:5000/api/health',
      connections: 100,
      duration: 30 // 30 seconds
    });
    
    expect(result.errors).toBe(0);
    expect(result.non2xx).toBe(0);
    expect(result.latency.average).toBeLessThan(100); // < 100ms average
  });
  
  it('should maintain accuracy under load', async () => {
    // Run load test
    const loadPromise = autocannon({
      url: 'http://localhost:5000/api/health',
      connections: 50,
      duration: 10
    });
    
    // Check health during load
    const response = await request(app)
      .get('/api/health/full');
    
    expect(response.body).toHaveProperty('performance');
    expect(response.body.performance.requestsPerMinute).toBeGreaterThan(0);
    
    await loadPromise;
  });
});
```

### 🎯 Monitoring Tests

#### Alert Generation Tests

```javascript
// tests/monitoring/alerts.test.js
describe('Alert Generation', () => {
  it('should generate memory alert when threshold exceeded', async () => {
    // Mock high memory usage
    jest.spyOn(process, 'memoryUsage').mockReturnValue({
      heapUsed: 900 * 1024 * 1024,
      heapTotal: 1000 * 1024 * 1024
    });
    
    const result = await runFullHealthCheck();
    
    const memoryAlert = result.alerts.find(alert => 
      alert.type === 'memory'
    );
    
    expect(memoryAlert).toBeDefined();
    expect(memoryAlert.level).toBe('warning');
  });
  
  it('should generate performance alert for slow responses', async () => {
    // Mock slow performance metrics
    jest.doMock('../src/middlewares/performance.middleware', () => ({
      getPerformanceMetrics: () => ({
        responseTime: { avg: 1500 } // > 1000ms threshold
      })
    }));
    
    const result = await runFullHealthCheck();
    
    const perfAlert = result.alerts.find(alert => 
      alert.type === 'performance'
    );
    
    expect(perfAlert).toBeDefined();
    expect(perfAlert.level).toBe('warning');
  });
});
```

---

*Guía técnica generada el 3 de agosto de 2025*
*Sistema: API RESTful VolleyballArt v1.0.0*
*Documentación técnica completa del sistema de Health Checks y Métricas*
