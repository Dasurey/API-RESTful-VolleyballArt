const {
  EXTERNAL_PACKAGES,
  PATHS,
  API_ENDPOINTS,
  ENV_CONFIG,
  HTTP_HEADERS,
  HTTP_METHODS,
  NODE_EVENTS,
  LOG_LEVELS,
  COMMON_VALUES,
  HTTP_STATUS,
  API_ENDPOINTS_PATHS,
  ERROR_HANDLING,
  DATABASE_ERROR_CODES
} = require('./config/paths.config.js');

const express = require(EXTERNAL_PACKAGES.EXPRESS);
require(EXTERNAL_PACKAGES.DOTENV).config();
const cors = require(EXTERNAL_PACKAGES.CORS);

// � Configuración de entorno para Vercel
if (!process.env.NODE_ENV) {
  process.env.NODE_ENV = process.env.NODE_ENV ? ENV_CONFIG.NODE_ENV_PRODUCTION : ENV_CONFIG.NODE_ENV_DEVELOPMENT;
}

// �📊 Sistema de logging
const Logger = require(PATHS.CONFIG.LOGGER);
const { httpLogger, devLogger, requestLogger } = require(PATHS.MIDDLEWARES.LOGGER);
const { requestIdMiddleware } = require(PATHS.UTILS.ASYNC_UTILS);

// 🛡️ Sistema de seguridad
const { helmetConfig, generalLimiter, authLimiter, createLimiter } = require(PATHS.CONFIG.SECURITY);
const { sanitizeInput, sanitizeHtml } = require(PATHS.MIDDLEWARES.SANITIZATION);

// ⚡ Sistema de cache y optimización
const {
  compressionMiddleware,
  optimizeResponse,
  minifyJson,
  performanceHeaders
} = require(PATHS.CONFIG.OPTIMIZATION);
const { getCacheStats, resetCacheStats } = require(PATHS.CONFIG.CACHE);
const {
  performanceMonitor,
  getPerformanceMetrics,
  healthCheckWithMetrics
} = require(PATHS.MIDDLEWARES.PERFORMANCE);

// 📚 Sistema de documentación
const { swaggerSpec, swaggerUi, swaggerUiOptions } = require(PATHS.CONFIG.SWAGGER);

const productsRoutes = require(PATHS.ROUTES.PRODUCTS);
const authRoutes = require(PATHS.ROUTES.AUTH);
const categoryRoutes = require(PATHS.ROUTES.CATEGORY);

const { authentication } = require(PATHS.MIDDLEWARES.AUTHENTICATION);
const { 
  GENERAL_MESSAGES, 
  SYSTEM_MESSAGES,
  HEALTH_CONSTANTS,
  METRICS_CONSTANTS,
  SERVICE_MESSAGES
} = require('./utils/messages.utils.js');
const { versionMiddleware, registerVersionedRoutes, registerVersionInfoEndpoints } = require(PATHS.MIDDLEWARES.VERSION);
const { getVersionInfo } = require(PATHS.CONFIG.API_VERSIONS);

// 🏥 Importar utilidades de health checks avanzados
const { 
  runFullHealthCheck, 
  quickHealthCheck, 
  getHealthHistory,
  calculatePerformanceMetrics,
  formatMetricsForPrometheus
} = require(PATHS.UTILS.HEALTH_UTILS);

// 🔧 Utilidades para URLs y paths (incluyendo middleware dinámico para Swagger)
const { __dirname: projectDir, join, updateSwaggerUrl, getBaseUrl } = require(PATHS.UTILS.URL_UTILS);

// 🔧 Utilidades centralizadas para respuestas y logging
const { logMessage, successResponse, getEndpointUrls, logServerInfo } = require(PATHS.UTILS.RESPONSE_UTILS);

// 🔧 Clases de error personalizadas
const { 
  InternalServerError, 
  ValidationError, 
  NotFoundError, 
  AppError, 
  formatDatabaseError, 
  formatJWTError 
} = require(PATHS.UTILS.ERROR_UTILS);

// 🌐 Configuración de variables de entorno
// Ya configurado con require('dotenv').config() arriba
const PORT = process.env.PORT || ENV_CONFIG.PORT_DEFAULT;

