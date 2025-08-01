/**
 * Mensajes centralizados para respuestas de la API
 * Evita duplicación de código y mantiene consistencia en mensajes
 */

const PRODUCTS_MESSAGES = {
  // Operaciones de lectura
  GET_ALL_SUCCESS: "📋 Productos obtenidos exitosamente",
  GET_BY_ID_SUCCESS: "🏐 Producto obtenido exitosamente",
  GET_ALL_ERROR: "🚨 Error al obtener productos",
  GET_BY_ID_ERROR: "❌ Error al obtener producto",
  NOT_FOUND: (id) => `🔍 No se encontró ningún producto con el ID: ${id}`,

  // Operaciones de escritura
  CREATE_SUCCESS: "✅ Producto creado exitosamente",
  CREATE_ERROR: "❌ Error al crear producto",

  UPDATE_SUCCESS: "🔄 Producto actualizado exitosamente",
  UPDATE_ERROR: "❌ Error al actualizar producto",

  DELETE_SUCCESS: "🗑️ Producto eliminado exitosamente",
  DELETE_ERROR: "❌ Error al eliminar producto",

  // Recursos
  RESOURCE_SINGLE: "producto",
  RESOURCE_PLURAL: "productos"
};

const CATEGORIES_MESSAGES = {
  // Operaciones de lectura
  GET_ALL_SUCCESS: "📋 Categorías obtenidas exitosamente",
  GET_BY_ID_SUCCESS: "📂 Categoría obtenida exitosamente",
  GET_SUBCATEGORIES_SUCCESS: "📂 Subcategorías obtenidas exitosamente",
  GET_HIERARCHY_SUCCESS: "🌳 Jerarquía de categorías obtenida exitosamente",
  GET_ALL_ERROR: "🚨 Error al obtener categorías",
  GET_BY_ID_ERROR: "🚨 Error al obtener categoría",
  GET_SUBCATEGORIES_ERROR: "🚨 Error al obtener subcategorías",
  GET_HIERARCHY_ERROR: "🚨 Error al obtener jerarquía de categorías",
  NOT_FOUND: (id) => `🔍 No se encontró ninguna categoría con el ID: ${id}`,
  NOT_FOUND_SUBCATEGORIES: (parentId) => `📂 No se encontraron subcategorías para la categoría: ${parentId}`,
  NOT_FOUND_PARENT: "🔍 Categoría padre no encontrada",
  EMPTY_CATEGORIES: "📂 No se encontraron categorías. Crea la primera categoría.",

  // Operaciones de escritura - Categorías
  CREATE_CATEGORY_SUCCESS: "✅ Categoría creada exitosamente",
  CREATE_CATEGORY_ERROR: "🚨 Error al crear categoría",

  UPDATE_CATEGORY_SUCCESS: "✅ Categoría actualizada exitosamente",
  UPDATE_CATEGORY_ERROR: "🚨 Error al actualizar categoría",

  DELETE_CATEGORY_SUCCESS: "✅ Categoría eliminada exitosamente",
  DELETE_CATEGORY_ERROR: "🚨 Error al eliminar categoría",

  // Operaciones de escritura - Subcategorías
  CREATE_SUBCATEGORY_SUCCESS: "✅ Subcategoría creada exitosamente",
  CREATE_SUBCATEGORY_ERROR: "🚨 Error al crear subcategoría",

  UPDATE_SUBCATEGORY_SUCCESS: "✅ Subcategoría actualizada exitosamente",
  UPDATE_SUBCATEGORY_ERROR: "🚨 Error al actualizar subcategoría",

  DELETE_SUBCATEGORY_SUCCESS: "✅ Subcategoría eliminada exitosamente",
  DELETE_SUBCATEGORY_ERROR: "🚨 Error al eliminar subcategoría",
  CANNOT_DELETE_HAS_SUBCATEGORIES: "No se puede eliminar la categoría porque tiene subcategorías. Use deleteSubcategory: true para eliminarlas también.",

  // Recursos
  RESOURCE_CATEGORIES: "categorías",
  RESOURCE_CATEGORY: "categoría",
  RESOURCE_SUBCATEGORY: "subcategoría",
  RESOURCE_HIERARCHY: "jerarquía de categoria"
};

const AUTH_MESSAGES = {
  LOGIN_SUCCESS: "🔐 Inicio de sesión exitoso",
  LOGIN_ERROR: "❌ Error en el inicio de sesión",
  REGISTER_SUCCESS: "👤 Usuario registrado exitosamente",
  REGISTER_ERROR: "❌ Error en el proceso de registro",
  INVALID_CREDENTIALS: "🚫 Credenciales inválidas",
  INCORRECT_CREDENTIALS: "🚫 Credenciales incorrectas: email o password incorrectos",
  EMAIL_ALREADY_IN_USE: "📧 El email ya está en uso",
  WEAK_PASSWORD: "🔒 La contraseña es muy débil (mínimo 6 caracteres)",
  INVALID_EMAIL: "📧 Email inválido",
  TOKEN_INVALID: "🚫 Token inválido",
  TOKEN_EXPIRED: "⏰ Token expirado",
  UNAUTHORIZED: "🚫 No autorizado",

  // Operaciones
  OPERATION_LOGIN: "login",
  OPERATION_REGISTER: "register"
};

const PERFORMANCE_MESSAGES = {
  // Mensajes de alerta
  HIGH_MEMORY_USAGE: "High memory usage:",
  HIGH_RESPONSE_TIME: "High average response time:",
  TOO_MANY_REQUESTS: "Too many requests in progress:",
  
  // Headers de request
  REQUEST_ID_HEADER: 'x-request-id'
};

const LOGGING_MESSAGES = {
  // Prefijos de logs
  REQUEST_PREFIX: '📨 [REQUEST]',
  RESPONSE_PREFIX: '📤 [RESPONSE]'
};

const CACHE_MESSAGES = {
  // Mensajes de cache hit/miss
  CACHE_HIT: '🎯 Cache HIT para',
  CACHE_MISS: '📦 Cache MISS - Guardando en cache',
  CACHE_INVALIDATED_PRODUCTS: '🗑️ Cache de productos invalidado',
  CACHE_INVALIDATED_AUTH: '🗑️ Cache de auth invalidado'
};

