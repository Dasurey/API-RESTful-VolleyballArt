const categoryController = require('../controllers/category.controller');
const { handleJoiValidationErrors } = require('../middlewares/error.validation');
const { authentication } = require('../middlewares/authentication');
const { categoriesQueryProcessor, subcategoriesQueryProcessor } = require('../utils/query');
const {
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
} = require('../schemas/category.schema');

const { Router } = require('express');
const router = Router();

/**
 * @swagger
 * tags:
 *   - name: "Category and Subcategory"
 *     description: Gestión de categorías y subcategorías
 * components:
 *   securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 *   schemas:
 *     Category:
 *       type: object
 *       required:
 *         - title
 *       properties:
 *         id:
 *           type: string
 *           description: ID único de la category (formato CAT-XXXX-0000 para category padre)
 *           example: "CAT-0001-0000"
 *         title:
 *           type: string
 *           description: Título de la category
 *           example: "Zapatillas"
 *         subcategory:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/Subcategory'
 *           description: Lista de subcategory (solo para category padre)
 *         isParent:
 *           type: boolean
 *           description: Indica si es una categoría padre
 *           example: true
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: Fecha de creación de la categoría
 *           readOnly: true
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: Fecha de última actualización de la categoría
 *           readOnly: true
 *
 *     Subcategory:
 *       type: object
 *       required:
 *         - title
 *         - text
 *         - img
 *       properties:
 *         id:
 *           type: string
 *           description: ID único de la subcategory (formato CAT-XXXX-YYYY)
 *           example: "CAT-0001-0001"
 *         title:
 *           type: string
 *           description: Título de la subcategory
 *           example: "Hombre"
 *         text:
 *           type: string
 *           description: Texto descriptivo con HTML
 *           example: "<p>Información importante sobre el producto</p>"
 *         img:
 *           type: array
 *           items:
 *             type: object
 *             required:
 *               - src
 *               - alt
 *             properties:
 *               src:
 *                 type: string
 *                 description: URL de la imagen
 *                 example: "https://example.com/image.jpg"
 *               alt:
 *                 type: string
 *                 description: Texto alternativo
 *                 example: "Descripción de la imagen"
 *           description: Imágenes asociadas a la subcategory
 *           example:
 *             - src: "https://example.com/image1.jpg"
 *               alt: "Primera imagen"
 *             - src: "https://example.com/image2.jpg"
 *               alt: "Segunda imagen"
 *         parentCategoryId:
 *           type: string
 *           description: ID de la category padre
 *           example: "CAT-0001-0000"
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: Fecha de creación de la subcategoría
 *           readOnly: true
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: Fecha de última actualización de la subcategoría
 *           readOnly: true
 *
 */

/**
 * @swagger
 * /api/category/hierarchy:
 *   get:
 *     summary: Obtener jerarquía completa de category con subcategory
 *     tags: ["Category and Subcategory"]
 *     responses:
 *       200:
 *         description: Jerarquía de category obtenida exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "🌳 Jerarquía de category obtenida exitosamente"
 *                 payload:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Category'
 *       500:
 *         description: 🚨 Error interno del servidor
 */
router.get('/hierarchy', categoriesQueryProcessor, categoryController.getCategoryHierarchy);

/**
 * @swagger
 * /api/category:
 *   get:
 *     summary: Obtener todas las category padre
 *     description: |
 *       Devuelve una lista de categorías padre con sistema avanzado de consultas:
 *       - **Paginación**: `?page=1&limit=10`
 *       - **Filtros**: `?isParent=true&createdAt[gte]=2024-01-01`
 *       - **Búsqueda**: `?search=zapatillas`
 *       - **Ordenamiento**: `?sort=-createdAt,title`
 *       
 *       **Campos filtrables:** isParent, parentCategoryId, createdAt
 *       **Campos ordenables:** title, createdAt
 *     tags: ["Category and Subcategory"]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: Número de página
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 10
 *         description: Elementos por página
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Búsqueda en título
 *       - in: query
 *         name: sort
 *         schema:
 *           type: string
 *         description: Ordenamiento
 *         example: "-createdAt,title"
 *     responses:
 *       200:
 *         description: Lista de categoria obtenida exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "📋 Category obtenidas exitosamente"
 *                 payload:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Category'
 *                 pagination:
 *                   type: object
 *                 queryInfo:
 *                   type: object
 *       500:
 *         description: 🚨 Error interno del servidor
 */
