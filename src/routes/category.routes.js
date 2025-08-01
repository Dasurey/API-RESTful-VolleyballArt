const { EXTERNAL_PACKAGES, API_ENDPOINTS, RELATIVE_PATHS, VALIDATION_TYPES } = require('../config/paths.config.js');
const { Router } = require(EXTERNAL_PACKAGES.EXPRESS);
const categoryController = require(RELATIVE_PATHS.FROM_ROUTES.CONTROLLERS_CATEGORY);
const { validate } = require(RELATIVE_PATHS.FROM_ROUTES.MIDDLEWARES_VALIDATION);
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
} = require(RELATIVE_PATHS.FROM_ROUTES.SCHEMAS_CATEGORY);

const router = Router();

/**
 * @swagger
 * components:
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
 *
 *     Subcategory:
 *       type: object
 *       required:
 *         - title
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
 *             properties:
 *               src:
 *                 type: string
 *                 description: URL de la imagen
 *               alt:
 *                 type: string
 *                 description: Texto alternativo
 *           description: Imágenes asociadas a la subcategory
 *         parentCategoryId:
 *           type: string
 *           description: ID de la category padre
 *           example: "CAT-0001-0000"
 *
 *     CategoryInput:
 *       type: object
 *       required:
 *         - title
 *       properties:
 *         title:
 *           type: string
 *           description: Título de la category
 *           example: "Zapatillas"
 *
 *     SubcategoryInput:
 *       type: object
 *       required:
 *         - title
 *       properties:
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
 *             properties:
 *               src:
 *                 type: string
 *                 description: URL de la imagen
 *               alt:
 *                 type: string
 *                 description: Texto alternativo
 *           description: Imágenes asociadas a la subcategory
 */

/**
 * @swagger
 * /api/v1/category:
 *   get:
 *     summary: Obtener todas las category padre
 *     tags: [Category]
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
 *       500:
 *         description: Error interno del servidor
 */
router.get(API_ENDPOINTS.CATEGORY_ROOT, categoryController.getAllCategory);

/**
 * @swagger
 * /api/v1/category/hierarchy:
 *   get:
 *     summary: Obtener jerarquía completa de category con subcategory
 *     tags: [Category]
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
 *         description: Error interno del servidor
 */
router.get(API_ENDPOINTS.CATEGORY_HIERARCHY, categoryController.getCategoryHierarchy);

/**
 * @swagger
 * /api/v1/category/{id}:
 *   get:
 *     summary: Obtener category por ID con sus subcategory
 *     tags: [Category]
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
 *         description: Error interno del servidor
 */
router.get(API_ENDPOINTS.CATEGORY_BY_ID, validate(categoryIdSchema, VALIDATION_TYPES.PARAMS), categoryController.getCategoryById);

/**
 * @swagger
 * /api/v1/category/{parentId}/subcategory:
 *   get:
 *     summary: Obtener subcategory de una category padre
 *     tags: [Category]
 *     parameters:
 *       - in: path
 *         name: parentId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de la category padre (CAT-XXXX-0000)
 *         example: "CAT-0001-0000"
 *     responses:
 *       200:
 *         description: Subcategory obtenidas exitosamente
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
 *       404:
 *         description: Category padre no encontrada
 *       500:
 *         description: Error interno del servidor
 */
/**
 * @swagger
 * /api/v1/category/{id}/subcategory/create:
 *   post:
 *     summary: Crear nueva subcategoría
 *     tags: [Category]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           pattern: "^CAT-\\\\d{4}-0000$"
 *         description: ID de la categoría padre (CAT-XXXX-0000)
 *         example: "CAT-0001-0000"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *             properties:
 *               title:
 *                 type: string
 *                 description: Título de la subcategoría
 *                 example: "Zapatillas de voleibol"
 *               text:
 *                 type: string
 *                 description: Descripción de la subcategoría
 *                 example: "Zapatillas especializadas para voleibol"
 *               img:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     src:
 *                       type: string
 *                       description: URL de la imagen
 *                     alt:
 *                       type: string
 *                       description: Texto alternativo
 *     responses:
 *       201:
 *         description: Subcategoría creada exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "✅ Subcategoría creada exitosamente"
 *                 payload:
 *                   $ref: '#/components/schemas/Subcategory'
 *       400:
 *         description: Datos inválidos
 *       404:
 *         description: Categoría padre no encontrada
 *       500:
 *         description: Error interno del servidor
 */
router.post(API_ENDPOINTS.CATEGORY_SUBCATEGORY_CREATE,
  validate(categoryParentIdSchema, VALIDATION_TYPES.PARAMS),
  validate(createSubcategorySimpleSchema),
  categoryController.createSubcategorySimple
);

/**
 * @swagger
 * /api/v1/category/{parentId}/subcategory:
 *   get:
 *     summary: Obtener subcategory de una category padre
 *     tags: [Category]
 *     parameters:
 *       - in: path
 *         name: parentId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de la category padre (CAT-XXXX-0000)
 *         example: "CAT-0001-0000"
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
 *       404:
 *         description: Category padre no encontrada
 *       500:
 *         description: Error interno del servidor
 */
router.get(API_ENDPOINTS.CATEGORY_SUBCATEGORY, validate(parentCategoryIdSchema, VALIDATION_TYPES.PARAMS), categoryController.getSubcategoryByParent);

