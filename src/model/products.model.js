const { RELATIVE_PATHS } = require('../config/paths.js');
const { db } = require(RELATIVE_PATHS.FROM_MODEL.CONFIG_DATABASE);
const { productsCacheManager } = require(RELATIVE_PATHS.FROM_MODEL.CONFIG_CACHE);
const { 
  getAllDocuments, 
  getDocumentById, 
  createDocument, 
  updateDocument, 
  deleteDocument,
  executeFirebaseOperation 
} = require(RELATIVE_PATHS.FROM_MODEL.UTILS_FIREBASE);
const { logMessage } = require(RELATIVE_PATHS.FROM_MODEL.UTILS_RESPONSE);
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

const COLLECTION_NAME = 'products';
const CACHE_TTL = 1800; // 30 minutos
const CACHE_TTL_SHORT = 300; // 5 minutos para productos no encontrados

// Función simple para generar el próximo ID
const generateNextId = async () => {
  return executeFirebaseOperation(
    async () => {
      const productsCollection = collection(db, COLLECTION_NAME);
      
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
    },
    'generateId',
    COLLECTION_NAME,
    { operation: 'generateSequentialId' }
  );
};

const getAllProducts = async () => {
  // Intentar obtener del cache primero
  const cacheKey = 'all_products';
  const cachedProducts = productsCacheManager.get(cacheKey);
  
  if (cachedProducts) {
    logMessage('info', '📦 Productos obtenidos desde cache', { cacheHit: true });
    return cachedProducts;
  }

  // Si no está en cache, obtener de Firebase directamente
  try {
    const productsCollection = collection(db, COLLECTION_NAME);
    const snapshot = await getDocs(productsCollection);
    
    const products = [];
    snapshot.forEach((doc) => {
      products.push({ id: doc.id, ...doc.data() });
    });
    
    // Ordenar los productos por título en el código
    products.sort((a, b) => (a.title || '').localeCompare(b.title || ''));
    
    // Guardar en cache por 30 minutos
    productsCacheManager.set(cacheKey, products, CACHE_TTL);
    
    logMessage('info', '📦 Productos obtenidos desde Firebase y cacheados', {
      count: products.length,
      cached: true,
      ttl: CACHE_TTL
    });
    
    return products;
  } catch (error) {
    logMessage('error', '🚨 Error al obtener productos de Firebase', {
      error: error.message,
      stack: error.stack
    });
    throw error;
  }
};

const getProductById = async (id) => {
  // Intentar obtener del cache primero (ignorar valores null del cache)
  const cacheKey = `product_${id}`;
  const cachedProduct = productsCacheManager.get(cacheKey);
  
  if (cachedProduct !== undefined && cachedProduct !== null) {
    logMessage('info', '📦 Producto obtenido desde cache', { 
      productId: id, 
      cacheHit: true,
      found: true 
    });
    return cachedProduct;
  }

  // Obtener de Firebase
  try {
    const docRef = doc(db, COLLECTION_NAME, id);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      const product = { id: docSnap.id, ...docSnap.data() };
      
      // Guardar en cache por 30 minutos
      productsCacheManager.set(cacheKey, product, CACHE_TTL);
      
      logMessage('info', '📦 Producto obtenido desde Firebase y cacheado', { 
        productId: id,
        cached: true,
        ttl: CACHE_TTL
      });
      
      return product;
    } else {
      // NO cachear productos no encontrados para evitar problemas futuros
      logMessage('warn', '📦 Producto no encontrado en Firebase', { 
        productId: id,
        found: false
      });
      
      return null;
    }
  } catch (error) {
    logMessage('error', '🚨 Error al obtener producto de Firebase', {
      productId: id,
      error: error.message,
      stack: error.stack
    });
    throw error;
  }
};

const createProduct = async (productData) => {
  try {
    // Generar ID secuencial
    const newId = await generateNextId();
    
    // Crear producto con ID personalizado usando Firebase nativo (para IDs personalizados)
    const productsCollection = collection(db, COLLECTION_NAME);
    await setDoc(doc(productsCollection, newId), productData);
    
    // Invalidar cache relacionado
    productsCacheManager.invalidateAll();
    
    const newProduct = { id: newId, ...productData };
    
    logMessage('info', '✅ Producto creado exitosamente en modelo', {
      productId: newId,
      title: productData.title,
      category: productData.category,
      price: productData.price,
      cacheInvalidated: true
    });
    
    // Retornar solo los datos, sin enviar respuesta HTTP
    return newProduct;
  } catch (error) {
    logMessage('error', '🚨 Error creando producto en la base de datos', {
      error: error.message,
      stack: error.stack,
      productData: productData
    });
    
    // Lanzar error para que el controlador lo maneje
    throw new Error(`Error al crear el producto en la base de datos: ${error.message}`);
  }
};

const updateProduct = async (id, data) => {
  const updatedProduct = await updateDocument(db, COLLECTION_NAME, id, data, {
    includeTimestamp: false, // No agregar timestamp automático
    validateData: null // Sin validación adicional por ahora
  });
  
  if (updatedProduct) {
    // Invalidar cache del producto específico y de la lista
    productsCacheManager.invalidateProduct(id);
    
    logMessage('info', '✅ Producto actualizado exitosamente', {
      productId: id,
      updatedFields: Object.keys(data),
      cacheInvalidated: true
    });
  }
  
  return updatedProduct;
};

const deleteProduct = async (id) => {
  const result = await deleteDocument(db, COLLECTION_NAME, id, {
    softDelete: false // Hard delete por defecto
  });
  
  if (result) {
    // Invalidar cache del producto específico y de la lista
    productsCacheManager.invalidateProduct(id);
    
    logMessage('info', '✅ Producto eliminado exitosamente', {
      productId: id,
      cacheInvalidated: true
    });
  }
  
  return result;
};

module.exports = {
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct
};
