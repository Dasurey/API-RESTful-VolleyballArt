const { RELATIVE_PATHS } = require('../config/paths.config.js');
const productsModel = require(RELATIVE_PATHS.FROM_CONTROLLERS.MODELS_PRODUCTS);

const getAllProducts = async (queryProcessor = null) => productsModel.getAllProducts(queryProcessor);

const getProductById = (id) => {
  return productsModel.getProductById(id);
};

const createProduct = async (productData) => {
  return productsModel.createProduct(productData);
};

const updateProduct = async (id, product, res) => {
  return productsModel.updateProduct(id, product, res);
};

const deleteProduct = async (id, res) => {
  await productsModel.deleteProduct(id, res);
};

module.exports = {
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
};
