const productsService = require('../services/products.service');
const { controllerWrapper } = require('../middlewares/async');
const { ValidationError, InternalServerError, NotFoundError } = require('../middlewares/error');
const { createSuccessWithLog } = require('../utils/success');

const getAllProducts = controllerWrapper(async (req, res) => {
  try {
    const result = await productsService.getAllProducts(req.queryProcessor);
    return createSuccessWithLog(
      res,
      200,
      '📋 Productos obtenidos exitosamente',
      result,
      { endpoint: 'getAllProducts' }
    ).send(res);
  } catch (error) {
    throw new InternalServerError();
  }
}, 'getAllProducts');

const getProductById = controllerWrapper(async (req, res) => {
  const { id } = req.params;
  try {
    const result = await productsService.getProductById(id);
    if (!result) {
      throw new NotFoundError();
    }
    return createSuccessWithLog(
      res,
      200,
      '🏐 Producto obtenido exitosamente',
      result,
      { endpoint: 'getProductById', productId: id }
    ).send(res);
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
}, 'getProductById');

const createProduct = controllerWrapper(async (req, res) => {
    const result = await productsService.createProduct(req.body);
    return createSuccessWithLog(
      res,
      201,
      '✅ Producto creado exitosamente',
      result,
      { endpoint: 'createProduct' }
    ).send(res);
}, 'createProduct');

const updateProduct = controllerWrapper(async (req, res) => {
  const { id } = req.params;
  try {
    const updatedProduct = await productsService.updateProduct(id, req.body);
    return createSuccessWithLog(
      res,
      200,
      '🔄 Producto actualizado exitosamente',
      updatedProduct,
      { endpoint: 'updateProduct', productId: id }
    ).send(res);
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
}, 'updateProduct');

const deleteProduct = controllerWrapper(async (req, res) => {
  const { id } = req.params;
  try {
    await productsService.deleteProduct(id);
    return createSuccessWithLog(
      res,
      200,
      '🗑️ Producto eliminado exitosamente',
      { deleted: true, id },
      { endpoint: 'deleteProduct', productId: id }
    ).send(res);
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
}, 'deleteProduct');

module.exports = {
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct
};
