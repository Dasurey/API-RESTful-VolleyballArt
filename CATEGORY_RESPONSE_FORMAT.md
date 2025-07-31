# 📋 **FORMATO DE RESPUESTAS ACTUALIZADO - Category API**

## 🔄 **Cambio Implementado**

Las respuestas de la API de categoria ahora usan el formato `message` + `payload` en lugar de `success` + `data`.

**Campos removidos:** `createdAt`, `type`, `updatedAt` - Solo se devuelven los datos esenciales solicitados.

**Nomenclatura corregida:** `category` (singular) y `subcategory` (singular) en lugar de plurales.

## 📊 **Ejemplos de Respuestas**

### **✅ Obtener Todas las Categorías**
```json
{
  "message": "📋 Categorías obtenidas exitosamente",
  "payload": [
    {
      "id": "CAT-0001-0000",
      "title": "Zapatillas"
    },
    {
      "id": "CAT-0002-0000", 
      "title": "Accesorios"
    }
  ]
}
```

### **✅ Obtener Categoría con Subcategoria**
```json
{
  "message": "📂 Categoría obtenida exitosamente",
  "payload": {
    "id": "CAT-0001-0000",
    "title": "Zapatillas",
    "subcategory": [
      {
        "id": "CAT-0001-0001",
        "title": "Hombre",
        "text": "<p>IMPORTANTE: en base a nuestra experiencia, el mejor dato para elegir el numero de tu zapa, es el que en la etiqueta figura como CM o JP.</p>",
        "img": [
          {
            "src": "img/additional_info/shoes_alls.webp",
            "alt": "Talles de Zapatillas"
          }
        ],
        "parentCategoryId": "CAT-0001-0000"
      },
      {
        "id": "CAT-0001-0002",
        "title": "Mujer",
        "text": "<p>IMPORTANTE: información sobre talles para mujeres.</p>",
        "img": [
          {
            "src": "img/additional_info/shoes_alls.webp",
            "alt": "Talles de Zapatillas"
          }
        ],
        "parentCategoryId": "CAT-0001-0000"
      }
    ]
  }
}
```

### **✅ Crear Nueva Categoría**
```json
{
  "message": "✅ Categoría creada exitosamente",
  "payload": {
    "id": "CAT-0003-0000",
    "title": "Ropa Deportiva"
  }
}
```

### **✅ Crear Nueva Subcategoría**
```json
{
  "message": "✅ Subcategoría creada exitosamente",
  "payload": {
    "id": "CAT-0001-0003",
    "title": "Niños",
    "text": "<p>Zapatillas deportivas especiales para niños.</p>",
    "img": [
      {
        "src": "img/kids/shoes.webp",
        "alt": "Zapatillas para Niños"
      }
    ],
    "parentCategoryId": "CAT-0001-0000"
  }
}
```

### **✅ Actualizar Categoría**
```json
{
  "message": "✅ Categoría actualizada exitosamente",
  "payload": {
    "id": "CAT-0001-0000",
    "title": "Zapatillas Deportivas"
  }
}
```

### **✅ Eliminar Categoría**
```json
{
  "message": "✅ Categoría eliminada exitosamente",
  "payload": {
    "deleted": true,
    "id": "CAT-0001-0003"
  }
}
```

### **✅ Obtener Jerarquía Completa**
```json
{
  "message": "🌳 Jerarquía de categoria obtenida exitosamente",
  "payload": [
    {
      "id": "CAT-0001-0000",
      "title": "Zapatillas",
      "subcategory": [
        {
          "id": "CAT-0001-0001",
          "title": "Hombre",
          "parentCategoryId": "CAT-0001-0000"
        },
        {
          "id": "CAT-0001-0002", 
          "title": "Mujer",
          "parentCategoryId": "CAT-0001-0000"
        }
      ]
    }
  ]
}
```

## ❌ **Respuestas de Error**

### **Error 404 - No Encontrado**
```json
{
  "message": "Categoría no encontrada con ID: CAT-9999-0000"
}
```

### **Error 400 - Validación**
```json
{
  "message": "El título de la categoría es requerido"
}
```

### **Error 500 - Error Interno**
```json
{
  "message": "🚨 Error al obtener categoria"
}
```

## 🔧 **Archivos Modificados**

1. **`src/utils/category.utils.js`** - ✅ **NUEVO**: Utilidades específicas para categoria
2. **`src/controllers/category.controller.js`** - ✅ **ACTUALIZADO**: Usa nuevas utilidades
3. **`src/routes/category.routes.js`** - ✅ **ACTUALIZADO**: Documentación Swagger actualizada

## 📝 **Características del Nuevo Formato**

### ✅ **Consistencia**
- Todas las respuestas usan `message` + `payload`
- No hay campos `success` o `data`
- Formato uniforme en toda la API de categoria

### ✅ **Logging Integrado**
- Logging automático con metadatos detallados
- Tiempos de ejecución incluidos
- Información de request (IP, método, path)

### ✅ **Manejo de Errores**
- Respuestas de error sin `payload`
- Solo `message` para errores
- Detalles de error en development mode

### ✅ **Documentación Swagger**
- Ejemplos actualizados con nuevo formato
- Esquemas de respuesta correctos
- Compatible con herramientas de testing

## 🎯 **Diferencias Clave**

### **Antes:**
```json
{
  "success": true,
  "message": "Datos obtenidos",
  "data": [...]
}
```

### **Ahora:**
```json
{
  "message": "Datos obtenidos",
  "payload": [...]
}
```

---

## 🎉 **¡Formato Actualizado!**

El sistema de categoria ahora usa exclusivamente el formato `message` + `payload` como solicitaste. Todas las respuestas son consistentes y la documentación Swagger ha sido actualizada para reflejar estos cambios.
