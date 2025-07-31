/**
 * Configuración centralizada de rutas y paths del proyecto
 * Evita duplicación de rutas y facilita el mantenimiento
 */

// Dependencias externas de npm
const EXTERNAL_PACKAGES = {
    // Firebase
    FIREBASE_AUTH: 'firebase/auth',
    FIREBASE_FIRESTORE: 'firebase/firestore',
    FIREBASE_APP: 'firebase/app',

    // Express y middleware
    EXPRESS: 'express',
    CORS: 'cors',
    DOTENV: 'dotenv',

    // Autenticación y seguridad
    JSONWEBTOKEN: 'jsonwebtoken',
    BCRYPT: 'bcrypt',

    // Node.js core modules
    PATH: 'path'
};

const PATHS = {
    // Configuraciones
    CONFIG: {
        DATABASE: './config/dataBase.js',
        JWT: './config/jwt.js',
        LOGGER: './config/logger.js',
        SECURITY: './config/security.js',
        OPTIMIZATION: './config/optimization.js',
        CACHE: './config/cache.js',
        SWAGGER: './config/swagger.js',
        API_VERSIONS: './config/api-versions.js'
    },

    // Utilidades
    UTILS: {
        INDEX: './utils/index.js',
        TOKEN_GENERATOR: './utils/tokenGenerator.js',
        VALIDATE_PRODUCT_DATA: './utils/validateProductData.js',
        RESPONSE_UTILS: './utils/response.utils.js',
        URL_UTILS: './utils/url.utils.js',
        FIREBASE_UTILS: './utils/firebase.utils.js',
        CONTROLLER_UTILS: './utils/controller.utils.js',
        CATEGORY_UTILS: './utils/category.utils.js'
    },

    // Modelos
    MODELS: {
        AUTH: './model/auth.model.js',
        PRODUCTS: './model/products.model.js'
    },

    // Servicios
    SERVICES: {
        AUTH: './services/auth.service.js',
        PRODUCTS: './services/products.service.js'
    },

    // Controladores
    CONTROLLERS: {
        AUTH: './controllers/auth.controller.js',
        PRODUCTS: './controllers/products.controller.js'
    },

    // Middlewares
    MIDDLEWARES: {
        AUTHENTICATION: './middlewares/authentication.js',
        ERROR: './middlewares/error.middleware.js',
        LOGGER: './middlewares/logger.middleware.js',
        SANITIZATION: './middlewares/sanitization.middleware.js',
        PERFORMANCE: './middlewares/performance.middleware.js',
        VERSION: './middlewares/version.middleware.js'
    },

    // Rutas
    ROUTES: {
        AUTH: './routes/auth.routes.js',
        PRODUCTS: './routes/products.routes.js',
        CATEGORY: './routes/category.routes.js'
    }
};

// Endpoints y rutas de la API
const API_ENDPOINTS = {
    // Rutas principales
    ROOT: '/',
    API_ROOT: '/api',
    TEST: '/test',
    DEBUG: '/debug',

    // Documentación
    API_DOCS: '/api/docs',
    SWAGGER_JSON: '/api/swagger.json',

    // Sistema
    HEALTH: '/api/health',
    METRICS: '/api/metrics',
    CACHE_STATS: '/api/cache/stats',
    CACHE_CLEAR: '/api/cache/clear',

    // Rutas de recursos
    AUTH_BASE: '/auth',
    AUTH_LOGIN: '/login',
    AUTH_REGISTER: '/register',
    AUTH_LOGIN_FULL: '/auth/login',
    AUTH_REGISTER_FULL: '/auth/register',

    PRODUCTS_BASE: '/products',
    CATEGORY_BASE: '/category',

    // Directorio público
    PUBLIC_DIR: 'public'
};

// Variables de entorno y configuración
const ENV_CONFIG = {
    PORT_DEFAULT: 5000,
    JSON_LIMIT: '10mb',
    NODE_ENV_DEVELOPMENT: 'development',
    NODE_ENV_PRODUCTION: 'production',
    NODE_ENV_UNKNOWN: 'unknown'
};

// Headers HTTP comunes
const HTTP_HEADERS = {
    CONTENT_TYPE: 'Content-Type',
    AUTHORIZATION: 'Authorization',
    CONTENT_TYPE_JSON: 'application/json',
    USER_AGENT: 'User-Agent',
    CONTENT_LENGTH: 'Content-Length'
};

// Métodos HTTP
const HTTP_METHODS = {
    GET: 'GET',
    POST: 'POST',
    PUT: 'PUT',
    DELETE: 'DELETE'
};

// Códigos de estado HTTP
const HTTP_STATUS = {
    OK: 200,
    MULTIPLE_CHOICES: 300,
    BAD_REQUEST: 400,
    INTERNAL_SERVER_ERROR: 500
};

