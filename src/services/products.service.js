
const { productsCacheManager } = require('../config/cache.config');
const productsModel = require('../model/products.model');
const { structureProducts } = productsModel;
const { InternalServerError } = require('../utils/error.utils');
const { logDatabase } = require('../utils/log.utils');
const { collection, getDocs } = require('firebase/firestore');

const COLLECTION_NAME = 'products';
const CACHE_TTL = 1800; // 30 minutos
const CACHE_TTL_SHORT = 300; // 5 minutos para productos no encontrados


// Generar el próximo ID secuencial para productos (Firebase)
const generateNextId = async () => {
  const productsCollection = collection(db, COLLECTION_NAME);
  const snapshot = await getDocs(productsCollection);
  if (snapshot.empty) {
    return 'VA-0000001';
  }
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
  const nextNumber = maxNumber + 1;
  return `VA-${nextNumber.toString().padStart(7, '0')}`;
};

/**
 * Obtener productos con query processing (filtros, búsqueda, paginación)
 */
const getProductsWithQuery = async (queryProcessor) => {
  try {
    const productsRaw = await productsModel.getAllProducts();
    let products = structureProducts(productsRaw);
    // Búsqueda
    if (queryProcessor && queryProcessor.search && queryProcessor.search.term) {
      const searchTerm = queryProcessor.search.term.toLowerCase();
      products = products.filter(product => {
        return queryProcessor.search.fields.some(field => {
          const fieldValue = product[field];
          if (typeof fieldValue === 'string') {
            return fieldValue.toLowerCase().includes(searchTerm);
          }
          return false;
        });
      });
    }
    // Filtros
    if (queryProcessor && queryProcessor.filters) {
      Object.entries(queryProcessor.filters).forEach(([field, filterArray]) => {
        filterArray.forEach(({ operator, value }) => {
          switch (operator) {
            case '==':
              products = products.filter(product => product[field] === value);
              break;
            case '!=':
              products = products.filter(product => product[field] !== value);
              break;
            case '>':
              products = products.filter(product => product[field] > value);
              break;
            case '>=':
              products = products.filter(product => product[field] >= value);
              break;
            case '<':
              products = products.filter(product => product[field] < value);
              break;
            case '<=':
              products = products.filter(product => product[field] <= value);
              break;
            case 'in':
              products = products.filter(product => value.includes(product[field]));
              break;
            case 'not-in':
              products = products.filter(product => !value.includes(product[field]));
              break;
          }
        });
      });
    }
    // Ordenamiento
    if (queryProcessor && queryProcessor.sorting && queryProcessor.sorting.length > 0) {
      const sort = queryProcessor.sorting[0];
      products.sort((a, b) => {
        const aVal = a[sort.field];
        const bVal = b[sort.field];
        if (sort.direction === 'desc') {
          return bVal > aVal ? 1 : bVal < aVal ? -1 : 0;
        } else {
          return aVal > bVal ? 1 : aVal < bVal ? -1 : 0;
        }
      });
    } else {
      products.sort((a, b) => (a.title || '').localeCompare(b.title || ''));
    }
    // Paginación
    if (queryProcessor && queryProcessor.pagination) {
      const { page, limit, offset } = queryProcessor.pagination;
      if (offset !== undefined && limit) {
        products = products.slice(offset, offset + limit);
      }
    }
    logDatabase('📦 Productos obtenidos desde Firebase y cacheados', {
      count: products.length,
      searchApplied: !!(queryProcessor && queryProcessor.search && queryProcessor.search.term),
      filtersApplied: !!(queryProcessor && Object.keys(queryProcessor.filters || {}).length > 0),
      cached: false
    });
    return products;
  } catch (error) {
    throw new InternalServerError(undefined, { operation: 'getProductsWithQuery', originalError: error.message, stack: error.stack });
  }
};

const getAllProducts = async (queryProcessor = null) => {
  if (queryProcessor) {
    return await getProductsWithQuery(queryProcessor);
  }
  const cacheKey = 'all_products';
  const cachedProducts = productsCacheManager.get(cacheKey);
  if (cachedProducts) {
    logDatabase('📦 Productos obtenidos desde cache', { cacheHit: true });
    return cachedProducts;
  }
  try {
    const productsRaw = await productsModel.getAllProducts();
    let products = structureProducts(productsRaw);
    products.sort((a, b) => (a.title || '').localeCompare(b.title || ''));
    productsCacheManager.set(cacheKey, products, CACHE_TTL);
    logDatabase('📦 Productos obtenidos desde Firebase y cacheados', { count: products.length, cached: true, ttl: CACHE_TTL });
    return products;
  } catch (error) {
    throw new InternalServerError(undefined, { operation: 'getAllProducts', originalError: error.message, stack: error.stack });
  }
};

const getProductById = async (id) => {
  const cacheKey = `product_${id}`;
  const cachedProduct = productsCacheManager.get(cacheKey);
  if (cachedProduct !== undefined && cachedProduct !== null) {
    logDatabase('📦 Producto obtenido desde cache', { productId: id, cacheHit: true, found: true });
    return cachedProduct;
  }
  try {
    const productRaw = await productsModel.getProductById(id);
    if (productRaw) {
      const product = structureProducts(productRaw);
      productsCacheManager.set(cacheKey, product, CACHE_TTL);
      logDatabase('📦 Producto obtenido desde Firebase y cacheado', { productId: id, cached: true, ttl: CACHE_TTL });
      return product;
    } else {
      logDatabase('📦 Producto no encontrado en Firebase', { productId: id, found: false });
      return null;
    }
  } catch (error) {
    throw new InternalServerError(undefined, { operation: 'getProductById', productId: id, originalError: error.message, stack: error.stack });
  }
};

const createProduct = async (productData) => {
  try {
    const newId = await generateNextId();
    const now = new Date().toISOString();
    const productWithTimestamps = {
      ...productData,
      previous_price: productData.previous_price ?? null,
      createdAt: now,
      updatedAt: now
    };
    const created = await productsModel.createProduct(newId, productWithTimestamps);
    productsCacheManager.invalidateAll();
    const newProduct = structureProducts(created);
    logDatabase('✅ Producto creado exitosamente', { productId: newId, ...productWithTimestamps, cacheInvalidated: true });
    return newProduct;
  } catch (error) {
    throw new InternalServerError(undefined, { operation: 'createProduct', originalError: error.message, productData, stack: error.stack });
  }
};

const updateProduct = async (id, data) => {
  try {
    const updated = await productsModel.updateProduct(id, data);
    productsCacheManager.invalidateProduct(id);
    logDatabase('✅ Producto actualizado exitosamente', { productId: id, updatedFields: Object.keys(data), cacheInvalidated: true });
    return structureProducts(updated);
  } catch (error) {
    throw new InternalServerError(undefined, { operation: 'updateProduct', productId: id, originalError: error.message });
  }
};

const deleteProduct = async (id) => {
  try {
    await productsModel.deleteProduct(id);
    productsCacheManager.invalidateProduct(id);
    logDatabase('🗑️ Producto eliminado exitosamente', { productId: id, cacheInvalidated: true });
    return true;
  } catch (error) {
    throw new InternalServerError(undefined, { operation: 'deleteProduct', productId: id, originalError: error.message });
  }
};

module.exports = {
  generateNextId,
  getProductsWithQuery,
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct
};
