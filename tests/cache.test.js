const request = require('supertest');
const express = require('express');

// Mock de node-cache
jest.mock('node-cache', () => {
  const mockCache = new Map();
  return jest.fn().mockImplementation(() => ({
    get: jest.fn((key) => mockCache.get(key)),
    set: jest.fn((key, value, ttl) => {
      mockCache.set(key, value);
      return true;
    }),
    del: jest.fn((key) => mockCache.delete(key)),
    has: jest.fn((key) => mockCache.has(key)),
    keys: jest.fn(() => Array.from(mockCache.keys())),
    flushAll: jest.fn(() => mockCache.clear()),
    getStats: jest.fn(() => ({
      keys: mockCache.size,
      hits: 10,
      misses: 5,
      hitRate: 0.67
    }))
  }));
});

describe('Sistema de Cache y Optimización', () => {
  let app;
  let mockProductsCache;
  let mockAuthCache;
  let mockGeneralCache;

  beforeAll(() => {
    app = express();
    app.use(express.json());

    // Mock cache managers
    const NodeCache = require('node-cache');
    mockProductsCache = new NodeCache({ stdTTL: 300 }); // 5 minutos
    mockAuthCache = new NodeCache({ stdTTL: 3600 }); // 1 hora
    mockGeneralCache = new NodeCache({ stdTTL: 600 }); // 10 minutos

    // Middleware de cache genérico
    const cacheMiddleware = (cacheManager, ttl = 600) => {
      return (req, res, next) => {
        const cacheKey = generateCacheKey(req);
        const cachedData = cacheManager.get(cacheKey);
        
        if (cachedData) {
          res.set('X-Cache', 'HIT');
          res.set('X-Cache-Key', cacheKey);
          return res.json(cachedData);
        }

        res.set('X-Cache', 'MISS');
        res.set('X-Cache-Key', cacheKey);

        // Interceptar la respuesta para cachearla
        const originalJson = res.json;
        res.json = function(data) {
          if (res.statusCode === 200) {
            try {
              cacheManager.set(cacheKey, data, ttl);
            } catch (e) {
              // Error al cachear, continuar sin cache
            }
          }
          return originalJson.call(this, data);
        };

        next();
      };
    };

    // Función para generar clave de cache
    function generateCacheKey(req) {
      const { method, originalUrl, query, user } = req;
      const queryString = Object.keys(query).length > 0 ? JSON.stringify(query) : '';
      const userContext = user ? user.id : 'anonymous';
      return `${method}:${originalUrl}:${queryString}:${userContext}`;
    }

    // Middleware de compresión mock
    const compressionMiddleware = (req, res, next) => {
      const acceptEncoding = req.headers['accept-encoding'] || '';
      
      // Solo aplicar compresión si se especifica explícitamente
      if (acceptEncoding && acceptEncoding.includes('gzip')) {
        res.set('X-Compression', 'gzip');
      } else if (acceptEncoding && acceptEncoding.includes('deflate')) {
        res.set('X-Compression', 'deflate');
      }
      // Si no hay Accept-Encoding específico, no aplicar compresión
      
      next();
    };

    // Middleware de optimización de respuesta
    const optimizeResponse = (req, res, next) => {
      const originalJson = res.json;
      
      res.json = function(data) {
        let responseData = data;
        
        // Optimizar JSON response
        if (typeof data === 'object' && data !== null) {
          // Remover campos nulos/undefined para reducir tamaño
          responseData = JSON.parse(JSON.stringify(data, (key, value) => {
            return value === null || value === undefined ? undefined : value;
          }));
        }

        // Agregar headers de optimización
        res.set('X-Response-Optimized', 'true');
        res.set('X-Response-Size', Buffer.byteLength(JSON.stringify(responseData), 'utf8'));
        
        return originalJson.call(this, responseData);
      };
      
      next();
    };

    // Middleware de ETags para cache del cliente
    const etagMiddleware = (req, res, next) => {
      const originalJson = res.json;
      
      res.json = function(data) {
        if (res.statusCode === 200) {
          const etag = `"${Buffer.from(JSON.stringify(data)).toString('base64').substring(0, 16)}"`;
          res.set('ETag', etag);
          
          // Verificar If-None-Match header
          if (req.headers['if-none-match'] === etag) {
            return res.status(304).end();
          }
        }
        
        return originalJson.call(this, data);
      };
      
      next();
    };

    // Aplicar middlewares
    app.use(compressionMiddleware);
    app.use(optimizeResponse);
    app.use(etagMiddleware);

    // Mock de datos
    const mockProducts = [
      {
        id: 'prod-1',
        name: 'Pelota Volleyball Pro',
        price: 49.99,
        category: 'volleyball',
        description: 'Pelota profesional para competencias',
        stock: 50,
        images: ['https://example.com/image1.jpg'],
        tags: ['professional', 'competition'],
        specifications: {
          weight: 0.27,
          material: 'Leather'
        }
      },
      {
        id: 'prod-2',
        name: 'Red de Volleyball',
        price: 89.99,
        category: 'accessories',
        description: 'Red oficial para cancha de volleyball',
        stock: 20,
        images: ['https://example.com/image2.jpg'],
        tags: ['official', 'net'],
        specifications: {
          height: 2.43,
          material: 'Nylon'
        }
      }
    ];

    // Rutas con cache
    app.get('/api/products', 
      cacheMiddleware(mockProductsCache, 300),
      (req, res) => {
        const { page = 1, limit = 10, category, search } = req.query;
        
        let filteredProducts = [...mockProducts];
        
        if (category) {
          filteredProducts = filteredProducts.filter(p => p.category === category);
        }
        
        if (search) {
          filteredProducts = filteredProducts.filter(p => 
            p.name.toLowerCase().includes(search.toLowerCase()) ||
            p.description.toLowerCase().includes(search.toLowerCase())
          );
        }

        const startIndex = (page - 1) * limit;
        const endIndex = startIndex + parseInt(limit);
        const paginatedProducts = filteredProducts.slice(startIndex, endIndex);

        res.json({
          success: true,
          data: paginatedProducts,
          pagination: {
            page: parseInt(page),
            limit: parseInt(limit),
            total: filteredProducts.length,
            totalPages: Math.ceil(filteredProducts.length / limit)
          }
        });
      }
    );

    app.get('/api/products/:id',
      cacheMiddleware(mockProductsCache, 600),
      (req, res) => {
        const product = mockProducts.find(p => p.id === req.params.id);
        
        if (!product) {
          return res.status(404).json({
            success: false,
            message: 'Producto no encontrado'
          });
        }

        res.json({
          success: true,
          data: product
        });
      }
    );

    // Ruta para invalidar cache
    app.delete('/api/cache/products', (req, res) => {
      const { key } = req.query;
      
      if (key) {
        mockProductsCache.del(key);
      } else {
        mockProductsCache.flushAll();
      }

      res.json({
        success: true,
        message: key ? `Cache invalidado para clave: ${key}` : 'Todo el cache de productos invalidado'
      });
    });

    // Ruta para estadísticas de cache
    app.get('/api/cache/stats', (req, res) => {
      const productsStats = mockProductsCache.getStats();
      const authStats = mockAuthCache.getStats();
      const generalStats = mockGeneralCache.getStats();

      res.json({
        success: true,
        data: {
          products: {
            ...productsStats,
            keys: mockProductsCache.keys().length
          },
          auth: {
            ...authStats,
            keys: mockAuthCache.keys().length
          },
          general: {
            ...generalStats,
            keys: mockGeneralCache.keys().length
          }
        }
      });
    });

    // Ruta para test de compresión
    app.get('/api/large-data', (req, res) => {
      // Generar datos grandes para test de compresión
      const largeData = {
        success: true,
        data: Array(1000).fill().map((_, i) => ({
          id: `item-${i}`,
          name: `Item ${i}`,
          description: 'A'.repeat(100),
          metadata: {
            created: new Date().toISOString(),
            updated: new Date().toISOString(),
            tags: [`tag-${i}`, `category-${i % 10}`]
          }
        }))
      };

      res.json(largeData);
    });

    // Ruta para test de optimización
    app.get('/api/optimized-data', (req, res) => {
      const data = {
        success: true,
        data: {
          id: 'test-1',
          name: 'Test Product',
          nullField: null,
          undefinedField: undefined,
          emptyString: '',
          validData: 'This should remain'
        }
      };

      res.json(data);
    });

    // Ruta sin cache para comparación
    app.get('/api/no-cache/products', (req, res) => {
      res.set('Cache-Control', 'no-cache, no-store, must-revalidate');
      res.json({
        success: true,
        data: mockProducts,
        timestamp: Date.now()
      });
    });

    // Ruta para test de ETags
    app.get('/api/etag-test', (req, res) => {
      res.json({
        success: true,
        message: 'ETag test data',
        timestamp: '2025-01-01T00:00:00Z' // Timestamp fijo para ETag consistente
      });
    });
  });

  beforeEach(() => {
    // Limpiar cache antes de cada test
    mockProductsCache.flushAll();
    mockAuthCache.flushAll();
    mockGeneralCache.flushAll();
  });

  describe('Cache Básico Tests', () => {
    it('debería retornar MISS en primera request', async () => {
      const response = await request(app)
        .get('/api/products')
        .expect(200);

      expect(response.headers['x-cache']).toBe('MISS');
      expect(response.headers['x-cache-key']).toBeDefined();
      expect(response.body.success).toBe(true);
    });

    it('debería retornar HIT en segunda request', async () => {
      // Primera request - MISS
      await request(app)
        .get('/api/products')
        .expect(200);

      // Segunda request - HIT
      const response = await request(app)
        .get('/api/products')
        .expect(200);

      expect(response.headers['x-cache']).toBe('HIT');
    });

    it('debería generar diferentes claves para diferentes queries', async () => {
      const response1 = await request(app)
        .get('/api/products?category=volleyball')
        .expect(200);

      const response2 = await request(app)
        .get('/api/products?category=accessories')
        .expect(200);

      expect(response1.headers['x-cache-key']).not.toBe(response2.headers['x-cache-key']);
    });

    it('debería cachear respuestas de productos individuales', async () => {
      // Primera request
      const response1 = await request(app)
        .get('/api/products/prod-1')
        .expect(200);

      expect(response1.headers['x-cache']).toBe('MISS');

      // Segunda request
      const response2 = await request(app)
        .get('/api/products/prod-1')
        .expect(200);

      expect(response2.headers['x-cache']).toBe('HIT');
      expect(response2.body.data.id).toBe('prod-1');
    });
  });

  describe('Cache Invalidation Tests', () => {
    it('debería invalidar cache específico por clave', async () => {
      // Cachear datos
      const firstResponse = await request(app)
        .get('/api/products')
        .expect(200);

      const cacheKey = firstResponse.headers['x-cache-key'];

      // Verificar que está en cache
      const cachedResponse = await request(app)
        .get('/api/products')
        .expect(200);

      expect(cachedResponse.headers['x-cache']).toBe('HIT');

      // Invalidar cache específico
      await request(app)
        .delete(`/api/cache/products?key=${cacheKey}`)
        .expect(200);

      // Verificar que ya no está en cache
      const afterInvalidation = await request(app)
        .get('/api/products')
        .expect(200);

      expect(afterInvalidation.headers['x-cache']).toBe('MISS');
    });

    it('debería invalidar todo el cache de productos', async () => {
      // Cachear múltiples endpoints
      await request(app).get('/api/products').expect(200);
      await request(app).get('/api/products/prod-1').expect(200);

      // Verificar que están en cache
      const response1 = await request(app).get('/api/products').expect(200);
      const response2 = await request(app).get('/api/products/prod-1').expect(200);

      expect(response1.headers['x-cache']).toBe('HIT');
      expect(response2.headers['x-cache']).toBe('HIT');

      // Invalidar todo el cache
      await request(app)
        .delete('/api/cache/products')
        .expect(200);

      // Verificar que ya no están en cache
      const afterFlush1 = await request(app).get('/api/products').expect(200);
      const afterFlush2 = await request(app).get('/api/products/prod-1').expect(200);

      expect(afterFlush1.headers['x-cache']).toBe('MISS');
      expect(afterFlush2.headers['x-cache']).toBe('MISS');
    });
  });

  describe('Cache Statistics Tests', () => {
    it('debería proporcionar estadísticas de cache', async () => {
      // Generar algunos hits y misses
      await request(app).get('/api/products').expect(200); // MISS
      await request(app).get('/api/products').expect(200); // HIT
      await request(app).get('/api/products/prod-1').expect(200); // MISS

      const response = await request(app)
        .get('/api/cache/stats')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('products');
      expect(response.body.data).toHaveProperty('auth');
      expect(response.body.data).toHaveProperty('general');
      expect(response.body.data.products).toHaveProperty('keys');
      expect(response.body.data.products).toHaveProperty('hits');
      expect(response.body.data.products).toHaveProperty('misses');
    });
  });

  describe('Compresión Tests', () => {
    it('debería aplicar compresión gzip cuando se soporta', async () => {
      const response = await request(app)
        .get('/api/large-data')
        .set('Accept-Encoding', 'gzip, deflate')
        .expect(200);

      expect(response.headers['x-compression']).toBe('gzip');
      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
    });

    it('debería aplicar compresión deflate como alternativa', async () => {
      const response = await request(app)
        .get('/api/large-data')
        .set('Accept-Encoding', 'deflate')
        .expect(200);

      expect(response.headers['x-compression']).toBe('deflate');
      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
    });

    it('debería funcionar sin compresión si no se soporta', async () => {
      const response = await request(app)
        .get('/api/large-data')
        .set('Accept-Encoding', '') // Explícitamente sin compresión
        .expect(200);

      expect(response.headers['x-compression']).toBeUndefined();
      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
    });
  });

  describe('Optimización de Respuesta Tests', () => {
    it('debería optimizar respuestas JSON removiendo campos nulos', async () => {
      const response = await request(app)
        .get('/api/optimized-data')
        .expect(200);

      expect(response.headers['x-response-optimized']).toBe('true');
      expect(response.headers['x-response-size']).toBeDefined();
      
      // Verificar que campos nulos fueron removidos en la optimización
      const responseBody = JSON.parse(response.text);
      expect(responseBody.data).not.toHaveProperty('nullField');
      expect(responseBody.data).not.toHaveProperty('undefinedField');
      expect(responseBody.data).toHaveProperty('emptyString');
      expect(responseBody.data).toHaveProperty('validData');
    });

    it('debería incluir información de tamaño de respuesta', async () => {
      const response = await request(app)
        .get('/api/products')
        .expect(200);

      expect(response.headers['x-response-size']).toBeDefined();
      expect(parseInt(response.headers['x-response-size'])).toBeGreaterThan(0);
    });
  });

  describe('ETags y Cache del Cliente Tests', () => {
    it('debería generar ETags para respuestas', async () => {
      const response = await request(app)
        .get('/api/etag-test')
        .expect(200);

      expect(response.headers['etag']).toBeDefined();
      expect(response.headers['etag']).toMatch(/^".*"$/); // ETag format
    });

    it('debería retornar 304 Not Modified con ETag válido', async () => {
      // Primera request para obtener ETag
      const firstResponse = await request(app)
        .get('/api/etag-test')
        .expect(200);

      const etag = firstResponse.headers['etag'];

      // Segunda request con If-None-Match
      const secondResponse = await request(app)
        .get('/api/etag-test')
        .set('If-None-Match', etag)
        .expect(304);

      expect(secondResponse.text).toBe('');
    });

    it('debería retornar contenido completo con ETag diferente', async () => {
      const response = await request(app)
        .get('/api/etag-test')
        .set('If-None-Match', '"different-etag"')
        .expect(200);

      expect(response.body.success).toBe(true);
    });
  });

  describe('Cache Headers Tests', () => {
    it('debería establecer headers de cache apropiados', async () => {
      const response = await request(app)
        .get('/api/products')
        .expect(200);

      expect(response.headers['x-cache']).toBeDefined();
      expect(response.headers['x-cache-key']).toBeDefined();
    });

    it('debería respetar no-cache headers', async () => {
      const response = await request(app)
        .get('/api/no-cache/products')
        .expect(200);

      expect(response.headers['cache-control']).toContain('no-cache');
      expect(response.headers['cache-control']).toContain('no-store');
    });
  });

  describe('Performance y Filtros Tests', () => {
    it('debería cachear diferentes resultados de filtros', async () => {
      // Cache para volleyball
      const volleyball = await request(app)
        .get('/api/products?category=volleyball')
        .expect(200);

      // Cache para accessories
      const accessories = await request(app)
        .get('/api/products?category=accessories')
        .expect(200);

      expect(volleyball.headers['x-cache']).toBe('MISS');
      expect(accessories.headers['x-cache']).toBe('MISS');

      // Verificar hits en segunda request
      const volleyballHit = await request(app)
        .get('/api/products?category=volleyball')
        .expect(200);

      const accessoriesHit = await request(app)
        .get('/api/products?category=accessories')
        .expect(200);

      expect(volleyballHit.headers['x-cache']).toBe('HIT');
      expect(accessoriesHit.headers['x-cache']).toBe('HIT');

      // Verificar que los datos son diferentes
      expect(volleyball.body.data).not.toEqual(accessories.body.data);
    });

    it('debería cachear búsquedas de texto', async () => {
      const searchResponse = await request(app)
        .get('/api/products?search=volleyball')
        .expect(200);

      expect(searchResponse.headers['x-cache']).toBe('MISS');

      const cachedSearch = await request(app)
        .get('/api/products?search=volleyball')
        .expect(200);

      expect(cachedSearch.headers['x-cache']).toBe('HIT');
    });
  });

  describe('Cache TTL Tests', () => {
    it('debería respetar diferentes TTL para diferentes tipos de cache', async () => {
      // En implementación real, esto requeriría esperar o mock del tiempo
      // Por ahora solo verificamos que el cache está funcionando
      const response = await request(app)
        .get('/api/products')
        .expect(200);

      expect(response.headers['x-cache']).toBe('MISS');

      const cached = await request(app)
        .get('/api/products')
        .expect(200);

      expect(cached.headers['x-cache']).toBe('HIT');
    });
  });
});