// Eventos de Node.js
const NODE_EVENTS = {
    UNCAUGHT_EXCEPTION: 'uncaughtException',
    UNHANDLED_REJECTION: 'unhandledRejection'
};

// Niveles de logging
const LOG_LEVELS = {
    ERROR: 'error',
    INFO: 'info',
    WARN: 'warn',
    DEBUG: 'debug'
};

// Valores booleanos y números comunes
const COMMON_VALUES = {
    EXTENDED_TRUE: true,
    PROCESS_EXIT_CODE: 1,
    DEFAULT_STATUS_CODE: 200,
    SERVER_ERROR_CODE: 500,
    CACHED_FALSE: false
};

// Variables de entorno
const ENV_VARIABLES = {
    ENABLE_CONSOLE_LOGS: 'ENABLE_CONSOLE_LOGS',
    NODE_ENV: 'NODE_ENV',
    VERCEL: 'VERCEL',
    VERCEL_URL: 'VERCEL_URL',
    PORT: 'PORT',
    BASE_DOMAIN: 'BASE_DOMAIN'
};

// Valores de configuración
const CONFIG_VALUES = {
    TRUE_STRING: 'true',
    REQ_PREFIX: 'req_',
    DEFAULT_PORT: 5000,
    LOCALHOST_PROTOCOL: 'http://localhost:',
    UNKNOWN: 'unknown',
    CACHE_DEFAULT_NAME: 'cache',
    TIME_UNIT_MS: 'ms',
    DEFAULT_TTL: 300,
    BAD_REQUEST_CODE: 400,

    // Valores específicos de middleware
    ASYNC: 'async',
    MIDDLEWARE: 'middleware',
    REQUEST: 'request',
    RESPONSE: 'response',
    ERROR: 'error',
    CACHE_HIT: 'HIT',
    CACHE_MISS: 'MISS'
};

// Rutas relativas específicas por contexto
const RELATIVE_PATHS = {
    // Desde model/ hacia otros directorios
    FROM_MODEL: {
        CONFIG_DATABASE: '../config/dataBase.js',
        CONFIG_JWT: '../config/jwt.js',
        CONFIG_CACHE: '../config/cache.js',
        UTILS_FIREBASE: '../utils/firebase.utils.js',
        UTILS_RESPONSE: '../utils/response.utils.js'
    },

    // Desde controllers/ hacia otros directorios  
    FROM_CONTROLLERS: {
        MODELS_AUTH: '../model/auth.model.js',
        MODELS_PRODUCTS: '../model/products.model.js'
    },

    // Desde middlewares/ hacia otros directorios
    FROM_MIDDLEWARES: {
        CONFIG_LOGGER: '../config/logger.js'
    },

    // Desde utils/ hacia otros directorios
    FROM_UTILS: {
        CONFIG_LOGGER: '../config/logger.js',
        CONFIG_SWAGGER: '../config/swagger.js',
        RESPONSE_UTILS: './response.utils.js',
        FIREBASE_UTILS: './firebase.utils.js',
        CONTROLLER_UTILS: './controller.utils.js',
        CATEGORY_UTILS: './category.utils.js'
    },

    // Desde routes/ hacia otros directorios
    FROM_ROUTES: {
        CONTROLLERS_AUTH: '../controllers/auth.controller.js',
        CONTROLLERS_PRODUCTS: '../controllers/products.controller.js',
        CONTROLLERS_CATEGORY: '../controllers/category.controller.js',
        MIDDLEWARES_VALIDATION: '../middlewares/validation.middleware.js',
        MIDDLEWARES_AUTH: '../middlewares/authentication.js',
        SCHEMAS_AUTH: '../schemas/auth.schema.js',
        SCHEMAS_PRODUCTS: '../schemas/products.schema.js',
        SCHEMAS_CATEGORY: '../schemas/category.schema.js',
        SCHEMAS_COMMON: '../schemas/common.schema.js'
    }
};

// Formatos y separadores
const FORMAT_PATTERNS = {
    LOG_TIMESTAMP: '[${timestamp}] ${level.toUpperCase()}: ${message}',
    COLON_SEPARATOR: ':',
    NEWLINE: '\n',
    BULLET_INDENT: '   • '
};

module.exports = {
    EXTERNAL_PACKAGES,
    PATHS,
    RELATIVE_PATHS,
    API_ENDPOINTS,
    ENV_CONFIG,
    HTTP_HEADERS,
    HTTP_METHODS,
    HTTP_STATUS,
    NODE_EVENTS,
    LOG_LEVELS,
    COMMON_VALUES,
    ENV_VARIABLES,
    CONFIG_VALUES,
    FORMAT_PATTERNS
};
