const { RELATIVE_PATHS } = require('../config/paths.config.js');
const { PRODUCTS_MESSAGES } = require('../utils/messages.utils.js');
const productsService = require(RELATIVE_PATHS.FROM_CONTROLLERS.SERVICES_PRODUCTS);
const { 
  getResource, 
  createResource, 
  updateResource, 
  deleteResource 
} = require(RELATIVE_PATHS.FROM_CONTROLLERS.UTILS_CONTROLLER);

const getAllProducts = async (req, res) => {
  return getResource(
    () => productsService.getAllProducts(req.queryProcessor),
    req,
    res,
    PRODUCTS_MESSAGES.RESOURCE_PLURAL,
    {
      successMessage: PRODUCTS_MESSAGES.GET_ALL_SUCCESS,
      errorMessage: PRODUCTS_MESSAGES.GET_ALL_ERROR
    }
  );
};

const getProductById = async (req, res) => {
  const { id } = req.params;
  
  return getResource(
    () => productsService.getProductById(id),
    req,
    res,
    PRODUCTS_MESSAGES.RESOURCE_SINGLE,
    {
      successMessage: PRODUCTS_MESSAGES.GET_BY_ID_SUCCESS,
      notFoundMessage: PRODUCTS_MESSAGES.NOT_FOUND(id),
      errorMessage: PRODUCTS_MESSAGES.GET_BY_ID_ERROR
    }
  );
};

const createProduct = async (req, res) => {
  // Los datos ya están validados por Joi middleware
  return createResource(
    () => productsService.createProduct(req.body),
    req,
    res,
    PRODUCTS_MESSAGES.RESOURCE_SINGLE,
    {
      successMessage: PRODUCTS_MESSAGES.CREATE_SUCCESS,
      errorMessage: PRODUCTS_MESSAGES.CREATE_ERROR
    }
  );
};

const updateProduct = async (req, res) => {
  const { id } = req.params;
  // Los datos ya están validados por Joi middleware
  
  return updateResource(
    async () => {
      const updatedProduct = await productsService.updateProduct(id, req.body, res);
      return { message: PRODUCTS_MESSAGES.UPDATE_SUCCESS, updatedProduct };
    },
    req,
    res,
    PRODUCTS_MESSAGES.RESOURCE_SINGLE,
    {
      successMessage: PRODUCTS_MESSAGES.UPDATE_SUCCESS,
      errorMessage: PRODUCTS_MESSAGES.UPDATE_ERROR
    }
  );
};

const deleteProduct = async (req, res) => {
  const { id } = req.params;
  
  return deleteResource(
    async () => {
      await productsService.deleteProduct(id, res);
      return { deleted: true, id };
    },
    req,
    res,
    PRODUCTS_MESSAGES.RESOURCE_SINGLE,
    {
      successMessage: PRODUCTS_MESSAGES.DELETE_SUCCESS,
      errorMessage: PRODUCTS_MESSAGES.DELETE_ERROR
    }
  );
};

module.exports = {
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct
};
