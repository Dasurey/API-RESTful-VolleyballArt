const Joi = require('joi');

// Esquema para validar productos
const productSchema = Joi.object({
  title: Joi.string()
    .min(3)
    .max(100)
    .required()
    .messages({
      'string.empty': '❗ El título es obligatorio',
      'string.min': '📝 El título debe tener al menos 3 caracteres',
      'string.max': '📝 El título debe tener como máximo 100 caracteres'
    }),

  img: Joi.array()
    .items(
      Joi.object({
        src: Joi.string().uri().required().messages({
          'string.uri': '🖼️ La URL de la imagen debe ser válida',
          'string.empty': '🖼️ La URL de la imagen es requerida'
        }),
        alt: Joi.string().min(1).required().messages({
          'string.empty': '🖼️ El texto alternativo de la imagen es requerido'
        }),
        carousel: Joi.boolean().required().messages({
          'boolean.base': '🎠 El campo carousel debe ser un booleano'
        })
      })
    )
    .min(1)
    .required()
    .messages({
      'array.min': '🖼️ Se requiere al menos una imagen',
      'array.base': '🖼️ Las imágenes deben ser un array'
    }),

  price: Joi.number()
    .min(0)
    .required()
    .messages({
      'number.min': '💸 El precio no puede ser negativo',
      'number.base': '💸 El precio debe ser un número'
    }),

  previous_price: Joi.number()
    .min(0)
    .allow(null)
    .messages({
      'number.min': '💸 El precio anterior no puede ser negativo',
      'number.base': '💸 El precio anterior debe ser un número o null'
    }),

  description: Joi.string()
    .min(10)
    .max(500)
    .required()
    .messages({
      'string.empty': '📝 La descripción del producto es requerida',
      'string.min': '📝 La descripción del producto debe tener al menos 10 caracteres',
      'string.max': '📝 La descripción del producto debe tener como máximo 500 caracteres'
    }),

  category: Joi.string()
    .pattern(/^CAT-\d{4}-0000$/)
    .required()
    .messages({
      'string.empty': '🏷️ La categoría es obligatoria',
      'string.pattern.base': '🏷️ La categoría debe tener el formato CAT-XXXX-0000'
    }),

  subcategory: Joi.string()
    .pattern(/^CAT-\d{4}-\d{4}$/)
    .required()
    .messages({
      'string.empty': '🏷️ La subcategoría es obligatoria',
      'string.pattern.base': '🏷️ La subcategoría debe tener el formato CAT-XXXX-YYYY'
    }),

  outstanding: Joi.boolean()
    .required()
    .messages({
      'boolean.base': '⭐ El campo destacado debe ser un valor booleano'
    })
});

// Esquema para actualizar productos (campos opcionales)
const updateProductSchema = Joi.object({
  title: Joi.string().min(3).max(100).messages({
    'string.empty': '❗ El título es obligatorio',
    'string.min': '📝 El título debe tener al menos 3 caracteres',
    'string.max': '📝 El título debe tener como máximo 100 caracteres'
  }),
  img: Joi.array().items(
    Joi.object({
      src: Joi.string().uri().required().messages({
        'string.uri': '🖼️ La URL de la imagen debe ser válida',
        'string.empty': '🖼️ La URL de la imagen es requerida'
      }),
      alt: Joi.string().min(1).required().messages({
        'string.empty': '🖼️ El texto alternativo de la imagen es requerido'
      }),
      carousel: Joi.boolean().required().messages({
        'boolean.base': '🎠 El campo carousel debe ser un booleano'
      })
    })
  ).min(1).messages({
    'array.min': '🖼️ Se requiere al menos una imagen',
    'array.base': '🖼️ Las imágenes deben ser un array'
  }),
  price: Joi.number().min(0).messages({
    'number.min': '💸 El precio no puede ser negativo',
    'number.base': '💸 El precio debe ser un número'
  }),
  previous_price: Joi.number().min(0).allow(null).messages({
    'number.min': '💸 El precio anterior no puede ser negativo',
    'number.base': '💸 El precio anterior debe ser un número o null'
  }),
  description: Joi.string().min(10).max(500).messages({
    'string.empty': '📝 La descripción del producto es requerida',
    'string.min': '📝 La descripción del producto debe tener al menos 10 caracteres',
    'string.max': '📝 La descripción del producto debe tener como máximo 500 caracteres'
  }),
  category: Joi.string().pattern(/^CAT-\d{4}-0000$/).messages({
    'string.empty': '🏷️ La categoría es obligatoria',
    'string.pattern.base': '🏷️ La categoría debe tener el formato CAT-XXXX-0000'
  }),
  subcategory: Joi.string().pattern(/^CAT-\d{4}-\d{4}$/).messages({
    'string.empty': '🏷️ La subcategoría es obligatoria',
    'string.pattern.base': '🏷️ La subcategoría debe tener el formato CAT-XXXX-YYYY'
  }),
  outstanding: Joi.boolean().messages({
    'boolean.base': '⭐ El campo destacado debe ser un valor booleano'
  })
}).min(1); // Al menos un campo debe estar presente

module.exports = {
  productSchema,
  updateProductSchema
};