const app = express();

// � Manejador de errores no capturados (especialmente importante en Vercel)
process.on(NODE_EVENTS.UNCAUGHT_EXCEPTION, (error) => {
  const internalError = new InternalServerError(error.message);
  logMessage(LOG_LEVELS.ERROR, SYSTEM_MESSAGES.UNCAUGHT_EXCEPTION, internalError);
  process.exit(COMMON_VALUES.PROCESS_EXIT_CODE);
});

process.on(NODE_EVENTS.UNHANDLED_REJECTION, (reason, promise) => {
  const internalError = new InternalServerError(typeof reason === 'string' ? reason : reason?.message || 'Unhandled Promise Rejection');
  logMessage(LOG_LEVELS.ERROR, SYSTEM_MESSAGES.UNHANDLED_REJECTION, internalError);
  process.exit(COMMON_VALUES.PROCESS_EXIT_CODE);
});

// �📊 Iniciar logging del sistema
logMessage(LOG_LEVELS.INFO, SYSTEM_MESSAGES.SERVER_STARTING, {
  nodeVersion: process.version,
  environment: process.env.NODE_ENV,
  timestamp: new Date().toISOString()
});

const corsOptions = {
  origin: SYSTEM_MESSAGES.CORS_ORIGIN,
  methods: [HTTP_METHODS.GET, HTTP_METHODS.POST, HTTP_METHODS.PUT, HTTP_METHODS.DELETE],
  allowedHeaders: [HTTP_HEADERS.CONTENT_TYPE, HTTP_HEADERS.AUTHORIZATION],
  credentials: SYSTEM_MESSAGES.CORS_CREDENTIALS,
};

// 🛡️ Middlewares de seguridad y parsing
app.use(helmetConfig); // Aplicar configuración de Helmet
app.use(generalLimiter); // Rate limiting general

// ⚡ Middlewares de optimización (aplicar temprano)
app.use(compressionMiddleware); // Compresión GZIP/Brotli
app.use(performanceHeaders); // Headers de rendimiento
app.use(performanceMonitor); // Monitoreo de rendimiento
app.use(optimizeResponse); // Optimización de respuestas
app.use(minifyJson); // Minificación de JSON en producción

app.use(express.json({ limit: ENV_CONFIG.JSON_LIMIT }));
app.use(express.urlencoded({ extended: true }));

// 📁 Archivos estáticos usando utilidades CommonJS
app.use(express.static(join(projectDir, API_ENDPOINTS.PUBLIC_DIR)));

// 🧹 Middlewares de sanitización
app.use(sanitizeInput); // Prevenir NoSQL injection
app.use(sanitizeHtml); // Limpiar HTML/XSS

// 🆔 Middleware para asignar ID único a cada request
app.use(requestIdMiddleware);

// 📊 Logging HTTP - aplicar antes de las rutas
app.use(process.env.NODE_ENV === ENV_CONFIG.NODE_ENV_DEVELOPMENT ? devLogger : httpLogger);
app.use(requestLogger);

// ⚠️ Middleware para capturar errores de JSON malformado
app.use((error, req, res, next) => {
  if (error instanceof SyntaxError && error.status === HTTP_STATUS.BAD_REQUEST && ERROR_HANDLING.BODY_PROPERTY in error) {
    return next(new ValidationError(GENERAL_MESSAGES.JSON_MALFORMED.replace("📝 ", "")));
  }
  next(error);
});

app.use(cors(corsOptions));

// Aplicar middleware de versioning
app.use(versionMiddleware);

// 🌐 Middleware para actualizar URL de Swagger dinámicamente usando req.headers.host
app.use(API_ENDPOINTS.API_DOCS, updateSwaggerUrl);

// 📚 Configurar documentación Swagger
app.use(API_ENDPOINTS.API_DOCS, swaggerUi.serve, swaggerUi.setup(swaggerSpec, swaggerUiOptions));

