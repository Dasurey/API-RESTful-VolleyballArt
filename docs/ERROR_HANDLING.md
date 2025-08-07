# Sistema de Manejo de Errores Global - VolleyballArt API

## 📋 Descripción

Sistema avanzado de manejo de errores que proporciona:
- Clases de error personalizadas y tipadas
- Manejo automático de errores async/await
- Logging estructurado y detallado
- Respuestas de error consistentes
- Formateo automático de errores de base de datos y JWT

## 🏗️ Arquitectura

### 1. Clases de Error Personalizadas (`error.js`)

#### `AppError` - Clase Base
```javascript
const error = new AppError(message, statusCode, code, details);
```

#### Clases Específicas
- `ValidationError` (400) - Errores de validación de datos
- `AuthenticationError` (401) - Errores de autenticación
- `AuthorizationError` (403) - Errores de autorización
- `NotFoundError` (404) - Recursos no encontrados
- `ConflictError` (409) - Conflictos de datos
- `RateLimitError` (429) - Límite de velocidad excedido
- `InternalServerError` (500) - Errores internos del servidor
- `DatabaseError` (500) - Errores de base de datos
- `ExternalServiceError` (502) - Errores de servicios externos
- `ConfigurationError` (500) - Errores de configuración

### 2. Utilidades Async (`async.utils.js`)

#### `asyncHandler(fn)`
Wrapper automático para funciones async que captura errores:
```javascript
const getProducts = asyncHandler(async (req, res) => {
  const products = await productService.getAll();
  res.json(products);
});
```

#### `controllerWrapper(fn, controllerName)`
Wrapper especializado para controladores con contexto:
```javascript
const getProduct = controllerWrapper(async (req, res) => {
  const product = await productService.getById(req.params.id);
  res.json(product);
}, 'ProductController.getProduct');
```

#### `validateAndThrow(condition, ErrorClass, message, details)`
Validación simplificada con lanzamiento de errores:
```javascript
validateAndThrow(
  !id,
  ValidationError,
  'ID es requerido',
  { field: 'id' }
);
```

### 3. Middleware de Error Mejorado (`error.middleware.js`)

- **Procesamiento automático**: Convierte errores genéricos en clases específicas
- **Formateo de DB**: Maneja errores de Mongoose/Firebase automáticamente
- **Formateo de JWT**: Convierte errores de JWT en AuthenticationError
- **Logging inteligente**: Diferentes niveles según el tipo de error
- **Contexto de request**: Incluye información detallada de la solicitud

## 🚀 Uso Práctico

### En Controladores

```javascript
const { controllerWrapper, validateAndThrow } = require('../utils/async.utils.js');
const { NotFoundError, ValidationError } = require('../middlewares/error.js');

const getProduct = controllerWrapper(async (req, res) => {
  const { id } = req.params;

  // Validación rápida
  validateAndThrow(
    !/^VA-\d{7}$/.test(id),
    ValidationError,
    'Formato de ID inválido',
    { field: 'id', value: id }
  );

  const product = await productService.getById(id);

  // Lanzar error específico si no existe
  if (!product) {
    throw new NotFoundError(
      `Producto ${id} no encontrado`,
      { productId: id },
      'PRODUCT_NOT_FOUND'
    );
  }

  res.json({ message: 'Producto encontrado', payload: product });
}, 'ProductController.getProduct');
```

### En Servicios

```javascript
const { dbServiceWrapper } = require('../utils/async.utils.js');
const { DatabaseError } = require('../middlewares/error.js');

const createProduct = dbServiceWrapper(async (productData) => {
  try {
    return await firestore.collection('products').add(productData);
  } catch (error) {
    // Se convierte automáticamente en DatabaseError
    throw error;
  }
}, 'ProductService.createProduct');
```

### En Middlewares de Validación

```javascript
const { handleValidationErrors } = require('../middlewares/error.validation.js');

router.post('/products',
  [
    body('title').notEmpty().withMessage('Título es requerido'),
    body('price').isNumeric().withMessage('Precio debe ser numérico')
  ],
  handleValidationErrors, // Convierte errores de express-validator
  createProduct
);
```

## 📊 Estructura de Respuesta de Error

### Formato Estándar
```json
{
  "message": "Descripción del error",
  "payload": {
    "statusCode": 400,
    "errorCode": "VALIDATION_ERROR",
    "timestamp": "2025-08-02T10:30:00.000Z",
    "path": "/api/v1/products/invalid-id",
    "method": "GET",
    "requestId": "1722596900000-abc123def",
    "details": {
      "field": "id",
      "value": "invalid-id",
      "expectedPattern": "VA-XXXXXXX"
    }
  }
}
```

### En Desarrollo (información adicional)
```json
{
  "message": "Producto no encontrado",
  "payload": {
    "statusCode": 404,
    "errorCode": "PRODUCT_NOT_FOUND",
    "timestamp": "2025-08-02T10:30:00.000Z",
    "path": "/api/v1/products/VA-9999999",
    "method": "GET",
    "requestId": "1722596900000-abc123def",
    "details": {
      "productId": "VA-9999999"
    },
    "development": {
      "stack": "NotFoundError: Producto VA-9999999 no encontrado\\n    at...",
      "isOperational": true,
      "originalError": null
    }
  }
}
```

## 📝 Logging Estructurado

### Estructura de Log
```json
{
  "level": "error",
  "message": "Producto VA-9999999 no encontrado",
  "errorCode": "PRODUCT_NOT_FOUND",
  "statusCode": 404,
  "requestId": "1722596900000-abc123def",
  "method": "GET",
  "url": "/api/v1/products/VA-9999999",
  "ip": "192.168.1.100",
  "userAgent": "Mozilla/5.0...",
  "userId": "user123",
  "timestamp": "2025-08-02T10:30:00.000Z",
  "isOperational": true,
  "details": {
    "productId": "VA-9999999"
  }
}
```

## 🔧 Configuración

### 1. Middleware Stack (index.js)
```javascript
// Agregar ID único a requests
app.use(requestIdMiddleware);

// Middleware de validación específicos
app.use(handleJoiValidationErrors);
app.use(handleMulterErrors);

// Rutas
app.use('/api', routes);

// Middleware de error global (al final)
app.use(notFoundHandler);
app.use(errorHandler);
```

### 2. Variables de Entorno
```env
NODE_ENV=development  # Controla el nivel de detalle en errores
LOG_LEVEL=info       # Nivel de logging
```

## 🎯 Beneficios

1. **Consistencia**: Todas las respuestas de error siguen el mismo formato
2. **Debugging**: Información detallada con requestId único
3. **Mantenibilidad**: Código más limpio con wrappers automáticos
4. **Monitoring**: Logs estructurados para análisis
5. **Seguridad**: Información sensible oculta en producción
6. **Performance**: Manejo eficiente de errores async

## 🔍 Troubleshooting

### Problemas Comunes

1. **Error no capturado**: Verificar que se use `asyncHandler` o `controllerWrapper`
2. **Log duplicado**: Verificar orden de middlewares
3. **Error genérico**: Asegurar que se lancen clases específicas de error

### Debugging

1. Buscar en logs por `requestId`
2. Verificar el `errorCode` para identificar el tipo
3. Revisar el stack trace en desarrollo
4. Confirmar la estructura de respuesta

## 📈 Mejoras Futuras

- [ ] Integración con sistema de alertas
- [ ] Métricas de errores en tiempo real
- [ ] Rate limiting basado en tipo de error
- [ ] Traducción automática de mensajes
- [ ] Webhook para errores críticos
