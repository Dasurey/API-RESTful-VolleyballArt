const { RELATIVE_PATHS, EXTERNAL_PACKAGES, VERSION_MIDDLEWARE } = require('../config/paths.config.js');
const { SYSTEM_MESSAGES, SERVICE_MESSAGES } = require('../utils/messages.utils.js');
const { db } = require(RELATIVE_PATHS.FROM_MODEL.CONFIG_DATABASE);
const { 
  getDocumentById, 
  executeFirebaseOperation
} = require(RELATIVE_PATHS.FROM_MODEL.UTILS_FIREBASE);
const { logMessage } = require(RELATIVE_PATHS.FROM_MODEL.UTILS_RESPONSE);
const { processQuery, getQueryProcessingInfo } = require(RELATIVE_PATHS.FROM_MODEL.UTILS_QUERY);
const {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  deleteDoc
} = require(EXTERNAL_PACKAGES.FIREBASE_FIRESTORE);

const COLLECTION_NAME = SYSTEM_MESSAGES.COLLECTION_CATEGORY;

/**
 * Estructurar categoría padre con orden específico de campos
 * @param {Object} categoryData - Datos de la categoría
 * @returns {Object} - Categoría estructurada
 */
const structureParentCategory = (categoryData) => {
  return {
    id: categoryData.id,
    title: categoryData.title,
    subcategory: categoryData.subcategory || [],
    [SERVICE_MESSAGES.IS_PARENT_FIELD]: true,
    createdAt: categoryData.createdAt,
    updatedAt: categoryData.updatedAt
  };
};

/**
 * Estructurar subcategoría con orden específico de campos
 * @param {Object} subcategoryData - Datos de la subcategoría
 * @returns {Object} - Subcategoría estructurada
 */
const structureSubcategory = (subcategoryData) => {
  return {
    id: subcategoryData.id,
    title: subcategoryData.title,
    img: subcategoryData.img || [],
    text: subcategoryData.text || VERSION_MIDDLEWARE.EMPTY_LINE,
    parentCategoryId: subcategoryData.parentCategoryId,
    createdAt: subcategoryData.createdAt,
    updatedAt: subcategoryData.updatedAt
  };
};

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
        return SYSTEM_MESSAGES.CATEGORY_ID_INITIAL;
      }
      
      // Obtener todas las categoria padre (terminan en -0000)
      let maxNumber = 0;
      snapshot.forEach((doc) => {
        const id = doc.id;
        if (id.startsWith(SYSTEM_MESSAGES.CATEGORY_ID_PREFIX) && id.endsWith(SYSTEM_MESSAGES.CATEGORY_ID_SUFFIX)) {
          const number = parseInt(id.split(SYSTEM_MESSAGES.CATEGORY_ID_SEPARATOR)[1]);
          if (number > maxNumber) {
            maxNumber = number;
          }
        }
      });
      
      const nextNumber = maxNumber + 1;
      return `${SYSTEM_MESSAGES.CATEGORY_ID_PREFIX}${nextNumber.toString().padStart(4, SYSTEM_MESSAGES.PADDING_ZERO)}${SYSTEM_MESSAGES.CATEGORY_ID_SUFFIX}`;
    },
    SYSTEM_MESSAGES.OPERATION_GENERATE_CATEGORY_ID_KEY,
    COLLECTION_NAME,
    { operation: SYSTEM_MESSAGES.OPERATION_GENERATE_CATEGORY_ID }
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
      const parentNumber = parentCategoryId.split(SYSTEM_MESSAGES.CATEGORY_ID_SEPARATOR)[1];
      
      const categoryCollection = collection(db, COLLECTION_NAME);
      const snapshot = await getDocs(categoryCollection);
      
      // Buscar todas las subcategoria de esta categoría padre
      let maxSubNumber = 0;
      snapshot.forEach((doc) => {
        const id = doc.id;
        if (id.startsWith(`${SYSTEM_MESSAGES.CATEGORY_ID_PREFIX}${parentNumber}${SYSTEM_MESSAGES.CATEGORY_ID_SEPARATOR}`) && !id.endsWith(SYSTEM_MESSAGES.CATEGORY_ID_SUFFIX)) {
          const subNumber = parseInt(id.split(SYSTEM_MESSAGES.CATEGORY_ID_SEPARATOR)[2]);
          if (subNumber > maxSubNumber) {
            maxSubNumber = subNumber;
          }
        }
      });
      
      const nextSubNumber = maxSubNumber + 1;
      return `${SYSTEM_MESSAGES.CATEGORY_ID_PREFIX}${parentNumber}${SYSTEM_MESSAGES.CATEGORY_ID_SEPARATOR}${nextSubNumber.toString().padStart(4, SYSTEM_MESSAGES.PADDING_ZERO)}`;
    },
    SYSTEM_MESSAGES.OPERATION_GENERATE_SUBCATEGORY_ID_KEY,
    COLLECTION_NAME,
    { 
      operation: SYSTEM_MESSAGES.OPERATION_GENERATE_SUBCATEGORY_ID_KEY,
      parentCategoryId 
    }
  );
};