// 📄 Endpoint para descargar especificación OpenAPI en JSON
app.get(API_ENDPOINTS.SWAGGER_JSON, (req, res) => {
  res.setHeader(HTTP_HEADERS.CONTENT_TYPE, HTTP_HEADERS.CONTENT_TYPE_JSON);
  res.send(swaggerSpec);
});

// 🧪 Endpoint de test simple para Vercel
app.get(API_ENDPOINTS.TEST, (req, res) => {
  successResponse(res, GENERAL_MESSAGES.SERVER_HEALTH, {
    environment: process.env.NODE_ENV || ENV_CONFIG.NODE_ENV_UNKNOWN
  });
});

// Registrar rutas de forma dinámica para todas las versiones soportadas
registerVersionedRoutes(app, API_ENDPOINTS.AUTH_BASE, authRoutes, [authLimiter]); // Aplicar rate limiting específico para auth
registerVersionedRoutes(app, API_ENDPOINTS.PRODUCTS_BASE, productsRoutes); // Sin rate limiting general, se aplica específicamente en /create
registerVersionedRoutes(app, API_ENDPOINTS.CATEGORY_BASE, categoryRoutes); // Rutas de categoria y subcategoria

// Registrar endpoints de información para cada versión (/api/v1, /api/v2, etc.)
registerVersionInfoEndpoints(app);

/**
 * @swagger
 * tags:
 *   - name: System
 *     description: Endpoints de información general y configuración del sistema
 *   - name: Health
 *     description: Endpoints de estado y salud de la API - monitoreo básico y completo
 *   - name: Metrics
 *     description: Endpoints de métricas y rendimiento del sistema - datos para dashboards
 *   - name: Debug
 *     description: Endpoints de información técnica y debugging para administradores
 *   - name: Auth
 *     description: Endpoints de autenticación y autorización de usuarios
 *   - name: Products
 *     description: Gestión completa de productos de volleyball
 *   - name: Category and Subcategory
 *     description: Gestión de categorías y subcategorías de productos
 * /api:
 *   get:
 *     summary: Información de la API
 *     description: Devuelve información general sobre la API y sus versiones
 *     tags: [System]
 *     responses:
 *       200:
 *         description: Información de la API obtenida exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Endpoint de información de la API RESTful VolleyballArt
 *                 payload:
 *                   type: object
 *                   properties:
 *                     currentVersion:
 *                       type: string
 *                       example: v1
 *                     supportedVersions:
 *                       type: array
 *                       items:
 *                         type: string
 *                       example: ["v1"]
 *                     documentation:
 *                       type: string
 *                       example: https://api.example.com/api/docs
 *                     health:
 *                       type: string
 *                       example: https://api.example.com/api/health
 */

app.get(API_ENDPOINTS.API_ROOT, (req, res) => {
  const versionInfo = getVersionInfo();
  const baseUrl = getBaseUrl();
  const urls = getEndpointUrls(baseUrl);

  successResponse(res, GENERAL_MESSAGES.API_INFO, {
    ...versionInfo,
    ...urls
  });
});

// ==============================================================
// HEALTH CHECK Y MÉTRICAS ENDPOINTS
// ==============================================================

/**
 * @swagger
 * /api/health:
 *   get:
 *     summary: Health Check básico del servidor
 *     description: |
 *       Verificación rápida de estado del servidor para balanceadores de carga.
 *       Retorna información básica sobre el estado del servidor sin verificar dependencias.
 *     tags: [Health]
 *     responses:
 *       200:
 *         description: Servidor funcionando correctamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   enum: [healthy, unhealthy]
 *                   example: healthy
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *       503:
 *         description: Servidor con problemas de rendimiento
 */
app.get(API_ENDPOINTS.HEALTH, (req, res) => {
  const healthReport = quickHealthCheck();
  const statusCode = healthReport.status === HEALTH_CONSTANTS.STATUS_HEALTHY ? HTTP_STATUS.OK : HTTP_STATUS.SERVICE_UNAVAILABLE;
  res.status(statusCode).json(healthReport);
});

