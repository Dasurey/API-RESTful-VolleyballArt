# 🔍 Sistema de Validación de Datos

## ✅ **¿Qué hemos implementado?**

### **Joi para Validación Robusta**
- Validaciones declarativas y claras
- Mensajes de error personalizados
- Sanitización automática de datos
- Validación de tipos, formatos y rangos

## 📋 **Validaciones Implementadas**

### **Productos**
```javascript
// Crear producto
{
  "title": "string (3-100 chars)",
  "img": [
    {
      "src": "URL válida",
      "alt": "string no vacío", 
      "carousel": "boolean"
    }
  ],
  "price": "number >= 0",
  "previous_price": "number >= 0 o null",
  "description": "string (10-500 chars)",
  "category": "integer > 0",
  "subcategory": "integer > 0", 
  "outstanding": "boolean"
}
```

### **Autenticación**
```javascript
// Login
{
  "email": "email válido",
  "password": "string >= 6 chars"
}

// Registro
{
  "email": "email válido",
  "password": "string (6-50 chars) con 1 mayúscula, 1 minúscula, 1 número",
  "confirmPassword": "debe coincidir con password"
}
```

### **IDs de Productos**
- Formato: `VA-0000001`
- Valida que tenga exactamente 7 dígitos después de "VA-"

## 🎯 **Beneficios**

- ✅ **Datos consistentes** - Todos los datos están validados antes de llegar a la BD
- ✅ **Errores claros** - Mensajes específicos sobre qué está mal
- ✅ **Seguridad** - Previene inyecciones y datos maliciosos
- ✅ **Menos bugs** - Catch errores antes de que causen problemas
- ✅ **Código más limpio** - No más validación manual repetitiva

## 🔧 **Cómo Funciona**

1. **Request llega** → Middleware de validación
2. **Joi valida** → Datos según esquema definido
3. **Si es válido** → Continúa al controlador
4. **Si es inválido** → Devuelve error 400 con mensaje claro

## 📝 **Ejemplos de Errores**

```json
// Email inválido
{
  "message": "Datos inválidos",
  "error": "Debe ser un email válido",
  "field": "email"
}

// Precio negativo
{
  "message": "Datos inválidos", 
  "error": "El precio no puede ser negativo",
  "field": "price"
}

// ID con formato incorrecto
{
  "message": "Parámetro inválido",
  "error": "El ID debe tener el formato VA-0000001"
}
```

## 🚀 **Próximas Mejoras**
- Validación de archivos de imagen
- Validación de fechas
- Sanitización de HTML
- Rate limiting por validación fallida
