const Joi = require('joi');

// Esquema para validar productos
const productSchema = Joi.object({
  title: Joi.string()
    .min(3)
    .max(100)
    .required()
    .messages({
      'string.empty': 'El título es obligatorio',
      'string.min': 'El título debe tener al menos 3 caracteres',
      'string.max': 'El título no puede tener más de 100 caracteres'
    }),

  img: Joi.array()
    .items(
      Joi.object({
        src: Joi.string().uri().required().messages({
          'string.uri': 'La URL de la imagen debe ser válida',
          'string.empty': 'La URL de la imagen es obligatoria'
        }),
        alt: Joi.string().min(1).required().messages({
          'string.empty': 'El texto alternativo es obligatorio'
        }),
        carousel: Joi.boolean().required().messages({
          'boolean.base': 'El carousel debe ser true o false'
        })
      })
    )
    .min(1)
    .required()
    .messages({
      'array.min': 'Debe incluir al menos una imagen',
      'array.base': 'Las imágenes deben ser un array'
    }),

  price: Joi.number()
    .min(0)
    .required()
    .messages({
      'number.min': 'El precio no puede ser negativo',
      'number.base': 'El precio debe ser un número'
    }),

  previous_price: Joi.number()
    .min(0)
    .allow(null)
    .messages({
      'number.min': 'El precio anterior no puede ser negativo',
      'number.base': 'El precio anterior debe ser un número o null'
    }),

  description: Joi.string()
    .min(10)
    .max(500)
    .required()
    .messages({
      'string.empty': 'La descripción es obligatoria',
      'string.min': 'La descripción debe tener al menos 10 caracteres',
      'string.max': 'La descripción no puede tener más de 500 caracteres'
    }),

  category: Joi.number()
    .integer()
    .min(1)
    .required()
    .messages({
      'number.base': 'La categoría debe ser un número',
      'number.integer': 'La categoría debe ser un número entero',
      'number.min': 'La categoría debe ser mayor a 0'
    }),

  subcategory: Joi.number()
    .integer()
    .min(1)
    .required()
    .messages({
      'number.base': 'La subcategoría debe ser un número',
      'number.integer': 'La subcategoría debe ser un número entero',
      'number.min': 'La subcategoría debe ser mayor a 0'
    }),

  outstanding: Joi.boolean()
    .required()
    .messages({
      'boolean.base': 'El destacado debe ser true o false'
    })
});

// Esquema para actualizar productos (campos opcionales)
const updateProductSchema = Joi.object({
  title: Joi.string().min(3).max(100),
  img: Joi.array().items(
    Joi.object({
      src: Joi.string().uri().required(),
      alt: Joi.string().min(1).required(),
      carousel: Joi.boolean().required()
    })
  ).min(1),
  price: Joi.number().min(0),
  previous_price: Joi.number().min(0).allow(null),
  description: Joi.string().min(10).max(500),
  category: Joi.number().integer().min(1),
  subcategory: Joi.number().integer().min(1),
  outstanding: Joi.boolean()
}).min(1); // Al menos un campo debe estar presente

module.exports = {
  productSchema,
  updateProductSchema
};
