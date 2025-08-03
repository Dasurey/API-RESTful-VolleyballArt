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
const { productsQueryProcessor } = require(RELATIVE_PATHS.FROM_ROUTES.MIDDLEWARES_QUERY);
const { productSchema, updateProductSchema } = require(RELATIVE_PATHS.FROM_ROUTES.SCHEMAS_PRODUCTS);
const { idParamSchema, validateParams } = require(RELATIVE_PATHS.FROM_ROUTES.SCHEMAS_COMMON);
const { createLimiter } = require(RELATIVE_PATHS.FROM_ROUTES.CONFIG_SECURITY);
const { cacheMiddleware, cacheHeaders } = require(RELATIVE_PATHS.FROM_ROUTES.CONFIG_CACHE);
const { throttleConfigs } = require(RELATIVE_PATHS.FROM_ROUTES.CONFIG_OPTIMIZATION);

const router = Router();



/**
 * @swagger
 * /api/products:
 *   get:
 *     summary: Obtener todos los productos
 *     description: |
 *       Devuelve una lista de productos con soporte completo para:
 *       - **Paginación**: `?page=1&limit=20` o `?cursor=xyz&limit=20`
 *       - **Filtros**: `?category=CAT-0001-0000&price[gte]=100&price[lte]=500`
 *       - **Búsqueda**: `?search=zapatilla&caseSensitive=false`
 *       - **Ordenamiento**: `?sort=-price,createdAt` (- para descendente)
 *       - **Selección de campos**: `?fields=title,price,img&exclude=description`
 *       
 *       **Operadores de filtro disponibles:**
 *       - `eq` (igual) - defecto: `?category=CAT-0001-0000`
 *       - `ne` (no igual): `?category[ne]=CAT-0001-0000`
 *       - `gt`, `gte` (mayor, mayor igual): `?price[gte]=100`
 *       - `lt`, `lte` (menor, menor igual): `?price[lte]=500`
 *       - `in` (en lista): `?category[in]=CAT-0001-0000,CAT-0002-0000`
 *       - `nin` (no en lista): `?category[nin]=CAT-0001-0000`
 *       
 *       **Campos filtrables:** category, subcategory, price, outstanding, createdAt
 *       **Campos ordenables:** price, createdAt, title, outstanding
 *       **Campos de búsqueda:** title, description
 *     tags: [Products]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: Número de página (paginación offset)
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 50
 *           default: 20
 *         description: Elementos por página
 *       - in: query
 *         name: cursor
 *         schema:
 *           type: string
 *         description: Cursor para paginación cursor-based (más eficiente)
 *       - in: query
 *         name: sort
 *         schema:
 *           type: string
 *         description: Campos de ordenamiento separados por coma. Usar - para desc
 *         example: "-price,createdAt"
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Término de búsqueda en title y description
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *         description: Filtrar por categoría
 *         example: "CAT-0001-0000"
 *       - in: query
 *         name: price[gte]
 *         schema:
 *           type: number
 *         description: Precio mínimo
 *       - in: query
 *         name: price[lte]
 *         schema:
 *           type: number
 *         description: Precio máximo
 *       - in: query
 *         name: outstanding
 *         schema:
 *           type: boolean
 *         description: Filtrar productos destacados
 *       - in: query
 *         name: fields
 *         schema:
 *           type: string
 *         description: Campos específicos a incluir
 *         example: "title,price,img"
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
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     currentPage:
 *                       type: integer
 *                     totalPages:
 *                       type: integer
 *                     totalItems:
 *                       type: integer
 *                     itemsPerPage:
 *                       type: integer
 *                     hasNextPage:
 *                       type: boolean
 *                     hasPrevPage:
 *                       type: boolean
 *                 queryInfo:
 *                   type: object
 *                   properties:
 *                     appliedFilters:
 *                       type: array
 *                       items:
 *                         type: string
 *                     appliedSort:
 *                       type: array
 *                     searchTerm:
 *                       type: string
 *       400:
 *         description: Parámetros de consulta inválidos
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
router.get(API_ENDPOINTS.PRODUCTS_ROOT, 
  cacheHeaders(1800), // Cache por 30 minutos
  cacheMiddleware(1800), // Cache en memoria por 30 minutos
  throttleConfigs.read, // Throttling para lectura
  productsQueryProcessor, // Sistema avanzado de query processing
  getAllProducts
);

/**
 * @swagger
 * /api/products/create:
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
 * /api/products/{id}:
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
  productsQueryProcessor,
  validateParams(idParamSchema),
  cacheHeaders(3600), // Cache por 1 hora para productos individuales
  cacheMiddleware(3600), // Cache en memoria por 1 hora
  throttleConfigs.read, // Throttling para lectura
  getProductById
);

/**
 * @swagger
 * /api/products/{id}:
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
