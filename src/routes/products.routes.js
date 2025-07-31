const { Router } = require('express');
const {
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
} = require('../controllers/products.controller.js');
const { authentication } = require('../middlewares/authentication.js');
const { validate } = require('../middlewares/validation.middleware.js');
const { productSchema, updateProductSchema } = require('../schemas/products.schema.js');
const { idParamSchema, validateParams } = require('../schemas/common.schema.js');
const { createLimiter } = require('../config/security.js');
const { cacheMiddleware, cacheHeaders } = require('../config/cache.js');
const { throttleConfigs, autoPagination } = require('../config/optimization.js');

const router = Router();

/**
 * @swagger
 * /api/v1/products:
 *   get:
 *     summary: Obtener todos los productos
 *     description: Devuelve una lista de todos los productos disponibles
 *     tags: [Products]
 *     responses:
 *       200:
 *         description: Lista de productos obtenida exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Lista de productos
 *                 payload:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Product'
 *       500:
 *         description: Error interno del servidor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/', 
  cacheHeaders(1800), // Cache por 30 minutos
  cacheMiddleware(1800), // Cache en memoria por 30 minutos
  throttleConfigs.read, // Throttling para lectura
  autoPagination(10, 50), // Paginación automática
  getAllProducts
);

/**
 * @swagger
 * /api/v1/products/{id}:
 *   get:
 *     summary: Obtener producto por ID
 *     description: Devuelve un producto específico por su identificador
 *     tags: [Products]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           pattern: '^VA-\d{5}$'
 *         description: ID del producto (formato VA-XXXXX)
 *         example: VA-00001
 *     responses:
 *       200:
 *         description: Producto encontrado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Producto encontrado
 *                 payload:
 *                   $ref: '#/components/schemas/Product'
 *       400:
 *         description: ID con formato inválido
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Producto no encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/:id', 
  validateParams(idParamSchema),
  cacheHeaders(3600), // Cache por 1 hora para productos individuales
  cacheMiddleware(3600), // Cache en memoria por 1 hora
  throttleConfigs.read, // Throttling para lectura
  getProductById
);

/**
 * @swagger
 * /api/v1/products/create:
 *   post:
 *     summary: Crear nuevo producto
 *     description: Crea un nuevo producto (requiere autenticación)
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, description, price, category, stock]
 *             properties:
 *               name:
 *                 type: string
 *                 example: Pelota de Volleyball Profesional
 *               description:
 *                 type: string
 *                 example: Pelota oficial para competencias
 *               price:
 *                 type: number
 *                 minimum: 0
 *                 example: 150.00
 *               category:
 *                 type: string
 *                 example: Pelotas
 *               stock:
 *                 type: integer
 *                 minimum: 0
 *                 example: 50
 *               images:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: uri
 *                 example: ["https://example.com/image1.jpg"]
 *     responses:
 *       201:
 *         description: Producto creado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Producto creado exitosamente
 *                 payload:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       example: VA-00001
 *       400:
 *         description: Datos de entrada inválidos
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Token de autorización requerido
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       429:
 *         description: Demasiadas solicitudes (rate limit)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post('/create', 
  createLimiter, 
  authentication, 
  throttleConfigs.write, // Throttling para escritura
  validate(productSchema), 
  createProduct
);

/**
 * @swagger
 * /api/v1/products/{id}:
 *   put:
 *     summary: Actualizar producto
 *     description: Actualiza un producto existente (requiere autenticación)
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           pattern: '^VA-\d{5}$'
 *         description: ID del producto (formato VA-XXXXX)
 *         example: VA-00001
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               price:
 *                 type: number
 *                 minimum: 0
 *               category:
 *                 type: string
 *               stock:
 *                 type: integer
 *                 minimum: 0
 *               images:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: uri
 *     responses:
 *       200:
 *         description: Producto actualizado exitosamente
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
 *       401:
 *         description: Token de autorización requerido
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Producto no encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *   delete:
 *     summary: Eliminar producto
 *     description: Elimina un producto existente (requiere autenticación)
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           pattern: '^VA-\d{5}$'
 *         description: ID del producto (formato VA-XXXXX)
 *         example: VA-00001
 *     responses:
 *       200:
 *         description: Producto eliminado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 *       400:
 *         description: ID con formato inválido
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Token de autorización requerido
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Producto no encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.put('/:id', 
  validateParams(idParamSchema), 
  authentication, 
  throttleConfigs.write, // Throttling para escritura
  validate(updateProductSchema), 
  updateProduct
);

router.delete('/:id', 
  validateParams(idParamSchema), 
  authentication, 
  throttleConfigs.write, // Throttling para escritura
  deleteProduct
);

module.exports = router;;
