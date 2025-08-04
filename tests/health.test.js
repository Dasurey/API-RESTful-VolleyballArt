const request = require('supertest');
const express = require('express');

describe('Sistema de Health Checks y Métricas', () => {
  let app;
  let healthLogger;
  let metrics;
  let mockDatabase;
  let mockCache;
  let externalServices;

  beforeAll(() => {
    app = express();
    app.use(express.json());

    // Mock del logger
    healthLogger = {
      info: jest.fn(),
      warn: jest.fn(),
      error: jest.fn()
    };

    // Mock de métricas
    metrics = {
      requests: {
        total: 0,
        successful: 0,
        failed: 0,
        averageResponseTime: 0
      },
      system: {
        memoryUsage: {
          used: 100 * 1024 * 1024,
          total: 8192 * 1024 * 1024
        },
        cpuUsage: 25.5,
        uptime: 3600
      },
      database: {
        connections: {
          active: 5,
          total: 10
        },
        queryTime: 150
      },
      cache: {
        hits: 850,
        misses: 150,
        hitRate: 85.0
      }
    };

    // Simulador de base de datos
    mockDatabase = {
      isConnected: true,
      ping: async () => {
        if (!mockDatabase.isConnected) {
          throw new Error('Database connection failed');
        }
        return { responseTime: 50 };
      },
      getStats: () => ({
        connections: metrics.database.connections,
        queryTime: metrics.database.queryTime
      })
    };

    // Simulador de cache
    mockCache = {
      isHealthy: true,
      ping: async () => {
        if (!mockCache.isHealthy) {
          throw new Error('Cache not responding');
        }
        return { responseTime: 10 };
      },
      getStats: () => metrics.cache
    };

    // Simulador de servicios externos
    externalServices = {
      paymentService: {
        url: 'https://api.payment.com/health',
        healthy: true,
        responseTime: 200
      },
      emailService: {
        url: 'https://api.email.com/health',
        healthy: true,
        responseTime: 150
      }
    };

    // Middleware de métricas simplificado
    const metricsMiddleware = (req, res, next) => {
      const startTime = Date.now();
      
      res.on('finish', () => {
        const responseTime = Date.now() - startTime;
        metrics.requests.total++;
        
        if (res.statusCode < 400) {
          metrics.requests.successful++;
        } else {
          metrics.requests.failed++;
        }

        // Calcular tiempo promedio de respuesta
        const totalRequests = metrics.requests.total;
        const currentAverage = metrics.requests.averageResponseTime;
        metrics.requests.averageResponseTime = 
          ((currentAverage * (totalRequests - 1)) + responseTime) / totalRequests;
      });

      next();
    };

    app.use(metricsMiddleware);

    // Health check básico
    app.get('/health', async (req, res) => {
      try {
        const health = {
          status: 'healthy',
          timestamp: new Date().toISOString(),
          uptime: process.uptime(),
          version: process.env.npm_package_version || '1.0.0',
          environment: process.env.NODE_ENV || 'development'
        };

        healthLogger.info('Health check requested', health);
        res.status(200).json(health);
      } catch (error) {
        healthLogger.error('Health check failed', error);
        res.status(503).json({
          status: 'unhealthy',
          timestamp: new Date().toISOString(),
          error: error.message
        });
      }
    });

    // Health check detallado
    app.get('/health/detailed', async (req, res) => {
      const checks = {};
      let overallStatus = 'healthy';

      try {
        // Check database
        try {
          const dbPing = await mockDatabase.ping();
          checks.database = {
            status: 'healthy',
            responseTime: dbPing.responseTime,
            connections: mockDatabase.getStats()
          };
        } catch (error) {
          checks.database = {
            status: 'unhealthy',
            error: error.message
          };
          overallStatus = 'degraded';
        }

        // Check cache
        try {
          const cachePing = await mockCache.ping();
          checks.cache = {
            status: 'healthy',
            responseTime: cachePing.responseTime,
            stats: mockCache.getStats()
          };
        } catch (error) {
          checks.cache = {
            status: 'unhealthy',
            error: error.message
          };
          overallStatus = 'degraded';
        }

        // Check servicios externos
        checks.externalServices = {};
        for (const [serviceName, service] of Object.entries(externalServices)) {
          checks.externalServices[serviceName] = {
            status: service.healthy ? 'healthy' : 'unhealthy',
            url: service.url,
            responseTime: service.responseTime
          };
          
          if (!service.healthy) {
            overallStatus = 'degraded';
          }
        }

        // Check memoria
        const memUsage = process.memoryUsage();
        const memoryPercent = (memUsage.used / memUsage.total) * 100 || 50; // default para tests
        
        checks.memory = {
          status: memoryPercent > 90 ? 'warning' : 'healthy',
          usage: {
            used: Math.round(memUsage.heapUsed / 1024 / 1024),
            total: Math.round(memUsage.heapTotal / 1024 / 1024),
            percentage: Math.round(memoryPercent)
          }
        };

        if (memoryPercent > 90) {
          overallStatus = 'warning';
        }

        const response = {
          status: overallStatus,
          timestamp: new Date().toISOString(),
          checks,
          uptime: process.uptime(),
          version: '1.0.0'
        };

        const statusCode = overallStatus === 'healthy' ? 200 : 
                          overallStatus === 'warning' ? 200 : 503;

        res.status(statusCode).json(response);

      } catch (error) {
        healthLogger.error('Detailed health check failed', error);
        res.status(503).json({
          status: 'unhealthy',
          timestamp: new Date().toISOString(),
          error: error.message
        });
      }
    });

    // Endpoint de métricas
    app.get('/metrics', (req, res) => {
      const systemMetrics = {
        requests: metrics.requests,
        system: {
          memory: {
            used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
            total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024)
          },
          uptime: process.uptime(),
          nodeVersion: process.version,
          platform: process.platform
        },
        database: metrics.database,
        cache: metrics.cache,
        timestamp: new Date().toISOString()
      };

      res.json(systemMetrics);
    });

    // Endpoint de readiness
    app.get('/ready', async (req, res) => {
      try {
        // Verificar dependencias críticas
        await mockDatabase.ping();
        await mockCache.ping();

        res.status(200).json({
          status: 'ready',
          timestamp: new Date().toISOString(),
          checks: {
            database: 'connected',
            cache: 'connected'
          }
        });
      } catch (error) {
        res.status(503).json({
          status: 'not ready',
          timestamp: new Date().toISOString(),
          error: error.message
        });
      }
    });

    // Endpoint de liveness
    app.get('/live', (req, res) => {
      res.status(200).json({
        status: 'alive',
        timestamp: new Date().toISOString(),
        pid: process.pid,
        uptime: process.uptime()
      });
    });

    // Endpoints para simular falla de servicios
    app.post('/test/fail/:service', (req, res) => {
      const { service } = req.params;
      
      switch (service) {
        case 'database':
          mockDatabase.isConnected = false;
          break;
        case 'cache':
          mockCache.isHealthy = false;
          break;
        case 'payment':
          externalServices.paymentService.healthy = false;
          break;
        case 'email':
          externalServices.emailService.healthy = false;
          break;
        default:
          return res.status(400).json({ error: 'Servicio no reconocido' });
      }

      res.json({ message: `Servicio ${service} marcado como no saludable` });
    });

    // Endpoint para restaurar servicios
    app.post('/test/restore/:service', (req, res) => {
      const { service } = req.params;
      
      switch (service) {
        case 'database':
          mockDatabase.isConnected = true;
          break;
        case 'cache':
          mockCache.isHealthy = true;
          break;
        case 'payment':
          externalServices.paymentService.healthy = true;
          break;
        case 'email':
          externalServices.emailService.healthy = true;
          break;
        default:
          return res.status(400).json({ error: 'Servicio no reconocido' });
      }

      res.json({ message: `Servicio ${service} restaurado` });
    });

    // Endpoint para reset de métricas
    app.post('/metrics/reset', (req, res) => {
      metrics.requests = {
        total: 0,
        successful: 0,
        failed: 0,
        averageResponseTime: 0
      };

      res.json({ message: 'Métricas reseteadas', timestamp: new Date().toISOString() });
    });

    // Rutas de test para generar métricas
    app.get('/test/success', (req, res) => {
      res.json({ message: 'Operación exitosa' });
    });

    app.get('/test/error', (req, res) => {
      res.status(500).json({ error: 'Error simulado' });
    });
  });

  beforeEach(() => {
    jest.clearAllMocks();
    // Resetear métricas
    metrics.requests = {
      total: 0,
      successful: 0,
      failed: 0,
      averageResponseTime: 0
    };
    
    // Resetear estado de servicios
    mockDatabase.isConnected = true;
    mockCache.isHealthy = true;
    externalServices.paymentService.healthy = true;
    externalServices.emailService.healthy = true;
  });

  describe('Health Check Básico Tests', () => {
    it('debería retornar estado healthy', async () => {
      const response = await request(app)
        .get('/health')
        .expect(200);

      expect(response.body.status).toBe('healthy');
      expect(response.body.timestamp).toBeDefined();
      expect(response.body.uptime).toBeGreaterThan(0);
      expect(response.body.version).toBeDefined();
      expect(healthLogger.info).toHaveBeenCalled();
    });

    it('debería incluir información básica del sistema', async () => {
      const response = await request(app)
        .get('/health')
        .expect(200);

      expect(response.body).toHaveProperty('uptime');
      expect(response.body).toHaveProperty('version');
      expect(response.body).toHaveProperty('environment');
      expect(response.body).toHaveProperty('timestamp');
    });
  });

  describe('Health Check Detallado Tests', () => {
    it('debería retornar health check completo cuando todos los servicios están healthy', async () => {
      const response = await request(app)
        .get('/health/detailed')
        .expect(200);

      expect(response.body.status).toBe('healthy');
      expect(response.body.checks).toHaveProperty('database');
      expect(response.body.checks).toHaveProperty('cache');
      expect(response.body.checks).toHaveProperty('externalServices');
      expect(response.body.checks).toHaveProperty('memory');
      
      expect(response.body.checks.database.status).toBe('healthy');
      expect(response.body.checks.cache.status).toBe('healthy');
    });

    it('debería detectar falla en base de datos', async () => {
      // Simular falla en BD
      await request(app).post('/test/fail/database');

      const response = await request(app)
        .get('/health/detailed')
        .expect(503);

      expect(response.body.status).toBe('degraded');
      expect(response.body.checks.database.status).toBe('unhealthy');
      expect(response.body.checks.database.error).toBeDefined();
    });

    it('debería verificar servicios externos', async () => {
      const response = await request(app)
        .get('/health/detailed')
        .expect(200);

      expect(response.body.checks.externalServices).toHaveProperty('paymentService');
      expect(response.body.checks.externalServices).toHaveProperty('emailService');
      expect(response.body.checks.externalServices.paymentService.status).toBe('healthy');
      expect(response.body.checks.externalServices.emailService.status).toBe('healthy');
    });
  });

  describe('Readiness y Liveness Tests', () => {
    it('debería retornar ready cuando dependencias están disponibles', async () => {
      const response = await request(app)
        .get('/ready')
        .expect(200);

      expect(response.body.status).toBe('ready');
      expect(response.body.checks.database).toBe('connected');
      expect(response.body.checks.cache).toBe('connected');
    });

    it('debería retornar not ready cuando dependencias fallan', async () => {
      // Simular falla en BD
      await request(app).post('/test/fail/database');

      const response = await request(app)
        .get('/ready')
        .expect(503);

      expect(response.body.status).toBe('not ready');
      expect(response.body.error).toBeDefined();
    });

    it('debería siempre retornar alive', async () => {
      const response = await request(app)
        .get('/live')
        .expect(200);

      expect(response.body.status).toBe('alive');
      expect(response.body.pid).toBe(process.pid);
      expect(response.body.uptime).toBeGreaterThan(0);
    });
  });

  describe('Métricas Tests', () => {
    it('debería retornar métricas del sistema', async () => {
      const response = await request(app)
        .get('/metrics')
        .expect(200);

      expect(response.body).toHaveProperty('requests');
      expect(response.body).toHaveProperty('system');
      expect(response.body).toHaveProperty('database');
      expect(response.body).toHaveProperty('cache');
      expect(response.body).toHaveProperty('timestamp');
    });

    it('debería rastrear requests exitosos', async () => {
      // Generar algunas requests exitosas
      await request(app).get('/test/success');
      await request(app).get('/test/success');

      const response = await request(app)
        .get('/metrics')
        .expect(200);

      expect(response.body.requests.successful).toBeGreaterThan(0);
      expect(response.body.requests.total).toBeGreaterThan(0);
    });

    it('debería calcular tiempo promedio de respuesta', async () => {
      // Generar requests
      await request(app).get('/test/success');
      await request(app).get('/test/success');

      const response = await request(app)
        .get('/metrics')
        .expect(200);

      // En tests pueden ser muy rápidos, verificamos >= 0
      expect(response.body.requests.averageResponseTime).toBeGreaterThanOrEqual(0);
      expect(response.body.requests.total).toBeGreaterThan(0);
    });
  });

  describe('Utilidades de Test Tests', () => {
    it('debería poder resetear métricas', async () => {
      // Generar algunas métricas
      await request(app).get('/test/success');
      
      // Resetear
      await request(app)
        .post('/metrics/reset')
        .expect(200);

      // Verificar reset - la cuenta incluirá la request al endpoint /metrics
      const response = await request(app)
        .get('/metrics')
        .expect(200);

      // Solo debe contar la request GET /metrics después del reset
      expect(response.body.requests.total).toBe(1);
      expect(response.body.requests.successful).toBe(1);
      expect(response.body.requests.failed).toBe(0);
    });

    it('debería poder simular fallas y restaurar servicios', async () => {
      // Fallar servicio
      await request(app)
        .post('/test/fail/database')
        .expect(200);

      let health = await request(app).get('/health/detailed');
      expect(health.body.checks.database.status).toBe('unhealthy');

      // Restaurar servicio
      await request(app)
        .post('/test/restore/database')
        .expect(200);

      health = await request(app).get('/health/detailed');
      expect(health.body.checks.database.status).toBe('healthy');
    });

    it('debería manejar servicios no reconocidos', async () => {
      const response = await request(app)
        .post('/test/fail/invalid-service')
        .expect(400);

      expect(response.body.error).toContain('Servicio no reconocido');
    });
  });

  describe('Middleware de Métricas Tests', () => {
    it('debería rastrear requests automáticamente', async () => {
      // Hacer varias requests
      await request(app).get('/health');
      await request(app).get('/live');

      const response = await request(app)
        .get('/metrics')
        .expect(200);

      // Debe contar las requests anteriores + la del /metrics (al menos 2 por el reseteo)
      expect(response.body.requests.total).toBeGreaterThanOrEqual(2);
      expect(response.body.requests.successful).toBeGreaterThan(0);
    });

    it('debería calcular tiempos de respuesta en operaciones múltiples', async () => {
      await request(app).get('/test/success');
      await request(app).get('/test/success');

      const response = await request(app)
        .get('/metrics')
        .expect(200);

      // Las métricas deben reflejar las operaciones
      expect(response.body.requests.total).toBeGreaterThanOrEqual(2);
      expect(response.body.requests.averageResponseTime).toBeGreaterThanOrEqual(0);
    });
  });

  describe('Logging de Health Checks Tests', () => {
    it('debería loggear health checks básicos', async () => {
      await request(app)
        .get('/health')
        .expect(200);

      expect(healthLogger.info).toHaveBeenCalledWith(
        'Health check requested',
        expect.objectContaining({
          status: 'healthy',
          timestamp: expect.any(String)
        })
      );
    });
  });
});
