const { EXTERNAL_PACKAGES, API_ENDPOINTS, RELATIVE_PATHS, CACHE_CONFIG, PAGINATION_CONFIG } = require('../config/paths.config.js');
const { Router } = require(EXTERNAL_PACKAGES.EXPRESS);
const {
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
} = require(RELATIVE_PATHS.FROM_ROUTES.CONTROLLERS_PRODUCTS);
const { authentication } = require(RELATIVE_PATHS.FROM_ROUTES.MIDDLEWARES_AUTH);
const { validate } = require(RELATIVE_PATHS.FROM_ROUTES.MIDDLEWARES_VALIDATION);
const { productSchema, updateProductSchema } = require(RELATIVE_PATHS.FROM_ROUTES.SCHEMAS_PRODUCTS);
const { idParamSchema, validateParams } = require(RELATIVE_PATHS.FROM_ROUTES.SCHEMAS_COMMON);
const { createLimiter } = require(RELATIVE_PATHS.FROM_ROUTES.CONFIG_SECURITY);
const { cacheMiddleware, cacheHeaders } = require(RELATIVE_PATHS.FROM_ROUTES.CONFIG_CACHE);
const { throttleConfigs, autoPagination } = require(RELATIVE_PATHS.FROM_ROUTES.CONFIG_OPTIMIZATION);

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
router.get(API_ENDPOINTS.PRODUCTS_ROOT, 
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
router.get(API_ENDPOINTS.PRODUCTS_BY_ID, 
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
 *             $ref: '#/components/schemas/ProductInput'
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
router.post(API_ENDPOINTS.PRODUCTS_CREATE, 
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
 *             minProperties: 1
 *             properties:
 *               title:
 *                 type: string
 *                 minLength: 3
 *                 maxLength: 100
 *                 description: Título del producto
 *               img:
 *                 type: array
 *                 minItems: 1
 *                 items:
 *                   type: object
 *                   required: [src, alt, carousel]
 *                   properties:
 *                     src:
 *                       type: string
 *                       format: uri
 *                     alt:
 *                       type: string
 *                       minLength: 1
 *                     carousel:
 *                       type: boolean
 *               price:
 *                 type: number
 *                 minimum: 0
 *               previous_price:
 *                 type: number
 *                 minimum: 0
 *                 nullable: true
 *               description:
 *                 type: string
 *                 minLength: 10
 *                 maxLength: 500
 *               category:
 *                 type: string
 *                 pattern: "^CAT-\\d{4}-0000$"
 *               subcategory:
 *                 type: string
 *                 pattern: "^CAT-\\d{4}-\\d{4}$"
 *               outstanding:
 *                 type: boolean
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
router.put(API_ENDPOINTS.PRODUCTS_BY_ID, 
  validateParams(idParamSchema), 
  authentication, 
  throttleConfigs.write, // Throttling para escritura
  validate(updateProductSchema), 
  updateProduct
);

router.delete(API_ENDPOINTS.PRODUCTS_BY_ID, 
  validateParams(idParamSchema), 
  authentication, 
  throttleConfigs.write, // Throttling para escritura
  deleteProduct
);

module.exports = router;