const AUTH_MIDDLEWARE_MESSAGES = {
  // Mensajes de log
  ACCESS_WITHOUT_TOKEN: '🔐 Intento de acceso sin token de autorización',
  INVALID_TOKEN_FORMAT: '🔐 Token de autorización con formato inválido',
  INVALID_OR_EXPIRED_TOKEN: '🔐 Token JWT inválido o expirado',
  AUTHENTICATION_SUCCESS: '✅ Autenticación exitosa',
  
  // Mensajes de respuesta
  TOKEN_REQUIRED: '🔐 Token de acceso requerido. Incluye el header Authorization.',
  TOKEN_INVALID_FORMAT: '🚫 Token de acceso inválido. Formato: Bearer <token>',
  TOKEN_INVALID_OR_EXPIRED: '🔐 Token de acceso inválido o expirado.'
};

const SANITIZATION_MESSAGES = {
  // Mensajes de error
  SANITIZATION_ERROR: "🚨 Error en sanitización:",
  
  // Mensajes de validación
  INVALID_DATA: "Datos inválidos"
};

const VERSION_MESSAGES = {
  // Mensajes de error
  VERSION_NOT_SUPPORTED: "Versión de API no soportada:",
  VERSION_INFO_NOT_FOUND: "Información de versión",
  VERSION_INFO_NOT_FOUND_SUFFIX: "no encontrada",
  
  // Mensajes de deprecación
  VERSION_DEPRECATED_PREFIX: "Version",
  VERSION_DEPRECATED_SUFFIX: "is deprecated",
  
  // Mensajes de documentación
  API_DOCUMENTATION_PREFIX: "Documentación de la API para la versión",
  
  // Mensajes de registro de rutas
  REGISTER_ROUTE_AUTH: "✅ Registrando ruta (auth):",
  REGISTER_ROUTE_VERSIONED: "✅ Registrando ruta:",
  REGISTER_ROUTE_NO_VERSION: "✅ Registrando ruta (sin versión):",
  REGISTER_VERSION_ENDPOINTS: "\n📋 Registrando endpoints de información de versiones:",
  REGISTER_DOCS_FOR: "✅",
  REGISTER_DOCS_SUFFIX: "- Documentación de"
};

const GENERAL_MESSAGES = {
  INTERNAL_ERROR: "🚨 Error interno del servidor",
  VALIDATION_ERROR: "📝 Datos inválidos",
  NOT_FOUND_GENERIC: "🔍 Recurso no encontrado",
  NOT_FOUND_ROUTE: "🔍 Recurso no encontrado o ruta inválida",
  FORBIDDEN: "🚫 Acceso prohibido",
  JSON_MALFORMED: "📝 JSON malformado. Verifica la sintaxis de los datos enviados.",
  SUCCESS_GENERIC: "✅ Operación exitosa",
  API_INFO: "Endpoint de información de la API RESTful VolleyballArt",
  SERVER_HEALTH: "✅ Servidor funcionando correctamente",
  SYSTEM_METRICS: "Métricas del sistema",
  CACHE_STATS: "Estadísticas de cache"
};

const LOG_MESSAGES = {
  ERROR_LOG: "🚨 [ERROR]",
  JSON_ERROR_LOG: "⚠️ [JSON_ERROR] JSON malformado desde",
  ROUTE_NOT_FOUND_LOG: "🔍 [404] Ruta no encontrada:",
  SERVER_STARTED: "✅ Servidor iniciado exitosamente",
  ERROR_INTERNAL: "Error interno del servidor",
  ROOT_ROUTE_ERROR: "Error en ruta raíz"
};

const SYSTEM_CONSTANTS = {
  USER_AGENT_HEADER: "User-Agent",
  ANONYMOUS_USER: "anonymous",
  DEVELOPMENT_ENV: "development",
  API_ENDPOINT_HELP: "Verifica la URL y el método HTTP. Consulta /api para ver endpoints disponibles."
};

