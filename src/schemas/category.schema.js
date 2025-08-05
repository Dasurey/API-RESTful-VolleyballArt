const { EXTERNAL_PACKAGES } = require('../config/paths.config');
const { JOI_ERROR_KEYS, VALIDATION_MESSAGES, SERVICE_MESSAGES } = require('../utils/messages.utils');
const Joi = require(EXTERNAL_PACKAGES.JOI);

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
      'string.empty': 'El título de la subcategoría es requerido',
      'string.min': VALIDATION_MESSAGES.TITLE_MIN_2_CHARS,
      'string.max': VALIDATION_MESSAGES.TITLE_MAX_100_CHARS,
      'any.required': 'El título de la subcategoría es requerido'
    }),
    
  text: Joi.string()
    .trim()
    .max(5000)
    .required()
    .messages({
      'string.max': VALIDATION_MESSAGES.TEXT_MAX_5000_CHARS,
      'string.empty': VALIDATION_MESSAGES.SUBCATEGORY_TEXT_REQUIRED,
      'any.required': VALIDATION_MESSAGES.SUBCATEGORY_TEXT_REQUIRED
    }),
    
  img: Joi.array()
    .items(
      Joi.object({
        src: Joi.string()
          .uri()
          .required()
          .messages({
            [JOI_ERROR_KEYS.STRING_URI]: VALIDATION_MESSAGES.IMAGE_URL_INVALID,
            'any.required': VALIDATION_MESSAGES.IMAGE_URL_REQUIRED
          }),
        alt: Joi.string()
          .trim()
          .max(200)
          .required()
          .messages({
            'string.max': VALIDATION_MESSAGES.ALT_TEXT_MAX_200_CHARS,
            'any.required': VALIDATION_MESSAGES.ALT_TEXT_REQUIRED
          })
      })
    )
    .min(1)
    .max(10)
    .required()
    .messages({
      [JOI_ERROR_KEYS.ARRAY_MAX]: VALIDATION_MESSAGES.MAX_10_IMAGES,
      [JOI_ERROR_KEYS.ARRAY_MIN]: VALIDATION_MESSAGES.MIN_1_IMAGE,
      'any.required': VALIDATION_MESSAGES.SUBCATEGORY_IMG_REQUIRED
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
      'string.empty': VALIDATION_MESSAGES.CATEGORY_TITLE_REQUIRED,
      'string.min': VALIDATION_MESSAGES.TITLE_MIN_2_CHARS,
      'string.max': VALIDATION_MESSAGES.TITLE_MAX_100_CHARS,
      'any.required': VALIDATION_MESSAGES.CATEGORY_TITLE_REQUIRED
    }),
    
  subcategory: Joi.array()
    .items(createSubcategorySchema)
    .max(20)
    .optional()
    .messages({
      [JOI_ERROR_KEYS.ARRAY_MAX]: VALIDATION_MESSAGES.MAX_20_SUBCATEGORIES
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
      'string.empty': 'El título de la subcategoría es requerido',
      'string.min': VALIDATION_MESSAGES.TITLE_MIN_2_CHARS,
      'string.max': VALIDATION_MESSAGES.TITLE_MAX_100_CHARS,
      'any.required': 'El título de la subcategoría es requerido'
    }),
    
  text: Joi.string()
    .trim()
    .max(5000)
    .allow('', null)
    .optional()
    .messages({
      'string.max': VALIDATION_MESSAGES.TEXT_MAX_5000_CHARS
    }),
    
  img: Joi.array()
    .items(
      Joi.object({
        src: Joi.string()
          .uri()
          .required()
          .messages({
            [JOI_ERROR_KEYS.STRING_URI]: VALIDATION_MESSAGES.IMAGE_URL_INVALID,
            'any.required': VALIDATION_MESSAGES.IMAGE_URL_REQUIRED
          }),
        alt: Joi.string()
          .trim()
          .max(200)
          .required()
          .messages({
            'string.max': VALIDATION_MESSAGES.ALT_TEXT_MAX_200_CHARS,
            'any.required': VALIDATION_MESSAGES.ALT_TEXT_REQUIRED
          })
      })
    )
    .max(10)
    .optional()
    .messages({
      [JOI_ERROR_KEYS.ARRAY_MAX]: VALIDATION_MESSAGES.MAX_10_IMAGES
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
      'string.empty': VALIDATION_MESSAGES.TITLE_CANNOT_BE_EMPTY,
      'string.min': VALIDATION_MESSAGES.TITLE_MIN_2_CHARS,
      'string.max': VALIDATION_MESSAGES.TITLE_MAX_100_CHARS
    })
}).min(1).messages({
  [JOI_ERROR_KEYS.OBJECT_MIN]: VALIDATION_MESSAGES.PROVIDE_AT_LEAST_ONE_FIELD
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
      'string.empty': VALIDATION_MESSAGES.TITLE_CANNOT_BE_EMPTY,
      'string.min': VALIDATION_MESSAGES.TITLE_MIN_2_CHARS,
      'string.max': VALIDATION_MESSAGES.TITLE_MAX_100_CHARS
    }),
    
  text: Joi.string()
    .trim()
    .max(5000)
    .allow('', null)
    .optional()
    .messages({
      'string.max': VALIDATION_MESSAGES.TEXT_MAX_5000_CHARS
    }),
    
  img: Joi.array()
    .items(
      Joi.object({
        src: Joi.string()
          .uri()
          .required()
          .messages({
            [JOI_ERROR_KEYS.STRING_URI]: VALIDATION_MESSAGES.IMAGE_URL_INVALID,
            'any.required': VALIDATION_MESSAGES.IMAGE_URL_REQUIRED
          }),
        alt: Joi.string()
          .trim()
          .max(200)
          .allow('', null)
          .optional()
          .messages({
            'string.max': VALIDATION_MESSAGES.ALT_TEXT_MAX_200_CHARS
          })
      })
    )
    .max(10)
    .optional()
    .default([])
    .messages({
      [JOI_ERROR_KEYS.ARRAY_MAX]: VALIDATION_MESSAGES.MAX_10_IMAGES
    })
}).min(1).messages({
  [JOI_ERROR_KEYS.OBJECT_MIN]: VALIDATION_MESSAGES.PROVIDE_AT_LEAST_ONE_FIELD
});

