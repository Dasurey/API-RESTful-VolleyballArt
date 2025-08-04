const request = require('supertest');
const express = require('express');

describe('Sistema de Manejo de Errores Global', () => {
  let app;
  let errorLogger;

  beforeAll(() => {
    app = express();
    app.use(express.json());

    // Mock del logger
    errorLogger = {
      error: jest.fn(),
      warn: jest.fn(),
      info: jest.fn()
    };

    // Clase personalizada para errores de aplicación
    class AppError extends Error {
      constructor(message, statusCode = 500, isOperational = true) {
        super(message);
        this.statusCode = statusCode;
        this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
        this.isOperational = isOperational;
        
        Error.captureStackTrace(this, this.constructor);
      }
    }

    // Middleware de manejo de errores global
    const globalErrorHandler = (error, req, res, next) => {
      let err = { ...error };
      err.message = error.message;

      // Log del error
      errorLogger.error(`Error ${error.statusCode || 500} - ${error.message}`, {
        error: error.message,
        stack: error.stack,
        method: req.method,
        url: req.originalUrl,
        ip: req.ip,
        userAgent: req.get('User-Agent'),
        userId: req.user?.id || 'anonymous',
        timestamp: new Date().toISOString(),
        body: req.body
      });

      // Errores de desarrollo vs producción
      const isDevelopment = process.env.NODE_ENV === 'development';
      
      // Formatear diferentes tipos de errores
      if (error.name === 'CastError') {
        err = new AppError(`Recurso no encontrado con ID: ${error.value}`, 404);
      }
      
      if (error.code === 11000) {
        const field = Object.keys(error.keyValue)[0];
        const message = `${field} ya existe`;
        err = new AppError(message, 400);
      }
      
      if (error.name === 'ValidationError') {
        const errors = Object.values(error.errors).map(val => val.message);
        const message = `Datos inválidos: ${errors.join('. ')}`;
        err = new AppError(message, 400);
      }
      
      if (error.name === 'JsonWebTokenError') {
        err = new AppError('Token JWT inválido', 401);
      }
      
      if (error.name === 'TokenExpiredError') {
        err = new AppError('Token JWT expirado', 401);
      }

      // Respuesta de error
      const statusCode = err.statusCode || 500;
      const status = err.status || 'error';

      // En desarrollo, enviar más información
      if (isDevelopment) {
        res.status(statusCode).json({
          success: false,
          status,
          error: err,
          message: err.message,
          stack: err.stack || error.stack
        });
      } else {
        // En producción, solo errores operacionales
        if (err.isOperational) {
          res.status(statusCode).json({
            success: false,
            status,
            message: err.message
          });
        } else {
          // Error de programación - no revelar detalles
          errorLogger.error('PROGRAMMING ERROR! 💥', err);
          
          res.status(500).json({
            success: false,
            status: 'error',
            message: 'Algo salió mal!'
          });
        }
      }
    };

    // Middleware para capturar async errors
    const catchAsync = (fn) => {
      return (req, res, next) => {
        fn(req, res, next).catch(next);
      };
    };

    // Middleware de validación
    const validateData = (schema) => {
      return (req, res, next) => {
        const { error } = schema.validate(req.body);
        if (error) {
          const err = new AppError(error.details[0].message, 400);
          return next(err);
        }
        next();
      };
    };

    // Rutas de test
    app.get('/api/error/operational', (req, res, next) => {
      const error = new AppError('Este es un error operacional', 400);
      next(error);
    });

    app.get('/api/error/programming', (req, res, next) => {
      const error = new Error('Error de programación');
      error.isOperational = false;
      next(error);
    });

    app.get('/api/error/with-stack', (req, res, next) => {
      const error = new AppError('Error con stack trace', 400);
      error.stack = 'Stack trace aquí';
      next(error);
    });

    app.get('/api/error/async', catchAsync(async (req, res, next) => {
      await new Promise((resolve, reject) => {
        setTimeout(() => {
          reject(new AppError('Error asíncrono', 500));
        }, 10);
      });
    }));

    app.get('/api/error/cast', (req, res, next) => {
      const error = new Error('Cast failed');
      error.name = 'CastError';
      error.value = 'invalid-id';
      next(error);
    });

    app.get('/api/error/duplicate', (req, res, next) => {
      const error = new Error('Duplicate key');
      error.code = 11000;
      error.keyValue = { email: 'test@test.com' };
      next(error);
    });

    app.get('/api/error/validation', (req, res, next) => {
      const error = new Error('Validation failed');
      error.name = 'ValidationError';
      error.errors = {
        name: { message: 'Nombre es requerido' },
        email: { message: 'Email inválido' }
      };
      next(error);
    });

    app.get('/api/error/jwt', (req, res, next) => {
      const error = new Error('JWT malformed');
      error.name = 'JsonWebTokenError';
      next(error);
    });

    app.get('/api/error/jwt-expired', (req, res, next) => {
      const error = new Error('JWT expired');
      error.name = 'TokenExpiredError';
      next(error);
    });

    app.get('/api/error/404', (req, res, next) => {
      const error = new AppError('Recurso no encontrado', 404);
      next(error);
    });

    app.get('/api/error/500', (req, res, next) => {
      const error = new AppError('Error interno del servidor', 500);
      next(error);
    });

    // Ruta que lanza excepción no capturada
    app.get('/api/error/uncaught', (req, res, next) => {
      throw new Error('Error no capturado');
    });

    // Ruta para test de validación
    const mockSchema = {
      validate: (data) => {
        if (!data.name) {
          return {
            error: {
              details: [{ message: 'Nombre es requerido' }]
            }
          };
        }
        return { error: null };
      }
    };

    app.post('/api/error/validate', validateData(mockSchema), (req, res) => {
      res.json({ success: true, data: req.body });
    });

    // Ruta que funciona correctamente
    app.get('/api/success', (req, res) => {
      res.json({ success: true, message: 'Todo funciona correctamente' });
    });

    // Rutas para tests de casos edge
    app.get('/test-no-message', (req, res, next) => {
      const error = new Error();
      next(error);
    });

    app.get('/test-extra-props', (req, res, next) => {
      const error = new AppError('Test error', 418); // Usar AppError con statusCode
      error.customProperty = 'custom value';
      next(error);
    });

    // Middleware y ruta para test de usuario
    app.use('/api/user-error', (req, res, next) => {
      req.user = { id: 'user123' };
      next();
    });

    app.get('/api/user-error', (req, res, next) => {
      const error = new AppError('Error con usuario', 400);
      next(error);
    });

    // Middleware para rutas no encontradas
    app.use((req, res, next) => {
      const err = new AppError(`No se encontró ${req.originalUrl} en el servidor`, 404);
      next(err);
    });

    // Aplicar el middleware de manejo de errores
    app.use(globalErrorHandler);

    // Manejar promesas rechazadas no capturadas
    process.on('unhandledRejection', (err, promise) => {
      errorLogger.error('UNHANDLED PROMISE REJECTION! 💥 Shutting down...', err);
    });

    // Manejar excepciones no capturadas
    process.on('uncaughtException', (err) => {
      errorLogger.error('UNCAUGHT EXCEPTION! 💥 Shutting down...', err);
    });
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Errores Operacionales Tests', () => {
    it('debería manejar errores operacionales 400', async () => {
      const response = await request(app)
        .get('/api/error/operational')
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.status).toBe('fail');
      expect(response.body.message).toBe('Este es un error operacional');
      expect(errorLogger.error).toHaveBeenCalled();
    });

    it('debería manejar errores 404', async () => {
      const response = await request(app)
        .get('/api/error/404')
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Recurso no encontrado');
    });

    it('debería manejar errores 500', async () => {
      const response = await request(app)
        .get('/api/error/500')
        .expect(500);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Error interno del servidor');
      expect(response.body.status).toBe('error');
    });
  });

  describe('Errores de Programación Tests', () => {
    it('debería manejar errores de programación en desarrollo', async () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'development';

      const response = await request(app)
        .get('/api/error/programming')
        .expect(500);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBeDefined();
      expect(response.body.stack).toBeDefined();

      process.env.NODE_ENV = originalEnv;
    });

    it('debería ocultar detalles de errores de programación en producción', async () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'production';

      const response = await request(app)
        .get('/api/error/programming')
        .expect(500);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Algo salió mal!');
      expect(response.body.stack).toBeUndefined();
      expect(response.body.error).toBeUndefined();

      process.env.NODE_ENV = originalEnv;
    });
  });

  describe('Errores Asíncronos Tests', () => {
    it('debería capturar errores en funciones async', async () => {
      const response = await request(app)
        .get('/api/error/async')
        .expect(500);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Error asíncrono');
    });
  });

  describe('Errores de Base de Datos Tests', () => {
    it('debería formatear errores de Cast (ID inválido)', async () => {
      const response = await request(app)
        .get('/api/error/cast')
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Recurso no encontrado con ID: invalid-id');
    });

    it('debería formatear errores de clave duplicada', async () => {
      const response = await request(app)
        .get('/api/error/duplicate')
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('email ya existe');
    });

    it('debería formatear errores de validación', async () => {
      const response = await request(app)
        .get('/api/error/validation')
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Datos inválidos');
      expect(response.body.message).toContain('Nombre es requerido');
      expect(response.body.message).toContain('Email inválido');
    });
  });

  describe('Errores JWT Tests', () => {
    it('debería formatear errores de JWT inválido', async () => {
      const response = await request(app)
        .get('/api/error/jwt')
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Token JWT inválido');
    });

    it('debería formatear errores de JWT expirado', async () => {
      const response = await request(app)
        .get('/api/error/jwt-expired')
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Token JWT expirado');
    });
  });

  describe('Logging de Errores Tests', () => {
    it('debería loggear errores con información completa', async () => {
      await request(app)
        .get('/api/error/operational')
        .set('User-Agent', 'Test-Agent')
        .expect(400);

      expect(errorLogger.error).toHaveBeenCalledWith(
        expect.stringContaining('Error 400'),
        expect.objectContaining({
          error: 'Este es un error operacional',
          method: 'GET',
          url: '/api/error/operational',
          userAgent: 'Test-Agent',
          timestamp: expect.any(String)
        })
      );
    });

    it('debería incluir información del usuario en logs', async () => {
      errorLogger.error.mockClear();

      await request(app)
        .get('/api/user-error')
        .expect(400);

      expect(errorLogger.error).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          error: 'Error con usuario',
          userId: 'user123'
        })
      );
    });
  });

  describe('Rutas No Encontradas Tests', () => {
    it('debería manejar rutas no existentes', async () => {
      const response = await request(app)
        .get('/api/ruta-inexistente')
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('No se encontró /api/ruta-inexistente');
    });

    it('debería manejar métodos HTTP no permitidos', async () => {
      const response = await request(app)
        .delete('/api/ruta-inexistente')
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('No se encontró');
    });
  });

  describe('Validación de Datos Tests', () => {
    it('debería manejar errores de validación de middleware', async () => {
      const response = await request(app)
        .post('/api/error/validate')
        .send({}) // Sin el campo name requerido
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Nombre es requerido');
    });

    it('debería permitir datos válidos', async () => {
      const response = await request(app)
        .post('/api/error/validate')
        .send({ name: 'Test Name' })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.name).toBe('Test Name');
    });
  });

  describe('Manejo de Excepciones No Capturadas Tests', () => {
    it('debería capturar errores lanzados directamente', async () => {
      const response = await request(app)
        .get('/api/error/uncaught')
        .expect(500);

      expect(response.body.success).toBe(false);
      expect(errorLogger.error).toHaveBeenCalled();
    });
  });

  describe('Diferentes Formatos de Error Tests', () => {
    it('debería manejar errores con códigos de estado personalizados', async () => {
      const response = await request(app)
        .get('/api/error/operational')
        .expect(400);

      expect(response.status).toBe(400);
      expect(response.body.status).toBe('fail');
    });

    it('debería diferenciar entre fail y error según código de estado', async () => {
      const response400 = await request(app)
        .get('/api/error/operational')
        .expect(400);

      const response500 = await request(app)
        .get('/api/error/500')
        .expect(500);

      expect(response400.body.status).toBe('fail');
      expect(response500.body.status).toBe('error');
    });
  });

  describe('Stack Traces Tests', () => {
    it('debería incluir stack trace en desarrollo', async () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'development';

      const response = await request(app)
        .get('/api/error/with-stack')
        .expect(400);

      expect(response.body.stack).toBeDefined();

      process.env.NODE_ENV = originalEnv;
    });

    it('debería excluir stack trace en producción', async () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'production';

      const response = await request(app)
        .get('/api/error/operational')
        .expect(400);

      expect(response.body.stack).toBeUndefined();

      process.env.NODE_ENV = originalEnv;
    });
  });

  describe('Integración con Sistema de Logging Tests', () => {
    it('debería usar el logger configurado', async () => {
      await request(app)
        .get('/api/error/operational')
        .expect(400);

      expect(errorLogger.error).toHaveBeenCalledTimes(1);
    });

    it('debería formatear mensajes de log correctamente', async () => {
      await request(app)
        .get('/api/error/operational')
        .expect(400);

      const logCall = errorLogger.error.mock.calls[0];
      expect(logCall[0]).toContain('Error 400');
      expect(logCall[1]).toHaveProperty('error');
      expect(logCall[1]).toHaveProperty('method');
      expect(logCall[1]).toHaveProperty('url');
    });
  });

  describe('Casos Edge Tests', () => {
    it('debería manejar errores sin mensaje', async () => {
      const response = await request(app)
        .get('/test-no-message')
        .expect(500);

      expect(response.body.success).toBe(false);
    });

    it('debería manejar errores con propiedades adicionales', async () => {
      const response = await request(app)
        .get('/test-extra-props')
        .expect(418);

      expect(response.body.success).toBe(false);
    });
  });
});
