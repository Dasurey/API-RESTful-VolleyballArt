const { RELATIVE_PATHS, EXTERNAL_PACKAGES } = require('../config/paths.js');
const { 
  CATEGORIES_MESSAGES,
  LOG_LEVEL_INFO,
  LOG_LEVEL_ERROR,
  COLLECTION_CATEGORY,
  CATEGORY_ID_PREFIX,
  CATEGORY_ID_SUFFIX,
  CATEGORY_ID_SEPARATOR,
  CATEGORY_ID_INITIAL,
  PADDING_ZERO,
  OPERATION_GENERATE_CATEGORY_ID,
  OPERATION_GENERATE_CATEGORY_ID_KEY,
  OPERATION_GENERATE_SUBCATEGORY_ID_KEY,
  CATEGORIES_PARENT_OBTAINED,
  CATEGORY_WITH_SUBCATEGORIES,
  SUBCATEGORIES_OBTAINED,
  CATEGORY_PARENT_CREATED,
  SUBCATEGORY_CREATED,
  CATEGORY_UPDATED,
  SUBCATEGORIES_DELETED,
  CATEGORY_DELETED,
  CATEGORY_HIERARCHY_OBTAINED,
  ERROR_GETTING_CATEGORIES_FIREBASE,
  ERROR_GETTING_CATEGORY_FIREBASE,
  ERROR_GETTING_SUBCATEGORIES_FIREBASE,
  ERROR_UPDATING_CATEGORY_FIREBASE,
  ERROR_DELETING_CATEGORY_FIREBASE,
  ERROR_GETTING_HIERARCHY_FIREBASE,
  CATEGORY_NOT_FOUND_PREFIX
} = require('../utils/messages.utils.js');
const { db } = require(RELATIVE_PATHS.FROM_MODEL.CONFIG_DATABASE);
const { 
  getAllDocuments, 
  getDocumentById, 
  createDocument, 
  updateDocument, 
  deleteDocument,
  executeFirebaseFunction,
  executeFirebaseOperation
} = require(RELATIVE_PATHS.FROM_MODEL.UTILS_FIREBASE);
const { logMessage } = require(RELATIVE_PATHS.FROM_MODEL.UTILS_RESPONSE);
const {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  deleteDoc,
} = require(EXTERNAL_PACKAGES.FIREBASE_FIRESTORE);

const COLLECTION_NAME = COLLECTION_CATEGORY;

/**
 * Generar el próximo ID para categoría padre
 * Formato: CAT-XXXX-0000
 */
const generateNextCategoryId = async () => {
  return executeFirebaseOperation(
    async () => {
      const categoryCollection = collection(db, COLLECTION_NAME);
      const snapshot = await getDocs(categoryCollection);
      
      if (snapshot.empty) {
        return CATEGORY_ID_INITIAL;
      }
      
      // Obtener todas las categoria padre (terminan en -0000)
      let maxNumber = 0;
      snapshot.forEach((doc) => {
        const id = doc.id;
        if (id.startsWith(CATEGORY_ID_PREFIX) && id.endsWith(CATEGORY_ID_SUFFIX)) {
          const number = parseInt(id.split(CATEGORY_ID_SEPARATOR)[1]);
          if (number > maxNumber) {
            maxNumber = number;
          }
        }
      });
      
      const nextNumber = maxNumber + 1;
      return `${CATEGORY_ID_PREFIX}${nextNumber.toString().padStart(4, PADDING_ZERO)}${CATEGORY_ID_SUFFIX}`;
    },
    OPERATION_GENERATE_CATEGORY_ID_KEY,
    COLLECTION_NAME,
    { operation: OPERATION_GENERATE_CATEGORY_ID }
  );
};

/**
 * Generar el próximo ID para subcategoría
 * Formato: CAT-XXXX-YYYY (donde XXXX es de la categoría padre)
 * @param {string} parentCategoryId - ID de la categoría padre (ej: CAT-0001-0000)
 */