const SYSTEM_MESSAGES = {
  // Mensajes de sistema y debug
  UNCAUGHT_EXCEPTION: "🚨 Uncaught Exception:",
  UNHANDLED_REJECTION: "🚨 Unhandled Rejection:",
  SERVER_STARTING: "🚀 Iniciando servidor VolleyballArt API...",
  ROOT_REDIRECT: "🏠 Acceso a ruta raíz, redirigiendo a /api",
  CACHE_CLEARED_BY_USER: "🗑️ Cache limpiado por usuario",
  DEBUG_INFO: "Debug info for Vercel",
  CACHE_CLEARED_SUCCESS: "Cache limpiado exitosamente",
  DEBUG_ENDPOINT_ERROR: "Error en debug endpoint",

  // Configuración CORS
  CORS_ORIGIN: "*",
  CORS_CREDENTIALS: true,

  // Mensajes de respuesta y logging
  SERVER_RUNNING: "🌐 Server running on",
  API_DOCUMENTATION: "📚 API Documentation:",
  SWAGGER_DOCS: "📖 Swagger Docs:",
  HEALTH_CHECK: "💚 Health Check:",
  PERFORMANCE_METRICS: "📊 Performance Metrics:",
  CACHE_STATS: "🗄️ Cache Stats:",
  OPENAPI_SPEC: "📄 OpenAPI Spec:",

  // Modos de entorno
  DEVELOPMENT_MODE: "🔧 Development Mode:",
  PRODUCTION_MODE: "🚀 Production Mode:",
  AUTO_RELOAD: "Auto-reload: Active",
  DEBUG_LOGGING: "Debug logging: Enabled",
  CACHE_TTL_SHORT: "Cache TTL: Short for testing",
  CORS_PERMISSIVE: "CORS: Permissive (*)",
  OPTIMIZATIONS_ACTIVE: "Optimizations: Active",
  COMPRESSION_ENABLED: "Compression: Enabled",
  CACHE_LONG_TTL: "Cache: Long TTL",
  SECURITY_ENHANCED: "Security: Enhanced",

  // URL y Swagger
  ERROR_UPDATING_SWAGGER_URL: "🚨 Error actualizando URL de Swagger",

  // Mensajes de modelo de productos
  PRODUCT_FROM_CACHE: "📦 Producto obtenido desde cache",
  PRODUCTS_FROM_CACHE: "📦 Productos obtenidos desde cache",
  PRODUCT_NOT_FOUND_FIREBASE: "📦 Producto no encontrado en Firebase",
  PRODUCTS_FROM_FIREBASE_CACHED: "📦 Productos obtenidos desde Firebase y cacheados",
  PRODUCT_FROM_FIREBASE_CACHED: "📦 Producto obtenido desde Firebase y cacheado",
  PRODUCT_CREATED_SUCCESS: "✅ Producto creado exitosamente en modelo",
  PRODUCT_UPDATED_SUCCESS: "✅ Producto actualizado exitosamente",
  PRODUCT_DELETED_SUCCESS: "✅ Producto eliminado exitosamente",
  ERROR_GETTING_PRODUCT_FIREBASE: "🚨 Error al obtener producto de Firebase",
  ERROR_GETTING_PRODUCTS_FIREBASE: "🚨 Error al obtener productos de Firebase",
  ERROR_CREATING_PRODUCT_DATABASE: "🚨 Error creando producto en la base de datos",
  ERROR_CREATING_PRODUCT_PREFIX: "Error al crear el producto en la base de datos:",

  // Constantes de colecciones y cache
  COLLECTION_PRODUCTS: "products",
  COLLECTION_CATEGORY: "category",
  CACHE_KEY_ALL_PRODUCTS: "all_products",
  CACHE_KEY_PRODUCT_PREFIX: "product_",
  CACHE_KEY_PRODUCTS_COUNT: "products_count",
  ERROR_SETTING_PRODUCT_CACHE: "Error setting product cache:",
  ERROR_SETTING_GENERAL_CACHE: "Error setting general cache:",
  PERCENTAGE_SYMBOL: "%",
  ZERO_PERCENTAGE: "0%",
  OPERATION_GENERATE_ID: "generateSequentialId",
  OPERATION_GENERATE_ID_KEY: "generateId",
  OPERATION_GENERATE_CATEGORY_ID: "generateParentCategoryId",
  OPERATION_GENERATE_CATEGORY_ID_KEY: "generateCategoryId",
  OPERATION_GENERATE_SUBCATEGORY_ID: "generateSubcategoryId",
  OPERATION_GENERATE_SUBCATEGORY_ID_KEY: "generateSubcategoryId",
  PRODUCT_ID_PREFIX: "VA-",
  PRODUCT_ID_INITIAL: "VA-0000001",
  CATEGORY_ID_PREFIX: "CAT-",
  CATEGORY_ID_SUFFIX: "-0000",

  // Constantes de API versioning
  API_VERSION_V1: 'v1',
  API_VERSION_V2: 'v2',
  API_STATUS_STABLE: 'stable',
  API_STATUS_BETA: 'beta',
  API_DESCRIPTION_V1: 'Primera versión de la API RESTful VolleyballArt',
  API_DESCRIPTION_V2: 'Segunda versión con categoria y gestión de usuarios',
  API_RELEASE_DATE: '2025-07-09',
  API_RELEASE_DATE_V2: '2025-06-01',
  API_MAINTAINER: 'VolleyballArt Team',
  API_DOCS_V1: '/api/v1/docs',
  API_DOCS_V2: '/api/v2/docs',
  API_FEATURE_AUTHENTICATION: 'authentication',
  API_FEATURE_PRODUCTS: 'products',
  API_FEATURE_CATEGORY: 'category',
  API_FEATURE_SUBCATEGORY: 'subcategory',
  API_FEATURE_USERS: 'users',
  API_FEATURE_FILE_UPLOAD: 'fileUpload',

  // Constantes de changelog
  CHANGELOG_AUTH_FIREBASE: '✅ Autenticación con Firebase',
  CHANGELOG_CRUD_PRODUCTS: '✅ CRUD de productos con IDs secuenciales (VA-XXXXX)',
  CHANGELOG_CATEGORY_SYSTEM: '✅ Sistema completo de categorías y subcategorías',
  CHANGELOG_HIERARCHICAL_IDS: '✅ IDs jerárquicos para categorías (CAT-XXXX-YYYY)',
  CHANGELOG_PUBLIC_PRIVATE_ROUTES: '✅ Rutas públicas y privadas',
  CHANGELOG_DYNAMIC_VERSIONING: '✅ Sistema de version dinámico',
  CATEGORY_ID_SEPARATOR: '-',
  CATEGORY_ID_INITIAL: 'CAT-0001-0000',
  PADDING_ZERO: '0',

  // Mensajes de categorías
  CATEGORIES_PARENT_OBTAINED: "📋 Categorías padre obtenidas",
  CATEGORY_WITH_SUBCATEGORIES: "📂 Categoría obtenida con subcategoria",
  SUBCATEGORIES_OBTAINED: "📂 Subcategorías obtenidas",
  CATEGORY_PARENT_CREATED: "✅ Categoría padre creada exitosamente",
  SUBCATEGORY_CREATED: "✅ Subcategoría creada exitosamente",
  CATEGORY_UPDATED: "✅ Categoría actualizada exitosamente",
  SUBCATEGORIES_DELETED: "🗑️ Subcategorías eliminadas",
  CATEGORY_DELETED: "✅ Categoría eliminada exitosamente",
  CATEGORY_HIERARCHY_OBTAINED: "🌳 Jerarquía de categoria obtenida",
  ERROR_GETTING_CATEGORIES_FIREBASE: "🚨 Error al obtener categorías de Firebase",
  ERROR_GETTING_CATEGORY_FIREBASE: "🚨 Error al obtener categoría de Firebase",
  ERROR_GETTING_SUBCATEGORIES_FIREBASE: "🚨 Error al obtener subcategorías de Firebase",
  ERROR_UPDATING_CATEGORY_FIREBASE: "🚨 Error al actualizar categoría de Firebase",
  ERROR_DELETING_CATEGORY_FIREBASE: "🚨 Error al eliminar categoría de Firebase",
  ERROR_GETTING_HIERARCHY_FIREBASE: "🚨 Error al obtener jerarquía de categorías de Firebase",
  CATEGORY_NOT_FOUND_PREFIX: "Categoría no encontrada con ID:",

  // Constantes para log levels (ya incluye 'info', 'error', etc.)
  LOG_LEVEL_INFO: "info",
  LOG_LEVEL_ERROR: "error",
  LOG_LEVEL_WARN: "warn",

  // Mensajes de middleware
  MIDDLEWARE_REQUEST_INCOMING: "📨 Request incoming",
  MIDDLEWARE_RESPONSE_SENT: "📤 Response sent",
  MIDDLEWARE_ASYNC_ERROR: "🚨 Async middleware error",
  MIDDLEWARE_VALIDATION_ERROR: "❌ Error de validación",
  MIDDLEWARE_ERROR: "🚨 Middleware error",
  MIDDLEWARE_ERROR_OCCURRED: "occurred",

  // Mensajes de cache
  CACHE_HIT: "🎯 Cache HIT",
  CACHE_MISS: "📦 Cache MISS - Data cached",

  // Operaciones Firebase
  FIREBASE_OPERATION_SUCCESS: "exitoso",
  FIREBASE_OPERATION_ERROR: "Error en",
  FIREBASE_OPERATION_OF: "de",
  FIREBASE_DATA_INVALID: "Datos inválidos:",
  FIREBASE_EXECUTION_TIME: "ms",
  FIREBASE_TIMESTAMP_FIELD: "createdAt",
  FIREBASE_UPDATED_TIMESTAMP_FIELD: "updatedAt",
  FIREBASE_DELETED_FIELD: "deletedAt",
  FIREBASE_IS_DELETED_FIELD: "isDeleted",
  FIREBASE_DELETED_FLAG: true,

  // Tipos de operación Firebase
  FIREBASE_CREATE: "create",
  FIREBASE_READ: "read",
  FIREBASE_UPDATE: "update",
  FIREBASE_DELETE: "delete",
  FIREBASE_SEARCH: "search",

  // Campos de metadata Firebase
  FIREBASE_METADATA_CREATE_TIME: "createTime",
  FIREBASE_METADATA_UPDATE_TIME: "updateTime",
  FIREBASE_METADATA_FROM_CACHE: "fromCache",
  FIREBASE_METADATA_PENDING_WRITES: "hasPendingWrites",

  // Log levels Firebase
  FIREBASE_LOG_INFO: "info",
  FIREBASE_LOG_ERROR: "error",

  // Direcciones de ordenamiento
  FIREBASE_ORDER_ASC: "asc",
  FIREBASE_ORDER_DESC: "desc",

  // Separadores y formatos
  FIREBASE_ERROR_SEPARATOR: ", ",
  FIREBASE_VALIDATION_PREFIX: "validation",
  FIREBASE_DOCUMENT_SIZE_PREFIX: "documentSize",
  FIREBASE_HAS_VALIDATION_PREFIX: "hasValidation",
  FIREBASE_TOTAL_DOCUMENTS_PREFIX: "totalDocuments",
  FIREBASE_HAS_FILTERS_PREFIX: "hasFilters",
  FIREBASE_HAS_ORDERING_PREFIX: "hasOrdering",
  FIREBASE_HAS_LIMIT_PREFIX: "hasLimit",
  FIREBASE_UPDATED_FIELDS_PREFIX: "updatedFields",
  FIREBASE_MERGE_PREFIX: "merge",
  FIREBASE_TOTAL_RESULTS_PREFIX: "totalResults",
  FIREBASE_HAS_CUSTOM_QUERY_PREFIX: "hasCustomQuery"
};

