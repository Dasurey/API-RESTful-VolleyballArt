const swaggerJSDoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');
const { __dirname: projectDir, join, getBaseUrl } = require('../utils/url.utils.js');

// Configuración básica de Swagger (URL se actualiza dinámicamente)

// Configuración básica de Swagger
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'VolleyballArt API',
      version: '1.0.0',
      description: 'API RESTful para la gestión de productos de volleyball. Proyecto educativo desarrollado como parte del programa Talento Tech.',
      contact: {
        name: 'Dario Asurey',
        email: 'dario.asurey@gmail.com'
      },
      license: {
        name: 'MIT',
        url: 'https://opensource.org/licenses/MIT'
      }
    },
    servers: [
      {
        url: getBaseUrl(),
        description: process.env.NODE_ENV === 'production' ? 'Servidor de producción' : 'Servidor de desarrollo'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Token JWT obtenido desde el endpoint de login'
        }
      },
      schemas: {
        Product: {
          type: 'object',
          required: ['name', 'description', 'price', 'category', 'stock'],
          properties: {
            id: {
              type: 'string',
              description: 'Identificador único del producto (formato VA-XXXXX)',
              example: 'VA-00001'
            },
            name: {
              type: 'string',
              description: 'Nombre del producto',
              example: 'Pelota de Volleyball Profesional'
            },
            description: {
              type: 'string',
              description: 'Descripción detallada del producto',
              example: 'Pelota oficial para competencias de volleyball'
            },
            price: {
              type: 'number',
              minimum: 0,
              description: 'Precio del producto en pesos',
              example: 150.00
            },
            category: {
              type: 'string',
              description: 'Categoría del producto',
              example: 'Pelotas'
            },
            stock: {
              type: 'integer',
              minimum: 0,
              description: 'Cantidad disponible en stock',
              example: 50
            },
            images: {
              type: 'array',
              items: {
                type: 'string',
                format: 'uri'
              },
              description: 'URLs de imágenes del producto',
              example: ['https://example.com/image1.jpg']
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              description: 'Fecha de creación del producto'
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
              description: 'Fecha de última actualización'
            }
          }
        },
        AuthRequest: {
          type: 'object',
          required: ['email', 'password'],
          properties: {
            email: {
              type: 'string',
              format: 'email',
              description: 'Email del usuario',
              example: 'admin@volleyballart.com'
            },
            password: {
              type: 'string',
              minLength: 6,
              description: 'Contraseña del usuario',
              example: 'password123'
            }
          }
        },
        AuthResponse: {
          type: 'object',
          properties: {
            message: {
              type: 'string',
              example: 'Login exitoso'
            },
            payload: {
              type: 'object',
              properties: {
                token: {
                  type: 'string',
                  description: 'Token JWT para autenticación',
                  example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
                }
              }
            }
          }
        },
        Error: {
          type: 'object',
          properties: {
            message: {
              type: 'string',
              description: 'Mensaje de error'
            },
            errors: {
              type: 'array',
              items: {
                type: 'string'
              },
              description: 'Lista detallada de errores'
            }
          }
        },
        SuccessResponse: {
          type: 'object',
          properties: {
            message: {
              type: 'string',
              description: 'Mensaje de éxito'
            },
            payload: {
              type: 'object',
              description: 'Datos de respuesta'
            }
          }
        }
      }
    },
    tags: [
      {
        name: 'Auth',
        description: 'Endpoints de autenticación'
      },
      {
        name: 'Products',
        description: 'Gestión de productos de volleyball'
      },
      {
        name: 'Health',
        description: 'Endpoints de estado y salud de la API'
      }
    ]
  },
  apis: [
    join(projectDir, 'routes/*.js'),
    join(projectDir, 'index.js')
  ]
};

// Generar especificación Swagger
const swaggerSpec = swaggerJSDoc(swaggerOptions);

// Opciones de personalización para Swagger UI
const swaggerUiOptions = {
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: 'VolleyballArt API Docs',
  customfavIcon: '/favicon.ico',
  swaggerOptions: {
    persistAuthorization: true,
    displayRequestDuration: true
  }
};

module.exports = {  swaggerSpec, swaggerUi, swaggerUiOptions  };
