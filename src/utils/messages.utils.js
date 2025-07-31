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
  CATEGORY_ID_SEPARATOR: "-",
  CATEGORY_ID_INITIAL: "CAT-0001-0000",
  PADDING_ZERO: "0",

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

// Mensajes de validación para esquemas Joi
const JOI_VALIDATION_MESSAGES = {
  // Mensajes de productos para Joi
  PRODUCT_TITLE_REQUIRED: VALIDATION_MESSAGES.PRODUCT_TITLE_REQUIRED,
  PRODUCT_TITLE_MIN: VALIDATION_MESSAGES.PRODUCT_TITLE_MIN,
  PRODUCT_TITLE_MAX: VALIDATION_MESSAGES.PRODUCT_TITLE_MAX,
  
  PRODUCT_IMAGE_URL_INVALID: VALIDATION_MESSAGES.PRODUCT_IMAGE_URL_INVALID,
  PRODUCT_IMAGE_URL_REQUIRED: VALIDATION_MESSAGES.PRODUCT_IMAGE_URL_REQUIRED,
  PRODUCT_IMAGE_ALT_REQUIRED: VALIDATION_MESSAGES.PRODUCT_IMAGE_ALT_REQUIRED,
  PRODUCT_IMAGE_CAROUSEL_BOOLEAN: VALIDATION_MESSAGES.PRODUCT_IMAGE_CAROUSEL_BOOLEAN,
  PRODUCT_IMAGES_MIN: VALIDATION_MESSAGES.PRODUCT_IMAGES_MIN,
  PRODUCT_IMAGES_ARRAY: VALIDATION_MESSAGES.PRODUCT_IMAGES_ARRAY,
  
  PRODUCT_PRICE_NEGATIVE: VALIDATION_MESSAGES.PRODUCT_PRICE_NEGATIVE,
  PRODUCT_PRICE_NUMBER: VALIDATION_MESSAGES.PRODUCT_PRICE_NUMBER,
  PRODUCT_PREVIOUS_PRICE_NEGATIVE: VALIDATION_MESSAGES.PRODUCT_PREVIOUS_PRICE_NEGATIVE,
  PRODUCT_PREVIOUS_PRICE_NUMBER: VALIDATION_MESSAGES.PRODUCT_PREVIOUS_PRICE_NUMBER,
  
  PRODUCT_DESCRIPTION_REQUIRED: VALIDATION_MESSAGES.PRODUCT_DESCRIPTION_REQUIRED,
  PRODUCT_DESCRIPTION_MIN: VALIDATION_MESSAGES.PRODUCT_DESCRIPTION_MIN,
  PRODUCT_DESCRIPTION_MAX: VALIDATION_MESSAGES.PRODUCT_DESCRIPTION_MAX,
  
  PRODUCT_CATEGORY_NUMBER: VALIDATION_MESSAGES.PRODUCT_CATEGORY_NUMBER,
  PRODUCT_CATEGORY_INTEGER: VALIDATION_MESSAGES.PRODUCT_CATEGORY_INTEGER,
  PRODUCT_CATEGORY_MIN: VALIDATION_MESSAGES.PRODUCT_CATEGORY_MIN,
  
  PRODUCT_SUBCATEGORY_NUMBER: VALIDATION_MESSAGES.PRODUCT_SUBCATEGORY_NUMBER,
  PRODUCT_SUBCATEGORY_INTEGER: VALIDATION_MESSAGES.PRODUCT_SUBCATEGORY_INTEGER,
  PRODUCT_SUBCATEGORY_MIN: VALIDATION_MESSAGES.PRODUCT_SUBCATEGORY_MIN,
  
  PRODUCT_OUTSTANDING_BOOLEAN: VALIDATION_MESSAGES.PRODUCT_OUTSTANDING_BOOLEAN,

  // Mensajes de validación común para esquemas
  ID_FORMAT_INVALID: VALIDATION_MESSAGES.ID_FORMAT_INVALID,
  ID_REQUIRED: VALIDATION_MESSAGES.ID_REQUIRED,
  PARAM_INVALID: VALIDATION_MESSAGES.PARAM_INVALID,
  QUERY_PARAM_INVALID: VALIDATION_MESSAGES.QUERY_PARAM_INVALID,

  // Mensajes de validación de categorías
  CATEGORY_TITLE_REQUIRED: VALIDATION_MESSAGES.CATEGORY_TITLE_REQUIRED,
  SUBCATEGORY_TITLE_REQUIRED: VALIDATION_MESSAGES.SUBCATEGORY_TITLE_REQUIRED,
  TITLE_MIN_2_CHARS: VALIDATION_MESSAGES.TITLE_MIN_2_CHARS,
  TITLE_MAX_100_CHARS: VALIDATION_MESSAGES.TITLE_MAX_100_CHARS,
  TITLE_CANNOT_BE_EMPTY: VALIDATION_MESSAGES.TITLE_CANNOT_BE_EMPTY,
  TEXT_MAX_5000_CHARS: VALIDATION_MESSAGES.TEXT_MAX_5000_CHARS,
  IMAGE_URL_INVALID: VALIDATION_MESSAGES.IMAGE_URL_INVALID,
  IMAGE_URL_REQUIRED: VALIDATION_MESSAGES.IMAGE_URL_REQUIRED,
  ALT_TEXT_REQUIRED: VALIDATION_MESSAGES.ALT_TEXT_REQUIRED,
  ALT_TEXT_MAX_200_CHARS: VALIDATION_MESSAGES.ALT_TEXT_MAX_200_CHARS,
  IMAGES_MAX_10: VALIDATION_MESSAGES.IMAGES_MAX_10,
  PROVIDE_AT_LEAST_ONE_FIELD: VALIDATION_MESSAGES.PROVIDE_AT_LEAST_ONE_FIELD,
  CATEGORY_ID_FORMAT_INVALID: VALIDATION_MESSAGES.CATEGORY_ID_FORMAT_INVALID,
  CATEGORY_ID_REQUIRED: VALIDATION_MESSAGES.CATEGORY_ID_REQUIRED,
  PARENT_CATEGORY_ID_FORMAT_INVALID: VALIDATION_MESSAGES.PARENT_CATEGORY_ID_FORMAT_INVALID,
  PARENT_CATEGORY_ID_REQUIRED: VALIDATION_MESSAGES.PARENT_CATEGORY_ID_REQUIRED,
  SUBCATEGORY_ID_FORMAT_INVALID: VALIDATION_MESSAGES.SUBCATEGORY_ID_FORMAT_INVALID,
  SUBCATEGORY_ID_REQUIRED: VALIDATION_MESSAGES.SUBCATEGORY_ID_REQUIRED,
  ID_CANNOT_END_0000: VALIDATION_MESSAGES.ID_CANNOT_END_0000,
  DELETE_SUBCATEGORY_VALID_VALUES: VALIDATION_MESSAGES.DELETE_SUBCATEGORY_VALID_VALUES,
  
  // Mensajes de autenticación para Joi
  EMAIL_REQUIRED: VALIDATION_MESSAGES.EMAIL_REQUIRED,
  EMAIL_INVALID: VALIDATION_MESSAGES.EMAIL_INVALID,
  PASSWORD_REQUIRED: VALIDATION_MESSAGES.PASSWORD_REQUIRED,
  PASSWORD_MIN_6_CHARS: VALIDATION_MESSAGES.PASSWORD_MIN_6_CHARS,
  PASSWORD_MAX_50_CHARS: VALIDATION_MESSAGES.PASSWORD_MAX_50_CHARS,
  PASSWORD_PATTERN_INVALID: VALIDATION_MESSAGES.PASSWORD_PATTERN_INVALID,
  PASSWORD_CONFIRMATION_REQUIRED: VALIDATION_MESSAGES.PASSWORD_CONFIRMATION_REQUIRED,
  PASSWORDS_DO_NOT_MATCH: VALIDATION_MESSAGES.PASSWORDS_DO_NOT_MATCH
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
  JOI_VALIDATION_MESSAGES,
  VERSION_MESSAGES
};