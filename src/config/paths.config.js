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
    EXPRESS_VALIDATOR: 'express-validator',

    // Autenticación y seguridad
    JSONWEBTOKEN: 'jsonwebtoken',
    BCRYPT: 'bcrypt',
    HELMET: 'helmet',
    EXPRESS_RATE_LIMIT: 'express-rate-limit',

    // Validación
    JOI: 'joi',

    // Firebase/Firestore
    FIREBASE_FIRESTORE: 'firebase/firestore',

    // Node.js core modules
    PATH: 'path',
    FS: 'fs',
    OS: 'os',

    // Logging
    MORGAN: 'morgan',
    WINSTON: 'winston',
    
    // Optimización y compresión
    COMPRESSION: 'compression',
    EXPRESS_SLOW_DOWN: 'express-slow-down',

    // Cache
    NODE_CACHE: 'node-cache',

    // Swagger
    SWAGGER_JSDOC: 'swagger-jsdoc',
    SWAGGER_UI_EXPRESS: 'swagger-ui-express'
};

const PATHS = {
    // Configuraciones
    CONFIG: {
        DATABASE: './config/db.config.js',
        JWT: './config/jwt.config.js',
        LOGGER: './config/logger.config.js',
        SECURITY: './config/security.config.js',
        OPTIMIZATION: './config/optimization.config.js',
        CACHE: './config/cache.config.js',
        SWAGGER: './config/swagger.config.js',
        API_VERSIONS: './config/apiVersions.config.js'
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
        AUTHENTICATION: './middlewares/authentication.middleware.js',
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

    // Endpoints de API por versión
    AUTH: '/auth',
    API_PRODUCTS: '/api/products',
    API_CATEGORY: '/api/category',
    PRODUCTS_V2: '/products',
    CATEGORY_V2: '/category',
    USERS: '/users',

    // Rutas de recursos
    AUTH_BASE: '/auth',
    AUTH_LOGIN: '/login',
    AUTH_REGISTER: '/register',
    AUTH_LOGIN_FULL: '/auth/login',
    AUTH_REGISTER_FULL: '/auth/register',

    PRODUCTS_BASE: '/products',
    PRODUCTS_ROOT: '/',
    PRODUCTS_BY_ID: '/:id',
    PRODUCTS_CREATE: '/create',

    CATEGORY_BASE: '/category',
    CATEGORY_ROOT: '/',
    CATEGORY_BY_ID: '/:id',
    CATEGORY_HIERARCHY: '/hierarchy',
    CATEGORY_CREATE: '/create',
    CATEGORY_SUBCATEGORY: '/:parentId/subcategory',
    CATEGORY_SUBCATEGORY_CREATE: '/:id/subcategory/create',
    CATEGORY_SUBCATEGORY_BY_IDS: '/:categoryId/subcategory/:subcategoryId',

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
    // Códigos de éxito
    OK: 200,
    CREATED: 201,

    MULTIPLE_CHOICES: 300,

    // Códigos de error del cliente
    BAD_REQUEST: 400,
    UNAUTHORIZED: 401,
    FORBIDDEN: 403,
    NOT_FOUND: 404,
    UNPROCESSABLE_ENTITY: 422,

    // Códigos de error del servidor
    INTERNAL_SERVER_ERROR: 500,
    SERVICE_UNAVAILABLE: 503
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
    PROCESS_EXIT_CODE: 1,
    DEFAULT_STATUS_CODE: 200,
    SERVER_ERROR_CODE: 500
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

// Constantes para validación
const VALIDATION_TYPES = {
    PARAMS: 'params',
    QUERY: 'query',
    BODY: 'body'
};

// Rutas relativas específicas por contexto
const RELATIVE_PATHS = {
    // Desde model/ hacia otros directorios
    FROM_MODEL: {
        CONFIG_DATABASE: '../config/db.config.js',
        CONFIG_JWT: '../config/jwt.config.js',
        CONFIG_CACHE: '../config/cache.config.js',
        UTILS_FIREBASE: '../utils/firebase.utils.js',
        UTILS_RESPONSE: '../utils/response.utils.js'
    },

    // Desde controllers/ hacia otros directorios  
    FROM_CONTROLLERS: {
        MODELS_AUTH: '../model/auth.model.js',
        MODELS_PRODUCTS: '../model/products.model.js',
        MODELS_CATEGORY: '../model/category.model.js',
        SERVICES_AUTH: '../services/auth.service.js',
        SERVICES_PRODUCTS: '../services/products.service.js',
        SERVICES_CATEGORY: '../services/category.service.js',
        UTILS_CONTROLLER: '../utils/controller.utils.js',
        UTILS_CATEGORY: '../utils/category.utils.js'
    },

    // Desde config/ hacia otros directorios
    FROM_CONFIG: {
        UTILS_URL: '../utils/url.utils.js'
    },
    FROM_MIDDLEWARES: {
        CONFIG_LOGGER: '../config/logger.config.js',
        CONFIG_API_VERSIONS: '../config/apiVersions.config.js',
        CONFIG_CACHE: '../config/cache.config.js',
        UTILS_MESSAGES: '../utils/messages.utils.js'
    },

    // Desde utils/ hacia otros directorios
    FROM_UTILS: {
        CONFIG_LOGGER: '../config/logger.config.js',
        CONFIG_SWAGGER: '../config/swagger.config.js',
        RESPONSE_UTILS: './response.utils.js',
        FIREBASE_UTILS: './firebase.utils.js',
        CONTROLLER_UTILS: './controller.utils.js',
        CATEGORY_UTILS: './category.utils.js'
    },

    // Desde services/ hacia otros directorios
    FROM_SERVICES: {
        MODELS_AUTH: '../model/auth.model.js',
        MODELS_CATEGORY: '../model/category.model.js',
        UTILS_RESPONSE: '../utils/response.utils.js',
        CONFIG_JWT: '../config/jwt.config.js',
    },

    // Desde routes/ hacia otros directorios
    FROM_ROUTES: {
        CONTROLLERS_AUTH: '../controllers/auth.controller.js',
        CONTROLLERS_PRODUCTS: '../controllers/products.controller.js',
        CONTROLLERS_CATEGORY: '../controllers/category.controller.js',
        MIDDLEWARES_VALIDATION: '../middlewares/validation.middleware.js',
        MIDDLEWARES_AUTH: '../middlewares/authentication.middleware.js',
        SCHEMAS_AUTH: '../schemas/auth.schema.js',
        SCHEMAS_PRODUCTS: '../schemas/products.schema.js',
        SCHEMAS_CATEGORY: '../schemas/category.schema.js',
        SCHEMAS_COMMON: '../schemas/common.schema.js',
        CONFIG_SECURITY: '../config/security.config.js',
        CONFIG_CACHE: '../config/cache.config.js',
        CONFIG_OPTIMIZATION: '../config/optimization.config.js'
    }
};

// Formatos y separadores
const FORMAT_PATTERNS = {
    LOG_TIMESTAMP: '[${timestamp}] ${level.toUpperCase()}: ${message}',
    COLON_SEPARATOR: ':',
    NEWLINE: '\n',
    BULLET_INDENT: '   • '
};

// Constantes específicas para version middleware
const VERSION_MIDDLEWARE = {
    // Headers HTTP
    HEADER_API_VERSION: 'API-Version',
    HEADER_API_SUPPORTED_VERSIONS: 'API-Supported-Versions',
    HEADER_API_DEPRECATION_WARNING: 'API-Deprecation-Warning',
    HEADER_USER_AGENT: 'User-Agent',

    // Paths y rutas
    API_PREFIX: '/api',
    DOCS_ENDPOINT: '/docs',
    AUTH_ROUTE: '/auth',

    // Patrones y separadores
    VERSION_REGEX: /^\/api\/(v\d+)\//,
    VERSION_SEPARATOR: ', ',
    API_NAME: 'VolleyballArt API',
    USER_AGENT_UNKNOWN: 'Unknown',

    // Separadores y espacios
    EMPTY_LINE: ''
};

// Constantes para sanitización
const SANITIZATION = {
    // Tipos de datos
    TYPE_OBJECT: 'object',
    TYPE_STRING: 'string',

    // Patrones regex para sanitización
    MONGO_DANGEROUS_CHARS: /[${}]/g,
    HTML_SCRIPT_TAGS: /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
    HTML_ALL_TAGS: /<[^>]*>/g,

    // Strings de reemplazo
    EMPTY_STRING: '',

    // Configuración de validación
    MIN_PASSWORD_LENGTH: 6,

    // Campos de validación
    FIELD_EMAIL: 'email',
    FIELD_PASSWORD: 'password',

    // Propiedades de request
    PROP_SANITIZED_QUERY: 'sanitizedQuery'
};

// Constantes para performance middleware
const PERFORMANCE = {
    // Headers HTTP
    HEADER_RESPONSE_TIME: 'X-Response-Time',
    HEADER_REQUEST_ID: 'X-Request-ID',
    REQUEST_ID_PREFIX: 'req_',

    // Sufijos y unidades
    TIME_UNIT_MS: 'ms',
    PERCENTAGE_UNIT: '%',

    // Sistema operativo
    LINUX_PLATFORM: 'linux',
    MEMINFO_PATH: '/proc/meminfo',
    MEMINFO_ENCODING: 'utf8',
    MEMINFO_REGEX: /MemTotal:\s*(\d+)/,

    // Estados de salud
    STATUS_HEALTHY: 'healthy',
    STATUS_UNHEALTHY: 'unhealthy',

    // Niveles de alerta
    ALERT_WARNING: 'warning',
    ALERT_CRITICAL: 'critical'
};

// Constantes para logging middleware
const LOGGING = {
    // Formatos de Morgan
    MORGAN_FORMAT_CUSTOM: ':remote-addr - :remote-user [:date[clf]] ":method :url HTTP/:http-version" :status :res[content-length] ":referrer" ":user-agent" - :response-time ms',
    MORGAN_FORMAT_DEV: 'dev',

    // Headers HTTP
    USER_AGENT_HEADER: 'User-Agent',

    // Identificadores de usuario
    ANONYMOUS_USER: 'anonymous',

    // Separadores
    LOG_SEPARATOR: ' - ',

    // Unidades
    TIME_UNIT: 'ms'
};

// Constantes para error middleware
const ERROR_HANDLING = {
    // Propiedades de error
    BODY_PROPERTY: 'body',

    // Códigos de estado por defecto
    DEFAULT_ERROR_STATUS: 500
};

// Constantes para cache middleware
const CACHE = {
    // Tipos de cache
    TYPE_GENERAL: 'general',
    TYPE_PRODUCTS: 'products',
    TYPE_AUTH: 'auth',

    // Headers de cache
    HEADER_CACHE: 'X-Cache',
    HEADER_CACHE_KEY: 'X-Cache-Key',
    HEADER_CACHE_TTL: 'X-Cache-TTL',
    HEADER_ETAG: 'ETag',

    // Estados de cache
    STATUS_HIT: 'HIT',
    STATUS_MISS: 'MISS',

    // Headers de no-cache
    CACHE_CONTROL: 'Cache-Control',
    PRAGMA: 'Pragma',
    EXPIRES: 'Expires',
    SURROGATE_CONTROL: 'Surrogate-Control',

    // Valores de no-cache
    NO_STORE_VALUE: 'no-store, no-cache, must-revalidate, proxy-revalidate',
    NO_CACHE_VALUE: 'no-cache',
    NO_CACHE_NO_STORE_MUST_REVALIDATE: 'no-cache, no-store, must-revalidate',
    PUBLIC_MAX_AGE_PREFIX: 'public, max-age=',
    ETAG_PREFIX: 'W/"',
    EXPIRES_VALUE: '0',
    NO_STORE_SURROGATE: 'no-store',

    // Separadores para cache keys
    KEY_SEPARATOR: ':',
    QUERY_SEPARATOR: '&',
    QUERY_PREFIX: '?',
    USER_PREFIX: ':user:',
    EQUALS_SEPARATOR: '=',

    // Prefijos de cache
    ROUTE_PREFIX: 'route_',

    // Símbolos y caracteres
    QUOTE_SYMBOL: '"',

    // Eventos
    FINISH_EVENT: 'finish',

    // Usuario anónimo
    ANONYMOUS_USER: 'anonymous'
};

// Constantes para authentication middleware
const AUTHENTICATION = {
    // Headers
    AUTHORIZATION_HEADER: 'authorization',

    // Separadores y formatos
    TOKEN_SEPARATOR: ' ',
    TOKEN_INDEX: 1
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
    FORMAT_PATTERNS,
    VALIDATION_TYPES,
    VERSION_MIDDLEWARE,
    SANITIZATION,
    PERFORMANCE,
    LOGGING,
    ERROR_HANDLING,
    CACHE,
    AUTHENTICATION
};
