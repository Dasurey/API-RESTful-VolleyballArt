const productsService = require('../services/products.service');
const { controllerWrapper } = require('../middlewares/async');
const { ValidationError, InternalServerError, NotFoundError } = require('../middlewares/error');

const getAllProducts = controllerWrapper(async (req, res) => {
  try {
    const result = await productsService.getAllProducts(req.queryProcessor);
    return res.json({
      success: true,
      message: '📋 Productos obtenidos exitosamente',
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
      message: '🏐 Producto obtenido exitosamente',
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
    const result = await productsService.createProduct(req.body);
    return res.status(201).json({
      success: true,
      message: '✅ Producto creado exitosamente',
      data: result
    });
}, 'createProduct');

const updateProduct = controllerWrapper(async (req, res) => {
  const { id } = req.params;
  try {
    const updatedProduct = await productsService.updateProduct(id, req.body);
    return res.json({
      success: true,
      message: '🔄 Producto actualizado exitosamente',
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
    await productsService.deleteProduct(id);
    return res.json({
      success: true,
      message: '🗑️ Producto eliminado exitosamente',
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