const SWAGGER_DESCRIPTIONS = {
  // Descripciones para Swagger
  LOGIN_SUMMARY: "Iniciar sesión",
  LOGIN_DESCRIPTION: "Autentica un usuario y devuelve un token JWT",
  REGISTER_SUMMARY: "Registrar nuevo usuario",
  REGISTER_DESCRIPTION: "Crea una nueva cuenta de usuario",

  // Respuestas de Swagger
  LOGIN_SUCCESS: "Login exitoso",
  REGISTER_SUCCESS: "Usuario registrado exitosamente",
  VALIDATION_ERROR: "Datos de entrada inválidos",
  CREDENTIALS_ERROR: "Credenciales incorrectas",
  USER_EXISTS_ERROR: "El usuario ya existe",
  INTERNAL_SERVER_ERROR: "Error interno del servidor"
};

const RESPONSE_FIELDS = {
  // Campos de respuesta estándar
  MESSAGE: "message",
  PAYLOAD: "payload",
  META: "meta",
  TIMESTAMP: "timestamp",
  REQUEST_ID: "requestId",
  CACHED: "cached",
  RESPONSE_TIME: "responseTime",
  STATUS_CODE: "statusCode",
  ERRORS: "errors",

  // Campos de metadata
  PORT: "port",
  URL: "url",
  ENVIRONMENT: "environment",
  PID: "pid",
  ERROR: "error",
  STACK: "stack",

  // URLs de endpoints
  DOCUMENTATION: "documentation",
  HEALTH: "health",
  METRICS: "metrics",
  CACHE: "cache",
  SWAGGER: "swagger",
  API: "api"
};

const FIREBASE_CONSTANTS = {
  // Códigos de error de Firebase Auth
  ERROR_EMAIL_ALREADY_IN_USE: "auth/email-already-in-use",
  ERROR_WEAK_PASSWORD: "auth/weak-password",
  ERROR_INVALID_EMAIL: "auth/invalid-email",

  // Colecciones de Firestore
  COLLECTION_USERS: "users"
};

