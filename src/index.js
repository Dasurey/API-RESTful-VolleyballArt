const { 
  EXTERNAL_PACKAGES, 
  PATHS, 
  API_ENDPOINTS, 
  ENV_CONFIG, 
  HTTP_HEADERS, 
  HTTP_METHODS,
  NODE_EVENTS,
  LOG_LEVELS,
  COMMON_VALUES
} = require('./config/paths.js');

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
const { errorHandler, jsonErrorHandler, notFoundHandler } = require(PATHS.MIDDLEWARES.ERROR);

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
const { GENERAL_MESSAGES, LOG_MESSAGES, SYSTEM_MESSAGES } = require('./utils/messages.utils.js');
const { versionMiddleware, registerVersionedRoutes, registerVersionInfoEndpoints } = require(PATHS.MIDDLEWARES.VERSION);
const { getVersionInfo } = require(PATHS.CONFIG.API_VERSIONS);

// 🔧 Utilidades para URLs y paths (incluyendo middleware dinámico para Swagger)
const { __dirname: projectDir, join, updateSwaggerUrl, getBaseUrl } = require(PATHS.UTILS.URL_UTILS);

// 🔧 Utilidades centralizadas para respuestas y logging
const { logMessage, successResponse, errorResponse, safeAsync, getEndpointUrls, logServerInfo } = require(PATHS.UTILS.RESPONSE_UTILS);

// 🌐 Configuración de variables de entorno
// Ya configurado con require('dotenv').config() arriba
const PORT = process.env.PORT || ENV_CONFIG.PORT_DEFAULT;

const app = express();

// � Manejador de errores no capturados (especialmente importante en Vercel)
process.on(NODE_EVENTS.UNCAUGHT_EXCEPTION, (err) => {
  logMessage(LOG_LEVELS.ERROR, SYSTEM_MESSAGES.UNCAUGHT_EXCEPTION, { error: err.message, stack: err.stack });
  process.exit(COMMON_VALUES.PROCESS_EXIT_CODE);
});

process.on(NODE_EVENTS.UNHANDLED_REJECTION, (reason, promise) => {
  logMessage(LOG_LEVELS.ERROR, SYSTEM_MESSAGES.UNHANDLED_REJECTION, { reason, promise });
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
app.use(express.urlencoded({ extended: COMMON_VALUES.EXTENDED_TRUE }));

// 📁 Archivos estáticos usando utilidades CommonJS
app.use(express.static(join(projectDir, API_ENDPOINTS.PUBLIC_DIR)));

// 🧹 Middlewares de sanitización
app.use(sanitizeInput); // Prevenir NoSQL injection
app.use(sanitizeHtml); // Limpiar HTML/XSS

// 📊 Logging HTTP - aplicar antes de las rutas
app.use(process.env.NODE_ENV === ENV_CONFIG.NODE_ENV_DEVELOPMENT ? devLogger : httpLogger);
app.use(requestLogger);

// ⚠️ Middleware para capturar errores de JSON malformado
app.use(jsonErrorHandler);

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

/**
 * @swagger
 * /api/health:
 *   get:
 *     summary: Verificación de estado del servidor con métricas avanzadas
 *     description: Retorna información completa sobre el estado del servidor incluyendo métricas de rendimiento
 *     tags: [System]
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
 *                   example: healthy
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *                 uptime:
 *                   type: object
 *                 memory:
 *                   type: object
 *                 performance:
 *                   type: object
 *                 cache:
 *                   type: object
 */
app.get(API_ENDPOINTS.HEALTH, healthCheckWithMetrics);

/**
 * @swagger
 * /api/metrics:
 *   get:
 *     summary: Métricas detalladas de rendimiento
 *     description: Retorna métricas completas de rendimiento, cache y sistema
 *     tags: [System]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Métricas del sistema
 *         content:
 *           application/json:
 *             schema:
 *               type: object
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
 *     description: Retorna estadísticas detalladas del sistema de cache
 *     tags: [System]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Estadísticas de cache
 */
app.get(API_ENDPOINTS.CACHE_STATS, authentication, (req, res) => {
  const cacheStats = getCacheStats();
  successResponse(res, GENERAL_MESSAGES.CACHE_STATS, cacheStats);
});

/**
 * @swagger
 * /api/cache/clear:
 *   post:
 *     summary: Limpiar cache
 *     description: Limpia todo el cache del sistema
 *     tags: [System]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Cache limpiado exitosamente
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
app.get(API_ENDPOINTS.ROOT, (req, res) => {
  safeAsync(async () => {
    logMessage(LOG_LEVELS.INFO, SYSTEM_MESSAGES.ROOT_REDIRECT);
    res.redirect(API_ENDPOINTS.API_ROOT);
  }, res, LOG_MESSAGES.ROOT_ROUTE_ERROR);
});

// 🔍 Endpoint de debug para Vercel
app.get(API_ENDPOINTS.DEBUG, (req, res) => {
  safeAsync(async () => {
    successResponse(res, SYSTEM_MESSAGES.DEBUG_INFO, {
      nodeVersion: process.version,
      environment: process.env.NODE_ENV,
      isVercel: !!process.env.VERCEL,
      vercelUrl: process.env.VERCEL_URL,
      baseUrl: getBaseUrl(),
      headers: req.headers
    });
  }, res, SYSTEM_MESSAGES.DEBUG_ENDPOINT_ERROR);
});

// 🚫 Middleware para rutas no encontradas (debe ir antes del error handler)
app.use(notFoundHandler);

// 🚨 Middleware global de manejo de errores (debe ir al final)
app.use(errorHandler);

// 🎧 Iniciar servidor
app.listen(PORT, () => {
  const baseUrl = getBaseUrl();
  logServerInfo(baseUrl, PORT);
});
