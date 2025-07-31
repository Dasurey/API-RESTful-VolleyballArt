const { EXTERNAL_PACKAGES, RELATIVE_PATHS, API_ENDPOINTS } = require('../config/paths.js');
const express = require(EXTERNAL_PACKAGES.EXPRESS);
const { loginUser, registerUser } = require(RELATIVE_PATHS.FROM_ROUTES.CONTROLLERS_AUTH);
const { validate } = require(RELATIVE_PATHS.FROM_ROUTES.MIDDLEWARES_VALIDATION);
const { loginSchema, registerSchema } = require(RELATIVE_PATHS.FROM_ROUTES.SCHEMAS_AUTH);

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
 *         description: Error interno del servidor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post(API_ENDPOINTS.AUTH_LOGIN, validate(loginSchema), loginUser);

/**
 * @swagger
 * /auth/register:
 *   post:
 *     summary: Registrar nuevo usuario
 *     description: Crea una nueva cuenta de usuario
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/AuthRequest'
 *     responses:
 *       201:
 *         description: Usuario registrado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 *       400:
 *         description: Datos de entrada inválidos
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       409:
 *         description: El usuario ya existe
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post(API_ENDPOINTS.AUTH_REGISTER, validate(registerSchema), registerUser);

module.exports = router;;
