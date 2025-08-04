const { RELATIVE_PATHS, EXTERNAL_PACKAGES } = require('../config/paths.config.js');
const { SYSTEM_MESSAGES } = require('../utils/messages.utils.js');
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
  ValidationError, 
  NotFoundError, 
  ConflictError, 
  InternalServerError 
} = require('../utils/error.utils.js');
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

const COLLECTION_NAME = SYSTEM_MESSAGES.COLLECTION_PRODUCTS;
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
        return SYSTEM_MESSAGES.PRODUCT_ID_INITIAL;
      }
      
      // Obtener todos los IDs y encontrar el número más alto
      let maxNumber = 0;
      snapshot.forEach((doc) => {
        const id = doc.id;
        if (id.startsWith(SYSTEM_MESSAGES.PRODUCT_ID_PREFIX)) {
          const number = parseInt(id.split('-')[1]);
          if (number > maxNumber) {
            maxNumber = number;
          }
        }
      });
      
      // Generar el siguiente número
      const nextNumber = maxNumber + 1;
      
      // Formatear con padding de ceros (7 dígitos)
      return `${SYSTEM_MESSAGES.PRODUCT_ID_PREFIX}${nextNumber.toString().padStart(7, SYSTEM_MESSAGES.PADDING_ZERO)}`;
    },
    SYSTEM_MESSAGES.OPERATION_GENERATE_ID_KEY,
    COLLECTION_NAME,
    { operation: SYSTEM_MESSAGES.OPERATION_GENERATE_ID }
  );
};

/**
 * Obtener productos con query processing (filtros, búsqueda, paginación)
 */
const getProductsWithQuery = async (queryProcessor) => {
  try {
    const productsCollection = collection(db, COLLECTION_NAME);
    const snapshot = await getDocs(productsCollection);
    
    let products = [];
    snapshot.forEach((doc) => {
      const data = doc.data();
      // Estructurar el producto con el orden específico requerido
      const product = {
        id: doc.id,
        title: data.title,
        img: {
          src: data.img?.src,
          alt: data.img?.alt,
          carousel: data.img?.carousel
        } || [],
        price: data.price,
        previous_price: data.previous_price ?? null,
        description: data.description,
        category: data.category,
        subcategory: data.subcategory,
        outstanding: data.outstanding,
        createdAt: data.createdAt,
        updatedAt: data.updatedAt
      };
      products.push(product);
    });

    // Aplicar búsqueda si existe
    if (queryProcessor && queryProcessor.search && queryProcessor.search.term) {
      const searchTerm = queryProcessor.search.term.toLowerCase();
      products = products.filter(product => {
        return queryProcessor.search.fields.some(field => {
          const fieldValue = product[field];
          if (typeof fieldValue === SYSTEM_MESSAGES.TYPE_STRING) {
            return fieldValue.toLowerCase().includes(searchTerm);
          }
          return false;
        });
      });
    }

    // Aplicar filtros básicos
    if (queryProcessor && queryProcessor.filters) {
      Object.entries(queryProcessor.filters).forEach(([field, filterArray]) => {
        filterArray.forEach(({ operator, value }) => {
          switch (operator) {
            case SYSTEM_MESSAGES.FIREBASE_EQUALITY_OPERATOR:
              products = products.filter(product => product[field] === value);
              break;
            case SYSTEM_MESSAGES.FIREBASE_NOT_EQUAL_OPERATOR:
              products = products.filter(product => product[field] !== value);
              break;
            case SYSTEM_MESSAGES.FIREBASE_GREATER_THAN_OPERATOR:
              products = products.filter(product => product[field] > value);
              break;
            case SYSTEM_MESSAGES.FIREBASE_GREATER_EQUAL_OPERATOR:
              products = products.filter(product => product[field] >= value);
              break;
            case SYSTEM_MESSAGES.FIREBASE_LESS_THAN_OPERATOR:
              products = products.filter(product => product[field] < value);
              break;
            case SYSTEM_MESSAGES.FIREBASE_LESS_EQUAL_OPERATOR:
              products = products.filter(product => product[field] <= value);
              break;
            case SYSTEM_MESSAGES.FIREBASE_IN_OPERATOR:
              products = products.filter(product => value.includes(product[field]));
              break;
            case SYSTEM_MESSAGES.FIREBASE_NOT_IN_OPERATOR:
              products = products.filter(product => !value.includes(product[field]));
              break;
          }
        });
      });
    }

    // Aplicar ordenamiento
    if (queryProcessor && queryProcessor.sorting && queryProcessor.sorting.length > 0) {
      const sort = queryProcessor.sorting[0]; // Usar solo el primer criterio de ordenamiento
      products.sort((a, b) => {
        const aVal = a[sort.field];
        const bVal = b[sort.field];
        
        if (sort.direction === SYSTEM_MESSAGES.FIREBASE_ORDER_DESC) {
          return bVal > aVal ? 1 : bVal < aVal ? -1 : 0;
        } else {
          return aVal > bVal ? 1 : aVal < bVal ? -1 : 0;
        }
      });
    } else {
      // Ordenamiento por defecto por título
      products.sort((a, b) => (a.title || SYSTEM_MESSAGES.EMPTY_STRING).localeCompare(b.title || SYSTEM_MESSAGES.EMPTY_STRING));
    }

    // Aplicar paginación
    if (queryProcessor && queryProcessor.pagination) {
      const { page, limit, offset } = queryProcessor.pagination;
      if (offset !== undefined && limit) {
        products = products.slice(offset, offset + limit);
      }
    }

    logMessage(SYSTEM_MESSAGES.LOG_LEVEL_INFO, SYSTEM_MESSAGES.PRODUCTS_FROM_FIREBASE_CACHED, {
      count: products.length,
      searchApplied: !!(queryProcessor && queryProcessor.search && queryProcessor.search.term),
      filtersApplied: !!(queryProcessor && Object.keys(queryProcessor.filters || {}).length > 0),
      cached: false
    });

    return products;
  } catch (error) {
    throw new InternalServerError(
      undefined, // Usar mensaje por defecto
      { operation: 'getProductsWithQuery', originalError: error.message, stack: error.stack }
    );
  }
};

