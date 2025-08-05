const { RELATIVE_PATHS } = require('../config/paths.config');
const productsModel = require('../model/products.model');

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
