const { loginUser /*, registerUser*/ } = require('../controllers/auth.controller');
const { validate } = require('../middlewares/validation.middleware');
const { loginSchema /*, registerSchema*/ } = require('../schemas/auth.schema');

const express = require('express');
const router = express.Router();

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Iniciar sesión
 *     description: Autentica un usuario y devuelve un token JWT
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/AuthRequest'
 *           examples:
 *             admin:
 *               summary: Usuario administrador
 *               value:
 *                 email: admin@volleyballart.com
 *                 password: admin123
 *     responses:
 *       200:
 *         description: Login exitoso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AuthResponse'
 *       400:
 *         description: Datos de entrada inválidos
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Credenciales incorrectas
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: 🚨 Error interno del servidor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post('/login', validate(loginSchema), loginUser);

/**
 * REGISTRO TEMPORALMENTE DESHABILITADO
 * TODO: Implementar sistema de roles y restricciones de registro
 */
/*
// @swagger
// /auth/register:
//   post:
//     summary: Registrar nuevo usuario
//     description: Crea una nueva cuenta de usuario
//     tags: [Auth]
//     requestBody:
//       required: true
//       content:
//         application/json:
//           schema:
//             $ref: '#/components/schemas/AuthRequest'
//     responses:
//       201:
//         description: Usuario registrado exitosamente
//         content:
//           application/json:
//             schema:
//               $ref: '#/components/schemas/SuccessResponse'
//       400:
//         description: Datos de entrada inválidos
//         content:
//           application/json:
//             schema:
//               $ref: '#/components/schemas/Error'
//       409:
//         description: El usuario ya existe
//         content:
//           application/json:
//             schema:
//               $ref: '#/components/schemas/Error'

router.post('/register', validate(registerSchema), registerUser);
*/

module.exports = router;;