/**
 * Obtener todas las categoria (solo categoria padre)
 */
const getAllCategory = async (queryProcessor = null) => {
  try {
    const categoryCollection = collection(db, COLLECTION_NAME);
    
    // Por ahora, hacer consulta simple y aplicar filtros en memoria
    const snapshot = await getDocs(categoryCollection);
    
    let allCategory = [];
    snapshot.forEach((doc) => {
      const data = doc.data();
      allCategory.push({ 
        id: doc.id, 
        title: data.title,
        ...data
      });
    });
    
    // Filtrar solo categoria padre (terminan en -0000)
    let parentCategory = allCategory.filter(cat => cat.id.endsWith(SYSTEM_MESSAGES.CATEGORY_ID_SUFFIX));
    
    // Aplicar procesamiento de consulta usando utilidades
    const processedCategories = processQuery(parentCategory, queryProcessor);
    
    // Estructurar categorías con orden específico
    const structuredCategories = processedCategories.map(category => structureParentCategory(category));

    // Obtener información de procesamiento
    const processingInfo = getQueryProcessingInfo(queryProcessor);

    logMessage(SYSTEM_MESSAGES.LOG_LEVEL_INFO, SYSTEM_MESSAGES.CATEGORIES_PARENT_OBTAINED, {
      totalCategory: structuredCategories.length,
      searchApplied: processingInfo.searchApplied,
      filtersApplied: processingInfo.filtersApplied
    });
    
    return structuredCategories;
  } catch (error) {
    logMessage(SYSTEM_MESSAGES.LOG_LEVEL_ERROR, SYSTEM_MESSAGES.ERROR_GETTING_CATEGORIES_FIREBASE, {
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
    
    const data = docSnap.data();
    const category = { 
      id: docSnap.id, 
      title: data.title,
      ...data
    };
    
    // Si es una categoría padre, obtener sus subcategoria
    if (categoryId.endsWith(SYSTEM_MESSAGES.CATEGORY_ID_SUFFIX)) {
      const parentNumber = categoryId.split(SYSTEM_MESSAGES.CATEGORY_ID_SEPARATOR)[1];
      
      // Obtener todas las categorías para filtrar subcategorías
      const categoryCollection = collection(db, COLLECTION_NAME);
      const snapshot = await getDocs(categoryCollection);
      
      const allCategory = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        allCategory.push({ 
          id: doc.id, 
          title: data.title,
          ...data
        });
      });
      
      // Filtrar subcategoria de esta categoría padre
      const subcategory = allCategory.filter(cat => 
        cat.id.startsWith(`${SYSTEM_MESSAGES.CATEGORY_ID_PREFIX}${parentNumber}${SYSTEM_MESSAGES.CATEGORY_ID_SEPARATOR}`) && !cat.id.endsWith(SYSTEM_MESSAGES.CATEGORY_ID_SUFFIX)
      );
      
      // Estructurar subcategorías con orden específico
      category.subcategory = subcategory.map(subcat => structureSubcategory(subcat));
      
      logMessage(SYSTEM_MESSAGES.LOG_LEVEL_INFO, SYSTEM_MESSAGES.CATEGORY_WITH_SUBCATEGORIES, {
        categoryId,
        subcategoryCount: subcategory.length
      });
    }
    
    // Estructurar la categoría principal
    return structureParentCategory(category);
  } catch (error) {
    logMessage(SYSTEM_MESSAGES.LOG_LEVEL_ERROR, SYSTEM_MESSAGES.ERROR_GETTING_CATEGORY_FIREBASE, {
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
 * @param {object} queryProcessor - Procesador de consultas
 */
const getSubcategoryByParent = async (parentCategoryId, queryProcessor = null) => {
  try {
    const parentNumber = parentCategoryId.split(SYSTEM_MESSAGES.CATEGORY_ID_SEPARATOR)[1];
    
    // Obtener todas las categorías directamente con Firebase v9+
    const categoryCollection = collection(db, COLLECTION_NAME);
    const snapshot = await getDocs(categoryCollection);
    
    let allCategory = [];
    snapshot.forEach((doc) => {
      const data = doc.data();
      allCategory.push({ 
        id: doc.id, 
        title: data.title,
        ...data
      });
    });
    
    // Filtrar subcategorías de esta categoría padre
    let subcategory = allCategory.filter(cat => 
      cat.id.startsWith(`${SYSTEM_MESSAGES.CATEGORY_ID_PREFIX}${parentNumber}${SYSTEM_MESSAGES.CATEGORY_ID_SEPARATOR}`) && !cat.id.endsWith(SYSTEM_MESSAGES.CATEGORY_ID_SUFFIX)
    );

    // Aplicar procesamiento de consulta usando utilidades
    const processedSubcategories = processQuery(subcategory, queryProcessor);
    
    // Estructurar subcategorías con orden específico
    const structuredSubcategories = processedSubcategories.map(subcat => structureSubcategory(subcat));
    
    // Obtener información de procesamiento
    const processingInfo = getQueryProcessingInfo(queryProcessor);
    
    logMessage(SYSTEM_MESSAGES.LOG_LEVEL_INFO, SYSTEM_MESSAGES.SUBCATEGORIES_OBTAINED, {
      parentCategoryId,
      subcategoryCount: structuredSubcategories.length,
      searchApplied: processingInfo.searchApplied,
      filtersApplied: processingInfo.filtersApplied
    });
    
    return structuredSubcategories;
  } catch (error) {
    logMessage(SYSTEM_MESSAGES.LOG_LEVEL_ERROR, SYSTEM_MESSAGES.ERROR_GETTING_SUBCATEGORIES_FIREBASE, {
      parentCategoryId,
      error: error.message,
      stack: error.stack
    });
    throw error;
  }
};

/**
 * Obtener todas las subcategorías
 */
const getAllSubcategory = async (queryProcessor = null) => {
  try {
    // Obtener todas las categorías directamente con Firebase v9+
    const categoryCollection = collection(db, COLLECTION_NAME);
    const snapshot = await getDocs(categoryCollection);
    
    let allCategory = [];
    snapshot.forEach((doc) => {
      const data = doc.data();
      allCategory.push({ 
        id: doc.id, 
        title: data.title,
        ...data
      });
    });
    
    // Filtrar solo subcategorías (no terminan en -0000)
    let subcategory = allCategory.filter(cat => 
      cat.id.startsWith(SYSTEM_MESSAGES.CATEGORY_ID_PREFIX) && !cat.id.endsWith(SYSTEM_MESSAGES.CATEGORY_ID_SUFFIX)
    );
    
    // Aplicar procesamiento de consulta usando utilidades
    const processedSubcategories = processQuery(subcategory, queryProcessor);
    
    // Estructurar subcategorías con orden específico
    const structuredSubcategories = processedSubcategories.map(subcat => structureSubcategory(subcat));
    
    // Obtener información de procesamiento
    const processingInfo = getQueryProcessingInfo(queryProcessor);
    
    logMessage(SYSTEM_MESSAGES.LOG_LEVEL_INFO, SYSTEM_MESSAGES.SUBCATEGORIES_OBTAINED, {
      subcategoryCount: structuredSubcategories.length,
      searchApplied: processingInfo.searchApplied,
      filtersApplied: processingInfo.filtersApplied
    });
    
    return structuredSubcategories;
  } catch (error) {
    logMessage(SYSTEM_MESSAGES.LOG_LEVEL_ERROR, SYSTEM_MESSAGES.ERROR_GETTING_SUBCATEGORIES_FIREBASE, {
      error: error.message,
      stack: error.stack
    });
    throw error;
  }
};

/**
 * Obtener subcategoría específica por ID
 * @param {string} parentCategoryId - ID de la categoría padre
 * @param {string} subcategoryId - ID de la subcategoría
 */
const getSubcategorySpecific = async (parentCategoryId, subcategoryId) => {
  try {
    // Verificar que subcategoryId corresponde al parentCategoryId
    const parentNumber = parentCategoryId.split(SYSTEM_MESSAGES.CATEGORY_ID_SEPARATOR)[1];
    if (!subcategoryId.startsWith(`${SYSTEM_MESSAGES.CATEGORY_ID_PREFIX}${parentNumber}${SYSTEM_MESSAGES.CATEGORY_ID_SEPARATOR}`)) {
      return null;
    }
    
    // Obtener documento directamente por ID
    const categoryRef = doc(db, COLLECTION_NAME, subcategoryId);
    const docSnap = await getDoc(categoryRef);
    
    if (!docSnap.exists()) {
      logMessage(SYSTEM_MESSAGES.LOG_LEVEL_WARN, SYSTEM_MESSAGES.CATEGORY_NOT_FOUND, {
        parentCategoryId,
        subcategoryId
      });
      return null;
    }
    
    const data = docSnap.data();
    const subcategory = { 
      id: docSnap.id, 
      title: data.title,
      ...data
    };
    
    logMessage(SYSTEM_MESSAGES.LOG_LEVEL_INFO, SYSTEM_MESSAGES.SUBCATEGORIES_OBTAINED, {
      parentCategoryId,
      subcategoryId
    });
    
    // Estructurar subcategoría con orden específico
    return structureSubcategory(subcategory);
  } catch (error) {
    logMessage(SYSTEM_MESSAGES.LOG_LEVEL_ERROR, SYSTEM_MESSAGES.ERROR_GETTING_SUBCATEGORIES_FIREBASE, {
      parentCategoryId,
      subcategoryId,
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
  const now = new Date().toISOString();
  
  const categoryCollection = collection(db, COLLECTION_NAME);
  const categoryWithId = {
    title: categoryData.title,
    ...categoryData,
    createdAt: now,
    updatedAt: now
  };
  
  await setDoc(doc(categoryCollection, newId), categoryWithId);
  
  logMessage(SYSTEM_MESSAGES.LOG_LEVEL_INFO, SYSTEM_MESSAGES.CATEGORY_PARENT_CREATED, {
    categoryId: newId,
    title: categoryData.title
  });
  
  const createdCategory = { 
    id: newId, 
    title: categoryData.title,
    ...categoryData,
    createdAt: now,
    updatedAt: now
  };
  
  // Estructurar categoría con orden específico
  return structureParentCategory(createdCategory);
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
    throw new Error(SYSTEM_MESSAGES.CATEGORIES_MESSAGES.NOT_FOUND_PARENT);
  }
  
  const newId = await generateNextSubcategoryId(parentCategoryId);
  const now = new Date().toISOString();
  
  const categoryCollection = collection(db, COLLECTION_NAME);
  const subcategoryWithId = {
    title: subcategoryData.title,
    ...subcategoryData,
    parentCategoryId,
    createdAt: now,
    updatedAt: now
  };
  
  await setDoc(doc(categoryCollection, newId), subcategoryWithId);
  
  logMessage(SYSTEM_MESSAGES.LOG_LEVEL_INFO, SYSTEM_MESSAGES.SUBCATEGORY_CREATED, {
    subcategoryId: newId,
    parentCategoryId,
    title: subcategoryData.title
  });
  
  const createdSubcategory = { 
    id: newId, 
    title: subcategoryData.title,
    ...subcategoryData,
    parentCategoryId,
    createdAt: now,
    updatedAt: now
  };
  
  // Estructurar subcategoría con orden específico
  return structureSubcategory(createdSubcategory);
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
      throw new Error(`${SYSTEM_MESSAGES.CATEGORY_NOT_FOUND_PREFIX} ${categoryId}`);
    }
    
    // Agregar updatedAt automáticamente
    const dataToUpdate = {
      ...updateData,
      updatedAt: new Date().toISOString()
    };
    
    // Actualizar el documento
    await setDoc(categoryRef, dataToUpdate, { merge: true });
    
    // Obtener el documento actualizado
    const updatedSnap = await getDoc(categoryRef);
    const updatedData = updatedSnap.data();
    const updatedCategory = { 
      id: updatedSnap.id, 
      title: updatedData.title,
      ...updatedData
    };
    
    logMessage(SYSTEM_MESSAGES.LOG_LEVEL_INFO, SYSTEM_MESSAGES.CATEGORY_UPDATED, {
      categoryId,
      updatedFields: Object.keys(updateData)
    });
    
    // Determinar si es categoría padre o subcategoría y estructurar en consecuencia
    if (categoryId.endsWith(SYSTEM_MESSAGES.CATEGORY_ID_SUFFIX)) {
      return structureParentCategory(updatedCategory);
    } else {
      return structureSubcategory(updatedCategory);
    }
  } catch (error) {
    logMessage(SYSTEM_MESSAGES.LOG_LEVEL_ERROR, SYSTEM_MESSAGES.ERROR_UPDATING_CATEGORY_FIREBASE, {
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
      throw new Error(`${SYSTEM_MESSAGES.CATEGORY_NOT_FOUND_PREFIX} ${categoryId}`);
    }
    
    // Si es una categoría padre y se especifica eliminar subcategorías
    if (categoryId.endsWith(SYSTEM_MESSAGES.CATEGORY_ID_SUFFIX) && deleteSubcategory) {
      const subcategory = await getSubcategoryByParent(categoryId);
      
      // Eliminar todas las subcategorías primero usando Firebase v9+
      for (const subcat of subcategory) {
        const subcatRef = doc(db, COLLECTION_NAME, subcat.id);
        await deleteDoc(subcatRef);
      }
      
      logMessage(SYSTEM_MESSAGES.LOG_LEVEL_INFO, SYSTEM_MESSAGES.SUBCATEGORIES_DELETED, {
        parentCategoryId: categoryId,
        deletedCount: subcategory.length
      });
    }
    
    // Eliminar la categoría principal usando Firebase v9+
    await deleteDoc(categoryRef);
    
    logMessage(SYSTEM_MESSAGES.LOG_LEVEL_INFO, SYSTEM_MESSAGES.CATEGORY_DELETED, {
      categoryId,
      deletedSubcategory: deleteSubcategory
    });
    
    return true;
  } catch (error) {
    logMessage(SYSTEM_MESSAGES.LOG_LEVEL_ERROR, SYSTEM_MESSAGES.ERROR_DELETING_CATEGORY_FIREBASE, {
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
      const data = doc.data();
      allCategory.push({ 
        id: doc.id, 
        title: data.title,
        ...data
      });
    });
    
    // Separar categoria padre de subcategoria
    const parentCategory = allCategory.filter(cat => cat.id.endsWith(SYSTEM_MESSAGES.CATEGORY_ID_SUFFIX));
    const subcategoryMap = new Map();
    
    // Agrupar subcategoria por categoría padre
    allCategory
      .filter(cat => !cat.id.endsWith(SYSTEM_MESSAGES.CATEGORY_ID_SUFFIX))
      .forEach(subcat => {
        const parentNumber = subcat.id.split(SYSTEM_MESSAGES.CATEGORY_ID_SEPARATOR)[1];
        const parentId = `${SYSTEM_MESSAGES.CATEGORY_ID_PREFIX}${parentNumber}${SYSTEM_MESSAGES.CATEGORY_ID_SUFFIX}`;
        
        if (!subcategoryMap.has(parentId)) {
          subcategoryMap.set(parentId, []);
        }
        subcategoryMap.get(parentId).push(subcat);
      });
    
    // Combinar categoria padre con sus subcategoria manteniendo el orden correcto
    const hierarchy = parentCategory.map(parent => {
      const subcategories = subcategoryMap.get(parent.id) || [];
      
      // Estructurar subcategorías
      const structuredSubcategories = subcategories.map(subcat => structureSubcategory(subcat));
      
      // Estructurar categoría padre
      return structureParentCategory({
        ...parent,
        subcategory: structuredSubcategories
      });
    });
    
    logMessage(SYSTEM_MESSAGES.LOG_LEVEL_INFO, SYSTEM_MESSAGES.CATEGORY_HIERARCHY_OBTAINED, {
      totalParentCategory: parentCategory.length,
      totalSubcategory: allCategory.length - parentCategory.length
    });
    
    return hierarchy;
  } catch (error) {
    logMessage(SYSTEM_MESSAGES.LOG_LEVEL_ERROR, SYSTEM_MESSAGES.ERROR_GETTING_HIERARCHY_FIREBASE, {
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
  getAllSubcategory,
  getSubcategorySpecific,
  createCategory,
  createSubcategory,
  updateCategory,
  deleteCategory,
  getCategoryHierarchy,
  generateNextCategoryId,
  generateNextSubcategoryId
};
