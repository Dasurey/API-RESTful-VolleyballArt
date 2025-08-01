const { RELATIVE_PATHS, EXTERNAL_PACKAGES, SANITIZATION } = require('./paths.config.js');
const { SWAGGER_CONSTANTS } = require('../utils/messages.utils.js');
const swaggerJSDoc = require(EXTERNAL_PACKAGES.SWAGGER_JSDOC);
const swaggerUi = require(EXTERNAL_PACKAGES.SWAGGER_UI_EXPRESS);
const { __dirname: projectDir, join, getBaseUrl } = require(RELATIVE_PATHS.FROM_CONFIG.UTILS_URL);

// Configuración básica de Swagger (URL se actualiza dinámicamente)

// Configuración básica de Swagger
const swaggerOptions = {
  definition: {
    openapi: SWAGGER_CONSTANTS.OPENAPI_VERSION,
    info: {
      title: SWAGGER_CONSTANTS.API_TITLE,
      version: SWAGGER_CONSTANTS.API_VERSION,
      description: SWAGGER_CONSTANTS.API_DESCRIPTION,
      contact: {
        name: SWAGGER_CONSTANTS.CONTACT_NAME,
        email: SWAGGER_CONSTANTS.CONTACT_EMAIL
      },
      license: {
        name: SWAGGER_CONSTANTS.LICENSE_NAME,
        url: SWAGGER_CONSTANTS.LICENSE_URL
      }
    },
    servers: [
      {
        url: getBaseUrl(),
        description: process.env.NODE_ENV === SWAGGER_CONSTANTS.ENV_PRODUCTION ? SWAGGER_CONSTANTS.SERVER_PRODUCTION : SWAGGER_CONSTANTS.SERVER_DEVELOPMENT
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: SWAGGER_CONSTANTS.TYPE_HTTP,
          scheme: SWAGGER_CONSTANTS.TYPE_BEARER,
          bearerFormat: SWAGGER_CONSTANTS.TYPE_JWT,
          description: SWAGGER_CONSTANTS.JWT_DESCRIPTION
        }
      },
      schemas: {
        Product: {
          type: SWAGGER_CONSTANTS.TYPE_OBJECT,
          required: [SWAGGER_CONSTANTS.FIELD_NAME, SWAGGER_CONSTANTS.FIELD_DESCRIPTION, SWAGGER_CONSTANTS.FIELD_PRICE, SWAGGER_CONSTANTS.FIELD_CATEGORY, SWAGGER_CONSTANTS.FIELD_STOCK],
          properties: {
            id: {
              type: SWAGGER_CONSTANTS.TYPE_STRING,
              description: SWAGGER_CONSTANTS.ID_DESCRIPTION,
              example: SWAGGER_CONSTANTS.EXAMPLE_PRODUCT_ID
            },
            name: {
              type: SWAGGER_CONSTANTS.TYPE_STRING,
              description: SWAGGER_CONSTANTS.PRODUCT_NAME_DESCRIPTION,
              example: SWAGGER_CONSTANTS.EXAMPLE_PRODUCT_NAME
            },
            description: {
              type: SWAGGER_CONSTANTS.TYPE_STRING,
              description: SWAGGER_CONSTANTS.PRODUCT_DESCRIPTION_DESCRIPTION,
              example: SWAGGER_CONSTANTS.EXAMPLE_PRODUCT_DESCRIPTION
            },
            price: {
              type: SWAGGER_CONSTANTS.TYPE_NUMBER,
              minimum: 0,
              description: SWAGGER_CONSTANTS.PRODUCT_PRICE_DESCRIPTION,
              example: 150.00
            },
            category: {
              type: SWAGGER_CONSTANTS.TYPE_STRING,
              description: SWAGGER_CONSTANTS.CATEGORY_DESCRIPTION,
              example: SWAGGER_CONSTANTS.EXAMPLE_CATEGORY
            },
            stock: {
              type: SWAGGER_CONSTANTS.TYPE_INTEGER,
              minimum: 0,
              description: SWAGGER_CONSTANTS.PRODUCT_STOCK_DESCRIPTION,
              example: 50
            },
            images: {
              type: SWAGGER_CONSTANTS.TYPE_ARRAY,
              items: {
                type: SWAGGER_CONSTANTS.TYPE_STRING,
                format: SWAGGER_CONSTANTS.FORMAT_URI
              },
              description: SWAGGER_CONSTANTS.IMAGES_DESCRIPTION,
              example: [SWAGGER_CONSTANTS.EXAMPLE_IMAGE_URL]
            },
            createdAt: {
              type: SWAGGER_CONSTANTS.TYPE_STRING,
              format: SWAGGER_CONSTANTS.FORMAT_DATE_TIME,
              description: SWAGGER_CONSTANTS.CREATED_AT_DESCRIPTION
            },
            updatedAt: {
              type: SWAGGER_CONSTANTS.TYPE_STRING,
              format: SWAGGER_CONSTANTS.FORMAT_DATE_TIME,
              description: SWAGGER_CONSTANTS.UPDATED_AT_DESCRIPTION
            }
          }
        },
        AuthRequest: {
          type: SWAGGER_CONSTANTS.TYPE_OBJECT,
          required: [SWAGGER_CONSTANTS.FIELD_EMAIL, SWAGGER_CONSTANTS.FIELD_PASSWORD],
          properties: {
            email: {
              type: SWAGGER_CONSTANTS.TYPE_STRING,
              format: SWAGGER_CONSTANTS.FORMAT_EMAIL,
              description: SWAGGER_CONSTANTS.EMAIL_USER_DESCRIPTION,
              example: SWAGGER_CONSTANTS.EXAMPLE_EMAIL
            },
            password: {
              type: SWAGGER_CONSTANTS.TYPE_STRING,
              minLength: SANITIZATION.MIN_PASSWORD_LENGTH,
              description: SWAGGER_CONSTANTS.PASSWORD_USER_DESCRIPTION,
              example: SWAGGER_CONSTANTS.EXAMPLE_PASSWORD
            }
          }
        },
        AuthResponse: {
          type: SWAGGER_CONSTANTS.TYPE_OBJECT,
          properties: {
            message: {
              type: SWAGGER_CONSTANTS.TYPE_STRING,
              example: SWAGGER_CONSTANTS.EXAMPLE_LOGIN_MESSAGE
            },
            payload: {
              type: SWAGGER_CONSTANTS.TYPE_OBJECT,
              properties: {
                token: {
                  type: SWAGGER_CONSTANTS.TYPE_STRING,
                  description: SWAGGER_CONSTANTS.JWT_TOKEN_DESCRIPTION,
                  example: SWAGGER_CONSTANTS.EXAMPLE_JWT_TOKEN
                }
              }
            }
          }
        },
        Error: {
          type: SWAGGER_CONSTANTS.TYPE_OBJECT,
          properties: {
            message: {
              type: SWAGGER_CONSTANTS.TYPE_STRING,
              description: SWAGGER_CONSTANTS.ERROR_MESSAGE_DESCRIPTION
            },
            errors: {
              type: SWAGGER_CONSTANTS.TYPE_ARRAY,
              items: {
                type: SWAGGER_CONSTANTS.TYPE_STRING
              },
              description: SWAGGER_CONSTANTS.ERROR_LIST_DESCRIPTION
            }
          }
        },
        SuccessResponse: {
          type: SWAGGER_CONSTANTS.TYPE_OBJECT,
          properties: {
            message: {
              type: SWAGGER_CONSTANTS.TYPE_STRING,
              description: SWAGGER_CONSTANTS.MESSAGE_SUCCESS
            },
            payload: {
              type: SWAGGER_CONSTANTS.TYPE_OBJECT,
              description: SWAGGER_CONSTANTS.RESPONSE_DATA_DESCRIPTION
            }
          }
        }
      }
    },
    tags: [
      {
        name: SWAGGER_CONSTANTS.TAG_AUTH,
        description: SWAGGER_CONSTANTS.TAG_AUTH_DESCRIPTION
      },
      {
        name: SWAGGER_CONSTANTS.TAG_PRODUCTS,
        description: SWAGGER_CONSTANTS.TAG_PRODUCTS_DESCRIPTION
      },
      {
        name: SWAGGER_CONSTANTS.TAG_HEALTH,
        description: SWAGGER_CONSTANTS.TAG_HEALTH_DESCRIPTION
      }
    ]
  },
  apis: [
    join(projectDir, SWAGGER_CONSTANTS.ROUTES_PATTERN),
    join(projectDir, SWAGGER_CONSTANTS.INDEX_FILE)
  ]
};

// Generar especificación Swagger
const swaggerSpec = swaggerJSDoc(swaggerOptions);

// Opciones de personalización para Swagger UI
const swaggerUiOptions = {
  customCss: SWAGGER_CONSTANTS.CSS_TOPBAR_HIDDEN,
  customSiteTitle: SWAGGER_CONSTANTS.SITE_TITLE,
  customfavIcon: SWAGGER_CONSTANTS.FAVICON_PATH,
  swaggerOptions: {
    persistAuthorization: true,
    displayRequestDuration: true
  }
};

module.exports = {  swaggerSpec, swaggerUi, swaggerUiOptions  };