const generateNextSubcategoryId = async (parentCategoryId) => {
  return executeFirebaseOperation(
    async () => {
      // Extraer el número de la categoría padre
      const parentNumber = parentCategoryId.split(CATEGORY_ID_SEPARATOR)[1];
      
      const categoryCollection = collection(db, COLLECTION_NAME);
      const snapshot = await getDocs(categoryCollection);
      
      // Buscar todas las subcategoria de esta categoría padre
      let maxSubNumber = 0;
      snapshot.forEach((doc) => {
        const id = doc.id;
        if (id.startsWith(`${CATEGORY_ID_PREFIX}${parentNumber}${CATEGORY_ID_SEPARATOR}`) && !id.endsWith(CATEGORY_ID_SUFFIX)) {
          const subNumber = parseInt(id.split(CATEGORY_ID_SEPARATOR)[2]);
          if (subNumber > maxSubNumber) {
            maxSubNumber = subNumber;
          }
        }
      });
      
      const nextSubNumber = maxSubNumber + 1;
      return `${CATEGORY_ID_PREFIX}${parentNumber}${CATEGORY_ID_SEPARATOR}${nextSubNumber.toString().padStart(4, PADDING_ZERO)}`;
    },
    OPERATION_GENERATE_SUBCATEGORY_ID_KEY,
    COLLECTION_NAME,
    { 
      operation: OPERATION_GENERATE_SUBCATEGORY_ID_KEY,
      parentCategoryId 
    }
  );
};

/**
 * Obtener todas las categoria (solo categoria padre)
 */
const getAllCategory = async () => {
  try {
    const categoryCollection = collection(db, COLLECTION_NAME);
    const snapshot = await getDocs(categoryCollection);
    
    const allCategory = [];
    snapshot.forEach((doc) => {
      allCategory.push({ id: doc.id, ...doc.data() });
    });
    
    // Filtrar solo categoria padre (terminan en -0000)
    const parentCategory = allCategory.filter(cat => cat.id.endsWith(CATEGORY_ID_SUFFIX));
    
    logMessage(LOG_LEVEL_INFO, CATEGORIES_PARENT_OBTAINED, {
      totalCategory: parentCategory.length
    });
    
    return parentCategory;
  } catch (error) {
    logMessage(LOG_LEVEL_ERROR, ERROR_GETTING_CATEGORIES_FIREBASE, {
      error: error.message,
      stack: error.stack
    });
    throw error;
  }
};

/**
 * Obtener categoría por ID con sus subcategoria
 * @param {string} categoryId - ID de la categoría
 */
const getCategoryById = async (categoryId) => {
  try {
    // Obtener la categoría principal directamente con Firebase v9+
    const docRef = doc(db, COLLECTION_NAME, categoryId);
    const docSnap = await getDoc(docRef);
    
    if (!docSnap.exists()) {
      return null;
    }
    
    const category = { id: docSnap.id, ...docSnap.data() };
    
    // Si es una categoría padre, obtener sus subcategoria
    if (categoryId.endsWith(CATEGORY_ID_SUFFIX)) {
      const parentNumber = categoryId.split(CATEGORY_ID_SEPARATOR)[1];
      
      // Obtener todas las categorías para filtrar subcategorías
      const categoryCollection = collection(db, COLLECTION_NAME);
      const snapshot = await getDocs(categoryCollection);
      
      const allCategory = [];
      snapshot.forEach((doc) => {
        allCategory.push({ id: doc.id, ...doc.data() });
      });
      
      // Filtrar subcategoria de esta categoría padre
      const subcategory = allCategory.filter(cat => 
        cat.id.startsWith(`${CATEGORY_ID_PREFIX}${parentNumber}${CATEGORY_ID_SEPARATOR}`) && !cat.id.endsWith(CATEGORY_ID_SUFFIX)
      );
      
      category.subcategory = subcategory;
      
      logMessage(LOG_LEVEL_INFO, CATEGORY_WITH_SUBCATEGORIES, {
        categoryId,
        subcategoryCount: subcategory.length
      });
    }
    
    return category;
  } catch (error) {
    logMessage(LOG_LEVEL_ERROR, ERROR_GETTING_CATEGORY_FIREBASE, {
      categoryId,
      error: error.message,
      stack: error.stack
    });
    throw error;
  }
};

