import { Router } from "express";
import {
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
} from '../controllers/products.controller.js';
import { authentication } from '../middlewares/authentication.js';

const router = Router();

// Rutas públicas (sin autenticación)
router.get('/', getAllProducts);
router.get('/:id', getProductById);

// Rutas privadas (con autenticación)
router.post('/create', authentication, createProduct);
router.put('/:id', authentication, updateProduct);
router.delete('/:id', authentication, deleteProduct);

export default router;
