import * as productsModel from '../model/products.model.js';

const getAllProducts = async () => productsModel.getAllProducts();

const getProductById = (id) => {
  return productsModel.getProductById(id);
};

const createProduct = async (req, res, product) => {
  return productsModel.createProduct(req, res, product);
};

const updateProduct = async (id, product) => {
  return productsModel.updateProduct(id, product);
};

const deleteProduct = async (id) => {
  await productsModel.deleteProduct(id);
};

export default {
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
};
