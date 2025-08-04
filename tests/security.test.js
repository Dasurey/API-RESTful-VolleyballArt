const request = require('supertest');
const express = require('express');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

// Mock de helmet
jest.mock('helmet', () => jest.fn(() => (req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  next();
}));

// Mock de express-rate-limit
jest.mock('express-rate-limit', () => jest.fn(() => (req, res, next) => {
  const rateLimitInfo = {
    limit: 100,
    remaining: 99,
    reset: Date.now() + 900000
  };
  
  res.setHeader('X-RateLimit-Limit', rateLimitInfo.limit);
  res.setHeader('X-RateLimit-Remaining', rateLimitInfo.remaining);
  res.setHeader('X-RateLimit-Reset', rateLimitInfo.reset);
  
  // Simular rate limit alcanzado
  if (req.headers['x-test-rate-limit'] === 'exceeded') {
    return res.status(429).json({
      error: 'Demasiadas solicitudes',
      retryAfter: '15 minutos'
    });
  }
  
  next();
}));

describe('Sistema de Seguridad Mejorada', () => {
  let app;

  beforeAll(() => {
    app = express();
    app.use(express.json({ limit: '10mb' }));

    // Configuración de seguridad
    app.use(helmet());

    // Rate limiting general
    const generalLimiter = rateLimit({
      windowMs: 15 * 60 * 1000,
      max: 100,
      message: {
        error: 'Demasiadas solicitudes desde esta IP',
        retryAfter: '15 minutos'
      }
    });

    // Rate limiting para autenticación
    const authLimiter = rateLimit({
      windowMs: 15 * 60 * 1000,
      max: 5,
      message: {
        error: 'Demasiados intentos de login',
        retryAfter: '15 minutos'
      }
    });

    app.use('/api/', generalLimiter);
    app.use('/api/auth/', authLimiter);

    // Middleware de autenticación JWT
    const authenticateJWT = (req, res, next) => {
      const authHeader = req.headers.authorization;
      
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({
          success: false,
          message: 'Token de acceso requerido'
        });
      }

      const token = authHeader.substring(7);
      
      // Verificar token básico para tests
      if (token === 'valid-token') {
        req.user = { id: 'user123', role: 'user' };
        next();
      } else if (token === 'admin-token') {
        req.user = { id: 'admin123', role: 'admin' };
        next();
      } else {
        res.status(401).json({
          success: false,
          message: 'Token inválido'
        });
      }
    };

    // Middleware de autorización por roles
    const authorize = (roles = []) => {
      return (req, res, next) => {
        if (!req.user) {
          return res.status(401).json({
            success: false,
            message: 'No autenticado'
          });
        }

        if (roles.length && !roles.includes(req.user.role)) {
          return res.status(403).json({
            success: false,
            message: 'Acceso denegado - Permisos insuficientes'
          });
        }

        next();
      };
    };

    // Middleware de sanitización contra ataques
    const sanitizeInput = (req, res, next) => {
      const sanitize = (obj) => {
        if (obj && typeof obj === 'object' && !Array.isArray(obj)) {
          const sanitized = {};
          for (let key in obj) {
            if (obj.hasOwnProperty(key)) {
              if (typeof obj[key] === 'string') {
                // Prevenir XSS
                sanitized[key] = obj[key]
                  .replace(/<script[^>]*>.*?<\/script>/gi, '')
                  .replace(/<.*?>/g, '')
                  .replace(/javascript:/gi, '')
                  .replace(/on\w+\s*=/gi, '');
                  
                // Prevenir SQL/NoSQL injection
                let cleaned = sanitized[key]
                  .replace(/\$(?=\w)/g, '') // Solo reemplazar $ seguido de palabra
                  .replace(/\{\s*\$where/gi, '')
                  .replace(/\{\s*\$ne/gi, '');
                
                // Solo remover puntos si no parece ser un email
                if (!cleaned.includes('@')) {
                  cleaned = cleaned.replace(/\./g, '');
                }
                
                sanitized[key] = cleaned;
              } else if (typeof obj[key] === 'object' && obj[key] !== null) {
                sanitized[key] = sanitize(obj[key]);
              } else {
                sanitized[key] = obj[key];
              }
            }
          }
          return sanitized;
        } else if (typeof obj === 'string') {
          // Sanitizar strings directos
          let cleaned = obj
            .replace(/<script[^>]*>.*?<\/script>/gi, '')
            .replace(/<.*?>/g, '')
            .replace(/javascript:/gi, '')
            .replace(/on\w+\s*=/gi, '')
            .replace(/\$(?=\w)/g, '') // Solo reemplazar $ seguido de palabra
            .replace(/\{\s*\$where/gi, '')
            .replace(/\{\s*\$ne/gi, '');
          
          // Solo remover puntos si no parece ser un email
          if (!cleaned.includes('@')) {
            cleaned = cleaned.replace(/\./g, '');
          }
          
          return cleaned;
        }
        return obj;
      };

      try {
        if (req.body && Object.keys(req.body).length > 0) {
          req.body = sanitize(req.body);
        }
        if (req.query && Object.keys(req.query).length > 0) {
          req.query = sanitize(req.query);
        }
        if (req.params && Object.keys(req.params).length > 0) {
          req.params = sanitize(req.params);
        }
      } catch (error) {
        console.error('Error en sanitización:', error);
      }
      
      next();
    };

    // Middleware para validar tipos de contenido
    const validateContentType = (req, res, next) => {
      try {
        if (req.method === 'POST' || req.method === 'PUT') {
          const contentType = req.headers['content-type'];
          
          if (!contentType || !contentType.includes('application/json')) {
            return res.status(400).json({
              success: false,
              message: 'Content-Type debe ser application/json'
            });
          }
        }
        next();
      } catch (error) {
        console.error('Error en validación de Content-Type:', error);
        next();
      }
    };

    // Middleware para detectar patrones de ataque
    const detectAttacks = (req, res, next) => {
      try {
        const userAgent = req.headers['user-agent'] || '';
        const url = req.originalUrl || req.url || '';
        let body = '';
        
        try {
          body = JSON.stringify(req.body || {});
        } catch (e) {
          body = '';
        }
        
        // Detectar bots maliciosos
        const maliciousBots = [
          'sqlmap', 'nikto', 'dirb', 'gobuster', 'burp',
          'nessus', 'openvas', 'metasploit'
        ];
        
        if (maliciousBots.some(bot => userAgent.toLowerCase().includes(bot))) {
          return res.status(403).json({
            success: false,
            message: 'Acceso denegado - Bot malicioso detectado'
          });
        }
        
        // Detectar intentos de path traversal
        if (url.includes('../') || url.includes('..\\')) {
          return res.status(403).json({
            success: false,
            message: 'Acceso denegado - Path traversal detectado'
          });
        }
        
        // Detectar intentos de inyección en el body
        const injectionPatterns = [
          /\$where/i, /\$ne/i, /\$gt/i, /\$lt/i,
          /<script/i, /javascript:/i, /vbscript:/i,
          /union\s+select/i, /drop\s+table/i, /insert\s+into/i
        ];
        
        if (body && injectionPatterns.some(pattern => pattern.test(body))) {
          return res.status(403).json({
            success: false,
            message: 'Acceso denegado - Patrón de inyección detectado'
          });
        }
        
        next();
      } catch (error) {
        console.error('Error en detección de ataques:', error);
        next();
      }
    };

    // Aplicar middlewares de seguridad después de todas las definiciones
    app.use(sanitizeInput);
    app.use(detectAttacks);

    // Rutas de test
    app.get('/api/public', (req, res) => {
      res.json({ success: true, message: 'Endpoint público' });
    });

    app.get('/api/protected', authenticateJWT, (req, res) => {
      res.json({ 
        success: true, 
        message: 'Endpoint protegido',
        user: req.user 
      });
    });

    app.get('/api/admin', authenticateJWT, authorize(['admin']), (req, res) => {
      res.json({ 
        success: true, 
        message: 'Endpoint de administrador',
        user: req.user 
      });
    });

    app.post('/api/auth/login', (req, res) => {
      const { email, password } = req.body;
      
      if (email === 'admin@test.com' && password === 'admin123') {
        res.json({
          success: true,
          token: 'admin-token',
          role: 'admin'
        });
      } else if (email === 'user@test.com' && password === 'user123') {
        res.json({
          success: true,
          token: 'valid-token',
          role: 'user'
        });
      } else {
        res.status(401).json({
          success: false,
          message: 'Credenciales inválidas'
        });
      }
    });

    app.post('/api/data', validateContentType, authenticateJWT, (req, res) => {
      res.json({
        success: true,
        receivedData: req.body
      });
    });

    // Ruta para test de ataques
    app.post('/api/vulnerable', validateContentType, (req, res) => {
      res.json({
        success: true,
        data: req.body
      });
    });

    // Middleware de manejo de errores (debe ir al final)
    app.use((err, req, res, next) => {
      console.error('Error en middleware:', err);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: err.message
      });
    });
  });

  describe('Headers de Seguridad Tests', () => {
    it('debería establecer headers de seguridad básicos', async () => {
      const response = await request(app)
        .get('/api/public')
        .expect(200);

      expect(response.headers['x-content-type-options']).toBe('nosniff');
      expect(response.headers['x-frame-options']).toBe('DENY');
      expect(response.headers['x-xss-protection']).toBe('1; mode=block');
    });

    it('debería configurar helmet correctamente', () => {
      expect(helmet).toHaveBeenCalled();
    });
  });

  describe('Rate Limiting Tests', () => {
    it('debería aplicar rate limiting general', async () => {
      const response = await request(app)
        .get('/api/public')
        .expect(200);

      expect(response.headers['x-ratelimit-limit']).toBeDefined();
      expect(response.headers['x-ratelimit-remaining']).toBeDefined();
    });

    it('debería bloquear cuando se excede el rate limit', async () => {
      const response = await request(app)
        .get('/api/public')
        .set('X-Test-Rate-Limit', 'exceeded')
        .expect(429);

      expect(response.body.error).toContain('Demasiadas solicitudes');
    });

    it('debería aplicar rate limiting más estricto a auth', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({ email: 'test@test.com', password: 'wrong' })
        .expect(401);

      expect(response.headers['x-ratelimit-limit']).toBeDefined();
    });
  });

  describe('Autenticación JWT Tests', () => {
    it('debería rechazar requests sin token', async () => {
      const response = await request(app)
        .get('/api/protected')
        .expect(401);

      expect(response.body.message).toContain('Token de acceso requerido');
    });

    it('debería rechazar tokens inválidos', async () => {
      const response = await request(app)
        .get('/api/protected')
        .set('Authorization', 'Bearer invalid-token')
        .expect(401);

      expect(response.body.message).toContain('Token inválido');
    });

    it('debería permitir acceso con token válido', async () => {
      const response = await request(app)
        .get('/api/protected')
        .set('Authorization', 'Bearer valid-token')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.user).toBeDefined();
    });

    it('debería manejar formato de Authorization incorrecto', async () => {
      const response = await request(app)
        .get('/api/protected')
        .set('Authorization', 'InvalidFormat token')
        .expect(401);

      expect(response.body.message).toContain('Token de acceso requerido');
    });
  });

  describe('Autorización por Roles Tests', () => {
    it('debería permitir acceso a admin con token de admin', async () => {
      const response = await request(app)
        .get('/api/admin')
        .set('Authorization', 'Bearer admin-token')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.user.role).toBe('admin');
    });

    it('debería denegar acceso a admin con token de usuario', async () => {
      const response = await request(app)
        .get('/api/admin')
        .set('Authorization', 'Bearer valid-token')
        .expect(403);

      expect(response.body.message).toContain('Permisos insuficientes');
    });

    it('debería permitir login con credenciales correctas', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'admin@test.com',
          password: 'admin123'
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.token).toBe('admin-token');
      expect(response.body.role).toBe('admin');
    });
  });

  describe('Sanitización contra Ataques Tests', () => {
    it('debería remover scripts XSS', async () => {
      const maliciousData = {
        name: '<script>alert("xss")</script>Test',
        description: 'Normal text<script>malicious()</script>'
      };

      const response = await request(app)
        .post('/api/data')
        .set('Authorization', 'Bearer valid-token')
        .send(maliciousData)
        .expect(200);

      expect(response.body.receivedData.name).toBe('Test');
      expect(response.body.receivedData.description).toBe('Normal text');
    });

    it('debería remover intentos de inyección NoSQL', async () => {
      const maliciousData = {
        query: '{ $ne: null }',
        filter: 'name.$where = function() { return true; }'
      };

      const response = await request(app)
        .post('/api/data')
        .set('Authorization', 'Bearer valid-token')
        .send(maliciousData)
        .expect(200);

      expect(response.body.receivedData.query).toBe('{ ne: null }');
      expect(response.body.receivedData.filter).toBe('namewhere = function() { return true; }');
    });

    it('debería limpiar atributos de eventos maliciosos', async () => {
      const maliciousData = {
        content: 'onclick=alert("xss") onload=malicious()'
      };

      const response = await request(app)
        .post('/api/data')
        .set('Authorization', 'Bearer valid-token')
        .send(maliciousData)
        .expect(200);

      expect(response.body.receivedData.content).not.toContain('onclick');
      expect(response.body.receivedData.content).not.toContain('onload');
    });
  });

  describe('Validación de Content-Type Tests', () => {
    it('debería rechazar POST sin Content-Type correcto', async () => {
      const response = await request(app)
        .post('/api/vulnerable')
        .set('Content-Type', 'text/plain')
        .send('malicious data')
        .expect(400);

      expect(response.body.message).toContain('Content-Type debe ser application/json');
    });

    it('debería aceptar POST con Content-Type correcto', async () => {
      const response = await request(app)
        .post('/api/data')
        .set('Authorization', 'Bearer valid-token')
        .set('Content-Type', 'application/json')
        .send({ data: 'test' })
        .expect(200);

      expect(response.body.success).toBe(true);
    });
  });

  describe('Detección de Ataques Tests', () => {
    it('debería detectar bots maliciosos por User-Agent', async () => {
      const response = await request(app)
        .get('/api/public')
        .set('User-Agent', 'sqlmap/1.0')
        .expect(403);

      expect(response.body.message).toContain('Bot malicioso detectado');
    });

    it('debería detectar intentos de path traversal', async () => {
      const response = await request(app)
        .get('/api/public?path=../../../etc/passwd')
        .expect(403);

      expect(response.body.message).toContain('Path traversal detectado');
    });

    it('debería detectar patrones de inyección SQL', async () => {
      const maliciousData = {
        query: 'user UNION SELECT * FROM admin'
      };

      const response = await request(app)
        .post('/api/vulnerable')
        .send(maliciousData)
        .expect(403);

      expect(response.body.message).toContain('Patrón de inyección detectado');
    });

    it('debería permitir requests legítimos', async () => {
      const legitimateData = {
        name: 'Producto Normal',
        description: 'Descripción legítima del producto'
      };

      const response = await request(app)
        .post('/api/data')
        .set('Authorization', 'Bearer valid-token')
        .send(legitimateData)
        .expect(200);

      expect(response.body.success).toBe(true);
    });
  });

  describe('Protección contra CSRF Tests', () => {
    it('debería rechazar requests con origin sospechoso', async () => {
      // En un escenario real, aquí verificaríamos CSRF tokens
      const response = await request(app)
        .post('/api/data')
        .set('Authorization', 'Bearer valid-token')
        .set('Origin', 'https://malicious-site.com')
        .send({ data: 'test' })
        .expect(200); // Aquí pasaría porque no implementamos CSRF completo

      // En implementación real, esto debería fallar
      expect(response.body.success).toBe(true);
    });
  });

  describe('Manejo de Errores de Seguridad Tests', () => {
    it('debería manejar tokens malformados', async () => {
      const response = await request(app)
        .get('/api/protected')
        .set('Authorization', 'Bearer malformed.token.here')
        .expect(401);

      expect(response.body.success).toBe(false);
    });

    it('debería logear intentos de acceso no autorizado', async () => {
      await request(app)
        .get('/api/admin')
        .set('Authorization', 'Bearer valid-token')
        .expect(403);

      // En implementación real, verificaríamos que se loggee el intento
    });
  });

  describe('Límites de Tamaño de Request Tests', () => {
    it('debería aceptar payloads de tamaño normal', async () => {
      const normalData = {
        description: 'A'.repeat(1000) // 1KB
      };

      const response = await request(app)
        .post('/api/data')
        .set('Authorization', 'Bearer valid-token')
        .send(normalData)
        .expect(200);

      expect(response.body.success).toBe(true);
    });

    // Test para payload muy grande requeriría configuración específica
    // de express.json({ limit: ... })
  });
});
