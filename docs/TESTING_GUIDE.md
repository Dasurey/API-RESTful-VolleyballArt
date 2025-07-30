# 🧪 Testing Automatizado - VolleyballArt API

## Resumen del Sistema de Testing

Se ha implementado un sistema completo de testing automatizado usando **Jest** y **Supertest** para garantizar la calidad y funcionamiento correcto de la API.

### 🛠️ Tecnologías de Testing

- **Jest:** Framework principal para testing
- **Supertest:** Testing de endpoints HTTP
- **Babel:** Transpilación para compatibilidad con ES6 modules

### 📁 Estructura de Tests

```
tests/
├── setup.js           # Configuración global de tests
├── auth.test.js       # Tests de autenticación
├── products.test.js   # Tests de productos
├── middlewares.test.js # Tests de middlewares
└── utils.test.js      # Tests de utilidades y schemas
```

### � Configuración de Variables de Entorno

#### Archivos de Configuración:
- **`.env.test`** - Variables específicas para testing (no incluido en git)
- **`.env.test.example`** - Plantilla de variables de testing
- **`tests/setup.js`** - Carga automática de configuración de test

#### Configuración Recomendada (.env.test):
```bash
NODE_ENV=test
JWT_SECRET=test-secret-key-for-testing-only
PORT=5001
```

### �🚀 Comandos Disponibles

```bash
# Ejecutar todos los tests
npm test

# Ejecutar tests en modo watch (re-ejecuta al cambiar archivos)
npm run test:watch

# Ejecutar tests con reporte de cobertura
npm run test:coverage

# Ejecutar tests para CI/CD
npm run test:ci
```

### ✅ Cobertura de Testing

#### Auth Endpoints (`auth.test.js`)
- ✅ Login exitoso con credenciales válidas
- ✅ Rechazo de credenciales incorrectas
- ✅ Validación de datos faltantes
- ✅ Validación de formato de email
- ✅ Validación de longitud de password

#### Products Endpoints (`products.test.js`)
- ✅ Listar productos sin autenticación
- ✅ Obtener producto específico por ID
- ✅ Crear producto con autenticación y datos válidos
- ✅ Rechazar creación sin autenticación
- ✅ Validación completa de datos de producto
- ✅ Actualizar y eliminar productos

#### Middlewares (`middlewares.test.js`)
- ✅ Middleware de autenticación JWT
- ✅ Middleware de validación con Joi
- ✅ Manejo de tokens inválidos/faltantes

#### Utilidades (`utils.test.js`)
- ✅ Generación de tokens JWT
- ✅ Validación de schemas Joi
- ✅ Validación de productos y autenticación

### 🔧 Configuración Especial

#### Mocks Implementados
- **Firebase Firestore:** Simulado para evitar conexiones reales
- **Logger:** Silenciado durante tests para output limpio
- **Variables de entorno:** Configuradas específicamente para testing

#### Características de Seguridad
- Tests ejecutados en entorno aislado
- No hay conexiones a base de datos real
- Tokens JWT con claves de prueba
- Timeouts configurados para tests lentos

### 📊 Métricas de Calidad

Los tests cubren:
- ✅ **Endpoints principales:** 100% de rutas públicas y privadas
- ✅ **Autenticación:** Tokens, validaciones, errores
- ✅ **Validación de datos:** Esquemas Joi completos
- ✅ **Middlewares críticos:** Auth y validación
- ✅ **Utilidades:** Generación de tokens, helpers

### 🎯 Casos de Test Principales

1. **Autenticación Exitosa**
   - Login válido retorna token JWT
   - Token tiene formato correcto

2. **Seguridad**
   - Credenciales incorrectas son rechazadas
   - Rutas protegidas requieren autenticación
   - Validación estricta de entrada

3. **Validación de Datos**
   - Esquemas Joi funcionan correctamente
   - Errores descriptivos para datos inválidos
   - Formatos requeridos son respetados

4. **CRUD Completo**
   - Operaciones de productos (crear, leer, actualizar, eliminar)
   - Respuestas HTTP correctas
   - Autorización adecuada

### 💡 Beneficios Implementados

- 🛡️ **Confiabilidad:** Detecta errores antes del despliegue
- 🚀 **Desarrollo rápido:** Feedback inmediato en cambios
- 📈 **Calidad:** Cobertura completa de funcionalidades críticas
- 🔄 **CI/CD Ready:** Configurado para integración continua
- 📝 **Documentación viva:** Tests como especificación

### 🔄 Integración Continua

Los tests están configurados para ejecutarse en:
- Commits locales (con hooks de git)
- Pull requests
- Despliegues automáticos
- Builds de producción

---

**¡Sistema de testing completamente funcional y listo para garantizar la calidad de tu API VolleyballArt!** ✅
