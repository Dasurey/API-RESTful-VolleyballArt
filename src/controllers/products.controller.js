const productsService = require('../services/products.service.js');
const Logger = require('../config/logger.js');

const getAllProducts = async (req, res) => {
  try {
    const products = await productsService.getAllProducts(res);
    
    Logger.info('📋 Listado de productos obtenido', {
      totalProducts: products.length,
      timestamp: new Date().toISOString()
    });
    
    res.status(200).json({ message: "Listado de productos", payload: products });
  } catch (error) {
    Logger.error('🚨 Error al obtener productos', {
      error: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString()
    });
    
    res.status(500).json({ 
      message: "Error interno del servidor", 
      error: error.message 
    });
  }
};

const getProductById = async (req, res) => {
  try {
    const id = req.params.id;
    const product = await productsService.getProductById(id, res);

    if (product) {
      return res.json(product);
    } else {
      res.status(404).json({
        message: `No se ha encontrado ningun producto con el siguiente ID: ${id}`,
      });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const createProduct = async (req, res) => {
  // Los datos ya están validados por Joi middleware
  const data = req.body;
  return productsService.createProduct(req, res, data);
};

const updateProduct = async (req, res) => {
  try {
    const id = req.params.id;
    // Los datos ya están validados por Joi middleware
    const product = req.body;

    const updatedProduct = await productsService.updateProduct(id, product, res);
    res.json({ message: 'Producto actualizado correctamente', updatedProduct });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const deleteProduct = async (req, res) => {
  try {
    const id = req.params.id;
    await productsService.deleteProduct(id, res);
    res.sendStatus(204);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct
};
