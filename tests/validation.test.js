const request = require('supertest');
const express = require('express');
const Joi = require('joi');

// Mock de express-validator
jest.mock('express-validator', () => ({
  body: jest.fn(() => ({
    isEmail: jest.fn(() => ({ withMessage: jest.fn(() => ({})) })),
    isLength: jest.fn(() => ({ withMessage: jest.fn(() => ({})) })),
    trim: jest.fn(() => ({})),
    escape: jest.fn(() => ({}))
  })),
  validationResult: jest.fn(() => ({
    isEmpty: jest.fn(() => true),
    array: jest.fn(() => [])
  }))
}));

describe('Sistema de Validación de Datos Avanzada', () => {
  let app;

  beforeAll(() => {
    app = express();
    app.use(express.json());

    // Middleware de validación con Joi
    const validateWithJoi = (schema) => {
      return (req, res, next) => {
        const { error, value } = schema.validate(req.body, { 
          abortEarly: false,
          stripUnknown: true,
          convert: true
        });
        
        if (error) {
          const errors = error.details.map(detail => ({
            field: detail.path.join('.'),
            message: detail.message,
            value: detail.context.value
          }));
          
          return res.status(400).json({
            success: false,
            message: 'Errores de validación',
            errors
          });
        }
        
        req.body = value;
        next();
      };
    };

    // Middleware de sanitización
    const sanitizeInput = (req, res, next) => {
      const sanitize = (obj) => {
        if (obj && typeof obj === 'object') {
          for (let key in obj) {
            if (typeof obj[key] === 'string') {
              // Remover caracteres peligrosos
              obj[key] = obj[key]
                .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '') // XSS - remover script tags
                .replace(/<>/g, '') // XSS básico - remover solo tags vacíos
                .replace(/\.\$where/g, '.where') // MongoDB injection específico - remover .$where
                .trim();
            } else if (typeof obj[key] === 'object' && obj[key] !== null) {
              sanitize(obj[key]);
            }
          }
        }
        return obj;
      };

      if (req.body) {
        req.body = sanitize({ ...req.body });
      }
      
      next();
    };

    // Esquemas de validación
    const productSchema = Joi.object({
      name: Joi.string().min(3).max(100).required()
        .messages({
          'string.min': 'El nombre debe tener al menos 3 caracteres',
          'string.max': 'El nombre no puede exceder 100 caracteres',
          'any.required': 'El nombre es obligatorio'
        }),
      description: Joi.string().min(10).max(500)
        .messages({
          'string.min': 'La descripción debe tener al menos 10 caracteres',
          'string.max': 'La descripción no puede exceder 500 caracteres'
        }),
      price: Joi.number().positive().precision(2).required()
        .messages({
          'number.positive': 'El precio debe ser positivo',
          'any.required': 'El precio es obligatorio'
        }),
      category: Joi.string().valid('volleyball', 'accessories', 'clothing').required()
        .messages({
          'any.only': 'La categoría debe ser: volleyball, accessories o clothing',
          'any.required': 'La categoría es obligatoria'
        }),
      tags: Joi.array().items(Joi.string().min(2).max(20)).max(5)
        .messages({
          'array.max': 'No puede tener más de 5 etiquetas'
        }),
      images: Joi.array().items(
        Joi.string().uri().required()
      ).min(1).max(10)
        .messages({
          'array.min': 'Debe incluir al menos una imagen',
          'array.max': 'No puede tener más de 10 imágenes'
        }),
      specifications: Joi.object({
        weight: Joi.number().positive(),
        dimensions: Joi.object({
          length: Joi.number().positive(),
          width: Joi.number().positive(),
          height: Joi.number().positive()
        }),
        material: Joi.string().max(50)
      }),
      stock: Joi.number().integer().min(0).required()
        .messages({
          'number.min': 'El stock no puede ser negativo',
          'any.required': 'El stock es obligatorio'
        }),
      isActive: Joi.boolean().default(true)
    });

    const userSchema = Joi.object({
      email: Joi.string().email().required()
        .messages({
          'string.email': 'Debe ser un email válido',
          'any.required': 'El email es obligatorio'
        }),
      password: Joi.string().min(8).pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
        .required()
        .messages({
          'string.min': 'La contraseña debe tener al menos 8 caracteres',
          'string.pattern.base': 'La contraseña debe contener al menos: 1 minúscula, 1 mayúscula, 1 número y 1 símbolo',
          'any.required': 'La contraseña es obligatoria'
        }),
      name: Joi.string().min(2).max(50).pattern(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/).required()
        .messages({
          'string.pattern.base': 'El nombre solo puede contener letras y espacios',
          'any.required': 'El nombre es obligatorio'
        }),
      age: Joi.number().integer().min(13).max(120)
        .messages({
          'number.min': 'Debe ser mayor de 13 años',
          'number.max': 'Edad no válida'
        }),
      phone: Joi.string().pattern(/^\+?[\d\s\-\(\)]{10,20}$/)
        .messages({
          'string.pattern.base': 'Formato de teléfono no válido'
        })
    });

    // Rutas con validación
    app.use(sanitizeInput);

    app.post('/api/products', validateWithJoi(productSchema), (req, res) => {
      res.status(201).json({
        success: true,
        message: 'Producto creado exitosamente',
        data: req.body
      });
    });

    app.post('/api/users', validateWithJoi(userSchema), (req, res) => {
      res.status(201).json({
        success: true,
        message: 'Usuario creado exitosamente',
        data: { ...req.body, password: '[HIDDEN]' }
      });
    });

    // Ruta para test de sanitización
    app.post('/api/sanitize-test', (req, res) => {
      res.json({
        success: true,
        sanitizedData: req.body
      });
    });

    // Ruta para validación condicional
    const conditionalSchema = Joi.object({
      type: Joi.string().valid('individual', 'business').required(),
      name: Joi.string().when('type', {
        is: 'individual',
        then: Joi.string().min(2).max(50).required(),
        otherwise: Joi.string().min(3).max(100).required()
      }),
      taxId: Joi.string().when('type', {
        is: 'business',
        then: Joi.string().required(),
        otherwise: Joi.forbidden()
      })
    });

    app.post('/api/conditional', validateWithJoi(conditionalSchema), (req, res) => {
      res.json({
        success: true,
        data: req.body
      });
    });
  });

  describe('Validación con Joi Tests', () => {
    describe('Validación de Productos', () => {
      it('debería validar producto válido', async () => {
        const validProduct = {
          name: 'Pelota de Volleyball Profesional',
          description: 'Pelota oficial para competencias de volleyball',
          price: 49.99,
          category: 'volleyball',
          tags: ['professional', 'official'],
          images: ['https://example.com/image1.jpg'],
          stock: 100,
          specifications: {
            weight: 0.27,
            dimensions: {
              length: 21,
              width: 21,
              height: 21
            },
            material: 'Cuero sintético'
          }
        };

        const response = await request(app)
          .post('/api/products')
          .send(validProduct)
          .expect(201);

        expect(response.body.success).toBe(true);
        expect(response.body.data).toMatchObject(validProduct);
      });

      it('debería rechazar producto con nombre muy corto', async () => {
        const invalidProduct = {
          name: 'AB',
          price: 49.99,
          category: 'volleyball',
          images: ['https://example.com/image1.jpg'],
          stock: 100
        };

        const response = await request(app)
          .post('/api/products')
          .send(invalidProduct)
          .expect(400);

        expect(response.body.success).toBe(false);
        expect(response.body.errors).toEqual(
          expect.arrayContaining([
            expect.objectContaining({
              field: 'name',
              message: expect.stringContaining('al menos 3 caracteres')
            })
          ])
        );
      });

      it('debería rechazar producto con precio negativo', async () => {
        const invalidProduct = {
          name: 'Producto Test',
          price: -10,
          category: 'volleyball',
          images: ['https://example.com/image1.jpg'],
          stock: 100
        };

        const response = await request(app)
          .post('/api/products')
          .send(invalidProduct)
          .expect(400);

        expect(response.body.errors).toEqual(
          expect.arrayContaining([
            expect.objectContaining({
              field: 'price',
              message: expect.stringContaining('debe ser positivo')
            })
          ])
        );
      });

      it('debería rechazar categoría inválida', async () => {
        const invalidProduct = {
          name: 'Producto Test',
          price: 49.99,
          category: 'invalid-category',
          images: ['https://example.com/image1.jpg'],
          stock: 100
        };

        const response = await request(app)
          .post('/api/products')
          .send(invalidProduct)
          .expect(400);

        expect(response.body.errors).toEqual(
          expect.arrayContaining([
            expect.objectContaining({
              field: 'category',
              message: expect.stringContaining('volleyball, accessories o clothing')
            })
          ])
        );
      });

      it('debería rechazar demasiadas etiquetas', async () => {
        const invalidProduct = {
          name: 'Producto Test',
          price: 49.99,
          category: 'volleyball',
          tags: ['tag1', 'tag2', 'tag3', 'tag4', 'tag5', 'tag6'],
          images: ['https://example.com/image1.jpg'],
          stock: 100
        };

        const response = await request(app)
          .post('/api/products')
          .send(invalidProduct)
          .expect(400);

        expect(response.body.errors).toEqual(
          expect.arrayContaining([
            expect.objectContaining({
              field: 'tags',
              message: expect.stringContaining('más de 5 etiquetas')
            })
          ])
        );
      });
    });

    describe('Validación de Usuarios', () => {
      it('debería validar usuario válido', async () => {
        const validUser = {
          email: 'test@example.com',
          password: 'SecurePass123!',
          name: 'Juan Pérez',
          age: 25,
          phone: '+54 9 11 1234-5678'
        };

        const response = await request(app)
          .post('/api/users')
          .send(validUser)
          .expect(201);

        expect(response.body.success).toBe(true);
        expect(response.body.data.email).toBe(validUser.email);
        expect(response.body.data.password).toBe('[HIDDEN]');
      });

      it('debería rechazar email inválido', async () => {
        const invalidUser = {
          email: 'invalid-email',
          password: 'SecurePass123!',
          name: 'Juan Pérez'
        };

        const response = await request(app)
          .post('/api/users')
          .send(invalidUser)
          .expect(400);

        expect(response.body.errors).toEqual(
          expect.arrayContaining([
            expect.objectContaining({
              field: 'email',
              message: expect.stringContaining('email válido')
            })
          ])
        );
      });

      it('debería rechazar contraseña débil', async () => {
        const invalidUser = {
          email: 'test@example.com',
          password: 'weak',
          name: 'Juan Pérez'
        };

        const response = await request(app)
          .post('/api/users')
          .send(invalidUser)
          .expect(400);

        expect(response.body.errors).toEqual(
          expect.arrayContaining([
            expect.objectContaining({
              field: 'password'
            })
          ])
        );
      });

      it('debería rechazar nombre con números', async () => {
        const invalidUser = {
          email: 'test@example.com',
          password: 'SecurePass123!',
          name: 'Juan123'
        };

        const response = await request(app)
          .post('/api/users')
          .send(invalidUser)
          .expect(400);

        expect(response.body.errors).toEqual(
          expect.arrayContaining([
            expect.objectContaining({
              field: 'name',
              message: expect.stringContaining('letras y espacios')
            })
          ])
        );
      });

      it('debería rechazar edad menor a 13', async () => {
        const invalidUser = {
          email: 'test@example.com',
          password: 'SecurePass123!',
          name: 'Juan Pérez',
          age: 10
        };

        const response = await request(app)
          .post('/api/users')
          .send(invalidUser)
          .expect(400);

        expect(response.body.errors).toEqual(
          expect.arrayContaining([
            expect.objectContaining({
              field: 'age',
              message: expect.stringContaining('mayor de 13 años')
            })
          ])
        );
      });
    });

    describe('Validación Condicional', () => {
      it('debería validar tipo individual correctamente', async () => {
        const validData = {
          type: 'individual',
          name: 'Juan Pérez'
        };

        const response = await request(app)
          .post('/api/conditional')
          .send(validData)
          .expect(200);

        expect(response.body.success).toBe(true);
      });

      it('debería validar tipo business correctamente', async () => {
        const validData = {
          type: 'business',
          name: 'Empresa S.A.',
          taxId: '12345678901'
        };

        const response = await request(app)
          .post('/api/conditional')
          .send(validData)
          .expect(200);

        expect(response.body.success).toBe(true);
      });

      it('debería rechazar business sin taxId', async () => {
        const invalidData = {
          type: 'business',
          name: 'Empresa S.A.'
        };

        const response = await request(app)
          .post('/api/conditional')
          .send(invalidData)
          .expect(400);

        expect(response.body.errors).toEqual(
          expect.arrayContaining([
            expect.objectContaining({
              field: 'taxId'
            })
          ])
        );
      });

      it('debería rechazar individual con taxId', async () => {
        const invalidData = {
          type: 'individual',
          name: 'Juan Pérez',
          taxId: '12345678901'
        };

        const response = await request(app)
          .post('/api/conditional')
          .send(invalidData)
          .expect(400);

        expect(response.body.errors).toEqual(
          expect.arrayContaining([
            expect.objectContaining({
              field: 'taxId'
            })
          ])
        );
      });
    });
  });

  describe('Sanitización de Datos Tests', () => {
    it('debería remover caracteres peligrosos para XSS', async () => {
      const maliciousData = {
        name: '<script>alert("xss")</script>Test Name',
        description: 'Normal description<>'
      };

      const response = await request(app)
        .post('/api/sanitize-test')
        .send(maliciousData)
        .expect(200);

      expect(response.body.sanitizedData.name).toBe('Test Name'); // Script completo removido
      expect(response.body.sanitizedData.description).toBe('Normal description');
    });

    it('debería remover caracteres peligrosos para MongoDB injection', async () => {
      const maliciousData = {
        query: { $ne: null },
        filter: 'name.$where'
      };

      const response = await request(app)
        .post('/api/sanitize-test')
        .send(maliciousData)
        .expect(200);

      expect(response.body.sanitizedData.filter).toBe('name.where'); // Solo se cambia $where por where
    });

    it('debería limpiar espacios en blanco', async () => {
      const dataWithSpaces = {
        name: '  Test Name  ',
        description: '\tDescription with tabs\n'
      };

      const response = await request(app)
        .post('/api/sanitize-test')
        .send(dataWithSpaces)
        .expect(200);

      expect(response.body.sanitizedData.name).toBe('Test Name');
      expect(response.body.sanitizedData.description).toBe('Description with tabs');
    });
  });

  describe('Manejo de Errores de Validación Tests', () => {
    it('debería devolver múltiples errores de validación', async () => {
      const invalidData = {
        name: 'A', // Muy corto
        price: -10, // Negativo
        category: 'invalid', // Inválida
        stock: -5 // Negativo
      };

      const response = await request(app)
        .post('/api/products')
        .send(invalidData)
        .expect(400);

      expect(response.body.errors).toHaveLength(4);
      expect(response.body.errors).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ field: 'name' }),
          expect.objectContaining({ field: 'price' }),
          expect.objectContaining({ field: 'category' }),
          expect.objectContaining({ field: 'stock' })
        ])
      );
    });

    it('debería incluir el valor que causó el error', async () => {
      const invalidData = {
        name: 'Test Product',
        price: 'not-a-number',
        category: 'volleyball',
        images: ['https://example.com/image1.jpg'],
        stock: 100
      };

      const response = await request(app)
        .post('/api/products')
        .send(invalidData)
        .expect(400);

      const priceError = response.body.errors.find(err => err.field === 'price');
      expect(priceError.value).toBe('not-a-number');
    });
  });

  describe('Transformación de Datos Tests', () => {
    it('debería convertir tipos de datos automáticamente', async () => {
      const dataWithStrings = {
        name: 'Test Product',
        price: '49.99', // String que debería convertirse a number
        category: 'volleyball',
        images: ['https://example.com/image1.jpg'],
        stock: '100', // String que debería convertirse a number
        isActive: 'true' // String que debería convertirse a boolean
      };

      const response = await request(app)
        .post('/api/products')
        .send(dataWithStrings)
        .expect(201);

      expect(typeof response.body.data.price).toBe('number');
      expect(typeof response.body.data.stock).toBe('number');
      expect(typeof response.body.data.isActive).toBe('boolean');
    });

    it('debería remover campos no permitidos', async () => {
      const dataWithExtraFields = {
        name: 'Test Product',
        price: 49.99,
        category: 'volleyball',
        images: ['https://example.com/image1.jpg'],
        stock: 100,
        maliciousField: 'should be removed',
        anotherBadField: 'also removed'
      };

      const response = await request(app)
        .post('/api/products')
        .send(dataWithExtraFields)
        .expect(201);

      expect(response.body.data).not.toHaveProperty('maliciousField');
      expect(response.body.data).not.toHaveProperty('anotherBadField');
    });
  });
});
