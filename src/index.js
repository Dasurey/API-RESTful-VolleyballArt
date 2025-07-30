import express from 'express';
import config from 'dotenv';
import cors from 'cors';
import { join, __dirname } from "./utils/index.js";

// 📊 Sistema de logging
import Logger from './config/logger.js';
import { httpLogger, devLogger, requestLogger } from './middlewares/logger.middleware.js';
import { errorHandler, jsonErrorHandler, notFoundHandler } from './middlewares/error.middleware.js';

import productsRoutes from './routes/products.routes.js';
import authRoutes from './routes/auth.routes.js';

import { authentication } from './middlewares/authentication.js';
import { versionMiddleware, registerVersionedRoutes, registerVersionInfoEndpoints } from './middlewares/version.middleware.js';
import { getVersionInfo } from './config/api-versions.js';

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
app.use(express.json({ limit: '10mb' }));
app.use(express.static(join(__dirname, "public")));
app.use(express.urlencoded({ extended: true }));

// 📊 Logging HTTP - aplicar antes de las rutas
app.use(process.env.NODE_ENV === 'development' ? devLogger : httpLogger);
app.use(requestLogger);

// ⚠️ Middleware para capturar errores de JSON malformado
app.use(jsonErrorHandler);

app.use(cors(corsOptions));

// Aplicar middleware de versioning
app.use(versionMiddleware);

// Registrar rutas de forma dinámica para todas las versiones soportadas
registerVersionedRoutes(app, '/auth', authRoutes);
registerVersionedRoutes(app, '/products', productsRoutes);

// Registrar endpoints de información para cada versión (/api/v1, /api/v2, etc.)
registerVersionInfoEndpoints(app);

// Endpoint de información de la API
app.get('/api', (req, res) => {
  const versionInfo = getVersionInfo();
  res.json({
    message: 'Endpoint de información de la API RESTful VolleyballArt',
    payload: {
      ...versionInfo,
      documentation: `${req.protocol}://${req.get('host')}/api/docs`,
      health: `${req.protocol}://${req.get('host')}/api/health`
    }
  });
});

// Endpoint de salud de la API
app.get('/api/health', (req, res) => {
  const healthInfo = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: req.apiVersion,
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    environment: process.env.NODE_ENV || 'development'
  };
  
  Logger.info('💚 Health check realizado', healthInfo);
  res.json(healthInfo);
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

const PORT = process.env.PORT || 5000;

// 🎧 Iniciar servidor
app.listen(PORT, () => {
  Logger.info(`✅ Servidor iniciado exitosamente`, {
    port: PORT,
    url: `http://localhost:${PORT}`,
    environment: process.env.NODE_ENV || 'development',
    pid: process.pid,
    timestamp: new Date().toISOString()
  });
  
  console.log(`🌐 Server running on http://localhost:${PORT}`);
  console.log(`📚 API Documentation: http://localhost:${PORT}/api`);
  console.log(`💚 Health Check: http://localhost:${PORT}/api/health`);
});
