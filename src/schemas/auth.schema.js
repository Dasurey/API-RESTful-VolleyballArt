const Joi = require('joi');

// Esquema para login
const loginSchema = Joi.object({
  email: Joi.string()
    .email()
    .required()
    .messages({
      'string.email': 'Debe ser un email válido',
      'string.empty': 'El email es obligatorio',
      'any.required': 'El email es obligatorio'
    }),

  password: Joi.string()
    .min(6)
    .required()
    .messages({
      'string.min': 'La contraseña debe tener al menos 6 caracteres',
      'string.empty': 'La contraseña es obligatoria',
      'any.required': 'La contraseña es obligatoria'
    })
});

// Esquema para registro - TEMPORALMENTE DESHABILITADO
/*
const registerSchema = Joi.object({
  email: Joi.string()
    .email()
    .required()
    .messages({
      'string.email': 'Debe ser un email válido',
      'string.empty': 'El email es obligatorio',
      'any.required': 'El email es obligatorio'
    }),

  password: Joi.string()
    .min(6)
    .max(50)
    .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .required()
    .messages({
      'string.min': 'La contraseña debe tener al menos 6 caracteres',
      'string.max': 'La contraseña no puede tener más de 50 caracteres',
      'string.pattern.base': 'La contraseña debe tener al menos: 1 minúscula, 1 mayúscula y 1 número',
      'string.empty': 'La contraseña es obligatoria',
      'any.required': 'La contraseña es obligatoria'
    }),

  confirmPassword: Joi.string()
    .valid(Joi.ref('password'))
    .required()
    .messages({
      'any.only': 'Las contraseñas no coinciden',
      'string.empty': 'Confirma tu contraseña',
      'any.required': 'Confirma tu contraseña'
    })
});
*/

module.exports = {
  loginSchema
  // registerSchema // Temporalmente deshabilitado
};