const VALIDATION_MESSAGES = {
  // Validaciones de categorías
  CATEGORY_TITLE_REQUIRED: "El título de la categoría es requerido",
  CATEGORY_TITLE_EMPTY: "El título de la categoría es requerido",
  CATEGORY_TITLE_MIN: "El título debe tener al menos 2 caracteres",
  CATEGORY_TITLE_MAX: "El título no puede exceder 100 caracteres",
  CATEGORY_TITLE_EMPTY_UPDATE: "El título no puede estar vacío",

  SUBCATEGORY_TITLE_REQUIRED: "El título de la subcategoría es requerido",
  SUBCATEGORY_TITLE_EMPTY: "El título de la subcategoría es requerido",
  SUBCATEGORY_TITLE_MIN: "El título debe tener al menos 2 caracteres",
  SUBCATEGORY_TITLE_MAX: "El título no puede exceder 100 caracteres",

  CATEGORY_ID_PATTERN: "El ID de categoría debe tener el formato CAT-XXXX-YYYY",
  CATEGORY_ID_REQUIRED: "El ID de categoría es requerido",
  CATEGORY_PARENT_ID_PATTERN: "El ID de categoría padre debe tener el formato CAT-XXXX-0000",
  CATEGORY_PARENT_ID_REQUIRED: "El ID de categoría padre es requerido",
  CATEGORY_PARENT_ID_INVALID: "ID de categoría padre inválido",
  SUBCATEGORY_ID_PATTERN: "El ID de subcategoría debe tener el formato CAT-XXXX-YYYY",
  SUBCATEGORY_ID_REQUIRED: "El ID de subcategoría es requerido",
  SUBCATEGORY_ID_INVALID: "El ID no puede terminar en -0000 (es un ID de categoría padre)",

  // Validaciones de productos
  PRODUCT_TITLE_REQUIRED: "El título es obligatorio",
  PRODUCT_TITLE_EMPTY: "El título es obligatorio",
  PRODUCT_TITLE_MIN: "El título debe tener al menos 3 caracteres",
  PRODUCT_TITLE_MAX: "El título no puede tener más de 100 caracteres",

  PRODUCT_PRICE_NUMBER: "El precio debe ser un número",
  PRODUCT_PREVIOUS_PRICE_NUMBER: "El precio anterior debe ser un número o null",

  PRODUCT_DESCRIPTION_REQUIRED: "La descripción es obligatoria",
  PRODUCT_DESCRIPTION_EMPTY: "La descripción es obligatoria",
  PRODUCT_DESCRIPTION_MIN: "La descripción debe tener al menos 10 caracteres",
  PRODUCT_DESCRIPTION_MAX: "La descripción no puede tener más de 500 caracteres",

  PRODUCT_CATEGORY_NUMBER: "La categoría debe ser un número",
  PRODUCT_CATEGORY_INTEGER: "La categoría debe ser un número entero",
  PRODUCT_CATEGORY_MIN: "La categoría debe ser mayor a 0",

  PRODUCT_SUBCATEGORY_NUMBER: "La subcategoría debe ser un número",
  PRODUCT_SUBCATEGORY_INTEGER: "La subcategoría debe ser un número entero",
  PRODUCT_SUBCATEGORY_MIN: "La subcategoría debe ser mayor a 0",

  // Validaciones de imágenes de productos
  PRODUCT_IMAGE_URL_INVALID: "La URL de la imagen debe ser válida",
  PRODUCT_IMAGE_URL_REQUIRED: "La URL de la imagen es requerida",
  PRODUCT_IMAGE_ALT_REQUIRED: "El texto alternativo es requerido",
  PRODUCT_IMAGE_ALT_MAX: "El texto alternativo no puede exceder 200 caracteres",
  PRODUCT_IMAGE_CAROUSEL_BOOLEAN: "El campo carousel debe ser un valor booleano",
  PRODUCT_IMAGES_MIN: "Se requiere al menos una imagen",
  PRODUCT_IMAGES_ARRAY: "Las imágenes deben ser un array",
  PRODUCT_IMAGES_MAX: "No se pueden agregar más de 10 imágenes",
  PRODUCT_PRICE_NEGATIVE: "El precio no puede ser negativo",
  PRODUCT_PREVIOUS_PRICE_NEGATIVE: "El precio anterior no puede ser negativo",
  PRODUCT_OUTSTANDING_BOOLEAN: "El campo destacado debe ser un valor booleano",

  // Validaciones comunes de esquemas
  ID_FORMAT_INVALID: "El ID debe tener el formato VA-0000001",
  ID_REQUIRED: "El ID es obligatorio",
  PARAM_INVALID: "Parámetro inválido",
  QUERY_PARAM_INVALID: "Query parameter inválido",

  // Validaciones específicas de categorías
  CATEGORY_TITLE_REQUIRED: "El título de la categoría es requerido",
  SUBCATEGORY_TITLE_REQUIRED: "El título de la subcategoría es requerido",
  TITLE_MIN_2_CHARS: "El título debe tener al menos 2 caracteres",
  TITLE_MAX_100_CHARS: "El título no puede exceder 100 caracteres",
  TITLE_CANNOT_BE_EMPTY: "El título no puede estar vacío",
  TEXT_MAX_5000_CHARS: "El texto no puede exceder 5000 caracteres",
  IMAGE_URL_INVALID: "La URL de la imagen debe ser válida",
  IMAGE_URL_REQUIRED: "La URL de la imagen es requerida",
  ALT_TEXT_REQUIRED: "El texto alternativo es requerido",
  ALT_TEXT_MAX_200_CHARS: "El texto alternativo no puede exceder 200 caracteres",
  MAX_10_IMAGES: "No se pueden agregar más de 10 imágenes",
  PROVIDE_AT_LEAST_ONE_FIELD: "Debe proporcionar al menos un campo para actualizar",
  CATEGORY_ID_FORMAT_INVALID: "El ID de categoría debe tener el formato CAT-XXXX-YYYY",
  CATEGORY_ID_REQUIRED: "El ID de categoría es requerido",
  PARENT_CATEGORY_ID_FORMAT_INVALID: "El ID de categoría padre debe tener el formato CAT-XXXX-0000",
  PARENT_CATEGORY_ID_REQUIRED: "El ID de categoría padre es requerido",
  SUBCATEGORY_ID_FORMAT_INVALID: "El ID de subcategoría debe tener el formato CAT-XXXX-YYYY",
  SUBCATEGORY_ID_REQUIRED: "El ID de subcategoría es requerido",
  ID_CANNOT_END_0000: "El ID no puede terminar en -0000 (es un ID de categoría padre)",
  DELETE_SUBCATEGORY_VALID_VALUES: "deleteSubcategory debe ser \"true\" o \"false\"",
  
  // Validaciones de autenticación
  EMAIL_REQUIRED: "El email es obligatorio",
  EMAIL_INVALID: "Debe ser un email válido",
  PASSWORD_REQUIRED: "La contraseña es obligatoria",
  PASSWORD_MIN_6_CHARS: "La contraseña debe tener al menos 6 caracteres",
  PASSWORD_MAX_50_CHARS: "La contraseña no puede tener más de 50 caracteres",
  PASSWORD_PATTERN_INVALID: "La contraseña debe tener al menos: 1 minúscula, 1 mayúscula y 1 número",
  PASSWORD_CONFIRMATION_REQUIRED: "Confirma tu contraseña",
  PASSWORDS_DO_NOT_MATCH: "Las contraseñas no coinciden"
};

