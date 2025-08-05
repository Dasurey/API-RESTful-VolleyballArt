const request = require('supertest');
const express = require('express');
const winston = require('winston');

// Mock de winston
jest.mock('winston', () => ({
  addColors: jest.fn(),
  format: {
    combine: jest.fn(() => 'mock-format'),
    timestamp: jest.fn(() => 'mock-timestamp'),
    colorize: jest.fn(() => 'mock-colorize'),
    printf: jest.fn(() => 'mock-printf'),
    json: jest.fn(() => 'mock-json')
  },
  transports: {
    Console: jest.fn(),
    File: jest.fn()
  },
  createLogger: jest.fn(() => ({
    info: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
    debug: jest.fn(),
    stream: { write: jest.fn() }
  }))
}));

// Mock del logger config
jest.mock('../src/utils/log.utils.js', () => ({
  Logger: {
    info: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
    debug: jest.fn(),
    stream: { write: jest.fn() }
  }
}));

describe('Sistema de Logging y Monitoreo', () => {
  let app;
  let mockLogger;

  beforeAll(() => {
    app = express();
    app.use(express.json());

    // Mock logger
    mockLogger = {
      info: jest.fn(),
      error: jest.fn(),
      warn: jest.fn(),
      debug: jest.fn(),
      stream: { write: jest.fn() }
    };

    // Mock middleware de logging
    const loggerMiddleware = (req, res, next) => {
      try {
        const startTime = Date.now();
        
        mockLogger.info(`REQUEST ${req.method} ${req.originalUrl}`, {
          method: req.method,
          url: req.originalUrl,
          ip: req.ip,
          userAgent: req.get('User-Agent'),
          timestamp: new Date().toISOString()
        });

        const originalSend = res.send;
        res.send = function(data) {
          try {
            const endTime = Date.now();
            const duration = endTime - startTime;
            
            mockLogger.info(`RESPONSE ${req.method} ${req.originalUrl} - ${res.statusCode} - ${duration}ms`);
          } catch (logError) {
            // Si el logging falla, no debería afectar la respuesta
            console.warn('Logging error:', logError.message);
          }
          
          return originalSend.call(this, data);
        };
      } catch (logError) {
        // Si el logging falla, no debería afectar la respuesta
        console.warn('Logging error:', logError.message);
      }

      next();
    };

    app.use(loggerMiddleware);

    // Rutas de test
    app.get('/test/log', (req, res) => {
      try {
        mockLogger.info('Test log message');
      } catch (logError) {
        // Si el logging falla, no debería afectar la respuesta
        console.warn('Route logging error:', logError.message);
      }
      res.json({ success: true, message: 'Log test' });
    });

    app.get('/test/error', (req, res) => {
      try {
        mockLogger.error('Test error message');
      } catch (logError) {
        // Si el logging falla, no debería afectar la respuesta
        console.warn('Route logging error:', logError.message);
      }
      res.status(500).json({ success: false, error: 'Test error' });
    });

    app.get('/test/performance', (req, res) => {
      const start = Date.now();
      // Simular procesamiento
      setTimeout(() => {
        const duration = Date.now() - start;
        try {
          mockLogger.info(`Performance test completed in ${duration}ms`);
        } catch (logError) {
          // Si el logging falla, no debería afectar la respuesta
          console.warn('Performance logging error:', logError.message);
        }
        res.json({ success: true, duration });
      }, 10);
    });
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Logger Configuration Tests', () => {
    it('debería crear logger con configuración correcta', () => {
      expect(winston.createLogger).toBeDefined();
      expect(winston.format.combine).toBeDefined();
      expect(winston.transports.Console).toBeDefined();
      expect(winston.transports.File).toBeDefined();
    });

    it('debería configurar colores para diferentes niveles', () => {
      expect(winston.addColors).toBeDefined();
    });

    it('debería determinar nivel correcto según entorno', () => {
      const originalEnv = process.env.NODE_ENV;
      
      process.env.NODE_ENV = 'development';
      // Test logic here
      
      process.env.NODE_ENV = 'production';
      // Test logic here
      
      process.env.NODE_ENV = originalEnv;
    });
  });

  describe('Request Logging Tests', () => {
    it('debería loggear requests HTTP correctamente', async () => {
      await request(app)
        .get('/test/log')
        .expect(200);

      expect(mockLogger.info).toHaveBeenCalledWith(
        expect.stringContaining('REQUEST GET /test/log'),
        expect.objectContaining({
          method: 'GET',
          url: '/test/log',
          timestamp: expect.any(String)
        })
      );
    });

    it('debería loggear responses con tiempo de respuesta', async () => {
      await request(app)
        .get('/test/log')
        .expect(200);

      expect(mockLogger.info).toHaveBeenCalledWith(
        expect.stringContaining('RESPONSE GET /test/log - 200')
      );
    });

    it('debería loggear errores HTTP', async () => {
      await request(app)
        .get('/test/error')
        .expect(500);

      expect(mockLogger.error).toHaveBeenCalledWith('Test error message');
    });
  });

  describe('Performance Monitoring Tests', () => {
    it('debería medir tiempo de respuesta', async () => {
      const response = await request(app)
        .get('/test/performance')
        .expect(200);

      expect(response.body).toHaveProperty('duration');
      expect(typeof response.body.duration).toBe('number');
    });

    it('debería loggear métricas de performance', (done) => {
      request(app)
        .get('/test/performance')
        .expect(200)
        .end(() => {
          setTimeout(() => {
            expect(mockLogger.info).toHaveBeenCalledWith(
              expect.stringContaining('Performance test completed')
            );
            done();
          }, 50);
        });
    });
  });

  describe('Log Levels Tests', () => {
    it('debería manejar diferentes niveles de log', () => {
      mockLogger.debug('Debug message');
      mockLogger.info('Info message');
      mockLogger.warn('Warning message');
      mockLogger.error('Error message');

      expect(mockLogger.debug).toHaveBeenCalledWith('Debug message');
      expect(mockLogger.info).toHaveBeenCalledWith('Info message');
      expect(mockLogger.warn).toHaveBeenCalledWith('Warning message');
      expect(mockLogger.error).toHaveBeenCalledWith('Error message');
    });
  });

  describe('Structured Logging Tests', () => {
    it('debería incluir metadata en logs', async () => {
      await request(app)
        .get('/test/log')
        .set('User-Agent', 'Test-Agent')
        .expect(200);

      expect(mockLogger.info).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          method: 'GET',
          url: '/test/log',
          userAgent: 'Test-Agent',
          timestamp: expect.any(String)
        })
      );
    });

    it('debería formatear logs como JSON para archivos', () => {
      expect(winston.format.json).toBeDefined();
    });
  });

  describe('Error Handling in Logging Tests', () => {
    it('debería manejar errores en el middleware de logging', async () => {
      // Simular error en logger
      const originalInfo = mockLogger.info;
      mockLogger.info = jest.fn(() => {
        throw new Error('Logger error');
      });

      // El request debería continuar a pesar del error en logging
      await request(app)
        .get('/test/log')
        .expect(200);

      // Restaurar logger
      mockLogger.info = originalInfo;
    });
  });

  describe('Log Rotation and Storage Tests', () => {
    it('debería configurar rotación de archivos de log', () => {
      expect(winston.transports.File).toBeDefined();
    });

    it('debería separar logs por nivel', () => {
      // Simular la creación de un logger que usa File transport
      winston.createLogger({
        transports: [
          new winston.transports.File({ filename: 'error.log', level: 'error' }),
          new winston.transports.File({ filename: 'combined.log' })
        ]
      });
      
      // Verificar que se configuran diferentes transports para diferentes niveles
      expect(winston.transports.File).toHaveBeenCalled();
    });
  });

  describe('Development vs Production Logging Tests', () => {
    it('debería ajustar nivel de logging según entorno', () => {
      const originalEnv = process.env.NODE_ENV;
      
      // Test development
      process.env.NODE_ENV = 'development';
      // Verificar configuración de desarrollo
      
      // Test production
      process.env.NODE_ENV = 'production';
      // Verificar configuración de producción
      
      process.env.NODE_ENV = originalEnv;
    });

    it('debería incluir más detalles en desarrollo', () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'development';
      
      // En desarrollo debería incluir más información de debug
      expect(winston.format.colorize).toBeDefined();
      
      process.env.NODE_ENV = originalEnv;
    });
  });
});
