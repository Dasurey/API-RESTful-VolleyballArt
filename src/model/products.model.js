const { db } = require('../config/dataBase.js');
const Logger = require('../config/logger.js');
const { productsCacheManager } = require('../config/cache.js');
const {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  updateDoc,
  setDoc,
} = require('firebase/firestore');

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

const getAllProducts = async (res) => {
  try {
    // Intentar obtener del cache primero
    const cacheKey = 'all_products';
    const cachedProducts = productsCacheManager.get(cacheKey);
    
    if (cachedProducts) {
      Logger.info('📦 Productos obtenidos desde cache');
      return cachedProducts;
    }

    // Si no está en cache, obtener de Firebase
    const querySnapshot = await getDocs(productsCollection);
    const products = [];
    querySnapshot.forEach((doc) => products.push({ id: doc.id, ...doc.data() }));
    
    // Guardar en cache por 30 minutos
    productsCacheManager.set(cacheKey, products, 1800);
    
    Logger.info('📦 Productos obtenidos desde Firebase y cacheados', {
      count: products.length
    });
    
    return products;
  } catch (error) {
    Logger.error('🚨 Error obteniendo productos', {
      error: error.message,
      stack: error.stack
    });
    return res.status(500).json({
      message: 'Error al obtener los productos',
      error: error.message
    });
  }
};

const getProductById = async (id, res) => {
  try {
    // Intentar obtener del cache primero
    const cacheKey = `product_${id}`;
    const cachedProduct = productsCacheManager.get(cacheKey);
    
    if (cachedProduct) {
      Logger.info('📦 Producto obtenido desde cache', { productId: id });
      return cachedProduct;
    }

    // Si no está en cache, obtener de Firebase
    const productDoc = await getDoc(doc(productsCollection, id));
    
    if (productDoc.exists()) {
      const product = { id: productDoc.id, ...productDoc.data() };
      
      // Guardar en cache por 30 minutos
      productsCacheManager.set(cacheKey, product, 1800);
      
      Logger.info('📦 Producto obtenido desde Firebase y cacheado', { productId: id });
      return product;
    } else {
      // Cachear también productos no encontrados (por 5 minutos)
      productsCacheManager.set(cacheKey, null, 300);
      return null;
    }
  } catch (error) {
    Logger.error('🚨 Error obteniendo producto por ID', {
      error: error.message,
      productId: id,
      stack: error.stack
    });
    return res.status(500).json({
      message: 'Error al obtener el producto',
      error: error.message
    });
  }
};

const createProduct = async (req, res, product) => {
  try {
    // Generar ID secuencial
    const newId = await generateNextId(req, res);
    
    // Si generateNextId devolvió una respuesta de error, ya se envió
    if (!newId || typeof newId !== 'string') {
      return; // La respuesta ya fue enviada por generateNextId
    }
    
    // Crear producto con ID personalizado
    await setDoc(doc(productsCollection, newId), product);
    
    // Invalidar cache relacionado
    productsCacheManager.invalidateAll();
    
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

const updateProduct = async (id, data, res) => {
  try {
    await updateDoc(doc(productsCollection, id), data);
    
    // Invalidar cache del producto específico y de la lista
    productsCacheManager.invalidateProduct(id);
    
    Logger.info('✅ Producto actualizado exitosamente', {
      productId: id,
      updatedFields: Object.keys(data),
      timestamp: new Date().toISOString()
    });
    
    return getProductById(id, res);
  } catch (error) {
    Logger.error('🚨 Error actualizando producto', {
      error: error.message,
      productId: id,
      data,
      stack: error.stack
    });
    return res.status(500).json({
      message: 'Error al actualizar el producto',
      error: error.message
    });
  }
};

const deleteProduct = async (id, res) => {
  try {
    await deleteDoc(doc(productsCollection, id));
    
    // Invalidar cache del producto específico y de la lista
    productsCacheManager.invalidateProduct(id);
    
    Logger.info('✅ Producto eliminado exitosamente', {
      productId: id,
      timestamp: new Date().toISOString()
    });
    
    return true;
  } catch (error) {
    Logger.error('🚨 Error eliminando producto', {
      error: error.message,
      productId: id,
      stack: error.stack
    });
    return res.status(500).json({
      message: 'Error al eliminar el producto',
      error: error.message
    });
  }
};

module.exports = {
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct
};
