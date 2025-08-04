const { RELATIVE_PATHS } = require('../config/paths.config.js');
const { PRODUCTS_MESSAGES } = require('../utils/messages.utils.js');
const productsService = require(RELATIVE_PATHS.FROM_CONTROLLERS.SERVICES_PRODUCTS);
const { controllerWrapper } = require('../utils/async.utils.js');
const { 
  ValidationError, 
  InternalServerError, 
  NotFoundError 
} = require('../utils/error.utils.js');

const getAllProducts = controllerWrapper(async (req, res) => {
  try {
    const result = await productsService.getAllProducts(req.queryProcessor);
    return res.json({
      success: true,
      message: PRODUCTS_MESSAGES.GET_ALL_SUCCESS,
      data: result
    });
  } catch (error) {
    throw new InternalServerError();
  }
});

const getProductById = controllerWrapper(async (req, res) => {
  const { id } = req.params;
  
  try {
    const result = await productsService.getProductById(id);
    if (!result) {
      throw new NotFoundError();
    }
    return res.json({
      success: true,
      message: PRODUCTS_MESSAGES.GET_BY_ID_SUCCESS,
      data: result
    });
  } catch (error) {
    if (error instanceof NotFoundError) {
      throw error;
    }
    throw new InternalServerError(undefined, {
      operation: 'getProductById',
      productId: req.params.id,
      originalError: error.message
    });
  }
});

const createProduct = controllerWrapper(async (req, res) => {
  try {
    const result = await productsService.createProduct(req.body);
    return res.status(201).json({
      success: true,
      message: PRODUCTS_MESSAGES.CREATE_SUCCESS,
      data: result
    });
  } catch (error) {
    if (error instanceof ValidationError) {
      throw error;
    }
    throw new InternalServerError(undefined, {
      operation: 'createProduct',
      productData: req.body,
      originalError: error.message
    });
  }
});

const updateProduct = controllerWrapper(async (req, res) => {
  const { id } = req.params;
  
  try {
    const updatedProduct = await productsService.updateProduct(id, req.body, res);
    return res.json({
      success: true,
      message: PRODUCTS_MESSAGES.UPDATE_SUCCESS,
      data: updatedProduct
    });
  } catch (error) {
    if (error instanceof ValidationError || error instanceof NotFoundError) {
      throw error;
    }
    throw new InternalServerError(undefined, {
      operation: 'updateProduct',
      productId: id,
      updateData: req.body,
      originalError: error.message
    });
  }
});

const deleteProduct = controllerWrapper(async (req, res) => {
  const { id } = req.params;
  
  try {
    await productsService.deleteProduct(id, res);
    return res.json({
      success: true,
      message: PRODUCTS_MESSAGES.DELETE_SUCCESS,
      data: { deleted: true, id }
    });
  } catch (error) {
    if (error instanceof NotFoundError) {
      throw error;
    }
    throw new InternalServerError(undefined, {
      operation: 'deleteProduct',
      productId: id,
      originalError: error.message
    });
  }
});

module.exports = {
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct
};
