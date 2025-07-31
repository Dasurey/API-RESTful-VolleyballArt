const { RELATIVE_PATHS, EXTERNAL_PACKAGES } = require('../config/paths.js');
const { 
  SERVICE_MESSAGES,
  LOG_LEVEL_INFO,
  LOG_LEVEL_ERROR,
  LOG_LEVEL_WARN,
  COLLECTION_PRODUCTS,
  CACHE_KEY_ALL_PRODUCTS,
  CACHE_KEY_PRODUCT_PREFIX,
  OPERATION_GENERATE_ID,
  OPERATION_GENERATE_ID_KEY,
  PRODUCT_ID_PREFIX,
  PRODUCT_ID_INITIAL,
  PADDING_ZERO,
  PRODUCT_FROM_CACHE,
  PRODUCTS_FROM_CACHE,
  PRODUCT_NOT_FOUND_FIREBASE,
  PRODUCTS_FROM_FIREBASE_CACHED,
  PRODUCT_FROM_FIREBASE_CACHED,
  PRODUCT_CREATED_SUCCESS,
  PRODUCT_UPDATED_SUCCESS,
  PRODUCT_DELETED_SUCCESS,
  ERROR_GETTING_PRODUCT_FIREBASE,
  ERROR_GETTING_PRODUCTS_FIREBASE,
  ERROR_CREATING_PRODUCT_DATABASE,
  ERROR_CREATING_PRODUCT_PREFIX
} = require('../utils/messages.utils.js');
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
} = require(EXTERNAL_PACKAGES.FIREBASE_FIRESTORE);

const COLLECTION_NAME = COLLECTION_PRODUCTS;
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
        return PRODUCT_ID_INITIAL;
      }
      
      // Obtener todos los IDs y encontrar el número más alto
      let maxNumber = 0;
      snapshot.forEach((doc) => {
        const id = doc.id;
        if (id.startsWith(PRODUCT_ID_PREFIX)) {
          const number = parseInt(id.split('-')[1]);
          if (number > maxNumber) {
            maxNumber = number;
          }
        }
      });
      
      // Generar el siguiente número
      const nextNumber = maxNumber + 1;
      
      // Formatear con padding de ceros (7 dígitos)
      return `${PRODUCT_ID_PREFIX}${nextNumber.toString().padStart(7, PADDING_ZERO)}`;
    },
    OPERATION_GENERATE_ID_KEY,
    COLLECTION_NAME,
    { operation: OPERATION_GENERATE_ID }
  );
};

const getAllProducts = async () => {
  // Intentar obtener del cache primero
  const cacheKey = CACHE_KEY_ALL_PRODUCTS;
  const cachedProducts = productsCacheManager.get(cacheKey);
  
  if (cachedProducts) {
    logMessage(LOG_LEVEL_INFO, PRODUCTS_FROM_CACHE, { cacheHit: true });
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
    
    logMessage(LOG_LEVEL_INFO, PRODUCTS_FROM_FIREBASE_CACHED, {
      count: products.length,
      cached: true,
      ttl: CACHE_TTL
    });
    
    return products;
  } catch (error) {
    logMessage(LOG_LEVEL_ERROR, ERROR_GETTING_PRODUCTS_FIREBASE, {
      error: error.message,
      stack: error.stack
    });
    throw error;
  }
};

const getProductById = async (id) => {
  // Intentar obtener del cache primero (ignorar valores null del cache)
  const cacheKey = `${CACHE_KEY_PRODUCT_PREFIX}${id}`;
  const cachedProduct = productsCacheManager.get(cacheKey);
  
  if (cachedProduct !== undefined && cachedProduct !== null) {
    logMessage(LOG_LEVEL_INFO, PRODUCT_FROM_CACHE, { 
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
      
      logMessage(LOG_LEVEL_INFO, PRODUCT_FROM_FIREBASE_CACHED, { 
        productId: id,
        cached: true,
        ttl: CACHE_TTL
      });
      
      return product;
    } else {
      // NO cachear productos no encontrados para evitar problemas futuros
      logMessage(LOG_LEVEL_WARN, PRODUCT_NOT_FOUND_FIREBASE, { 
        productId: id,
        found: false
      });
      
      return null;
    }
  } catch (error) {
    logMessage(LOG_LEVEL_ERROR, ERROR_GETTING_PRODUCT_FIREBASE, {
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
    
    logMessage(LOG_LEVEL_INFO, PRODUCT_CREATED_SUCCESS, {
      productId: newId,
      title: productData.title,
      category: productData.category,
      price: productData.price,
      cacheInvalidated: true
    });
    
    // Retornar solo los datos, sin enviar respuesta HTTP
    return newProduct;
  } catch (error) {
    logMessage(LOG_LEVEL_ERROR, ERROR_CREATING_PRODUCT_DATABASE, {
      error: error.message,
      stack: error.stack,
      productData: productData
    });
    
    // Lanzar error para que el controlador lo maneje
    throw new Error(`${ERROR_CREATING_PRODUCT_PREFIX} ${error.message}`);
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
    
    logMessage(LOG_LEVEL_INFO, PRODUCT_UPDATED_SUCCESS, {
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
    
    logMessage(LOG_LEVEL_INFO, PRODUCT_DELETED_SUCCESS, {
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