/**
 * Esquema de validación para ID de categoría
 */
const categoryIdSchema = Joi.object({
  id: Joi.string()
    .pattern(/^CAT-\d{4}-(0000|\d{4})$/)
    .required()
    .messages({
      [JOI_ERROR_KEYS.STRING_PATTERN_BASE]: VALIDATION_MESSAGES.CATEGORY_ID_FORMAT_INVALID,
      'any.required': VALIDATION_MESSAGES.CATEGORY_ID_REQUIRED
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
      [JOI_ERROR_KEYS.STRING_PATTERN_BASE]: VALIDATION_MESSAGES.PARENT_CATEGORY_ID_FORMAT_INVALID,
      'any.required': VALIDATION_MESSAGES.PARENT_CATEGORY_ID_REQUIRED
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
      [JOI_ERROR_KEYS.STRING_PATTERN_BASE]: VALIDATION_MESSAGES.PARENT_CATEGORY_ID_FORMAT_INVALID,
      'any.required': VALIDATION_MESSAGES.PARENT_CATEGORY_ID_REQUIRED
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
      [JOI_ERROR_KEYS.STRING_PATTERN_BASE]: VALIDATION_MESSAGES.PARENT_CATEGORY_ID_FORMAT_INVALID,
      'any.required': VALIDATION_MESSAGES.PARENT_CATEGORY_ID_REQUIRED
    }),
  subcategoryId: Joi.string()
    .pattern(/^CAT-\d{4}-\d{4}$/)
    .custom((value, helpers) => {
      if (value.endsWith('-0000')) {
        return helpers.error('any.custom', { message: VALIDATION_MESSAGES.ID_CANNOT_END_0000 });
      }
      return value;
    })
    .required()
    .messages({
      [JOI_ERROR_KEYS.STRING_PATTERN_BASE]: VALIDATION_MESSAGES.SUBCATEGORY_ID_FORMAT_INVALID,
      'any.required': VALIDATION_MESSAGES.SUBCATEGORY_ID_REQUIRED
    })
});

/**
 * Esquema de validación para query parameters de eliminación
 */
const deleteQuerySchema = Joi.object({
  deleteSubcategory: Joi.string()
    .valid(SERVICE_MESSAGES.TRUE_STRING, SERVICE_MESSAGES.FALSE_STRING)
    .optional()
    .messages({
      [JOI_ERROR_KEYS.ANY_ONLY]: VALIDATION_MESSAGES.DELETE_SUBCATEGORY_VALID_VALUES
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