const getAllProducts = async (queryProcessor = null) => {
  // Si hay query processor, no usar cache para permitir filtros/búsquedas dinámicas
  if (queryProcessor) {
    return await getProductsWithQuery(queryProcessor);
  }

  // Intentar obtener del cache primero solo para consultas básicas
  const cacheKey = SYSTEM_MESSAGES.CACHE_KEY_ALL_PRODUCTS;
  const cachedProducts = productsCacheManager.get(cacheKey);
  
  if (cachedProducts) {
    logMessage(SYSTEM_MESSAGES.LOG_LEVEL_INFO, SYSTEM_MESSAGES.PRODUCTS_FROM_CACHE, { cacheHit: true });
    return cachedProducts;
  }

  // Si no está en cache, obtener de Firebase directamente
  try {
    const productsCollection = collection(db, COLLECTION_NAME);
    const snapshot = await getDocs(productsCollection);
    
    const products = [];
    snapshot.forEach((doc) => {
      const data = doc.data();
      // Estructurar el producto con el orden específico requerido
      const product = {
        id: doc.id,
        title: data.title,
        img: {
          src: data.img?.src,
          alt: data.img?.alt,
          carousel: data.img?.carousel
        } || [],
        price: data.price,
        previous_price: data.previous_price ?? null,
        description: data.description,
        category: data.category,
        subcategory: data.subcategory,
        outstanding: data.outstanding,
        createdAt: data.createdAt,
        updatedAt: data.updatedAt
      };
      products.push(product);
    });
    
    // Ordenar los productos por título en el código
    products.sort((a, b) => (a.title || SYSTEM_MESSAGES.EMPTY_STRING).localeCompare(b.title || SYSTEM_MESSAGES.EMPTY_STRING));
    
    // Guardar en cache por 30 minutos
    productsCacheManager.set(cacheKey, products, CACHE_TTL);
    
    logMessage(SYSTEM_MESSAGES.LOG_LEVEL_INFO, SYSTEM_MESSAGES.PRODUCTS_FROM_FIREBASE_CACHED, {
      count: products.length,
      cached: true,
      ttl: CACHE_TTL
    });
    
    return products;
  } catch (error) {
    throw new InternalServerError(
      undefined, // Usar mensaje por defecto
      { operation: 'getAllProducts', originalError: error.message, stack: error.stack }
    );
  }
};

