# � VolleyballArt API - Proyecto Backend

> **Proyecto educativo** desarrollado como parte del programa **Talento Tech** en la especialización **Backend con Node.js**. 

Esta es una API RESTful robusta y escalable para la gestión de productos y autenticación de usuarios, construida con tecnologías modernas y mejores prácticas de desarrollo.

---

## 🚀 Características Principales

- ✅ **API RESTful** completa con operaciones CRUD
- 🔐 **Autenticación JWT** segura  
- 🛡️ **Sistema de seguridad** avanzado (headers, rate limiting, sanitización)
- 📊 **Logging profesional** con Winston
- ✅ **Validación de datos** con Joi
- 🔄 **Versionado de API** automático
- 🔥 **Firebase Firestore** como base de datos
- ☁️ **Desplegado en Vercel**

## 🛠️ Tecnologías

- **Backend:** Node.js + Express
- **Base de datos:** Firebase Firestore
- **Autenticación:** JWT
- **Validación:** Joi 
- **Logging:** Winston + Morgan
- **Seguridad:** Helmet + Rate Limiting
- **Despliegue:** Vercel

## 📋 Endpoints Disponibles

### Productos
```
GET    /api/v1/products       - Listar productos
GET    /api/v1/products/:id   - Obtener producto por ID
POST   /api/v1/products/create - Crear producto (requiere auth)
PUT    /api/v1/products/:id   - Actualizar producto (requiere auth)  
DELETE /api/v1/products/:id   - Eliminar producto (requiere auth)
```

### Autenticación
```
POST   /auth/login            - Login (obtener token JWT)
```

### Información
```
GET    /api                   - Info general de la API
GET    /api/health            - Estado de salud del servidor
GET    /api/v1/docs           - Documentación de versión
```

## 🏃‍♂️ Ejecución Rápida

```bash
# Instalar dependencias
npm i && npm i -D

# Ejecutar en desarrollo
npm start
```

## 📚 Documentación Adicional

Para información técnica detallada, consulta:

- **[SECURITY_FEATURES.md](./SECURITY_FEATURES.md)** - Características de seguridad implementadas
- Ver carpeta `/src` para la arquitectura del código
- Endpoints de documentación en `/api/docs` cuando el servidor esté ejecutándose

---

**Desarrollado por:** @Dasurey
**Programa:** Talento Tech - Back-end / Node.js