router.get('/', categoriesQueryProcessor, categoryController.getAllCategory);

/**
 * @swagger
 * /api/category/subcategory:
 *   get:
 *     summary: Obtener todas las subcategorías
 *     description: |
 *       Devuelve una lista de todas las subcategorías con sistema avanzado de consultas:
 *       - **Paginación**: `?page=1&limit=10`
 *       - **Filtros**: `?parentCategoryId=CAT-0001-0000&createdAt[gte]=2024-01-01`
 *       - **Búsqueda**: `?search=rodilleras`
 *       - **Ordenamiento**: `?sort=-createdAt,title`
 *       
 *       **Campos filtrables:** parentCategoryId, createdAt
 *       **Campos ordenables:** title, createdAt
 *     tags: ["Category and Subcategory"]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: Número de página
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 10
 *         description: Elementos por página
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Búsqueda en título y texto
 *       - in: query
 *         name: sort
 *         schema:
 *           type: string
 *         description: Ordenamiento
 *         example: "-createdAt,title"
 *       - in: query
 *         name: parentCategoryId
 *         schema:
 *           type: string
 *         description: Filtrar por categoría padre
 *         example: "CAT-0001-0000"
 *     responses:
 *       200:
 *         description: Lista de todas las subcategorías obtenida exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "📂 Subcategorías obtenidas exitosamente"
 *                 payload:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Subcategory'
 *                 pagination:
 *                   type: object
 *                 queryInfo:
 *                   type: object
 *       500:
 *         description: 🚨 Error interno del servidor
 */
router.get('/subcategory', subcategoriesQueryProcessor, categoryController.getAllSubcategory);

/**
 * @swagger
 * /api/category/create:
 *   post:
 *     summary: Crear nueva category padre (opcionalmente con subcategorías)
 *     tags: ["Category and Subcategory"]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Category'
 *           examples:
 *             solo_categoria:
 *               summary: Crear solo categoría padre
 *               value:
 *                 title: "Indumentaria"
 *             categoria_con_subcategorias:
 *               summary: Crear categoría padre con subcategorías
 *               value:
 *                 title: "Indumentaria"
 *                 subcategory:
 *                   - title: "Camperas y Buzos"
 *                     text: "<p>CONSEJO: Ver tabla de talles</p>"
 *                     img:
 *                       - src: "img/additional_info/jacket.webp"
 *                         alt: "Talle de Camperas y Buzos"
 *     responses:
 *       201:
 *         description: Categoría creada exitosamente (con o sin subcategorías)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "✅ Categoría creada exitosamente"
 *                 payload:
 *                   $ref: '#/components/schemas/Category'
 *       400:
 *         description: Datos inválidos
 *       401:
 *         description: Token de acceso requerido
 *       403:
 *         description: Token inválido o expirado
 *       500:
 *         description: 🚨 Error interno del servidor
 */
router.post('/create', authentication, handleJoiValidationErrors(createCategorySchema), categoryController.createCategory);

/**
 * @swagger
 * /api/category/{id}:
 *   get:
 *     summary: Obtener category por ID con sus subcategory
 *     tags: ["Category and Subcategory"]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de la category (CAT-XXXX-0000 o CAT-XXXX-YYYY)
 *         example: "CAT-0001-0000"
 *     responses:
 *       200:
 *         description: Category obtenida exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "📂 Category obtenida exitosamente"
 *                 payload:
 *                   $ref: '#/components/schemas/Category'
 *       404:
 *         description: Category no encontrada
 *       500:
 *         description: 🚨 Error interno del servidor
 */
router.get('/:id', categoriesQueryProcessor, handleJoiValidationErrors(categoryIdSchema, 'params'), categoryController.getCategoryById);

/**
 * @swagger
 * /api/category/{id}:
 *   put:
 *     summary: Actualizar category o subcategory
 *     tags: ["Category and Subcategory"]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de la category (CAT-XXXX-0000 o CAT-XXXX-YYYY)
 *         example: "CAT-0001-0000"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             oneOf:
 *               - $ref: '#/components/schemas/Category'
 *               - $ref: '#/components/schemas/Subcategory'
 *     responses:
 *       200:
 *         description: Categoría actualizada exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "✅ Category actualizada exitosamente"
 *                 payload:
 *                   oneOf:
 *                     - $ref: '#/components/schemas/Category'
 *                     - $ref: '#/components/schemas/Subcategory'
 *       400:
 *         description: Datos inválidos
 *       401:
 *         description: Token de acceso requerido
 *       403:
 *         description: Token inválido o expirado
 *       404:
 *         description: Category no encontrada
 *       500:
 *         description: 🚨 Error interno del servidor
 */
