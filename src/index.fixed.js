const express = require('express');
const config = require('dotenv');
const cors = require('cors');
const { fileURLToPath } = require('url');
const { dirname } = require('path');
const path = require('path');

// 📊 Sistema de logging
const Logger = require('./config/logger.js');
const { httpLogger, devLogger, requestLogger } = require('./middlewares/logger.middleware.js');
const { errorHandler, jsonErrorHandler, notFoundHandler } = require('./middlewares/error.middleware.js');

// 🛡️ Sistema de seguridad
const { helmetConfig, generalLimiter, authLimiter, createLimiter } = require('./config/security.js');
const { sanitizeInput, sanitizeHtml } = require('./middlewares/sanitization.middleware.js');

// ⚡ Sistema de cache y optimización
const { 
  compressionMiddleware, 
  optimizeResponse, 
  minifyJson, 
  performanceHeaders 
} = require('./config/optimization.js');
const { getCacheStats, resetCacheStats } = require('./config/cache.js');
const { 
  performanceMonitor, 
  getPerformanceMetrics, 
  healthCheckWithMetrics 
} = require('./middlewares/performance.middleware.js');

// 📚 Sistema de documentación
const { swaggerSpec, swaggerUi, swaggerUiOptions } = require('./config/swagger.js');

const productsRoutes = require('./routes/products.routes.js');
const authRoutes = require('./routes/auth.routes.js');

const { authentication } = require('./middlewares/authentication.js');
const { versionMiddleware, registerVersionedRoutes, registerVersionInfoEndpoints } = require('./middlewares/version.middleware.js');
const { getVersionInfo } = require('./config/api-versions.js');

// 🌐 Configuración de variables de entorno
config.config();

// 🔧 Configuración de rutas del proyecto
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();

// 📊 Iniciar logging del sistema
Logger.info('🚀 Iniciando servidor VolleyballArt API...', {
  nodeVersion: process.version,
  environment: process.env.NODE_ENV || 'development',
  timestamp: new Date().toISOString()
});

const corsOptions = {
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
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

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// 🧹 Middlewares de sanitización
app.use(sanitizeInput); // Prevenir NoSQL injection
app.use(sanitizeHtml); // Limpiar HTML/XSS

// 📊 Logging HTTP - aplicar antes de las rutas
app.use(process.env.NODE_ENV === 'development' ? devLogger : httpLogger);
app.use(requestLogger);

// ⚠️ Middleware para capturar errores de JSON malformado
app.use(jsonErrorHandler);

app.use(cors(corsOptions));

// Aplicar middleware de versioning
app.use(versionMiddleware);

// 📚 Configurar documentación Swagger
app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, swaggerUiOptions));

// 📄 Endpoint para descargar especificación OpenAPI en JSON
app.get('/api/swagger.json', (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.send(swaggerSpec);
});

// Registrar rutas de forma dinámica para todas las versiones soportadas
registerVersionedRoutes(app, '/auth', authRoutes, [authLimiter]); // Aplicar rate limiting específico para auth
registerVersionedRoutes(app, '/products', productsRoutes); // Sin rate limiting general, se aplica específicamente en /create

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
app.get('/api', (req, res) => {
  const versionInfo = getVersionInfo();
  const baseUrl = getBaseUrl(req);
  
  res.json({
    message: 'Endpoint de información de la API RESTful VolleyballArt',
    payload: {
      ...versionInfo,
      documentation: `${baseUrl}/api/docs`,
      health: `${baseUrl}/api/health`,
      metrics: `${baseUrl}/api/metrics`,
      cache: `${baseUrl}/api/cache/stats`
    }
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
app.get('/api/health', healthCheckWithMetrics);

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
app.get('/api/metrics', authentication, (req, res) => {
  const metrics = getPerformanceMetrics();
  res.json({
    message: 'Métricas del sistema',
    payload: metrics
  });
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
app.get('/api/cache/stats', authentication, (req, res) => {
  const cacheStats = getCacheStats();
  res.json({
    message: 'Estadísticas de cache',
    payload: cacheStats
  });
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
app.post('/api/cache/clear', authentication, (req, res) => {
  resetCacheStats();
  Logger.info('🗑️ Cache limpiado por usuario', {
    userId: req.user?.uid,
    timestamp: new Date().toISOString()
  });
  res.json({
    message: 'Cache limpiado exitosamente',
    timestamp: new Date().toISOString()
  });
});

// Redirigir la ruta raíz a la documentación de la API
app.get('/', (req, res) => {
  Logger.info('🏠 Acceso a ruta raíz, redirigiendo a /api');
  res.redirect('/api');
});

// 🚫 Middleware para rutas no encontradas (debe ir antes del error handler)
app.use(notFoundHandler);

// 🚨 Middleware global de manejo de errores (debe ir al final)
app.use(errorHandler);

// 🌐 Función para generar URL base según el entorno
const getBaseUrl = (req = null) => {
  if (process.env.NODE_ENV === 'production') {
    // En producción (Vercel), usar la URL del deployment
    if (process.env.VERCEL_URL) {
      return `https://${process.env.VERCEL_URL}`;
    }
    // Si hay un request, usar el host del request
    if (req) {
      const protocol = req.headers['x-forwarded-proto'] || (req.connection.encrypted ? 'https' : 'http');
      return `${protocol}://${req.get('host')}`;
    }
    // URL por defecto para producción
    return `https://volleyball-art-api.vercel.app`;
  } else {
    // En desarrollo, usar localhost con puerto dinámico
    const PORT = process.env.PORT || 5000;
    return `http://localhost:${PORT}`;
  }
};

// 📁 Función para obtener rutas de archivos locales (usando __dirname)
const getProjectPath = (relativePath = '') => {
  return path.join(__dirname, '..', relativePath);
};

const PORT = process.env.PORT || 5000;

// 🎧 Iniciar servidor
app.listen(PORT, () => {
  const baseUrl = getBaseUrl();
  
  Logger.info(`✅ Servidor iniciado exitosamente`, {
    port: PORT,
    url: baseUrl,
    environment: process.env.NODE_ENV || 'development',
    pid: process.pid,
    timestamp: new Date().toISOString()
  });
  
  // Mostrar URLs según el entorno
  console.log(`🌐 Server running on ${baseUrl}`);
  console.log(`📚 API Documentation: ${baseUrl}/api`);
  console.log(`📖 Swagger Docs: ${baseUrl}/api/docs`);
  console.log(`💚 Health Check: ${baseUrl}/api/health`);
  console.log(`📊 Performance Metrics: ${baseUrl}/api/metrics`);
  console.log(`🗄️ Cache Stats: ${baseUrl}/api/cache/stats`);
  console.log(`📄 OpenAPI Spec: ${baseUrl}/api/swagger.json`);
  
  // Información adicional en desarrollo
  if (process.env.NODE_ENV !== 'production') {
    console.log(`\n🔧 Development Mode:`);
    console.log(`   • Auto-reload: Active`);
    console.log(`   • Debug logging: Enabled`);
    console.log(`   • Cache TTL: Short for testing`);
    console.log(`   • CORS: Permissive (*)`);
  } else {
    console.log(`\n🚀 Production Mode:`);
    console.log(`   • Optimizations: Active`);
    console.log(`   • Compression: Enabled`);
    console.log(`   • Cache: Long TTL`);
    console.log(`   • Security: Enhanced`);
  }
});