const getProductById = async (id) => {
  // Intentar obtener del cache primero (ignorar valores null del cache)
  const cacheKey = `${SYSTEM_MESSAGES.CACHE_KEY_PRODUCT_PREFIX}${id}`;
  const cachedProduct = productsCacheManager.get(cacheKey);
  
  if (cachedProduct !== undefined && cachedProduct !== null) {
    logMessage(SYSTEM_MESSAGES.LOG_LEVEL_INFO, SYSTEM_MESSAGES.PRODUCT_FROM_CACHE, { 
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
      const data = docSnap.data();
      // Estructurar el producto con el orden específico requerido
      const product = {
        id: docSnap.id,
        title: data.title,
        img: {
          src: data.img?.src,
          alt: data.img?.alt,
          carousel: data.img?.carousel
        } || [],
        price: data.price,
        previous_price: data.previous_price ?? null,
        description: data.description,
        category: data.category,
        subcategory: data.subcategory,
        outstanding: data.outstanding,
        createdAt: data.createdAt,
        updatedAt: data.updatedAt
      };
      
      // Guardar en cache por 30 minutos
      productsCacheManager.set(cacheKey, product, CACHE_TTL);
      
      logMessage(SYSTEM_MESSAGES.LOG_LEVEL_INFO, SYSTEM_MESSAGES.PRODUCT_FROM_FIREBASE_CACHED, { 
        productId: id,
        cached: true,
        ttl: CACHE_TTL
      });
      
      return product;
    } else {
      // NO cachear productos no encontrados para evitar problemas futuros
      logMessage(SYSTEM_MESSAGES.LOG_LEVEL_WARN, SYSTEM_MESSAGES.PRODUCT_NOT_FOUND_FIREBASE, { 
        productId: id,
        found: false
      });
      
      return null;
    }
  } catch (error) {
    throw new InternalServerError(
      undefined, // Usar mensaje por defecto
      { operation: 'getProductById', productId: id, originalError: error.message, stack: error.stack }
    );
  }
};

const createProduct = async (productData) => {
  try {
    // Generar ID secuencial
    const newId = await generateNextId();
    
    // Agregar timestamps automáticamente y asegurar que previous_price esté presente
    const now = new Date().toISOString();
    const productWithTimestamps = {
      ...productData,
      previous_price: productData.previous_price ?? null,
      createdAt: now,
      updatedAt: now
    };
    
    // Crear producto con ID personalizado usando Firebase nativo (para IDs personalizados)
    const productsCollection = collection(db, COLLECTION_NAME);
    await setDoc(doc(productsCollection, newId), productWithTimestamps);
    
    // Invalidar cache relacionado
    productsCacheManager.invalidateAll();
    
    // Estructurar el producto con el orden específico requerido
    const newProduct = {
      id: newId,
      title: productData.title,
      img: {
        src: productData.img?.src,
        alt: productData.img?.alt,
        carousel: productData.img?.carousel
      } || [],
      price: productData.price,
      previous_price: productData.previous_price ?? null,
      description: productData.description,
      category: productData.category,
      subcategory: productData.subcategory,
      outstanding: productData.outstanding,
      createdAt: now,
      updatedAt: now
    };
    
    logMessage(SYSTEM_MESSAGES.LOG_LEVEL_INFO, SYSTEM_MESSAGES.PRODUCT_CREATED_SUCCESS, {
      productId: newId,
      title: productData.title,
      img: {
        src: productData.img?.src,
        alt: productData.img?.alt,
        carousel: productData.img?.carousel
      } || [],
      price: productData.price,
      previous_price: productData.previous_price ?? null,
      description: productData.description,
      category: productData.category,
      subcategory: productData.subcategory,
      outstanding: productData.outstanding,
      createdAt: now,
      updatedAt: now,
      cacheInvalidated: true
    });
    
    // Retornar solo los datos, sin enviar respuesta HTTP
    return newProduct;
  } catch (error) {
    throw new InternalServerError(
      undefined, // Usar mensaje por defecto
      { operation: 'createProduct', originalError: error.message, stack: error.stack, productData }
    );
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
    
    logMessage(SYSTEM_MESSAGES.LOG_LEVEL_INFO, SYSTEM_MESSAGES.PRODUCT_UPDATED_SUCCESS, {
      productId: id,
      updatedFields: Object.keys(data),
      cacheInvalidated: true
    });
    
    // Estructurar el producto actualizado con el orden específico requerido
    const structuredProduct = {
      id: updatedProduct.id,
      title: updatedProduct.title,
      img: {
        src: updatedProduct.img?.src,
        alt: updatedProduct.img?.alt,
        carousel: updatedProduct.img?.carousel
      } || [],
      price: updatedProduct.price,
      previous_price: updatedProduct.previous_price ?? null,
      description: updatedProduct.description,
      category: updatedProduct.category,
      subcategory: updatedProduct.subcategory,
      outstanding: updatedProduct.outstanding,
      createdAt: updatedProduct.createdAt,
      updatedAt: updatedProduct.updatedAt
    };
    
    return structuredProduct;
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
    
    logMessage(SYSTEM_MESSAGES.LOG_LEVEL_INFO, SYSTEM_MESSAGES.PRODUCT_DELETED_SUCCESS, {
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
