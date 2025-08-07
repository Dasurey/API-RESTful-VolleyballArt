const { db } = require('../config/db');
const { InternalServerError } = require('../middlewares/error');

const { collection, doc, getDoc, getDocs, setDoc, updateDoc, deleteDoc } = require('firebase/firestore');

const COLLECTION_NAME = 'products';

/**
 * Estructurar productos con orden específico de campos
 * @param {Object|Array} productsData - Datos del producto o array de productos
 * @returns {Object|Array} - Producto(s) estructurado(s)
 */
const structureProducts = (productsData) => {
  if (Array.isArray(productsData)) {
    return productsData.map(structureProducts);
  }
  return {
    id: productsData.id,
    title: productsData.title,
    img: {
      src: productsData.img?.src,
      alt: productsData.img?.alt,
      carousel: productsData.img?.carousel
    } || [],
    price: productsData.price,
    previous_price: productsData.previous_price ?? null,
    description: productsData.description,
    category: productsData.category,
    subcategory: productsData.subcategory,
    outstanding: productsData.outstanding,
    createdAt: productsData.createdAt,
    updatedAt: productsData.updatedAt
  };
};

// Solo acceso a datos puro, sin lógica de negocio ni logs

const getAllProducts = async () => {
  try {
    const productsCollection = collection(db, COLLECTION_NAME);
    const snapshot = await getDocs(productsCollection);
    const products = [];
    snapshot.forEach((doc) => {
      products.push({ id: doc.id, ...doc.data() });
    });
    return products;
  } catch (error) {
    throw new InternalServerError(undefined, { operation: 'getAllProducts', originalError: error.message });
  }
};

const getProductById = async (id) => {
  try {
    const docRef = doc(db, COLLECTION_NAME, id);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() };
    } else {
      return null;
    }
  } catch (error) {
    throw new InternalServerError(undefined, { operation: 'getProductById', productId: id, originalError: error.message });
  }
};

const createProduct = async (id, productData) => {
  try {
    const productsCollection = collection(db, COLLECTION_NAME);
    await setDoc(doc(productsCollection, id), productData);
    return { id, ...productData };
  } catch (error) {
    throw new InternalServerError(undefined, { operation: 'createProduct', originalError: error.message, productData });
  }
};

const updateProduct = async (id, data) => {
  try {
    const docRef = doc(db, COLLECTION_NAME, id);
    await updateDoc(docRef, data);
    return { id, ...data };
  } catch (error) {
    throw new InternalServerError(undefined, { operation: 'updateProduct', productId: id, originalError: error.message });
  }
};

const deleteProduct = async (id) => {
  try {
    const docRef = doc(db, COLLECTION_NAME, id);
    await deleteDoc(docRef);
    return true;
  } catch (error) {
    throw new InternalServerError(undefined, { operation: 'deleteProduct', productId: id, originalError: error.message });
  }
};

module.exports = {
  structureProducts,
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct
};
