const Joi = require('joi');

/**
 * Esquema de validación para crear subcategoría
 */
const createSubcategorySchema = Joi.object({
  title: Joi.string()
    .trim()
    .min(2)
    .max(100)
    .required()
    .messages({
      'string.empty': '📛 El título de la subcategoría es requerido',
      'string.min': '📝 El título debe tener al menos 2 caracteres',
      'string.max': '📝 El título debe tener como máximo 100 caracteres',
      'any.required': '📛 El título de la subcategoría es requerido'
    }),
    
  text: Joi.string()
    .trim()
    .max(5000)
    .required()
    .messages({
      'string.max': '📝 El texto no puede exceder 5000 caracteres',
      'string.empty': '📝 El texto descriptivo de la subcategoría es requerido',
      'any.required': '📝 El texto descriptivo de la subcategoría es requerido'
    }),
    
  img: Joi.array()
    .items(
      Joi.object({
        src: Joi.string()
          .uri()
          .required()
          .messages({
            'string.uri': '🖼️ La URL de la imagen debe ser válida',
            'any.required': '🖼️ La URL de la imagen es requerida'
          }),
        alt: Joi.string()
          .trim()
          .max(200)
          .required()
          .messages({
            'string.max': '🖼️ El texto alternativo no puede exceder 200 caracteres',
            'any.required': '🖼️ El texto alternativo es requerido'
          })
      })
    )
    .min(1)
    .max(10)
    .required()
    .messages({
      'array.max': '🖼️ No se pueden agregar más de 10 imágenes',
      'array.min': '🖼️ Se requiere al menos una imagen',
      'any.required': '🖼️ Las imágenes de la subcategoría son requeridas'
    })
});

/**
 * Esquema de validación para crear categoría padre
 */
const createCategorySchema = Joi.object({
  title: Joi.string()
    .trim()
    .min(2)
    .max(100)
    .required()
    .messages({
      'string.empty': '📛 El título de la categoría es requerido',
      'string.min': '📝 El título debe tener al menos 2 caracteres',
      'string.max': '📝 El título no puede exceder 100 caracteres',
      'any.required': '📛 El título de la categoría es requerido'
    }),
    
  subcategory: Joi.array()
    .items(createSubcategorySchema)
    .max(20)
    .optional()
    .messages({
      'array.max': '📚 No se pueden agregar más de 20 subcategorías'
    })
});

/**
 * Esquema de validación simple para crear subcategoría (sin validaciones adicionales)
 */
const createSubcategorySimpleSchema = Joi.object({
  title: Joi.string()
    .trim()
    .min(2)
    .max(100)
    .required()
    .messages({
      'string.empty': '📛 El título de la subcategoría es requerido',
      'string.min': '📝 El título debe tener al menos 2 caracteres',
      'string.max': '📝 El título no puede exceder 100 caracteres',
      'any.required': '📛 El título de la subcategoría es requerido'
    }),
    
  text: Joi.string()
    .trim()
    .max(5000)
    .allow('', null)
    .optional()
    .messages({
      'string.max': '📝 El texto no puede exceder 5000 caracteres'
    }),
    
  img: Joi.array()
    .items(
      Joi.object({
        src: Joi.string()
          .uri()
          .required()
          .messages({
            'string.uri': '🖼️ La URL de la imagen debe ser válida',
            'any.required': '🖼️ La URL de la imagen es requerida'
          }),
        alt: Joi.string()
          .trim()
          .max(200)
          .required()
          .messages({
            'string.max': '🖼️ El texto alternativo no puede exceder 200 caracteres',
            'any.required': '🖼️ El texto alternativo es requerido'
          })
      })
    )
    .max(10)
    .optional()
    .messages({
      'array.max': '🖼️ No se pueden agregar más de 10 imágenes'
    })
});

/**
 * Esquema de validación para actualizar categoría
 */
const updateCategorySchema = Joi.object({
  title: Joi.string()
    .trim()
    .min(2)
    .max(100)
    .optional()
    .messages({
      'string.empty': '📛 El título no puede estar vacío',
      'string.min': '📝 El título debe tener al menos 2 caracteres',
      'string.max': '📝 El título no puede exceder 100 caracteres'
    })
}).min(1).messages({
  'object.min': '📝 Debe proporcionar al menos un campo para actualizar'
});