/**
 * @swagger
 * /api/health/full:
 *   get:
 *     summary: Health Check completo del sistema
 *     description: |
 *       Verificación completa del estado del sistema incluyendo:
 *       - Estado de la base de datos
 *       - Estado del cache
 *       - Métricas de rendimiento
 *       - Alertas del sistema
 *       - Dependencias externas
 *     tags: [Health]
 *     responses:
 *       200:
 *         description: Información completa del estado del sistema
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   enum: [healthy, degraded, unhealthy]
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *                 version:
 *                   type: string
 *                 uptime:
 *                   type: object
 *                 system:
 *                   type: object
 *                 dependencies:
 *                   type: object
 *                 performance:
 *                   type: object
 *                 alerts:
 *                   type: array
 */
app.get(API_ENDPOINTS_PATHS.HEALTH_FULL, async (req, res, next) => {
  try {
    const healthReport = await runFullHealthCheck();
    const statusCode = healthReport.status === HEALTH_CONSTANTS.STATUS_HEALTHY ? HTTP_STATUS.OK : 
                       healthReport.status === HEALTH_CONSTANTS.STATUS_DEGRADED ? HTTP_STATUS.OK : HTTP_STATUS.SERVICE_UNAVAILABLE;
    res.status(statusCode).json(healthReport);
  } catch (error) {
    next(new InternalServerError());
  }
});

/**
 * @swagger
 * /api/health/history:
 *   get:
 *     summary: Historial de health checks
 *     description: |
 *       Retorna el historial de verificaciones de salud realizadas,
 *       incluyendo estadísticas de disponibilidad del sistema.
 *     tags: [Health]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Historial de health checks obtenido exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 checks:
 *                   type: array
 *                   description: Últimos 50 health checks
 *                 summary:
 *                   type: object
 *                   properties:
 *                     totalChecks:
 *                       type: number
 *                     uptime:
 *                       type: number
 *                     degraded:
 *                       type: number
 *                     unhealthy:
 *                       type: number
 *       401:
 *         description: Token de acceso requerido
 */
app.get(API_ENDPOINTS_PATHS.HEALTH_HISTORY, authentication, (req, res) => {
  const history = getHealthHistory();
  res.json(history);
});

/**
 * @swagger
 * /api/metrics:
 *   get:
 *     summary: Métricas en tiempo real del sistema
 *     description: |
 *       Proporciona métricas detalladas de rendimiento del sistema incluyendo:
 *       - CPU y memoria
 *       - Tiempos de respuesta de la API
 *       - Estadísticas de base de datos
 *       - Métricas de cache
 *     tags: [Metrics]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Métricas del sistema obtenidas exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *                 system:
 *                   type: object
 *                   properties:
 *                     cpu:
 *                       type: object
 *                     memory:
 *                       type: object
 *                     uptime:
 *                       type: number
 *                 api:
 *                   type: object
 *                   properties:
 *                     requests:
 *                       type: object
 *                     responseTime:
 *                       type: object
 *                     errors:
 *                       type: object
 *                 database:
 *                   type: object
 *                 cache:
 *                   type: object
 */
app.get(API_ENDPOINTS_PATHS.METRICS, authentication, async (req, res, next) => {
  try {
    const metrics = await calculatePerformanceMetrics();
    res.json({
      timestamp: new Date().toISOString(),
      ...metrics
    });
  } catch (error) {
    next(new InternalServerError());
  }
});

/**
 * @swagger
 * /api/metrics/prometheus:
 *   get:
 *     summary: Métricas en formato Prometheus
 *     description: |
 *       Endpoint para exportar métricas en formato Prometheus para monitoreo
 *       con herramientas como Grafana y sistemas de alertas.
 *     tags: [Metrics]
 *     security:
 *       - bearerAuth: []
 *     produces:
 *       - text/plain
 *     responses:
 *       200:
 *         description: Métricas en formato Prometheus
 *         content:
 *           text/plain:
 *             schema:
 *               type: string
 *               example: |
 *                 # HELP api_requests_total Total number of API requests
 *                 # TYPE api_requests_total counter
 *                 api_requests_total 1234
 */
