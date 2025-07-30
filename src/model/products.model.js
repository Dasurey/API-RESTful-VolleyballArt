import { db } from '../config/dataBase.js';
import Logger from '../config/logger.js';
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  updateDoc,
  setDoc,
} from 'firebase/firestore';

const productsCollection = collection(db, 'products');

// Función simple para generar el próximo ID
const generateNextId = async (req, res) => {
  try {
    // Obtener todos los productos sin ordenamiento (no requiere índice)
    const snapshot = await getDocs(productsCollection);
    
    if (snapshot.empty) {
      // Si no hay productos, empezar con VA-0000001
      return 'VA-0000001';
    }
    
    // Obtener todos los IDs y encontrar el número más alto
    let maxNumber = 0;
    snapshot.forEach((doc) => {
      const id = doc.id;
      if (id.startsWith('VA-')) {
        const number = parseInt(id.split('-')[1]);
        if (number > maxNumber) {
          maxNumber = number;
        }
      }
    });
    
    // Generar el siguiente número
    const nextNumber = maxNumber + 1;
    
    // Formatear con padding de ceros (7 dígitos)
    return `VA-${nextNumber.toString().padStart(7, '0')}`;
  } catch (error) {
    Logger.error('🚨 Error generando ID de producto', {
      error: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString()
    });
    return res.status(500).json({
      message: 'No se pudo generar el ID del producto',
      error: error.message
    });
  }
};

export const getAllProducts = async () => {
  const querySnapshot = await getDocs(productsCollection);
  const products = [];
  querySnapshot.forEach((doc) => products.push({ id: doc.id, ...doc.data() }));
  return products;
};

export const getProductById = async (id) => {
  const productDoc = await getDoc(doc(productsCollection, id));
  if (productDoc.exists()) {
    return { id: productDoc.id, ...productDoc.data() };
  } else {
    return null;
  }
};

export const createProduct = async (req, res, product) => {
  try {
    // Generar ID secuencial
    const newId = await generateNextId(req, res);
    
    // Si generateNextId devolvió una respuesta de error, ya se envió
    if (!newId || typeof newId !== 'string') {
      return; // La respuesta ya fue enviada por generateNextId
    }
    
    // Crear producto con ID personalizado
    await setDoc(doc(productsCollection, newId), product);
    
    Logger.info('✅ Producto creado exitosamente', {
      productId: newId,
      title: product.title,
      category: product.category,
      price: product.price,
      timestamp: new Date().toISOString()
    });
    
    return res.status(201).json({
      message: 'Producto creado exitosamente',
      payload: { id: newId, ...product }
    });
  } catch (error) {
    Logger.error('🚨 Error creando producto en la base de datos', {
      error: error.message,
      stack: error.stack,
      productData: product,
      timestamp: new Date().toISOString()
    });
    return res.status(500).json({
      message: 'Error al crear el producto en la base de datos',
      error: error.message
    });
  }
};

export const updateProduct = async (id, data) => {
  await updateDoc(doc(productsCollection, id), data);
  return getProductById(id);
};

export const deleteProduct = async (id) => {
  await deleteDoc(doc(productsCollection, id));
};
