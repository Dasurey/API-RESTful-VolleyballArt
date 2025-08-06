const { EXTERNAL_PACKAGES } = require('../config/paths.config.js');
const { JOI_ERROR_KEYS, VALIDATION_MESSAGES, SERVICE_MESSAGES } = require('../utils/messages.utils.js');
const Joi = require(EXTERNAL_PACKAGES.JOI);

// Esquema para login
const loginSchema = Joi.object({
  email: Joi.string()
    .email()
    .required()
    .messages({
      [JOI_ERROR_KEYS.STRING_EMAIL]: VALIDATION_MESSAGES.EMAIL_INVALID,
      'string.empty': VALIDATION_MESSAGES.EMAIL_REQUIRED,
      'any.required': VALIDATION_MESSAGES.EMAIL_REQUIRED
    }),

  password: Joi.string()
    .min(6)
    .required()
    .messages({
      'string.min': VALIDATION_MESSAGES.PASSWORD_MIN_6_CHARS,
      'string.empty': VALIDATION_MESSAGES.PASSWORD_REQUIRED,
      'any.required': VALIDATION_MESSAGES.PASSWORD_REQUIRED
    })
});

// Esquema para registro - TEMPORALMENTE DESHABILITADO
/*
const registerSchema = Joi.object({
  email: Joi.string()
    .email()
    .required()
    .messages({
      [JOI_ERROR_KEYS.STRING_EMAIL]: VALIDATION_MESSAGES.EMAIL_INVALID,
      'string.empty': VALIDATION_MESSAGES.EMAIL_REQUIRED,
      'any.required': VALIDATION_MESSAGES.EMAIL_REQUIRED
    }),

  password: Joi.string()
    .min(6)
    .max(50)
    .pattern(SERVICE_MESSAGES.PASSWORD_PATTERN)
    .required()
    .messages({
      'string.min': VALIDATION_MESSAGES.PASSWORD_MIN_6_CHARS,
      'string.max': VALIDATION_MESSAGES.PASSWORD_MAX_50_CHARS,
      'string.pattern.base': VALIDATION_MESSAGES.PASSWORD_PATTERN_INVALID,
      'string.empty': VALIDATION_MESSAGES.PASSWORD_REQUIRED,
      'any.required': VALIDATION_MESSAGES.PASSWORD_REQUIRED
    }),

  confirmPassword: Joi.string()
    .valid(Joi.ref(SERVICE_MESSAGES.PASSWORD_FIELD))
    .required()
    .messages({
      [JOI_ERROR_KEYS.ANY_ONLY]: VALIDATION_MESSAGES.PASSWORDS_DO_NOT_MATCH,
      'string.empty': VALIDATION_MESSAGES.PASSWORD_CONFIRMATION_REQUIRED,
      'any.required': VALIDATION_MESSAGES.PASSWORD_CONFIRMATION_REQUIRED
    })
});
*/

module.exports = {
  loginSchema
  // registerSchema // Temporalmente deshabilitado
};
