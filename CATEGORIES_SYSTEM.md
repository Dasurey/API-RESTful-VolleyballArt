# 🏷️ Sistema de Categorías - API RESTful VolleyballArt

## 📋 **Estructura de IDs Implementada**

### **Categorías Padre:** `CAT-XXXX-0000`
- `CAT-0001-0000` - Primera categoría padre
- `CAT-0002-0000` - Segunda categoría padre
- `CAT-XXXX-0000` - Patrón general

### **Subcategoria:** `CAT-XXXX-YYYY`
- `CAT-0001-0001` - Primera subcategoría de CAT-0001-0000
- `CAT-0001-0002` - Segunda subcategoría de CAT-0001-0000
- `CAT-0002-0001` - Primera subcategoría de CAT-0002-0000

## 🚀 **Endpoints Disponibles**

### **Obtener Todas las Categorías**
```http
GET /api/v1/category
```

### **Obtener Jerarquía Completa**
```http
GET /api/v1/category/hierarchy
```

### **Obtener Categoría por ID**
```http
GET /api/v1/category/CAT-0001-0000
```

### **Obtener Subcategoria de una Categoría Padre**
```http
GET /api/v1/category/CAT-0001-0000/subcategory
```

### **Crear Categoría Padre**
```http
POST /api/v1/category
Content-Type: application/json

{
  "title": "Zapatillas"
}
```

### **Crear Subcategoría**
```http
POST /api/v1/category/CAT-0001-0000/subcategory
Content-Type: application/json

{
  "title": "Hombre",
  "text": "<p>IMPORTANTE: en base a nuestra experiencia, el mejor dato para elegir el numero de tu zapa, es el que en la etiqueta figura como CM o JP. Compara ese dato con el que figura en nuestra pagina y así el margen de error es mínimo!</p>",
  "img": [
    {
      "src": "img/additional_info/shoes_alls.webp",
      "alt": "Talles de Zapatillas"
    }
  ]
}
```

### **Actualizar Categoría**
```http
PUT /api/v1/category/CAT-0001-0000
Content-Type: application/json

{
  "title": "Zapatillas Deportivas"
}
```

### **Eliminar Categoría**
```http
DELETE /api/v1/category/CAT-0001-0001
```

### **Eliminar Categoría Padre con Subcategoria**
```http
DELETE /api/v1/category/CAT-0001-0000?deleteSubcategory=true
```

## 📊 **Ejemplo de Estructura de Datos**

### **Categoría Padre Completa:**
```json
{
  "id": "CAT-0001-0000",
  "title": "Zapatillas",
  "type": "parent",
  "subcategory": [
    {
      "id": "CAT-0001-0001",
      "title": "Hombre",
      "text": "<p>IMPORTANTE: en base a nuestra experiencia...</p>",
      "img": [
        {
          "src": "img/additional_info/shoes_alls.webp",
          "alt": "Talles de Zapatillas"
        }
      ],
      "parentCategoryId": "CAT-0001-0000",
      "type": "subcategory",
      "createdAt": "2025-07-30T21:45:00.000Z"
    },
    {
      "id": "CAT-0001-0002",
      "title": "Mujer",
      "text": "<p>IMPORTANTE: en base a nuestra experiencia...</p>",
      "img": [
        {
          "src": "img/additional_info/shoes_alls.webp",
          "alt": "Talles de Zapatillas"
        }
      ],
      "parentCategoryId": "CAT-0001-0000",
      "type": "subcategory",
      "createdAt": "2025-07-30T21:46:00.000Z"
    }
  ],
  "createdAt": "2025-07-30T21:44:00.000Z"
}
```

## 🔧 **Características Implementadas**

### ✅ **Generación Automática de IDs**
- IDs secuenciales automáticos
- Formato consistente CAT-XXXX-YYYY
- Categorías padre terminan en -0000
- Subcategoria mantienen relación con padre

### ✅ **Validación Completa**
- Validación de formatos de ID
- Validación de datos de entrada
- Validación de relaciones padre-hijo
- Esquemas Joi para todas las operaciones

### ✅ **Logging Centralizado**
- Logging automático de todas las operaciones
- Metadatos detallados para debugging
- Integración con sistema de logging existente

### ✅ **Manejo de Errores**
- Respuestas consistentes
- Manejo de errores de validación
- Protección contra eliminación de categoria con subcategoria

### ✅ **Documentación Swagger**
- Documentación completa de todos los endpoints
- Ejemplos de requests y responses
- Esquemas de validación documentados

### ✅ **Operaciones CRUD Completas**
- Crear categoria y subcategoria
- Leer con diferentes filtros
- Actualizar cualquier categoría
- Eliminar con opciones avanzadas

## 🎯 **Casos de Uso**

### **1. Crear Jerarquía de Zapatillas**
```bash
# 1. Crear categoría padre
POST /api/v1/category
{"title": "Zapatillas"}
# Retorna: CAT-0001-0000

# 2. Crear subcategoría Hombre
POST /api/v1/category/CAT-0001-0000/subcategory
{"title": "Hombre", "text": "...", "img": [...]}
# Retorna: CAT-0001-0001

# 3. Crear subcategoría Mujer
POST /api/v1/category/CAT-0001-0000/subcategory
{"title": "Mujer", "text": "...", "img": [...]}
# Retorna: CAT-0001-0002
```

### **2. Obtener Estructura Completa**
```bash
GET /api/v1/category/hierarchy
# Retorna todas las categoria con sus subcategoria anidadas
```

### **3. Gestión de Productos**
- Los productos pueden referenciar `CAT-0001-0001` para "Zapatillas > Hombre"
- Filtrado por categoría padre o subcategoría específica
- Navegación jerárquica en frontend

## 🔒 **Validaciones Implementadas**

### **IDs de Categoría Padre:**
- Formato: `^CAT-\d{4}-0000$`
- Ejemplo válido: `CAT-0001-0000`

### **IDs de Subcategoría:**
- Formato: `^CAT-\d{4}-\d{4}$`
- Ejemplo válido: `CAT-0001-0001`

### **Datos de Entrada:**
- Títulos: 2-100 caracteres, requerido
- Texto: máximo 5000 caracteres, opcional
- Imágenes: máximo 10, con URL y alt text válidos

## 📝 **Swagger Documentation**

La documentación completa está disponible en:
- **URL:** `http://localhost:5000/api/docs`
- **Sección:** Category
- **Tags:** [Category]

---

## 🎉 **¡Sistema Listo para Uso!**

El sistema de categoria está completamente implementado y probado. Todas las funcionalidades solicitadas están disponibles con:

- ✅ IDs automáticos CAT-XXXX-YYYY
- ✅ Relación padre-hijo
- ✅ Validaciones completas
- ✅ Documentación Swagger
- ✅ Logging centralizado
- ✅ Manejo de errores robusto