/**
 * Obtener todas las subcategoria de una categoría padre
 * @param {string} parentCategoryId - ID de la categoría padre
 */
const getSubcategoryByParent = async (parentCategoryId) => {
  try {
    const parentNumber = parentCategoryId.split(CATEGORY_ID_SEPARATOR)[1];
    
    // Obtener todas las categorías directamente con Firebase v9+
    const categoryCollection = collection(db, COLLECTION_NAME);
    const snapshot = await getDocs(categoryCollection);
    
    const allCategory = [];
    snapshot.forEach((doc) => {
      allCategory.push({ id: doc.id, ...doc.data() });
    });
    
    const subcategory = allCategory.filter(cat => 
      cat.id.startsWith(`${CATEGORY_ID_PREFIX}${parentNumber}${CATEGORY_ID_SEPARATOR}`) && !cat.id.endsWith(CATEGORY_ID_SUFFIX)
    );
    
    logMessage(LOG_LEVEL_INFO, SUBCATEGORIES_OBTAINED, {
      parentCategoryId,
      subcategoryCount: subcategory.length
    });
    
    return subcategory;
  } catch (error) {
    logMessage(LOG_LEVEL_ERROR, ERROR_GETTING_SUBCATEGORIES_FIREBASE, {
      parentCategoryId,
      error: error.message,
      stack: error.stack
    });
    throw error;
  }
};

/**
 * Crear una nueva categoría padre
 * @param {Object} categoryData - Datos de la categoría
 */
const createCategory = async (categoryData) => {
  const newId = await generateNextCategoryId();
  
  const categoryCollection = collection(db, COLLECTION_NAME);
  const categoryWithId = {
    ...categoryData
  };
  
  await setDoc(doc(categoryCollection, newId), categoryWithId);
  
  logMessage(LOG_LEVEL_INFO, CATEGORY_PARENT_CREATED, {
    categoryId: newId,
    title: categoryData.title
  });
  
  return { id: newId, ...categoryWithId };
};

/**
 * Crear una nueva subcategoría
 * @param {string} parentCategoryId - ID de la categoría padre
 * @param {Object} subcategoryData - Datos de la subcategoría
 */
const createSubcategory = async (parentCategoryId, subcategoryData) => {
  // Verificar que la categoría padre existe
  const parentCategory = await getDocumentById(db, COLLECTION_NAME, parentCategoryId);
  if (!parentCategory) {
    throw new Error(CATEGORIES_MESSAGES.NOT_FOUND_PARENT);
  }
  
  const newId = await generateNextSubcategoryId(parentCategoryId);
  
  const categoryCollection = collection(db, COLLECTION_NAME);
  const subcategoryWithId = {
    ...subcategoryData,
    parentCategoryId
  };
  
  await setDoc(doc(categoryCollection, newId), subcategoryWithId);
  
  logMessage(LOG_LEVEL_INFO, SUBCATEGORY_CREATED, {
    subcategoryId: newId,
    parentCategoryId,
    title: subcategoryData.title
  });
  
  return { id: newId, ...subcategoryWithId };
};

/**
 * Actualizar categoría o subcategoría
 * @param {string} categoryId - ID de la categoría
 * @param {Object} updateData - Datos a actualizar
 */
const updateCategory = async (categoryId, updateData) => {
  try {
    // Usar Firebase v9+ API directamente
    const categoryRef = doc(db, COLLECTION_NAME, categoryId);
    const categorySnap = await getDoc(categoryRef);
    
    if (!categorySnap.exists()) {
      throw new Error(`${CATEGORY_NOT_FOUND_PREFIX} ${categoryId}`);
    }
    
    // Actualizar el documento
    await setDoc(categoryRef, updateData, { merge: true });
    
    // Obtener el documento actualizado
    const updatedSnap = await getDoc(categoryRef);
    const updatedCategory = { id: updatedSnap.id, ...updatedSnap.data() };
    
    logMessage(LOG_LEVEL_INFO, CATEGORY_UPDATED, {
      categoryId,
      updatedFields: Object.keys(updateData)
    });
    
    return updatedCategory;
  } catch (error) {
    logMessage(LOG_LEVEL_ERROR, ERROR_UPDATING_CATEGORY_FIREBASE, {
      categoryId,
      error: error.message,
      stack: error.stack
    });
    throw error;
  }
};