/**
 * @swagger
 * /api/v1/category:
 *   post:
 *     summary: Crear nueva category padre
 *     tags: [Category]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CategoryInput'
 *     responses:
 *       201:
 *         description: Category creada exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "✅ Category creada exitosamente"
 *                 payload:
 *                   $ref: '#/components/schemas/Category'
 *       400:
 *         description: Datos inválidos
 *       500:
 *         description: Error interno del servidor
 */
router.post(API_ENDPOINTS.CATEGORY_ROOT, validate(createCategorySchema), categoryController.createCategory);

/**
 * @swagger
 * /api/v1/category/create:
 *   post:
 *     summary: Crear nueva categoría padre
 *     tags: [Category]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CategoryInput'
 *     responses:
 *       201:
 *         description: Categoría creada exitosamente
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
 *       500:
 *         description: Error interno del servidor
 */
router.post(API_ENDPOINTS.CATEGORY_CREATE, validate(createCategorySchema), categoryController.createCategory);

router.put(API_ENDPOINTS.CATEGORY_UPDATE,
  // validate(categoryParentIdSchema, VALIDATION_TYPES.PARAMS),
  validate(updateCategorySchema),
  categoryController.updateCategorySpecific
);

/**
 * @swagger
 * /api/v1/category/{categoryId}/subcategory/{subcategoryId}:
 *   put:
 *     summary: Actualizar subcategoría específica
 *     tags: [Category]
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
 *       404:
 *         description: Subcategoría no encontrada
 *       500:
 *         description: Error interno del servidor
 */
router.put(API_ENDPOINTS.CATEGORY_SUBCATEGORY_BY_IDS,
  // validate(categorySubcategoryParamsSchema, VALIDATION_TYPES.PARAMS),
  validate(updateSubcategorySchema),
  categoryController.updateSubcategorySpecific
);

router.delete(API_ENDPOINTS.CATEGORY_DELETE,
  // validate(categoryParentIdSchema, VALIDATION_TYPES.PARAMS),
  validate(deleteQuerySchema, VALIDATION_TYPES.QUERY),
  categoryController.deleteCategorySpecific
);

/**
 * @swagger
 * /api/v1/category/{categoryId}/subcategory/{subcategoryId}:
 *   delete:
 *     summary: Eliminar subcategoría específica
 *     tags: [Category]
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
 *       404:
 *         description: Subcategoría no encontrada
 *       500:
 *         description: Error interno del servidor
 */
router.delete(API_ENDPOINTS.CATEGORY_SUBCATEGORY_BY_IDS,
  // validate(categorySubcategoryParamsSchema, VALIDATION_TYPES.PARAMS),
  categoryController.deleteSubcategorySpecific
);

/**
 * @swagger
 * /api/v1/category/{id}/subcategory/create:
 *   post:
 *     summary: Crear nueva subcategoría
 *     tags: [Category]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           pattern: "^CAT-\\\\\\\\d{4}-0000$"
 *         description: ID de la categoría padre (CAT-XXXX-0000)
 *         example: "CAT-0001-0000"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *             properties:
 *               title:
 *                 type: string
 *                 description: Título de la subcategoría
 *                 example: "Zapatillas de voleibol"
 *               text:
 *                 type: string
 *                 description: Descripción de la subcategoría
 *                 example: "Zapatillas especializadas para voleibol"
 *               img:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     src:
 *                       type: string
 *                       description: URL de la imagen
 *                     alt:
 *                       type: string
 *                       description: Texto alternativo
 *     responses:
 *       201:
 *         description: Subcategoría creada exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "✅ Subcategoría creada exitosamente"
 *                 payload:
 *                   $ref: '#/components/schemas/Subcategory'
 *       400:
 *         description: Datos inválidos
 *       404:
 *         description: Categoría padre no encontrada
 *       500:
 *         description: Error interno del servidor
 */
/**
 * @swagger
 * /api/v1/category/{parentId}/subcategory:
 *   post:
 *     summary: Crear nueva subcategory
 *     tags: [Category]
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
 *             $ref: '#/components/schemas/SubcategoryInput'
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
 *       404:
 *         description: Category padre no encontrada
 *       500:
 *         description: Error interno del servidor
 */
router.post(API_ENDPOINTS.CATEGORY_SUBCATEGORY,
  validate(parentCategoryIdSchema, VALIDATION_TYPES.PARAMS),
  validate(createSubcategorySchema),
  categoryController.createSubcategory
);

/**
 * @swagger
 * /api/v1/category/{id}:
 *   put:
 *     summary: Actualizar category o subcategory
 *     tags: [Category]
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
 *               - $ref: '#/components/schemas/CategoryInput'
 *               - $ref: '#/components/schemas/SubcategoryInput'
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
 *       404:
 *         description: Category no encontrada
 *       500:
 *         description: Error interno del servidor
 */
router.put(API_ENDPOINTS.CATEGORY_BY_ID,
  // validate(categoryIdSchema, VALIDATION_TYPES.PARAMS),
  validate(updateCategorySchema),
  categoryController.updateCategory
);

/**
 * @swagger
 * /api/v1/category/{id}:
 *   delete:
 *     summary: Eliminar category o subcategory
 *     tags: [Category]
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
 *       404:
 *         description: Category no encontrada
 *       500:
 *         description: Error interno del servidor
 */
router.delete(API_ENDPOINTS.CATEGORY_BY_ID,
  validate(categoryIdSchema, VALIDATION_TYPES.PARAMS),
  validate(deleteQuerySchema, VALIDATION_TYPES.QUERY),
  categoryController.deleteCategory
);

module.exports = router;