/**
 * Esquema de validación para actualizar subcategoría
 */
const updateSubcategorySchema = Joi.object({
  title: Joi.string()
    .trim()
    .min(2)
    .max(100)
    .optional()
    .messages({
      'string.empty': '📛 El título no puede estar vacío',
      'string.min': '📝 El título debe tener al menos 2 caracteres',
      'string.max': '📝 El título no puede exceder 100 caracteres'
    }),
    
  text: Joi.string()
    .trim()
    .max(5000)
    .allow('', null)
    .optional()
    .messages({
      'string.max': '📝 El texto no puede exceder 5000 caracteres'
    }),
    
  img: Joi.array()
    .items(
      Joi.object({
        src: Joi.string()
          .uri()
          .required()
          .messages({
            'string.uri': '🖼️ La URL de la imagen debe ser válida',
            'any.required': '🖼️ La URL de la imagen es requerida'
          }),
        alt: Joi.string()
          .trim()
          .max(200)
          .allow('', null)
          .optional()
          .messages({
            'string.max': '🖼️ El texto alternativo no puede exceder 200 caracteres'
          })
      })
    )
    .max(10)
    .optional()
    .default([])
    .messages({
      'array.max': '🖼️ No se pueden agregar más de 10 imágenes'
    })
}).min(1).messages({
  'object.min': '📝 Debe proporcionar al menos un campo para actualizar'
});

/**
 * Esquema de validación para ID de categoría
 */
const categoryIdSchema = Joi.object({
  id: Joi.string()
    .pattern(/^CAT-\d{4}-(0000|\d{4})$/)
    .required()
    .messages({
      'string.pattern.base': '🆔 El ID de categoría debe tener el formato CAT-XXXX-YYYY',
      'any.required': '🆔 El ID de categoría es requerido'
    })
});

/**
 * Esquema de validación para ID de categoría padre
 */
const parentCategoryIdSchema = Joi.object({
  parentId: Joi.string()
    .pattern(/^CAT-\d{4}-0000$/)
    .required()
    .messages({
      'string.pattern.base': '🆔 El ID de categoría padre debe tener el formato CAT-XXXX-0000',
      'any.required': '🆔 El ID de categoría padre es requerido'
    })
});

/**
 * Esquema de validación para parámetros de categoria padre
 */
const categoryParentIdSchema = Joi.object({
  id: Joi.string()
    .pattern(/^CAT-\d{4}-0000$/)
    .required()
    .messages({
      'string.pattern.base': '🆔 El ID de categoría padre debe tener el formato CAT-XXXX-0000',
      'any.required': '🆔 El ID de categoría padre es requerido'
    })
});

/**
 * Esquema de validación para parámetros de categoría y subcategoría
 */
const categorySubcategoryParamsSchema = Joi.object({
  categoryId: Joi.string()
    .pattern(/^CAT-\d{4}-0000$/)
    .required()
    .messages({
      'string.pattern.base': '🆔 El ID de categoría padre debe tener el formato CAT-XXXX-0000',
      'any.required': '🆔 El ID de categoría padre es requerido'
    }),
  subcategoryId: Joi.string()
    .pattern(/^CAT-\d{4}-\d{4}$/)
    .custom((value, helpers) => {
      if (value.endsWith('-0000')) {
        return helpers.error('any.custom', { message: 'El ID no puede terminar en -0000 (es un ID de categoría padre)' });
      }
      return value;
    })
    .required()
    .messages({
      'string.pattern.base': '🆔 El ID de subcategoría debe tener el formato CAT-XXXX-YYYY',
      'any.required': '🆔 El ID de subcategoría es requerido'
    })
});

/**
 * Esquema de validación para query parameters de eliminación
 */
const deleteQuerySchema = Joi.object({
  deleteSubcategory: Joi.string()
    .valid('true', 'false')
    .optional()
    .messages({
      'any.only': '🗑️ deleteSubcategory debe ser "true" o "false"'
    })
});

module.exports = {
  createCategorySchema,
  createSubcategorySchema,
  createSubcategorySimpleSchema,
  updateCategorySchema,
  updateSubcategorySchema,
  categoryIdSchema,
  parentCategoryIdSchema,
  categoryParentIdSchema,
  categorySubcategoryParamsSchema,
  deleteQuerySchema
};