app.get(API_ENDPOINTS_PATHS.METRICS_PROMETHEUS, authentication, async (req, res, next) => {
  try {
    const metrics = await calculatePerformanceMetrics();
    const prometheusFormat = formatMetricsForPrometheus(metrics);
    res.set(METRICS_CONSTANTS.CONTENT_TYPE_HEADER, METRICS_CONSTANTS.CONTENT_TYPE_TEXT_PLAIN);
    res.send(prometheusFormat);
  } catch (error) {
    next(new InternalServerError());
  }
});

/**
 * @swagger
 * /api/status:
 *   get:
 *     summary: Estado resumido del sistema
 *     description: |
 *       Proporciona un resumen del estado del sistema sin autenticación
 *       para dashboards públicos o páginas de estado.
 *     tags: [Health]
 *     responses:
 *       200:
 *         description: Estado del sistema obtenido exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   enum: [operational, degraded, down]
 *                 services:
 *                   type: object
 *                   properties:
 *                     api:
 *                       type: string
 *                     database:
 *                       type: string
 *                     cache:
 *                       type: string
 *                 lastUpdated:
 *                   type: string
 *                   format: date-time
 */
app.get(API_ENDPOINTS_PATHS.STATUS, async (req, res, next) => {
  try {
    const healthReport = await runFullHealthCheck();
    const systemStatus = {
      status: healthReport.status === HEALTH_CONSTANTS.STATUS_HEALTHY ? METRICS_CONSTANTS.STATUS_OPERATIONAL :
              healthReport.status === HEALTH_CONSTANTS.STATUS_DEGRADED ? HEALTH_CONSTANTS.STATUS_DEGRADED : METRICS_CONSTANTS.STATUS_DOWN,
      services: {
        api: healthReport.dependencies?.api?.status || METRICS_CONSTANTS.SERVICE_UNKNOWN,
        database: healthReport.dependencies?.database?.status || METRICS_CONSTANTS.SERVICE_UNKNOWN,
        cache: healthReport.dependencies?.cache?.status || METRICS_CONSTANTS.SERVICE_UNKNOWN
      },
      lastUpdated: healthReport.timestamp
    };
    
    res.json(systemStatus);
  } catch (error) {
    next(new InternalServerError());
  }
});

/**
 * @swagger
 * /api/debug/info:
 *   get:
 *     summary: Información de debug del sistema
 *     description: |
 *       Proporciona información detallada para debugging y soporte técnico.
 *       Solo disponible en modo desarrollo o para administradores.
 *     tags: [Debug]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Información de debug obtenida exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 environment:
 *                   type: string
 *                 version:
 *                   type: string
 *                 nodeVersion:
 *                   type: string
 *                 platform:
 *                   type: string
 *                 startTime:
 *                   type: string
 *                 config:
 *                   type: object
 */
app.get(API_ENDPOINTS_PATHS.DEBUG_INFO, authentication, (req, res) => {
  const debugInfo = {
    environment: process.env.NODE_ENV || METRICS_CONSTANTS.DEFAULT_ENVIRONMENT,
    version: process.env.npm_package_version || METRICS_CONSTANTS.DEFAULT_VERSION,
    nodeVersion: process.version,
    platform: process.platform,
    architecture: process.arch,
    startTime: process.env.START_TIME || new Date().toISOString(),
    uptime: process.uptime(),
    workingDirectory: process.cwd(),
    config: {
      port: process.env.PORT || ENV_CONFIG.PORT_DEFAULT,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      locale: Intl.DateTimeFormat().resolvedOptions().locale
    },
    memoryUsage: process.memoryUsage(),
    resourceUsage: process.resourceUsage ? process.resourceUsage() : null
  };
  
  res.json(debugInfo);
});

// ==============================================================
// ENDPOINTS DE AUTENTICACIÓN
// ==============================================================

/**
 * @swagger
 * /api/metrics:
 *   get:
 *     summary: Métricas detalladas de rendimiento
 *     description: Retorna métricas completas de rendimiento, memoria, cache y sistema (requiere autenticación)
 *     tags: [Health]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Métricas del sistema obtenidas exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "📊 Métricas del sistema obtenidas exitosamente"
 *                 payload:
 *                   type: object
 *       401:
 *         description: Token de acceso requerido
 *       403:
 *         description: Token inválido o expirado
 */
