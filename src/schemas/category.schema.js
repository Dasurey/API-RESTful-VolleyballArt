const { EXTERNAL_PACKAGES } = require('../config/paths.config.js');
const { JOI_ERROR_KEYS, VALIDATION_MESSAGES, SERVICE_MESSAGES } = require('../utils/messages.utils.js');
const Joi = require(EXTERNAL_PACKAGES.JOI);

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
      [JOI_ERROR_KEYS.STRING_EMPTY]: VALIDATION_MESSAGES.CATEGORY_TITLE_REQUIRED,
      [JOI_ERROR_KEYS.STRING_MIN]: VALIDATION_MESSAGES.TITLE_MIN_2_CHARS,
      [JOI_ERROR_KEYS.STRING_MAX]: VALIDATION_MESSAGES.TITLE_MAX_100_CHARS,
      [JOI_ERROR_KEYS.ANY_REQUIRED]: VALIDATION_MESSAGES.CATEGORY_TITLE_REQUIRED
    })
});

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
      [JOI_ERROR_KEYS.STRING_EMPTY]: VALIDATION_MESSAGES.SUBCATEGORY_TITLE_REQUIRED,
      [JOI_ERROR_KEYS.STRING_MIN]: VALIDATION_MESSAGES.TITLE_MIN_2_CHARS,
      [JOI_ERROR_KEYS.STRING_MAX]: VALIDATION_MESSAGES.TITLE_MAX_100_CHARS,
      [JOI_ERROR_KEYS.ANY_REQUIRED]: VALIDATION_MESSAGES.SUBCATEGORY_TITLE_REQUIRED
    }),
    
  text: Joi.string()
    .trim()
    .max(5000)
    .allow('', null)
    .optional()
    .messages({
      [JOI_ERROR_KEYS.STRING_MAX]: VALIDATION_MESSAGES.TEXT_MAX_5000_CHARS
    }),
    
  img: Joi.array()
    .items(
      Joi.object({
        src: Joi.string()
          .uri()
          .required()
          .messages({
            [JOI_ERROR_KEYS.STRING_URI]: VALIDATION_MESSAGES.IMAGE_URL_INVALID,
            [JOI_ERROR_KEYS.ANY_REQUIRED]: VALIDATION_MESSAGES.IMAGE_URL_REQUIRED
          }),
        alt: Joi.string()
          .trim()
          .max(200)
          .required()
          .messages({
            [JOI_ERROR_KEYS.STRING_MAX]: VALIDATION_MESSAGES.ALT_TEXT_MAX_200_CHARS,
            [JOI_ERROR_KEYS.ANY_REQUIRED]: VALIDATION_MESSAGES.ALT_TEXT_REQUIRED
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
      [JOI_ERROR_KEYS.STRING_EMPTY]: VALIDATION_MESSAGES.TITLE_CANNOT_BE_EMPTY,
      [JOI_ERROR_KEYS.STRING_MIN]: VALIDATION_MESSAGES.TITLE_MIN_2_CHARS,
      [JOI_ERROR_KEYS.STRING_MAX]: VALIDATION_MESSAGES.TITLE_MAX_100_CHARS
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
      [JOI_ERROR_KEYS.STRING_EMPTY]: VALIDATION_MESSAGES.TITLE_CANNOT_BE_EMPTY,
      [JOI_ERROR_KEYS.STRING_MIN]: VALIDATION_MESSAGES.TITLE_MIN_2_CHARS,
      [JOI_ERROR_KEYS.STRING_MAX]: VALIDATION_MESSAGES.TITLE_MAX_100_CHARS
    }),
    
  text: Joi.string()
    .trim()
    .max(5000)
    .allow('', null)
    .optional()
    .messages({
      [JOI_ERROR_KEYS.STRING_MAX]: VALIDATION_MESSAGES.TEXT_MAX_5000_CHARS
    }),
    
  img: Joi.array()
    .items(
      Joi.object({
        src: Joi.string()
          .uri()
          .required()
          .messages({
            [JOI_ERROR_KEYS.STRING_URI]: VALIDATION_MESSAGES.IMAGE_URL_INVALID,
            [JOI_ERROR_KEYS.ANY_REQUIRED]: VALIDATION_MESSAGES.IMAGE_URL_REQUIRED
          }),
        alt: Joi.string()
          .trim()
          .max(200)
          .required()
          .messages({
            [JOI_ERROR_KEYS.STRING_MAX]: VALIDATION_MESSAGES.ALT_TEXT_MAX_200_CHARS,
            [JOI_ERROR_KEYS.ANY_REQUIRED]: VALIDATION_MESSAGES.ALT_TEXT_REQUIRED
          })
      })
    )
    .max(10)
    .optional()
    .messages({
      [JOI_ERROR_KEYS.ARRAY_MAX]: VALIDATION_MESSAGES.MAX_10_IMAGES
    })
}).min(1).messages({
  [JOI_ERROR_KEYS.OBJECT_MIN]: VALIDATION_MESSAGES.PROVIDE_AT_LEAST_ONE_FIELD
});

/**
 * Esquema de validación para parámetros de ID de categoría
 */
const categoryIdSchema = Joi.object({
  id: Joi.string()
    .pattern(SERVICE_MESSAGES.SUBCATEGORY_ID_PATTERN)
    .required()
    .messages({
      [JOI_ERROR_KEYS.STRING_PATTERN_BASE]: VALIDATION_MESSAGES.CATEGORY_ID_FORMAT_INVALID,
      [JOI_ERROR_KEYS.ANY_REQUIRED]: VALIDATION_MESSAGES.CATEGORY_ID_REQUIRED
    })
});

/**
 * Esquema de validación para parámetros de ID de categoría padre
 */
const parentCategoryIdSchema = Joi.object({
  parentId: Joi.string()
    .pattern(SERVICE_MESSAGES.PARENT_CATEGORY_ID_PATTERN)
    .required()
    .messages({
      [JOI_ERROR_KEYS.STRING_PATTERN_BASE]: VALIDATION_MESSAGES.PARENT_CATEGORY_ID_FORMAT_INVALID,
      [JOI_ERROR_KEYS.ANY_REQUIRED]: VALIDATION_MESSAGES.PARENT_CATEGORY_ID_REQUIRED
    })
});

/**
 * Esquema de validación para parámetros de ID de categoría (usado en nueva ruta RESTful)
 */
const categoryParentIdSchema = Joi.object({
  id: Joi.string()
    .pattern(SERVICE_MESSAGES.PARENT_CATEGORY_ID_PATTERN)
    .required()
    .messages({
      [JOI_ERROR_KEYS.STRING_PATTERN_BASE]: VALIDATION_MESSAGES.PARENT_CATEGORY_ID_FORMAT_INVALID,
      [JOI_ERROR_KEYS.ANY_REQUIRED]: VALIDATION_MESSAGES.PARENT_CATEGORY_ID_REQUIRED
    })
});

/**
 * Esquema de validación para rutas con categoryId y subcategoryId
 */
const categorySubcategoryParamsSchema = Joi.object({
  categoryId: Joi.string()
    .pattern(SERVICE_MESSAGES.PARENT_CATEGORY_ID_PATTERN)
    .required()
    .messages({
      [JOI_ERROR_KEYS.STRING_PATTERN_BASE]: VALIDATION_MESSAGES.PARENT_CATEGORY_ID_FORMAT_INVALID,
      [JOI_ERROR_KEYS.ANY_REQUIRED]: VALIDATION_MESSAGES.CATEGORY_ID_REQUIRED
    }),
  subcategoryId: Joi.string()
    .pattern(SERVICE_MESSAGES.SUBCATEGORY_ID_PATTERN)
    .custom((value, helpers) => {
      // Validar que no termine en -0000 (eso sería una categoría padre)
      if (value.endsWith(SERVICE_MESSAGES.PARENT_CATEGORY_SUFFIX)) {
        return helpers.error(JOI_ERROR_KEYS.ANY_INVALID);
      }
      return value;
    })
    .required()
    .messages({
      [JOI_ERROR_KEYS.STRING_PATTERN_BASE]: VALIDATION_MESSAGES.SUBCATEGORY_ID_FORMAT_INVALID,
      [JOI_ERROR_KEYS.ANY_REQUIRED]: VALIDATION_MESSAGES.SUBCATEGORY_ID_REQUIRED,
      [JOI_ERROR_KEYS.ANY_INVALID]: VALIDATION_MESSAGES.ID_CANNOT_END_0000
    })
});

/**
 * Esquema de validación para crear subcategoría con parentId en URL
 */
const createSubcategorySimpleSchema = Joi.object({
  title: Joi.string()
    .trim()
    .min(2)
    .max(100)
    .required()
    .messages({
      [JOI_ERROR_KEYS.STRING_EMPTY]: VALIDATION_MESSAGES.SUBCATEGORY_TITLE_REQUIRED,
      [JOI_ERROR_KEYS.STRING_MIN]: VALIDATION_MESSAGES.TITLE_MIN_2_CHARS,
      [JOI_ERROR_KEYS.STRING_MAX]: VALIDATION_MESSAGES.TITLE_MAX_100_CHARS,
      [JOI_ERROR_KEYS.ANY_REQUIRED]: VALIDATION_MESSAGES.SUBCATEGORY_TITLE_REQUIRED
    }),
    
  text: Joi.string()
    .trim()
    .max(5000)
    .allow('', null)
    .optional()
    .messages({
      [JOI_ERROR_KEYS.STRING_MAX]: VALIDATION_MESSAGES.TEXT_MAX_5000_CHARS
    }),
    
  img: Joi.array()
    .items(
      Joi.object({
        src: Joi.string()
          .uri()
          .required()
          .messages({
            [JOI_ERROR_KEYS.STRING_URI]: VALIDATION_MESSAGES.IMAGE_URL_INVALID,
            [JOI_ERROR_KEYS.ANY_REQUIRED]: VALIDATION_MESSAGES.IMAGE_URL_REQUIRED
          }),
        alt: Joi.string()
          .trim()
          .max(200)
          .allow('', null)
          .optional()
          .messages({
            [JOI_ERROR_KEYS.STRING_MAX]: VALIDATION_MESSAGES.ALT_TEXT_MAX_200_CHARS
          })
      })
    )
    .max(10)
    .optional()
    .default([])
    .messages({
      [JOI_ERROR_KEYS.ARRAY_MAX]: VALIDATION_MESSAGES.MAX_10_IMAGES
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
