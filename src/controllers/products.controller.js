import productsService from '../services/products.service.js';
import { validateProductData } from '../utils/validateProductData.js';

export const getAllProducts = async (req, res) => {
  try {
    const products = await productsService.getAllProducts();
    res.json(products);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getProductById = async (req, res) => {
  try {
    const id = req.params.id;
    const product = await productsService.getProductById(id);

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

export const createProduct = async (req, res) => {
  try {
    const data = req.body;
    const error = validateProductData(data);
    if (error) {
      return res.status(400).json({ error });
    }

    const newProduct = await productsService.createProduct(data);
    res.status(201).json({
      message: `Producto creado correctamente con el ID: ${newProduct.id}`,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const updateProduct = async (req, res) => {
  try {
    const id = req.params.id;
    const product = req.body;

    const error = validateProductData(product);
    if (error) {
      return res.status(400).json({ error });
    }

    const updatedProduct = await productsService.updateProduct(id, product);
    res.json({ message: 'Producto actualizado correctamente', updatedProduct });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const deleteProduct = async (req, res) => {
  try {
    const id = req.params.id;
    await productsService.deleteProduct(id);
    res.sendStatus(204);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
