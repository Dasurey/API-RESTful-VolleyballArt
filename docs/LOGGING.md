# 📊 Sistema de Logging y Monitoreo

## 🎯 Características Implementadas

### ✅ **Winston Logger**
- **Niveles de log**: `error`, `warn`, `info`, `http`, `debug`
- **Formato colorizado** para desarrollo
- **Timestamps** en todos los logs
- **Logs estructurados** en formato JSON

### ✅ **Morgan HTTP Logging**
- **Logging automático** de todas las peticiones HTTP
- **Formato personalizado** con información detallada
- **Diferente configuración** para desarrollo vs producción

### ✅ **Manejo de Errores Global**
- **Captura de errores** no manejados
- **Logging automático** de errores con contexto
- **Respuestas consistentes** al cliente
- **Stack traces** en desarrollo

### ✅ **Archivos de Log**
- `logs/e// Falta: Winston/Morgan para logs estructurados
// Actual: Solo console.log básicoslogs
- **Rotación automática** (se puede configurar)

## 🔧 Configuración

### Niveles de Log por Entorno
- **Desarrollo**: `debug` (todos los logs)
- **Producción**: `warn` (solo warnings y errores)

### Variables de Entorno
```bash
NODE_ENV=development  # Para logs detallados
NODE_ENV=production   # Para logs optimizados
```

## 📋 Tipos de Logs Implementados

### 🚀 **Startup Logs**
```javascript
Logger.info('🚀 Iniciando servidor VolleyballArt API...', {
  nodeVersion: process.version,
  environment: process.env.NODE_ENV,
  timestamp: new Date().toISOString()
});
```

### 📨 **Request Logs**
```javascript
Logger.info('📨 [REQUEST] GET /api/products', {
  method: 'GET',
  url: '/api/products',
  ip: '127.0.0.1',
  userAgent: 'Mozilla/5.0...',
  apiVersion: 'v1'
});
```

### 📤 **Response Logs**
```javascript
Logger.info('📤 [RESPONSE] GET /api/products - 200', {
  statusCode: 200,
  duration: '45ms',
  responseSize: 1024
});
```

### 🔐 **Authentication Logs**
```javascript
// Éxito
Logger.info('✅ Autenticación exitosa', {
  userId: 'user123',
  email: 'user@example.com'
});

// Error
Logger.warn('🔐 Token JWT inválido', {
  error: 'Token expired',
  ip: '127.0.0.1'
});
```

### 🚨 **Error Logs**
```javascript
Logger.error('🚨 Error creando producto', {
  error: error.message,
  stack: error.stack,
  productData: {...}
});
```

## 🎨 Emojis por Tipo de Log

| Emoji | Tipo | Descripción |
|-------|------|-------------|
| 🚀 | Startup | Inicio del servidor |
| 📨 | Request | Petición entrante |
| 📤 | Response | Respuesta enviada |
| ✅ | Success | Operación exitosa |
| 🔐 | Auth | Autenticación/Autorización |
| 🚨 | Error | Errores críticos |
| ⚠️ | Warning | Advertencias |
| 💚 | Health | Health checks |
| 🔍 | NotFound | Rutas no encontradas |
| 📋 | Info | Información general |

## 🎛️ Monitoreo Incluido

### Health Check Mejorado
**Endpoint**: `GET /api/health`

**Respuesta**:
```json
{
  "status": "healthy",
  "timestamp": "2025-07-29T21:56:41.564Z",
  "version": "v1",
  "uptime": 123.45,
  "memory": {
    "rss": 45678912,
    "heapTotal": 12345678,
    "heapUsed": 8765432
  },
  "environment": "development"
}
```

### Logs Estructurados
Todos los logs incluyen:
- **timestamp**: Marca de tiempo ISO
- **level**: Nivel del log (info, warn, error, etc.)
- **message**: Mensaje descriptivo
- **metadata**: Contexto adicional (IP, user, etc.)

## 🔍 Ejemplo de Uso

### Ver logs en tiempo real
```bash
# En desarrollo
npm start

# Los logs aparecen en consola con colores
```

### Ver archivos de log
```bash
# Todos los logs
tail -f logs/combined.log

# Solo errores
tail -f logs/error.log
```

## 🚀 Próximas Mejoras Sugeridas

1. **Log Rotation** - Rotar archivos por tamaño/fecha
2. **Alertas** - Notificaciones por email/Slack en errores críticos
3. **Dashboard** - Interfaz web para visualizar logs
4. **Métricas** - Prometheus/Grafana integration
5. **APM** - Application Performance Monitoring

## 📊 Beneficios Obtenidos

- ✅ **Debugging más fácil** - Logs estructurados y contextuales
- ✅ **Monitoreo en producción** - Visibilidad completa del sistema  
- ✅ **Detección temprana** - Identificación rápida de problemas
- ✅ **Auditoría** - Trazabilidad completa de operaciones
- ✅ **Performance insights** - Métricas de tiempo de respuesta
