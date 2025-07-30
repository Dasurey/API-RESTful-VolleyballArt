const productsModel = require('../model/products.model.js');

const getAllProducts = async (res) => productsModel.getAllProducts(res);

const getProductById = (id, res) => {
  return productsModel.getProductById(id, res);
};

const createProduct = async (req, res, product) => {
  return productsModel.createProduct(req, res, product);
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
