
const { db } = require('../config/db');
const { getAllDocuments, getDocumentById, createDocument, updateDocument, deleteDocument } = require('../config/firebase');
const { dbServiceWrapper } = require('../middlewares/async');

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

const getAllProducts = dbServiceWrapper(async () => {
  return await getAllDocuments(db, COLLECTION_NAME);
}, 'getAllProducts');

const getProductById = dbServiceWrapper(async (id) => {
  return await getDocumentById(db, COLLECTION_NAME, id);
}, 'getProductById');

const createProduct = dbServiceWrapper(async (id, productData) => {
  // createDocument genera un ID automático, pero aquí se respeta el ID recibido
  // Por lo tanto, usamos updateDocument para crear con ID específico
  return await updateDocument(db, COLLECTION_NAME, id, productData, { includeTimestamp: true, merge: false });
}, 'createProduct');

const updateProduct = dbServiceWrapper(async (id, data) => {
  return await updateDocument(db, COLLECTION_NAME, id, data, { includeTimestamp: true, merge: true });
}, 'updateProduct');

const deleteProduct = dbServiceWrapper(async (id) => {
  return await deleteDocument(db, COLLECTION_NAME, id);
}, 'deleteProduct');

module.exports = {
  structureProducts,
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct
};