app.get(API_ENDPOINTS.METRICS, authentication, (req, res) => {
  const metrics = getPerformanceMetrics();
  successResponse(res, GENERAL_MESSAGES.SYSTEM_METRICS, metrics);
});

/**
 * @swagger
 * /api/cache/stats:
 *   get:
 *     summary: Estadísticas de cache
 *     description: Retorna estadísticas detalladas del sistema de cache (requiere autenticación)
 *     tags: [Health]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Estadísticas de cache obtenidas exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "📊 Estadísticas de cache obtenidas exitosamente"
 *                 payload:
 *                   type: object
 *       401:
 *         description: Token de acceso requerido
 *       403:
 *         description: Token inválido o expirado
 */
app.get(API_ENDPOINTS.CACHE_STATS, authentication, (req, res) => {
  const cacheStats = getCacheStats();
  successResponse(res, GENERAL_MESSAGES.CACHE_STATS, cacheStats);
});

/**
 * @swagger
 * /api/cache/clear:
 *   post:
 *     summary: Limpiar cache del sistema
 *     description: Limpia todo el cache del sistema y reinicia las estadísticas (requiere autenticación)
 *     tags: [Health]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Cache limpiado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "🧹 Cache limpiado exitosamente"
 *                 payload:
 *                   type: object
 *       401:
 *         description: Token de acceso requerido
 *       403:
 *         description: Token inválido o expirado
 */
app.post(API_ENDPOINTS.CACHE_CLEAR, authentication, (req, res) => {
  resetCacheStats();
  logMessage(LOG_LEVELS.INFO, SYSTEM_MESSAGES.CACHE_CLEARED_BY_USER, {
    userId: req.user?.uid,
    timestamp: new Date().toISOString()
  });
  successResponse(res, SYSTEM_MESSAGES.CACHE_CLEARED_SUCCESS);
});

// Redirigir la ruta raíz a la documentación de la API
app.get(API_ENDPOINTS.ROOT, (req, res, next) => {
  try {
    logMessage(LOG_LEVELS.INFO, SYSTEM_MESSAGES.ROOT_REDIRECT);
    res.redirect(API_ENDPOINTS.API_ROOT);
  } catch (error) {
    next(new InternalServerError());
  }
});

// 🔍 Endpoint de debug para Vercel
app.get(API_ENDPOINTS.DEBUG, (req, res, next) => {
  try {
    successResponse(res, SYSTEM_MESSAGES.DEBUG_INFO, {
      nodeVersion: process.version,
      environment: process.env.NODE_ENV,
      isVercel: !!process.env.VERCEL,
      vercelUrl: process.env.VERCEL_URL,
      baseUrl: getBaseUrl(),
      headers: req.headers
    });
  } catch (error) {
    next(new InternalServerError());
  }
});

// 🚫 Middleware para rutas no encontradas (debe ir antes del error handler)
app.use((req, res, next) => {
  next(new NotFoundError(`Ruta ${req.method} ${req.originalUrl} no encontrada`));
});

// 🚨 Middleware global de manejo de errores (debe ir al final)
app.use((error, req, res, next) => {
  // Convertir errores nativos a AppError si es necesario
  let appError = error;
  if (!(error instanceof AppError)) {
    if (error.code === DATABASE_ERROR_CODES.MONGODB_DUPLICATE_KEY || 
        error.name === 'ValidationError' || 
        error.name === 'CastError') {
      appError = formatDatabaseError(error);
    } else if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
      appError = formatJWTError(error);
    } else {
      appError = new InternalServerError(error.message || SERVICE_MESSAGES.INTERNAL_SERVER_ERROR_DEFAULT);
    }
  }

  // Respuesta usando la estructura del AppError
  res.status(appError.statusCode).json({
    message: appError.message,
    payload: {
      statusCode: appError.statusCode,
      timestamp: appError.timestamp,
      path: req.originalUrl,
      method: req.method,
      ...(appError.details && { details: appError.details })
    }
  });
});

// 🎧 Iniciar servidor
app.listen(PORT, () => {
  const baseUrl = getBaseUrl();
  logServerInfo(baseUrl, PORT);
});
