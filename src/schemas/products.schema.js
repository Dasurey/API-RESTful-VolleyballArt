const { EXTERNAL_PACKAGES } = require('../config/paths.js');
const { JOI_ERROR_KEYS, JOI_VALIDATION_MESSAGES } = require('../utils/messages.utils.js');
const Joi = require(EXTERNAL_PACKAGES.JOI);

// Esquema para validar productos
const productSchema = Joi.object({
  title: Joi.string()
    .min(3)
    .max(100)
    .required()
    .messages({
      [JOI_ERROR_KEYS.STRING_EMPTY]: JOI_VALIDATION_MESSAGES.PRODUCT_TITLE_REQUIRED,
      [JOI_ERROR_KEYS.STRING_MIN]: JOI_VALIDATION_MESSAGES.PRODUCT_TITLE_MIN,
      [JOI_ERROR_KEYS.STRING_MAX]: JOI_VALIDATION_MESSAGES.PRODUCT_TITLE_MAX
    }),

  img: Joi.array()
    .items(
      Joi.object({
        src: Joi.string().uri().required().messages({
          [JOI_ERROR_KEYS.STRING_URI]: JOI_VALIDATION_MESSAGES.PRODUCT_IMAGE_URL_INVALID,
          [JOI_ERROR_KEYS.STRING_EMPTY]: JOI_VALIDATION_MESSAGES.PRODUCT_IMAGE_URL_REQUIRED
        }),
        alt: Joi.string().min(1).required().messages({
          [JOI_ERROR_KEYS.STRING_EMPTY]: JOI_VALIDATION_MESSAGES.PRODUCT_IMAGE_ALT_REQUIRED
        }),
        carousel: Joi.boolean().required().messages({
          [JOI_ERROR_KEYS.BOOLEAN_BASE]: JOI_VALIDATION_MESSAGES.PRODUCT_IMAGE_CAROUSEL_BOOLEAN
        })
      })
    )
    .min(1)
    .required()
    .messages({
      [JOI_ERROR_KEYS.ARRAY_MIN]: JOI_VALIDATION_MESSAGES.PRODUCT_IMAGES_MIN,
      [JOI_ERROR_KEYS.ARRAY_BASE]: JOI_VALIDATION_MESSAGES.PRODUCT_IMAGES_ARRAY
    }),

  price: Joi.number()
    .min(0)
    .required()
    .messages({
      [JOI_ERROR_KEYS.NUMBER_MIN]: JOI_VALIDATION_MESSAGES.PRODUCT_PRICE_NEGATIVE,
      [JOI_ERROR_KEYS.NUMBER_BASE]: JOI_VALIDATION_MESSAGES.PRODUCT_PRICE_NUMBER
    }),

  previous_price: Joi.number()
    .min(0)
    .allow(null)
    .messages({
      [JOI_ERROR_KEYS.NUMBER_MIN]: JOI_VALIDATION_MESSAGES.PRODUCT_PREVIOUS_PRICE_NEGATIVE,
      [JOI_ERROR_KEYS.NUMBER_BASE]: JOI_VALIDATION_MESSAGES.PRODUCT_PREVIOUS_PRICE_NUMBER
    }),

  description: Joi.string()
    .min(10)
    .max(500)
    .required()
    .messages({
      [JOI_ERROR_KEYS.STRING_EMPTY]: JOI_VALIDATION_MESSAGES.PRODUCT_DESCRIPTION_REQUIRED,
      [JOI_ERROR_KEYS.STRING_MIN]: JOI_VALIDATION_MESSAGES.PRODUCT_DESCRIPTION_MIN,
      [JOI_ERROR_KEYS.STRING_MAX]: JOI_VALIDATION_MESSAGES.PRODUCT_DESCRIPTION_MAX
    }),

  category: Joi.number()
    .integer()
    .min(1)
    .required()
    .messages({
      [JOI_ERROR_KEYS.NUMBER_BASE]: JOI_VALIDATION_MESSAGES.PRODUCT_CATEGORY_NUMBER,
      [JOI_ERROR_KEYS.NUMBER_INTEGER]: JOI_VALIDATION_MESSAGES.PRODUCT_CATEGORY_INTEGER,
      [JOI_ERROR_KEYS.NUMBER_MIN]: JOI_VALIDATION_MESSAGES.PRODUCT_CATEGORY_MIN
    }),

  subcategory: Joi.number()
    .integer()
    .min(1)
    .required()
    .messages({
      [JOI_ERROR_KEYS.NUMBER_BASE]: JOI_VALIDATION_MESSAGES.PRODUCT_SUBCATEGORY_NUMBER,
      [JOI_ERROR_KEYS.NUMBER_INTEGER]: JOI_VALIDATION_MESSAGES.PRODUCT_SUBCATEGORY_INTEGER,
      [JOI_ERROR_KEYS.NUMBER_MIN]: JOI_VALIDATION_MESSAGES.PRODUCT_SUBCATEGORY_MIN
    }),

  outstanding: Joi.boolean()
    .required()
    .messages({
      [JOI_ERROR_KEYS.BOOLEAN_BASE]: JOI_VALIDATION_MESSAGES.PRODUCT_OUTSTANDING_BOOLEAN
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
