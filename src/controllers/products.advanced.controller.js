const { RELATIVE_PATHS } = require('../config/paths.config.js');
const { PRODUCTS_MESSAGES, ADVANCED_CONTROLLER_CONSTANTS } = require('../utils/messages.utils.js');
const productsService = require(RELATIVE_PATHS.FROM_CONTROLLERS.SERVICES_PRODUCTS);
const { 
  controllerWrapper,
  validateAndThrow
} = require(RELATIVE_PATHS.FROM_CONTROLLERS.UTILS_ASYNC);
const { 
  NotFoundError,
  ValidationError,
  ConflictError
} = require(RELATIVE_PATHS.FROM_CONTROLLERS.UTILS_ERROR);

/**
 * Ejemplo de controlador usando el nuevo sistema de manejo de errores
 */
const getProductWithAdvancedErrorHandling = controllerWrapper(async (req, res) => {
  const { id } = req.params;

  // Validación básica usando validateAndThrow
  validateAndThrow(
    !id || typeof id !== ADVANCED_CONTROLLER_CONSTANTS.TYPE_STRING,
    ValidationError,
    ADVANCED_CONTROLLER_CONSTANTS.ID_REQUIRED_AND_STRING_MESSAGE,
    { field: ADVANCED_CONTROLLER_CONSTANTS.FIELD_ID, value: id }
  );

  // Validación de formato
  validateAndThrow(
    !/^VA-\d{7}$/.test(id),
    ValidationError,
    ADVANCED_CONTROLLER_CONSTANTS.INVALID_ID_FORMAT_MESSAGE,
    { field: ADVANCED_CONTROLLER_CONSTANTS.FIELD_ID, value: id, expectedPattern: ADVANCED_CONTROLLER_CONSTANTS.PATTERN_VA_XXXXXXX }
  );

  // Buscar el producto
  const product = await productsService.getProductById(id);

  // Validar que existe
  if (!product) {
    throw new NotFoundError(
      ADVANCED_CONTROLLER_CONSTANTS.PRODUCT_NOT_FOUND_MESSAGE.replace('{id}', id),
      { productId: id, searchedAt: new Date().toISOString() },
      ADVANCED_CONTROLLER_CONSTANTS.PRODUCT_NOT_FOUND_CODE
    );
  }

  // Respuesta exitosa
  res.json({
    message: PRODUCTS_MESSAGES.GET_BY_ID_SUCCESS,
    payload: product
  });
}, ADVANCED_CONTROLLER_CONSTANTS.CONTROLLER_GET_PRODUCT_ADVANCED);

/**
 * Ejemplo de creación con validaciones complejas
 */
const createProductWithValidation = controllerWrapper(async (req, res) => {
  const productData = req.body;

  // Validaciones de negocio más complejas
  if (productData.price && productData.previous_price) {
    validateAndThrow(
      productData.price >= productData.previous_price,
      ValidationError,
      ADVANCED_CONTROLLER_CONSTANTS.PRICE_VALIDATION_MESSAGE,
      { 
        currentPrice: productData.price, 
        previousPrice: productData.previous_price 
      }
    );
  }

  // Verificar si ya existe un producto con el mismo título
  const existingProducts = await productsService.getAllProducts();
  const duplicateTitle = existingProducts.find(p => 
    p.title.toLowerCase() === productData.title.toLowerCase()
  );

  if (duplicateTitle) {
    throw new ConflictError(
      ADVANCED_CONTROLLER_CONSTANTS.DUPLICATE_TITLE_MESSAGE,
      { 
        existingProductId: duplicateTitle.id,
        duplicateTitle: productData.title 
      },
      ADVANCED_CONTROLLER_CONSTANTS.DUPLICATE_PRODUCT_TITLE_CODE
    );
  }

  // Crear el producto
  const newProduct = await productsService.createProduct(productData);

  res.status(201).json({
    message: PRODUCTS_MESSAGES.CREATE_SUCCESS,
    payload: newProduct
  });
}, ADVANCED_CONTROLLER_CONSTANTS.CONTROLLER_CREATE_PRODUCT_VALIDATION);

/**
 * Ejemplo de manejo de errores de base de datos
 */
const updateProductWithDbErrorHandling = controllerWrapper(async (req, res) => {
  const { id } = req.params;
  const updateData = req.body;

  try {
    // Intentar actualizar el producto
    const updatedProduct = await productsService.updateProduct(id, updateData);

    if (!updatedProduct) {
      throw new NotFoundError(
        ADVANCED_CONTROLLER_CONSTANTS.PRODUCT_NOT_FOUND_FOR_UPDATE_MESSAGE.replace('{id}', id),
        { productId: id },
        ADVANCED_CONTROLLER_CONSTANTS.UPDATE_PRODUCT_NOT_FOUND_CODE
      );
    }

    res.json({
      message: PRODUCTS_MESSAGES.UPDATE_SUCCESS,
      payload: updatedProduct
    });

  } catch (error) {
    // Los errores de base de datos se procesan automáticamente
    // por el middleware de error usando formatDatabaseError
    throw error;
  }
}, ADVANCED_CONTROLLER_CONSTANTS.CONTROLLER_UPDATE_PRODUCT_DB_ERROR);

module.exports = {
  getProductWithAdvancedErrorHandling,
  createProductWithValidation,
  updateProductWithDbErrorHandling
};