const CONTROLLER_MESSAGES = {
  // Templates de mensajes para controllers
  RESOURCE_OBTAINED_SUCCESS: "obtenido exitosamente",
  RESOURCE_NOT_FOUND: "no encontrado",
  RESOURCE_GET_ERROR: "Error al obtener",
  RESOURCE_CREATED_SUCCESS: "creado exitosamente",
  RESOURCE_CREATE_ERROR: "Error al crear",
  RESOURCE_UPDATED_SUCCESS: "actualizado exitosamente",
  RESOURCE_UPDATE_ERROR: "Error al actualizar",
  RESOURCE_DELETED_SUCCESS: "eliminado exitosamente",
  RESOURCE_DELETE_ERROR: "Error al eliminar",

  // Campos de metadata y logging
  EXECUTION_TIME_SUFFIX: "ms",
  REQUEST_BODY_FIELD: "requestBody",
  BODY_SIZE_FIELD: "bodySize",
  RESOURCE_NAME_FIELD: "resourceName",
  RESOURCE_ID_FIELD: "resourceId",
  UPDATED_FIELDS_FIELD: "updatedFields",

  // Headers y campos de request
  USER_AGENT_HEADER: "User-Agent",

  // Valores por defecto
  DELETED_FLAG: true
};

const SERVICE_MESSAGES = {
  // Mensajes de log para servicios
  SERVICE_CATEGORIES_GET_SUCCESS: "📋 Servicio: Categorías obtenidas exitosamente",
  SERVICE_CATEGORY_GET_SUCCESS: "📂 Servicio: Categoría obtenida exitosamente", 
  SERVICE_SUBCATEGORIES_GET_SUCCESS: "📂 Servicio: Subcategoria obtenidas exitosamente",
  SERVICE_CATEGORY_CREATE_SUCCESS: "✅ Servicio: Categoría creada exitosamente",
  SERVICE_SUBCATEGORY_CREATE_SUCCESS: "✅ Servicio: Subcategoría creada exitosamente",
  SERVICE_CATEGORY_UPDATE_SUCCESS: "✅ Servicio: Categoría actualizada exitosamente",
  SERVICE_CATEGORY_DELETE_SUCCESS: "✅ Servicio: Categoría eliminada exitosamente",
  SERVICE_HIERARCHY_GET_SUCCESS: "🌳 Servicio: Jerarquía de categoria obtenida exitosamente",
  
  // Mensajes de error para servicios
  SERVICE_CATEGORIES_GET_ERROR: "🚨 Error en servicio al obtener categoria",
  SERVICE_CATEGORY_GET_ERROR: "🚨 Error en servicio al obtener categoría por ID", 
  SERVICE_SUBCATEGORIES_GET_ERROR: "🚨 Error en servicio al obtener subcategoria",
  SERVICE_CATEGORY_CREATE_ERROR: "🚨 Error en servicio al crear categoría",
  SERVICE_SUBCATEGORY_CREATE_ERROR: "🚨 Error en servicio al crear subcategoría",
  SERVICE_CATEGORY_UPDATE_ERROR: "🚨 Error en servicio al actualizar categoría",
  SERVICE_CATEGORY_DELETE_ERROR: "🚨 Error en servicio al eliminar categoría",
  SERVICE_HIERARCHY_GET_ERROR: "🚨 Error en servicio al obtener jerarquía de categoria",
  
  // Mensajes de validación para servicios
  NO_UPDATE_DATA_ERROR: "No hay datos para actualizar",
  NO_TITLE_DEFAULT: "Sin título",
  
  // Campos específicos para servicios
  SERVICE_NAME_CATEGORY: "category",
  
  // Patrones de validación
  PARENT_CATEGORY_SUFFIX: "-0000",
  EMPTY_STRING: "",
  
  // Patrones de regex para categorías
  PARENT_CATEGORY_ID_PATTERN: /^CAT-\d{4}-0000$/,
  SUBCATEGORY_ID_PATTERN: /^CAT-\d{4}-\d{4}$/,
  
  // Patrón de regex para IDs de productos
  PRODUCT_ID_PATTERN: /^VA-\d{7}$/,
  
  // Patrón de regex para validación de contraseñas
  PASSWORD_PATTERN: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
  
  // Referencias de campos
  PASSWORD_FIELD: "password",
  
  // Valores booleanos como string
  TRUE_STRING: "true",
  FALSE_STRING: "false",
  
  // Campos de log para servicios
  TOTAL_CATEGORY_FIELD: "totalCategory",
  TOTAL_SUBCATEGORY_FIELD: "totalSubcategory", 
  TOTAL_PARENT_CATEGORY_FIELD: "totalParentCategory",
  HAS_SUBCATEGORY_FIELD: "hasSubcategory",
  CATEGORY_ID_FIELD: "categoryId",
  SUBCATEGORY_ID_FIELD: "subcategoryId",
  PARENT_CATEGORY_ID_FIELD: "parentCategoryId",
  UPDATED_FIELDS_FIELD: "updatedFields",
  DELETED_SUBCATEGORY_FIELD: "deletedSubcategory",
  CATEGORY_DATA_FIELD: "categoryData",
  SUBCATEGORY_DATA_FIELD: "subcategoryData",
  UPDATE_DATA_FIELD: "updateData",
  OPTIONS_FIELD: "options",
  TITLE_FIELD: "title",
  SERVICE_FIELD: "service"
};

