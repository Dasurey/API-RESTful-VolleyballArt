const productsModel = require('../model/products.model.js');

const getAllProducts = async () => productsModel.getAllProducts();

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
