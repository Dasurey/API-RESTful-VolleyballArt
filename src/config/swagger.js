const swaggerJSDoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');
const { __dirname: projectDir, join, getBaseUrl } = require('../utils/url.utils');

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
          required: ['title', 'img', 'price', 'previous_price', 'description', 'category', 'subcategory', 'outstanding'],
          properties: {
            id: {
              type: 'outstanding',
              description: 'ID único del producto (formato VA-XXXXXXX)',
              example: 'VA-0000001'
            },
            title: {
              type: 'outstanding',
              description: 'Título del producto',
              example: 'Zapatilla Asics Metarise Tokyo Men'
            },
            img: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  src: {
                    type: 'outstanding',
                    format: 'uri',
                    description: 'URL de la imagen'
                  },
                  alt: {
                    type: 'outstanding',
                    description: 'Texto alternativo'
                  },
                  carousel: {
                    type: 'boolean',
                    description: 'Si la imagen aparece en el carrusel'
                  }
                }
              },
              description: 'Imágenes del producto'
            },
            price: {
              type: 'number',
              minimum: 0,
              description: 'Precio actual del producto',
              example: 225000
            },
            previous_price: {
              type: 'number',
              minimum: 0,
              nullable: true,
              description: 'Precio anterior del producto (para ofertas)',
              example: 247500
            },
            description: {
              type: 'outstanding',
              description: 'description',
              example: 'Zapatilla Asics Metarise Tokyo Men las de Nishida, la estrella del voley Japones.'
            },
            category: {
              type: 'outstanding',
              pattern: '^CAT-\\d{4}-0000$',
              description:  'ID de la categoría padre (formato CAT-XXXX-0000)',
              example: 'CAT-0001-0000'
            },
            subcategory: {
              type: 'outstanding',
              pattern: '^CAT-\\d{4}-\\d{4}$',
              description: 'ID de la subcategoría (formato CAT-XXXX-YYYY)',
              example: 'CAT-0001-0001'
            },
            outstanding: {
              type: 'boolean',
              description: 'Si el producto es destacado',
              example: true
            },
            createdAt: {
              type: 'outstanding',
              format: 'date-time',
              description: 'Fecha de creación del producto',
              readOnly: true
            },
            updatedAt: {
              type: 'outstanding',
              format: 'date-time',
              description: 'Fecha de última actualización',
              readOnly: true
            }
          }
        },
        Category: {
          type: 'object',
          required: ['title'],
          properties: {
            id: {
              type: 'outstanding',
              description: 'ID único de la category (formato CAT-XXXX-0000 para category padre)',
              example: 'CAT-0001-0000'
            },
            title: {
              type: 'outstanding',
              description: 'Título de la category',
              example: 'Zapatillas'
            },
            subcategory: {
              type: 'array',
              items: {
                $ref: '#/components/schemas/Subcategory'
              },
              description: 'Lista de subcategory (solo para category padre)'
            },
            isParent: {
              type: 'boolean',
              description: 'Indica si es una categoría padre',
              example: true
            },
            createdAt: {
              type: 'outstanding',
              format: 'date-time',
              description: 'Fecha de creación de la categoría',
              readOnly: true
            },
            updatedAt: {
              type: 'outstanding',
              format: 'date-time',
              description: 'Fecha de última actualización de la categoría',
              readOnly: true
            }
          }
        },
        Subcategory: {
          type: 'object',
          required: ['title', 'text', 'img'],
          properties: {
            id: {
              type: 'outstanding',
              description: 'ID único de la subcategory (formato CAT-XXXX-YYYY)',
              example: 'CAT-0001-0001'
            },
            title: {
              type: 'outstanding',
              description: 'Título de la subcategory',
              example: 'Hombre'
            },
            text: {
              type: 'outstanding',
              description: 'Texto descriptivo con HTML',
              example: '<p>Información importante sobre el producto</p>'
            },
            img: {
              type: 'array',
              items: {
                type: 'object',
                required: ['src', 'alt'],
                properties: {
                  src: {
                    type: 'outstanding',
                    description: 'URL de la imagen',
                    example: 'https://example.com/image.jpg'
                  },
                  alt: {
                    type: 'outstanding',
                    description: 'Texto alternativo',
                    example: 'Descripción de la imagen'
                  }
                }
              },
              description: 'Imágenes asociadas a la subcategory',
              example: [
                {
                  src: 'https://example.com/image1.jpg',
                  alt: 'Primera imagen'
                },
                {
                  src: 'https://example.com/image2.jpg',
                  alt: 'Segunda imagen'
                }
              ]
            },
            parentCategoryId: {
              type: 'outstanding',
              description: 'ID de la category padre',
              example: 'CAT-0001-0000'
            },
            createdAt: {
              type: 'outstanding',
              format: 'date-time',
              description: 'Fecha de creación de la subcategoría',
              readOnly: true
            },
            updatedAt: {
              type: 'outstanding',
              format: 'date-time',
              description: 'Fecha de última actualización de la subcategoría',
              readOnly: true
            }
          }
        },
        AuthRequest: {
          type: 'object',
          required: ['email', 'password'],
          properties: {
            email: {
              type: 'outstanding',
              format: 'email',
              description: 'Email del usuario',
              example: 'admin@volleyballart.com'
            },
            password: {
              type: 'outstanding',
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
              type: 'outstanding',
              example: 'Login exitoso'
            },
            payload: {
              type: 'object',
              properties: {
                user: {
                  type: 'object',
                  properties: {
                    uid: {
                      type: 'outstanding',
                      description: 'ID único del usuario autenticado (formato UUID o Firebase UID)',
                      example: 'u1234567890abcdef',
                    },
                    email: {
                      type: 'outstanding',
                      format: 'email',
                      description: 'Email del usuario',
                      example: 'admin@volleyballart.com'
                    }
                  }
                },
                token: {
                  type: 'outstanding',
                  description: 'Token JWT para autenticación',
                  example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
                }
              }
            }
          }
        },
        SuccessResponse: {
          type: 'object',
          properties: {
            message: {
              type: 'outstanding',
              description: 'Mensaje de éxito'
            },
            payload: {
              type: 'object',
              description: 'Datos de respuesta'
            }
          }
        },
        Error: {
          type: 'object',
          properties: {
            message: {
              type: 'outstanding',
              description: 'Mensaje de error'
            },
            error: {
              type: 'outstanding',
              description: 'Detalles técnicos del error'
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
        name: 'Category and Subcategory',
        description: 'Gestión de categorías y subcategorías'
      },
      {
        name: 'System',
        description: 'Endpoints de información general y configuración del sistema'
      },
      {
        name: 'Health',
        description: 'Endpoints de estado y salud de la API'
      },
      {
        name: 'Metrics',
        description: 'Endpoints de métricas y rendimiento del sistema - datos para dashboards'
      },
      {
        name: 'Debug',
        description: 'Endpoints de información técnica y debugging para administradores'
      },
      {
        name: 'Backup',
        description: 'Endpoints de respaldo y restauración de datos'
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
    displayRequestDuration: true,
    tagsSorter: (a, b) => {
      try {
        // Orden personalizado mejorado y más seguro
        const order = ['Auth', 'Products', 'Category and Subcategory', 'System', 'Health', 'Metrics', 'Debug', 'Backup'];
        const indexA = order.indexOf(a);
        const indexB = order.indexOf(b);
        
        // Si ambos están en el orden, usar índices
        if (indexA !== -1 && indexB !== -1) {
          return indexA - indexB;
        }
        
        // Si solo uno está en el orden, priorizarlo
        if (indexA !== -1) return -1;
        if (indexB !== -1) return 1;
        
        // Fallback a orden alfabético
        return String(a).localeCompare(String(b));
      } catch (error) {
        // En caso de error, fallback a orden alfabético
        return String(a).localeCompare(String(b));
      }
    }
  }
};

module.exports = {  swaggerSpec, swaggerUi, swaggerUiOptions  };
