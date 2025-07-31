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

const HTTP_STATUS = {
  // Códigos de éxito
  OK: 200,
  CREATED: 201,
  
  // Códigos de error del cliente
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  UNPROCESSABLE_ENTITY: 422,
  
  // Códigos de error del servidor
  INTERNAL_SERVER_ERROR: 500
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
  PRODUCT_SUBCATEGORY_MIN: "La subcategoría debe ser mayor a 0"
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

module.exports = {
  PRODUCTS_MESSAGES,
  CATEGORIES_MESSAGES, 
  AUTH_MESSAGES,
  GENERAL_MESSAGES,
  VALIDATION_MESSAGES,
  CONTROLLER_MESSAGES,
  LOG_MESSAGES,
  SWAGGER_DESCRIPTIONS,
  SYSTEM_CONSTANTS,
  SYSTEM_MESSAGES,
  RESPONSE_FIELDS,
  FIREBASE_CONSTANTS,
  HTTP_STATUS
};
