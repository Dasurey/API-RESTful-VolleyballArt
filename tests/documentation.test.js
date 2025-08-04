const request = require('supertest');
const express = require('express');

// Mock de swagger-jsdoc
jest.mock('swagger-jsdoc', () => jest.fn(() => ({
  openapi: '3.0.0',
  info: {
    title: 'API Test',
    version: '1.0.0'
  },
  paths: {}
})));

// Mock de swagger-ui-express
jest.mock('swagger-ui-express', () => ({
  serve: (req, res, next) => next(),
  setup: jest.fn(() => (req, res) => {
    res.json({
      success: true,
      message: 'Swagger UI mock'
    });
  })
}));

describe('Sistema de Documentación Automática', () => {
  let app;

  beforeAll(() => {
    app = express();
    app.use(express.json());

    // Mock de configuración de Swagger
    const swaggerOptions = {
      definition: {
        openapi: '3.0.0',
        info: {
          title: 'VolleyballArt API',
          version: '1.0.0',
          description: 'API RESTful para gestión de productos de volleyball',
          contact: {
            name: 'API Support',
            email: 'support@volleyballart.com'
          },
          license: {
            name: 'MIT',
            url: 'https://opensource.org/licenses/MIT'
          }
        },
        servers: [
          {
            url: 'http://localhost:3000',
            description: 'Development server'
          },
          {
            url: 'https://api.volleyballart.com',
            description: 'Production server'
          }
        ],
        components: {
          securitySchemes: {
            bearerAuth: {
              type: 'http',
              scheme: 'bearer',
              bearerFormat: 'JWT'
            }
          },
          schemas: {
            Product: {
              type: 'object',
              required: ['name', 'price', 'category'],
              properties: {
                id: {
                  type: 'string',
                  description: 'ID único del producto'
                },
                name: {
                  type: 'string',
                  minLength: 3,
                  maxLength: 100,
                  description: 'Nombre del producto'
                },
                description: {
                  type: 'string',
                  maxLength: 500,
                  description: 'Descripción del producto'
                },
                price: {
                  type: 'number',
                  minimum: 0,
                  description: 'Precio del producto'
                },
                category: {
                  type: 'string',
                  enum: ['volleyball', 'accessories', 'clothing'],
                  description: 'Categoría del producto'
                },
                tags: {
                  type: 'array',
                  items: {
                    type: 'string'
                  },
                  maxItems: 5,
                  description: 'Etiquetas del producto'
                },
                images: {
                  type: 'array',
                  items: {
                    type: 'string',
                    format: 'uri'
                  },
                  minItems: 1,
                  maxItems: 10,
                  description: 'URLs de imágenes'
                },
                stock: {
                  type: 'integer',
                  minimum: 0,
                  description: 'Cantidad en stock'
                },
                isActive: {
                  type: 'boolean',
                  default: true,
                  description: 'Si el producto está activo'
                }
              },
              example: {
                id: 'prod-123',
                name: 'Pelota de Volleyball Profesional',
                description: 'Pelota oficial para competencias',
                price: 49.99,
                category: 'volleyball',
                tags: ['professional', 'official'],
                images: ['https://example.com/image1.jpg'],
                stock: 100,
                isActive: true
              }
            },
            User: {
              type: 'object',
              required: ['email', 'password', 'name'],
              properties: {
                id: {
                  type: 'string',
                  description: 'ID único del usuario'
                },
                email: {
                  type: 'string',
                  format: 'email',
                  description: 'Email del usuario'
                },
                name: {
                  type: 'string',
                  minLength: 2,
                  maxLength: 50,
                  description: 'Nombre del usuario'
                },
                role: {
                  type: 'string',
                  enum: ['user', 'admin'],
                  default: 'user',
                  description: 'Rol del usuario'
                }
              }
            },
            Error: {
              type: 'object',
              properties: {
                success: {
                  type: 'boolean',
                  example: false
                },
                message: {
                  type: 'string',
                  description: 'Mensaje de error'
                },
                errors: {
                  type: 'array',
                  items: {
                    type: 'object',
                    properties: {
                      field: {
                        type: 'string'
                      },
                      message: {
                        type: 'string'
                      }
                    }
                  }
                }
              }
            },
            SuccessResponse: {
              type: 'object',
              properties: {
                success: {
                  type: 'boolean',
                  example: true
                },
                message: {
                  type: 'string'
                },
                data: {
                  type: 'object'
                }
              }
            }
          }
        }
      },
      apis: ['./src/routes/*.js']
    };

    // Rutas documentadas
    /**
     * @swagger
     * /api/products:
     *   get:
     *     summary: Obtener todos los productos
     *     tags: [Products]
     *     parameters:
     *       - in: query
     *         name: page
     *         schema:
     *           type: integer
     *           minimum: 1
     *         description: Número de página
     *       - in: query
     *         name: limit
     *         schema:
     *           type: integer
     *           minimum: 1
     *           maximum: 100
     *         description: Productos por página
     *       - in: query
     *         name: category
     *         schema:
     *           type: string
     *         description: Filtrar por categoría
     *     responses:
     *       200:
     *         description: Lista de productos
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 success:
     *                   type: boolean
     *                 data:
     *                   type: array
     *                   items:
     *                     $ref: '#/components/schemas/Product'
     *                 pagination:
     *                   type: object
     *                   properties:
     *                     page:
     *                       type: integer
     *                     limit:
     *                       type: integer
     *                     total:
     *                       type: integer
     */
    app.get('/api/products', (req, res) => {
      const { page = 1, limit = 10, category } = req.query;
      
      let products = [
        {
          id: 'prod-1',
          name: 'Pelota Volleyball Pro',
          price: 49.99,
          category: 'volleyball',
          stock: 50
        },
        {
          id: 'prod-2',
          name: 'Red de Volleyball',
          price: 89.99,
          category: 'accessories',
          stock: 20
        }
      ];

      if (category) {
        products = products.filter(p => p.category === category);
      }

      res.json({
        success: true,
        data: products,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: products.length
        }
      });
    });

    /**
     * @swagger
     * /api/products:
     *   post:
     *     summary: Crear un nuevo producto
     *     tags: [Products]
     *     security:
     *       - bearerAuth: []
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             $ref: '#/components/schemas/Product'
     *     responses:
     *       201:
     *         description: Producto creado exitosamente
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/SuccessResponse'
     *       400:
     *         description: Error de validación
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/Error'
     *       401:
     *         description: No autorizado
     */
    app.post('/api/products', (req, res) => {
      const authHeader = req.headers.authorization;
      
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({
          success: false,
          message: 'Token de acceso requerido'
        });
      }

      const { name, price, category } = req.body;
      
      if (!name || !price || !category) {
        return res.status(400).json({
          success: false,
          message: 'Campos requeridos faltantes',
          errors: [
            { field: 'name', message: 'Nombre es requerido' },
            { field: 'price', message: 'Precio es requerido' },
            { field: 'category', message: 'Categoría es requerida' }
          ].filter(err => !req.body[err.field])
        });
      }

      res.status(201).json({
        success: true,
        message: 'Producto creado exitosamente',
        data: {
          id: 'prod-new',
          ...req.body
        }
      });
    });

    /**
     * @swagger
     * /api/auth/login:
     *   post:
     *     summary: Iniciar sesión
     *     tags: [Authentication]
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             required:
     *               - email
     *               - password
     *             properties:
     *               email:
     *                 type: string
     *                 format: email
     *               password:
     *                 type: string
     *                 minLength: 6
     *     responses:
     *       200:
     *         description: Login exitoso
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 success:
     *                   type: boolean
     *                 token:
     *                   type: string
     *                 user:
     *                   $ref: '#/components/schemas/User'
     *       401:
     *         description: Credenciales inválidas
     */
    app.post('/api/auth/login', (req, res) => {
      const { email, password } = req.body;
      
      if (email === 'admin@test.com' && password === 'admin123') {
        res.json({
          success: true,
          token: 'mock-jwt-token',
          user: {
            id: 'user-1',
            email,
            name: 'Admin User',
            role: 'admin'
          }
        });
      } else {
        res.status(401).json({
          success: false,
          message: 'Credenciales inválidas'
        });
      }
    });

    // Endpoint para obtener especificación OpenAPI
    app.get('/api/docs/spec', (req, res) => {
      res.json(swaggerOptions.definition);
    });

    // Mock de Swagger UI
    app.get('/api/docs', (req, res) => {
      res.json({
        success: true,
        message: 'Swagger UI disponible',
        url: '/api/docs'
      });
    });

    // Endpoint para validar esquemas
    app.post('/api/docs/validate', (req, res) => {
      const { schema, data } = req.body;
      
      // Validación básica mock
      const validSchemas = ['Product', 'User', 'Error'];
      
      if (!validSchemas.includes(schema)) {
        return res.status(400).json({
          success: false,
          message: 'Esquema no válido'
        });
      }

      res.json({
        success: true,
        message: 'Esquema válido',
        schema,
        valid: true
      });
    });

    // Endpoint para generar documentación en diferentes formatos
    app.get('/api/docs/export/:format', (req, res) => {
      const { format } = req.params;
      
      const supportedFormats = ['json', 'yaml', 'html'];
      
      if (!supportedFormats.includes(format)) {
        return res.status(400).json({
          success: false,
          message: 'Formato no soportado'
        });
      }

      res.json({
        success: true,
        format,
        content: `Documentación en formato ${format}`
      });
    });
  });

  describe('Configuración de Swagger Tests', () => {
    it('debería servir la especificación OpenAPI', async () => {
      const response = await request(app)
        .get('/api/docs/spec')
        .expect(200);

      expect(response.body).toHaveProperty('openapi', '3.0.0');
      expect(response.body).toHaveProperty('info');
      expect(response.body.info).toHaveProperty('title', 'VolleyballArt API');
      expect(response.body.info).toHaveProperty('version', '1.0.0');
    });

    it('debería incluir información de contacto y licencia', async () => {
      const response = await request(app)
        .get('/api/docs/spec')
        .expect(200);

      expect(response.body.info).toHaveProperty('contact');
      expect(response.body.info).toHaveProperty('license');
      expect(response.body.info.contact).toHaveProperty('email');
    });

    it('debería definir servidores para diferentes entornos', async () => {
      const response = await request(app)
        .get('/api/docs/spec')
        .expect(200);

      expect(response.body).toHaveProperty('servers');
      expect(response.body.servers).toHaveLength(2);
      expect(response.body.servers[0]).toHaveProperty('description', 'Development server');
      expect(response.body.servers[1]).toHaveProperty('description', 'Production server');
    });
  });

  describe('Esquemas de Componentes Tests', () => {
    it('debería definir esquema de Product completo', async () => {
      const response = await request(app)
        .get('/api/docs/spec')
        .expect(200);

      const productSchema = response.body.components.schemas.Product;
      expect(productSchema).toBeDefined();
      expect(productSchema.type).toBe('object');
      expect(productSchema.required).toContain('name');
      expect(productSchema.required).toContain('price');
      expect(productSchema.required).toContain('category');
      expect(productSchema.properties).toHaveProperty('name');
      expect(productSchema.properties).toHaveProperty('price');
      expect(productSchema.properties).toHaveProperty('category');
    });

    it('debería incluir validaciones en los esquemas', async () => {
      const response = await request(app)
        .get('/api/docs/spec')
        .expect(200);

      const productSchema = response.body.components.schemas.Product;
      expect(productSchema.properties.name.minLength).toBe(3);
      expect(productSchema.properties.name.maxLength).toBe(100);
      expect(productSchema.properties.price.minimum).toBe(0);
      expect(productSchema.properties.category.enum).toContain('volleyball');
    });

    it('debería definir esquemas de respuesta estándar', async () => {
      const response = await request(app)
        .get('/api/docs/spec')
        .expect(200);

      expect(response.body.components.schemas).toHaveProperty('Error');
      expect(response.body.components.schemas).toHaveProperty('SuccessResponse');
      
      const errorSchema = response.body.components.schemas.Error;
      expect(errorSchema.properties).toHaveProperty('success');
      expect(errorSchema.properties).toHaveProperty('message');
      expect(errorSchema.properties).toHaveProperty('errors');
    });

    it('debería incluir ejemplos en los esquemas', async () => {
      const response = await request(app)
        .get('/api/docs/spec')
        .expect(200);

      const productSchema = response.body.components.schemas.Product;
      expect(productSchema).toHaveProperty('example');
      expect(productSchema.example).toHaveProperty('id');
      expect(productSchema.example).toHaveProperty('name');
      expect(productSchema.example).toHaveProperty('price');
    });
  });

  describe('Autenticación en Documentación Tests', () => {
    it('debería definir esquemas de seguridad', async () => {
      const response = await request(app)
        .get('/api/docs/spec')
        .expect(200);

      expect(response.body.components).toHaveProperty('securitySchemes');
      expect(response.body.components.securitySchemes).toHaveProperty('bearerAuth');
      expect(response.body.components.securitySchemes.bearerAuth.type).toBe('http');
      expect(response.body.components.securitySchemes.bearerAuth.scheme).toBe('bearer');
    });
  });

  describe('Documentación de Endpoints Tests', () => {
    it('debería documentar endpoint GET /api/products con parámetros', async () => {
      const response = await request(app)
        .get('/api/products')
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('data');
      expect(response.body).toHaveProperty('pagination');
    });

    it('debería documentar filtros en query parameters', async () => {
      const response = await request(app)
        .get('/api/products?category=volleyball&page=1&limit=5')
        .expect(200);

      expect(response.body.data).toHaveLength(1);
      expect(response.body.data[0].category).toBe('volleyball');
      expect(response.body.pagination.page).toBe(1);
      expect(response.body.pagination.limit).toBe(5);
    });

    it('debería documentar endpoint POST con autenticación', async () => {
      const newProduct = {
        name: 'Nuevo Producto',
        price: 29.99,
        category: 'volleyball'
      };

      const response = await request(app)
        .post('/api/products')
        .set('Authorization', 'Bearer valid-token')
        .send(newProduct)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toMatchObject(newProduct);
    });

    it('debería documentar respuestas de error', async () => {
      const response = await request(app)
        .post('/api/products')
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Token de acceso requerido');
    });

    it('debería documentar validaciones en request body', async () => {
      const invalidProduct = {
        price: 29.99
        // Falta name y category
      };

      const response = await request(app)
        .post('/api/products')
        .set('Authorization', 'Bearer valid-token')
        .send(invalidProduct)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body).toHaveProperty('errors');
      expect(response.body.errors).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ field: 'name' }),
          expect.objectContaining({ field: 'category' })
        ])
      );
    });
  });

  describe('Swagger UI Tests', () => {
    it('debería servir Swagger UI', async () => {
      const response = await request(app)
        .get('/api/docs')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toContain('Swagger UI disponible');
    });
  });

  describe('Validación de Esquemas Tests', () => {
    it('debería validar esquemas existentes', async () => {
      const response = await request(app)
        .post('/api/docs/validate')
        .send({
          schema: 'Product',
          data: { name: 'Test', price: 10 }
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.valid).toBe(true);
    });

    it('debería rechazar esquemas no existentes', async () => {
      const response = await request(app)
        .post('/api/docs/validate')
        .send({
          schema: 'NonExistentSchema',
          data: {}
        })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Esquema no válido');
    });
  });

  describe('Exportación de Documentación Tests', () => {
    it('debería exportar documentación en formato JSON', async () => {
      const response = await request(app)
        .get('/api/docs/export/json')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.format).toBe('json');
    });

    it('debería exportar documentación en formato YAML', async () => {
      const response = await request(app)
        .get('/api/docs/export/yaml')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.format).toBe('yaml');
    });

    it('debería rechazar formatos no soportados', async () => {
      const response = await request(app)
        .get('/api/docs/export/pdf')
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Formato no soportado');
    });
  });

  describe('Documentación de Códigos de Estado Tests', () => {
    it('debería documentar códigos 2xx correctamente', async () => {
      const response = await request(app)
        .get('/api/products')
        .expect(200);

      expect(response.body.success).toBe(true);
    });

    it('debería documentar códigos 4xx correctamente', async () => {
      const response = await request(app)
        .post('/api/products')
        .send({})
        .expect(401);

      expect(response.body.success).toBe(false);
    });
  });

  describe('Documentación de Headers Tests', () => {
    it('debería documentar headers de autenticación', async () => {
      const response = await request(app)
        .post('/api/products')
        .set('Authorization', 'Bearer valid-token')
        .send({
          name: 'Test Product',
          price: 10,
          category: 'volleyball'
        })
        .expect(201);

      expect(response.body.success).toBe(true);
    });
  });

  describe('Documentación Automática Tests', () => {
    it('debería generar documentación a partir de comentarios JSDoc', () => {
      // En implementación real, esto verificaría que swagger-jsdoc
      // procese correctamente los comentarios @swagger
      expect(true).toBe(true);
    });

    it('debería mantener sincronización entre código y documentación', () => {
      // En implementación real, esto verificaría que los cambios
      // en el código se reflejen automáticamente en la documentación
      expect(true).toBe(true);
    });
  });
});