router.put('/:id',
  authentication,
  // handleJoiValidationErrors(categoryIdSchema, 'params'),
  handleJoiValidationErrors(updateCategorySchema),
  categoryController.updateCategory
);

/**
 * @swagger
 * /api/category/{id}:
 *   delete:
 *     summary: Eliminar category o subcategory
 *     tags: ["Category and Subcategory"]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de la category (CAT-XXXX-0000 o CAT-XXXX-YYYY)
 *         example: "CAT-0001-0000"
 *       - in: query
 *         name: deleteSubcategory
 *         schema:
 *           type: boolean
 *         description: Si es true, elimina también las subcategory (solo para category padre)
 *         example: false
 *     responses:
 *       200:
 *         description: Category eliminada exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "✅ Category eliminada exitosamente"
 *                 payload:
 *                   type: object
 *                   properties:
 *                     deleted:
 *                       type: boolean
 *                       example: true
 *                     id:
 *                       type: string
 *                       example: "CAT-0001-0000"
 *       400:
 *         description: No se puede eliminar la category (tiene subcategory)
 *       401:
 *         description: Token de acceso requerido
 *       403:
 *         description: Token inválido o expirado
 *       404:
 *         description: Category no encontrada
 *       500:
 *         description: 🚨 Error interno del servidor
 */
router.delete('/:id', authentication, handleJoiValidationErrors(categoryIdSchema, 'params'), handleJoiValidationErrors(deleteQuerySchema, 'query'), categoryController.deleteCategory);

/**
 * @swagger
 * /api/category/{parentId}/subcategory:
 *   get:
 *     summary: Obtener subcategory de una category padre
 *     description: |
 *       Devuelve una lista de subcategorías de una categoría padre específica con sistema avanzado de consultas:
 *       - **Paginación**: `?page=1&limit=10`
 *       - **Filtros**: `?createdAt[gte]=2024-01-01`
 *       - **Búsqueda**: `?search=rodilleras`
 *       - **Ordenamiento**: `?sort=-createdAt,title`
 *       
 *       **Campos filtrables:** createdAt
 *       **Campos ordenables:** title, createdAt
 *     tags: ["Category and Subcategory"]
 *     parameters:
 *       - in: path
 *         name: parentId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de la category padre (CAT-XXXX-0000)
 *         example: "CAT-0001-0000"
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: Número de página
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 10
 *         description: Elementos por página
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Búsqueda en título y texto
 *       - in: query
 *         name: sort
 *         schema:
 *           type: string
 *         description: Ordenamiento
 *         example: "-createdAt,title"
 *     responses:
 *       200:
 *         description: Lista de subcategory obtenida exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "📂 Subcategory obtenidas exitosamente"
 *                 payload:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Subcategory'
 *                 pagination:
 *                   type: object
 *                 queryInfo:
 *                   type: object
 *       404:
 *         description: Category padre no encontrada
 *       500:
 *         description: 🚨 Error interno del servidor
 */
router.get('/:parentId/subcategory', subcategoriesQueryProcessor, handleJoiValidationErrors(parentCategoryIdSchema, 'params'), categoryController.getSubcategoryByParent);

/**
 * @swagger
 * /api/category/{parentId}/subcategory/create:
 *   post:
 *     summary: Crear nueva subcategory
 *     tags: ["Category and Subcategory"]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: parentId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de la category padre (CAT-XXXX-0000)
 *         example: "CAT-0001-0000"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Subcategory'
 *     responses:
 *       201:
 *         description: Subcategory creada exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "✅ Subcategory creada exitosamente"
 *                 payload:
 *                   $ref: '#/components/schemas/Subcategory'
 *       400:
 *         description: Datos inválidos
 *       401:
 *         description: Token de acceso requerido
 *       403:
 *         description: Token inválido o expirado
 *       404:
 *         description: Category padre no encontrada
 *       500:
 *         description: 🚨 Error interno del servidor
 */
router.post('/:parentId/subcategory', authentication, handleJoiValidationErrors(parentCategoryIdSchema, 'params'), handleJoiValidationErrors(createSubcategorySchema), categoryController.createSubcategory);