/**
 * Eliminar categoría o subcategoría
 * @param {string} categoryId - ID de la categoría
 * @param {Object} options - Opciones de eliminación
 */
const deleteCategory = async (categoryId, options = {}) => {
  try {
    const { deleteSubcategory = false } = options;
    
    // Verificar que la categoría existe
    const categoryRef = doc(db, COLLECTION_NAME, categoryId);
    const categorySnap = await getDoc(categoryRef);
    
    if (!categorySnap.exists()) {
      throw new Error(`${CATEGORY_NOT_FOUND_PREFIX} ${categoryId}`);
    }
    
    // Si es una categoría padre y se especifica eliminar subcategorías
    if (categoryId.endsWith(CATEGORY_ID_SUFFIX) && deleteSubcategory) {
      const subcategory = await getSubcategoryByParent(categoryId);
      
      // Eliminar todas las subcategorías primero usando Firebase v9+
      for (const subcat of subcategory) {
        const subcatRef = doc(db, COLLECTION_NAME, subcat.id);
        await deleteDoc(subcatRef);
      }
      
      logMessage(LOG_LEVEL_INFO, SUBCATEGORIES_DELETED, {
        parentCategoryId: categoryId,
        deletedCount: subcategory.length
      });
    }
    
    // Eliminar la categoría principal usando Firebase v9+
    await deleteDoc(categoryRef);
    
    logMessage(LOG_LEVEL_INFO, CATEGORY_DELETED, {
      categoryId,
      deletedSubcategory: deleteSubcategory
    });
    
    return true;
  } catch (error) {
    logMessage(LOG_LEVEL_ERROR, ERROR_DELETING_CATEGORY, {
      categoryId,
      error: error.message,
      stack: error.stack
    });
    throw error;
  }
};

/**
 * Obtener estructura completa de categoria con subcategoria
 */
const getCategoryHierarchy = async () => {
  try {
    const categoryCollection = collection(db, COLLECTION_NAME);
    const snapshot = await getDocs(categoryCollection);
    
    const allCategory = [];
    snapshot.forEach((doc) => {
      allCategory.push({ id: doc.id, ...doc.data() });
    });
    
    // Separar categoria padre de subcategoria
    const parentCategory = allCategory.filter(cat => cat.id.endsWith(CATEGORY_ID_SUFFIX));
    const subcategoryMap = new Map();
    
    // Agrupar subcategoria por categoría padre
    allCategory
      .filter(cat => !cat.id.endsWith(CATEGORY_ID_SUFFIX))
      .forEach(subcat => {
        const parentNumber = subcat.id.split(CATEGORY_ID_SEPARATOR)[1];
        const parentId = `${CATEGORY_ID_PREFIX}${parentNumber}${CATEGORY_ID_SUFFIX}`;
        
        if (!subcategoryMap.has(parentId)) {
          subcategoryMap.set(parentId, []);
        }
        subcategoryMap.get(parentId).push(subcat);
      });
    
    // Combinar categoria padre con sus subcategoria
    const hierarchy = parentCategory.map(parent => ({
      ...parent,
      subcategory: subcategoryMap.get(parent.id) || []
    }));
    
    logMessage(LOG_LEVEL_INFO, CATEGORY_HIERARCHY_OBTAINED, {
      totalParentCategory: parentCategory.length,
      totalSubcategory: allCategory.length - parentCategory.length
    });
    
    return hierarchy;
  } catch (error) {
    logMessage(LOG_LEVEL_ERROR, ERROR_GETTING_CATEGORY_HIERARCHY, {
      error: error.message,
      stack: error.stack
    });
    throw error;
  }
};

module.exports = {
  getAllCategory,
  getCategoryById,
  getSubcategoryByParent,
  createCategory,
  createSubcategory,
  updateCategory,
  deleteCategory,
  getCategoryHierarchy,
  generateNextCategoryId,
  generateNextSubcategoryId
};
