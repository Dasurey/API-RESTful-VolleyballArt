const { EXTERNAL_PACKAGES } = require('../config/paths.config.js');
const { JOI_ERROR_KEYS, VALIDATION_MESSAGES } = require('../utils/messages.utils.js');
const Joi = require(EXTERNAL_PACKAGES.JOI);

// Esquema para validar productos
const productSchema = Joi.object({
  title: Joi.string()
    .min(3)
    .max(100)
    .required()
    .messages({
      [JOI_ERROR_KEYS.STRING_EMPTY]: VALIDATION_MESSAGES.PRODUCT_TITLE_REQUIRED,
      'string.min': VALIDATION_MESSAGES.PRODUCT_TITLE_MIN,
      'string.max': VALIDATION_MESSAGES.PRODUCT_TITLE_MAX
    }),

  img: Joi.array()
    .items(
      Joi.object({
        src: Joi.string().uri().required().messages({
          [JOI_ERROR_KEYS.STRING_URI]: VALIDATION_MESSAGES.PRODUCT_IMAGE_URL_INVALID,
          [JOI_ERROR_KEYS.STRING_EMPTY]: VALIDATION_MESSAGES.PRODUCT_IMAGE_URL_REQUIRED
        }),
        alt: Joi.string().min(1).required().messages({
          [JOI_ERROR_KEYS.STRING_EMPTY]: VALIDATION_MESSAGES.PRODUCT_IMAGE_ALT_REQUIRED
        }),
        carousel: Joi.boolean().required().messages({
          [JOI_ERROR_KEYS.BOOLEAN_BASE]: VALIDATION_MESSAGES.PRODUCT_IMAGE_CAROUSEL_BOOLEAN
        })
      })
    )
    .min(1)
    .required()
    .messages({
      [JOI_ERROR_KEYS.ARRAY_MIN]: VALIDATION_MESSAGES.PRODUCT_IMAGES_MIN,
      [JOI_ERROR_KEYS.ARRAY_BASE]: VALIDATION_MESSAGES.PRODUCT_IMAGES_ARRAY
    }),

  price: Joi.number()
    .min(0)
    .required()
    .messages({
      [JOI_ERROR_KEYS.NUMBER_MIN]: VALIDATION_MESSAGES.PRODUCT_PRICE_NEGATIVE,
      [JOI_ERROR_KEYS.NUMBER_BASE]: VALIDATION_MESSAGES.PRODUCT_PRICE_NUMBER
    }),

  previous_price: Joi.number()
    .min(0)
    .allow(null)
    .messages({
      [JOI_ERROR_KEYS.NUMBER_MIN]: VALIDATION_MESSAGES.PRODUCT_PREVIOUS_PRICE_NEGATIVE,
      [JOI_ERROR_KEYS.NUMBER_BASE]: VALIDATION_MESSAGES.PRODUCT_PREVIOUS_PRICE_NUMBER
    }),

  description: Joi.string()
    .min(10)
    .max(500)
    .required()
    .messages({
      [JOI_ERROR_KEYS.STRING_EMPTY]: VALIDATION_MESSAGES.PRODUCT_DESCRIPTION_REQUIRED,
      'string.min': VALIDATION_MESSAGES.PRODUCT_DESCRIPTION_MIN,
      'string.max': VALIDATION_MESSAGES.PRODUCT_DESCRIPTION_MAX
    }),

  category: Joi.string()
    .pattern(/^CAT-\d{4}-0000$/)
    .required()
    .messages({
      [JOI_ERROR_KEYS.STRING_EMPTY]: VALIDATION_MESSAGES.PRODUCT_CATEGORY_REQUIRED,
      [JOI_ERROR_KEYS.STRING_PATTERN_BASE]: VALIDATION_MESSAGES.PRODUCT_CATEGORY_INVALID_FORMAT
    }),

  subcategory: Joi.string()
    .pattern(/^CAT-\d{4}-\d{4}$/)
    .required()
    .messages({
      [JOI_ERROR_KEYS.STRING_EMPTY]: VALIDATION_MESSAGES.PRODUCT_SUBCATEGORY_REQUIRED,
      [JOI_ERROR_KEYS.STRING_PATTERN_BASE]: VALIDATION_MESSAGES.PRODUCT_SUBCATEGORY_INVALID_FORMAT
    }),

  outstanding: Joi.boolean()
    .required()
    .messages({
      [JOI_ERROR_KEYS.BOOLEAN_BASE]: VALIDATION_MESSAGES.PRODUCT_OUTSTANDING_BOOLEAN
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
  category: Joi.string().pattern(/^CAT-\d{4}-0000$/),
  subcategory: Joi.string().pattern(/^CAT-\d{4}-\d{4}$/),
  outstanding: Joi.boolean()
}).min(1); // Al menos un campo debe estar presente

module.exports = {
  productSchema,
  updateProductSchema
};