// Claves de error de Joi
const JOI_ERROR_KEYS = {
  STRING_EMPTY: 'string.empty',
  STRING_MIN: 'string.min',
  STRING_MAX: 'string.max',
  STRING_URI: 'string.uri',
  STRING_PATTERN_BASE: 'string.pattern.base',
  NUMBER_BASE: 'number.base',
  NUMBER_MIN: 'number.min',
  BOOLEAN_BASE: 'boolean.base',
  ARRAY_BASE: 'array.base',
  ARRAY_MIN: 'array.min',
  ARRAY_MAX: 'array.max',
  NUMBER_INTEGER: 'number.integer',
  ANY_REQUIRED: 'any.required',
  ANY_ONLY: 'any.only',
  ANY_INVALID: 'any.invalid',
  OBJECT_MIN: 'object.min',
  STRING_EMAIL: 'string.email'
};

// Constantes para categorías
const CATEGORY_CONSTANTS = {
  CATEGORY_SINGULAR: "categoría",
  CATEGORY_PLURAL: "categorías", 
  SUBCATEGORY_SINGULAR: "subcategoría",
  SUBCATEGORY_PLURAL: "subcategorías",
  CATEGORY_HIERARCHY: "jerarquía de categoria",
  BOOLEAN_TRUE: "true",
  VALUE_TRUE: true
};

// Constantes para Swagger
const SWAGGER_CONSTANTS = {
  PACKAGE_SWAGGER_JSDOC: 'swagger-jsdoc',
  PACKAGE_SWAGGER_UI: 'swagger-ui-express',
  UTILS_URL_PATH: '../utils/url.utils.js',
  FAVICON_PATH: '/favicon.ico',
  CSS_TOPBAR_HIDDEN: '.swagger-ui .topbar { display: none }',
  TYPE_STRING: 'string',
  MESSAGE_SUCCESS: 'Mensaje de éxito',
  EXAMPLE_IMAGE_URL: 'https://example.com/image1.jpg',
  ENV_PRODUCTION: 'production',
  SERVER_PRODUCTION: 'Servidor de producción',
  SERVER_DEVELOPMENT: 'Servidor de desarrollo',
  
  // Información de la API
  OPENAPI_VERSION: '3.0.0',
  API_TITLE: 'VolleyballArt API',
  API_VERSION: '1.0.0',
  API_DESCRIPTION: 'API RESTful para la gestión de productos de volleyball. Proyecto educativo desarrollado como parte del programa Talento Tech.',
  CONTACT_NAME: 'Dario Asurey',
  CONTACT_EMAIL: 'dario.asurey@gmail.com',
  LICENSE_NAME: 'MIT',
  LICENSE_URL: 'https://opensource.org/licenses/MIT',
  
  // Documentación
  JWT_DESCRIPTION: 'Token JWT obtenido desde el endpoint de login',
  CATEGORY_DESCRIPTION: 'Categoría del producto',
  SITE_TITLE: 'VolleyballArt API Docs',
  
  // Rutas de archivos
  ROUTES_PATTERN: 'routes/*.js',
  INDEX_FILE: 'index.js',
  
  // Tipos y esquemas
  TYPE_HTTP: 'http',
  TYPE_BEARER: 'bearer',
  TYPE_JWT: 'JWT',
  TYPE_OBJECT: 'object',
  TYPE_NUMBER: 'number',
  TYPE_INTEGER: 'integer',
  TYPE_ARRAY: 'array',
  
  // Propiedades de esquemas
  FIELD_NAME: 'name',
  FIELD_DESCRIPTION: 'description',
  FIELD_PRICE: 'price',
  FIELD_CATEGORY: 'category',
  FIELD_STOCK: 'stock',
  FIELD_EMAIL: 'email',
  FIELD_PASSWORD: 'password',
  
  // Descripciones específicas
  ID_DESCRIPTION: 'Identificador único del producto (formato VA-XXXXX)',
  EXAMPLE_PRODUCT_ID: 'VA-00001',
  
  // Formatos y tipos adicionales
  FORMAT_EMAIL: 'email',
  FORMAT_URI: 'uri',
  FORMAT_DATE_TIME: 'date-time',
  
  // Descripciones de productos
  IMAGES_DESCRIPTION: 'URLs de imágenes del producto',
  CREATED_AT_DESCRIPTION: 'Fecha de creación del producto',
  UPDATED_AT_DESCRIPTION: 'Fecha de última actualización',
  EMAIL_USER_DESCRIPTION: 'Email del usuario',
  PASSWORD_USER_DESCRIPTION: 'Contraseña del usuario',
  
  // Tags de documentación
  TAG_AUTH: 'Auth',
  TAG_PRODUCTS: 'Products',
  TAG_HEALTH: 'Health',
  TAG_AUTH_DESCRIPTION: 'Endpoints de autenticación',
  TAG_PRODUCTS_DESCRIPTION: 'Gestión de productos de volleyball',
  TAG_HEALTH_DESCRIPTION: 'Endpoints de estado y salud de la API',
  
  // Descripciones de productos específicas
  PRODUCT_NAME_DESCRIPTION: 'Nombre del producto',
  PRODUCT_DESCRIPTION_DESCRIPTION: 'Descripción detallada del producto',
  PRODUCT_PRICE_DESCRIPTION: 'Precio del producto en pesos',
  PRODUCT_STOCK_DESCRIPTION: 'Cantidad disponible en stock',
  
  // Ejemplos de productos
  EXAMPLE_PRODUCT_NAME: 'Pelota de Volleyball Profesional',
  EXAMPLE_PRODUCT_DESCRIPTION: 'Pelota oficial para competencias de volleyball',
  EXAMPLE_CATEGORY: 'Pelotas',
  
  // Ejemplos de autenticación
  EXAMPLE_EMAIL: 'admin@volleyballart.com',
  EXAMPLE_PASSWORD: 'password123',
  EXAMPLE_LOGIN_MESSAGE: 'Login exitoso',
  EXAMPLE_JWT_TOKEN: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  
  // Descripciones de respuestas
  JWT_TOKEN_DESCRIPTION: 'Token JWT para autenticación',
  ERROR_MESSAGE_DESCRIPTION: 'Mensaje de error',
  ERROR_LIST_DESCRIPTION: 'Lista detallada de errores',
  RESPONSE_DATA_DESCRIPTION: 'Datos de respuesta'
};