/**
 * @swagger
 * /api/category/{categoryId}/subcategory/{subcategoryId}:
 *   get:
 *     summary: Obtener subcategoría específica por ID
 *     tags: ["Category and Subcategory"]
 *     parameters:
 *       - in: path
 *         name: categoryId
 *         required: true
 *         schema:
 *           type: string
 *           pattern: "^CAT-\\\\d{4}-0000$"
 *         description: ID de la categoría padre (CAT-XXXX-0000)
 *         example: "CAT-0001-0000"
 *       - in: path
 *         name: subcategoryId
 *         required: true
 *         schema:
 *           type: string
 *           pattern: "^CAT-\\\\d{4}-\\d{4}$"
 *         description: ID de la subcategoría (CAT-XXXX-YYYY)
 *         example: "CAT-0001-0001"
 *     responses:
 *       200:
 *         description: Subcategoría obtenida exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "📂 Subcategoría obtenida exitosamente"
 *                 payload:
 *                   $ref: '#/components/schemas/Subcategory'
 *       404:
 *         description: Subcategoría no encontrada
 *       500:
 *         description: 🚨 Error interno del servidor
 */
router.get('/:categoryId/subcategory/:subcategoryId',
  subcategoriesQueryProcessor,
  // handleJoiValidationErrors(categorySubcategoryParamsSchema, 'params'),
  categoryController.getSubcategorySpecific
);

/**
 * @swagger
 * /api/category/{categoryId}/subcategory/{subcategoryId}:
 *   put:
 *     summary: Actualizar subcategoría específica
 *     tags: ["Category and Subcategory"]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: categoryId
 *         required: true
 *         schema:
 *           type: string
 *           pattern: "^CAT-\\\\\\\\d{4}-0000$"
 *         description: ID de la categoría padre (CAT-XXXX-0000)
 *         example: "CAT-0001-0000"
 *       - in: path
 *         name: subcategoryId
 *         required: true
 *         schema:
 *           type: string
 *           pattern: "^CAT-\\\\\\\\d{4}-\\d{4}$"
 *         description: ID de la subcategoría (CAT-XXXX-YYYY)
 *         example: "CAT-0001-0001"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *                 description: Nuevo título de la subcategoría
 *                 example: "Zapatillas de voleibol actualizadas"
 *               text:
 *                 type: string
 *                 description: Nueva descripción de la subcategoría
 *     responses:
 *       200:
 *         description: Subcategoría actualizada exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "✅ Subcategoría actualizada exitosamente"
 *                 payload:
 *                   $ref: '#/components/schemas/Subcategory'
 *       400:
 *         description: Datos inválidos
 *       401:
 *         description: Token de acceso requerido
 *       403:
 *         description: Token inválido o expirado
 *       404:
 *         description: Subcategoría no encontrada
 *       500:
 *         description: 🚨 Error interno del servidor
 */
router.put('/:categoryId/subcategory/:subcategoryId',
  authentication,
  // handleJoiValidationErrors(categorySubcategoryParamsSchema, 'params'),
  handleJoiValidationErrors(updateSubcategorySchema),
  categoryController.updateSubcategorySpecific
);

/**
 * @swagger
 * /api/category/{categoryId}/subcategory/{subcategoryId}:
 *   delete:
 *     summary: Eliminar subcategoría específica
 *     tags: ["Category and Subcategory"]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: categoryId
 *         required: true
 *         schema:
 *           type: string
 *           pattern: "^CAT-\\\\\\\\d{4}-0000$"
 *         description: ID de la categoría padre (CAT-XXXX-0000)
 *         example: "CAT-0001-0000"
 *       - in: path
 *         name: subcategoryId
 *         required: true
 *         schema:
 *           type: string
 *           pattern: "^CAT-\\\\\\\\d{4}-\\d{4}$"
 *         description: ID de la subcategoría (CAT-XXXX-YYYY)
 *         example: "CAT-0001-0001"
 *     responses:
 *       200:
 *         description: Subcategoría eliminada exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "✅ Subcategoría eliminada exitosamente"
 *       401:
 *         description: Token de acceso requerido
 *       403:
 *         description: Token inválido o expirado
 *       404:
 *         description: Subcategoría no encontrada
 *       500:
 *         description: 🚨 Error interno del servidor
 */
router.delete('/:categoryId/subcategory/:subcategoryId',
  authentication,
  // handleJoiValidationErrors(categorySubcategoryParamsSchema, 'params'),
  categoryController.deleteSubcategorySpecific
);

module.exports = router;