// Constantes de seguridad
const SECURITY_CONSTANTS = {
  // Content Security Policy valores
  CSP_SELF: "'self'",
  CSP_UNSAFE_INLINE: "'unsafe-inline'",
  CSP_NONE: "'none'",
  CSP_DATA: "data:",
  CSP_HTTPS: "https:",
  
  // CORS Policy valores
  CROSS_ORIGIN: "cross-origin",
  
  // Rate limiting mensajes
  RATE_LIMIT_GENERAL_ERROR: "Demasiadas solicitudes desde esta IP",
  RATE_LIMIT_AUTH_ERROR: "Demasiados intentos de autenticación",
  RATE_LIMIT_CREATE_ERROR: "Límite de creación de productos excedido",
  
  // Rate limiting tiempo de espera
  RETRY_AFTER_15_MIN: "15 minutos",
  RETRY_AFTER_1_HOUR: "1 hora"
};

// Constantes de optimización
const OPTIMIZATION_CONSTANTS = {
  // Headers de compresión y optimización
  HEADER_X_NO_COMPRESSION: 'x-no-compression',
  HEADER_CONTENT_TYPE: 'content-type',
  HEADER_X_REQUEST_ID: 'x-request-id',
  HEADER_X_CACHE: 'X-Cache',
  HEADER_X_RESPONSE_TIME: 'X-Response-Time',
  HEADER_X_POWERED_BY: 'X-Powered-By',
  HEADER_X_DNS_PREFETCH_CONTROL: 'X-DNS-Prefetch-Control',
  HEADER_LINK: 'Link',
  HEADER_X_CONTENT_TYPE_OPTIONS: 'X-Content-Type-Options',
  HEADER_X_FRAME_OPTIONS: 'X-Frame-Options',
  
  // Content Types para compresión
  CONTENT_TYPE_JSON: 'application/json',
  CONTENT_TYPE_TEXT: 'text/',
  CONTENT_TYPE_JAVASCRIPT: 'application/javascript',
  CONTENT_TYPE_XML: 'application/xml',
  
  // Cache values
  CACHE_HIT: 'HIT',
  
  // Request ID prefix
  REQUEST_ID_PREFIX: 'req_',
  
  // Response time suffix
  RESPONSE_TIME_SUFFIX: 'ms',
  
  // API branding
  API_POWERED_BY: 'VolleyballArt-API',
  
  // Performance headers values
  DNS_PREFETCH_ON: 'on',
  FIRESTORE_PRECONNECT: '<https://firestore.googleapis.com>; rel=preconnect',
  CONTENT_TYPE_NOSNIFF: 'nosniff',
  FRAME_OPTIONS_DENY: 'DENY',
  
  // Environment
  NODE_ENV_PRODUCTION: 'production',
  
  // Pagination properties
  PAGINATION_CURRENT_PAGE: 'currentPage',
  PAGINATION_TOTAL_PAGES: 'totalPages',
  PAGINATION_TOTAL_ITEMS: 'totalItems',
  PAGINATION_ITEMS_PER_PAGE: 'itemsPerPage',
  PAGINATION_HAS_NEXT_PAGE: 'hasNextPage',
  PAGINATION_HAS_PREV_PAGE: 'hasPrevPage',
  
  // Field separator
  FIELD_SEPARATOR: ','
};

// Constantes de logger
const LOGGER_CONSTANTS = {
  // Colores de logging
  COLOR_RED: 'red',
  COLOR_YELLOW: 'yellow',
  COLOR_GREEN: 'green',
  COLOR_MAGENTA: 'magenta',
  COLOR_WHITE: 'white',
  
  // Niveles de logging
  LEVEL_ERROR: 'error',
  LEVEL_WARN: 'warn',
  LEVEL_INFO: 'info',
  LEVEL_HTTP: 'http',
  LEVEL_DEBUG: 'debug',
  
  // Entorno de desarrollo
  ENV_DEVELOPMENT: 'development',
  
  // Formato de timestamp
  TIMESTAMP_FORMAT: 'YYYY-MM-DD HH:mm:ss:ms',
  
  // Separadores de log
  LOG_SEPARATOR: ':',
  
  // Archivos de log
  ERROR_LOG_FILE: 'logs/error.log',
  COMBINED_LOG_FILE: 'logs/combined.log'
};

// Constantes de JWT
const JWT_CONSTANTS = {
  // Duración del token
  EXPIRATION_1_DAY: '1d'
};

module.exports = {
  PRODUCTS_MESSAGES,
  CATEGORIES_MESSAGES, 
  AUTH_MESSAGES,
  GENERAL_MESSAGES,
  VALIDATION_MESSAGES,
  CONTROLLER_MESSAGES,
  SERVICE_MESSAGES,
  LOG_MESSAGES,
  SWAGGER_DESCRIPTIONS,
  SYSTEM_CONSTANTS,
  SYSTEM_MESSAGES,
  RESPONSE_FIELDS,
  FIREBASE_CONSTANTS,
  JOI_ERROR_KEYS,
  VALIDATION_MESSAGES,
  VERSION_MESSAGES,
  SANITIZATION_MESSAGES,
  PERFORMANCE_MESSAGES,
  LOGGING_MESSAGES,
  CACHE_MESSAGES,
  AUTH_MIDDLEWARE_MESSAGES,
  CATEGORY_CONSTANTS,
  SWAGGER_CONSTANTS,
  SECURITY_CONSTANTS,
  OPTIMIZATION_CONSTANTS,
  LOGGER_CONSTANTS,
  JWT_CONSTANTS
};