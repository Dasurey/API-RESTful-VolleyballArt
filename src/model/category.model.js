const { db } = require('../config/dataBase.js');
const { 
  getAllDocuments, 
  getDocumentById, 
  createDocument, 
  updateDocument, 
  deleteDocument,
  executeFirebaseFunction,
  executeFirebaseOperation
} = require('../utils/firebase.utils.js');
const { CATEGORIES_MESSAGES } = require('../utils/messages.utils.js');
const { logMessage } = require('../utils/response.utils.js');
const {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  deleteDoc,
} = require('firebase/firestore');

const COLLECTION_NAME = 'category';

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
        return 'CAT-0001-0000';
      }
      
      // Obtener todas las categoria padre (terminan en -0000)
      let maxNumber = 0;
      snapshot.forEach((doc) => {
        const id = doc.id;
        if (id.startsWith('CAT-') && id.endsWith('-0000')) {
          const number = parseInt(id.split('-')[1]);
          if (number > maxNumber) {
            maxNumber = number;
          }
        }
      });
      
      const nextNumber = maxNumber + 1;
      return `CAT-${nextNumber.toString().padStart(4, '0')}-0000`;
    },
    'generateCategoryId',
    COLLECTION_NAME,
    { operation: 'generateParentCategoryId' }
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
      const parentNumber = parentCategoryId.split('-')[1];
      
      const categoryCollection = collection(db, COLLECTION_NAME);
      const snapshot = await getDocs(categoryCollection);
      
      // Buscar todas las subcategoria de esta categoría padre
      let maxSubNumber = 0;
      snapshot.forEach((doc) => {
        const id = doc.id;
        if (id.startsWith(`CAT-${parentNumber}-`) && !id.endsWith('-0000')) {
          const subNumber = parseInt(id.split('-')[2]);
          if (subNumber > maxSubNumber) {
            maxSubNumber = subNumber;
          }
        }
      });
      
      const nextSubNumber = maxSubNumber + 1;
      return `CAT-${parentNumber}-${nextSubNumber.toString().padStart(4, '0')}`;
    },
    'generateSubcategoryId',
    COLLECTION_NAME,
    { 
      operation: 'generateSubcategoryId',
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
    const parentCategory = allCategory.filter(cat => cat.id.endsWith('-0000'));
    
    logMessage('info', '📋 Categorías padre obtenidas', {
      totalCategory: parentCategory.length
    });
    
    return parentCategory;
  } catch (error) {
    logMessage('error', '🚨 Error al obtener categorías de Firebase', {
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
    if (categoryId.endsWith('-0000')) {
      const parentNumber = categoryId.split('-')[1];
      
      // Obtener todas las categorías para filtrar subcategorías
      const categoryCollection = collection(db, COLLECTION_NAME);
      const snapshot = await getDocs(categoryCollection);
      
      const allCategory = [];
      snapshot.forEach((doc) => {
        allCategory.push({ id: doc.id, ...doc.data() });
      });
      
      // Filtrar subcategoria de esta categoría padre
      const subcategory = allCategory.filter(cat => 
        cat.id.startsWith(`CAT-${parentNumber}-`) && !cat.id.endsWith('-0000')
      );
      
      category.subcategory = subcategory;
      
      logMessage('info', '📂 Categoría obtenida con subcategoria', {
        categoryId,
        subcategoryCount: subcategory.length
      });
    }
    
    return category;
  } catch (error) {
    logMessage('error', '🚨 Error al obtener categoría de Firebase', {
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
    const parentNumber = parentCategoryId.split('-')[1];
    
    // Obtener todas las categorías directamente con Firebase v9+
    const categoryCollection = collection(db, COLLECTION_NAME);
    const snapshot = await getDocs(categoryCollection);
    
    const allCategory = [];
    snapshot.forEach((doc) => {
      allCategory.push({ id: doc.id, ...doc.data() });
    });
    
    const subcategory = allCategory.filter(cat => 
      cat.id.startsWith(`CAT-${parentNumber}-`) && !cat.id.endsWith('-0000')
    );
    
    logMessage('info', '📂 Subcategorías obtenidas', {
      parentCategoryId,
      subcategoryCount: subcategory.length
    });
    
    return subcategory;
  } catch (error) {
    logMessage('error', '🚨 Error al obtener subcategorías de Firebase', {
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
  
  logMessage('info', '✅ Categoría padre creada exitosamente', {
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
  
  logMessage('info', '✅ Subcategoría creada exitosamente', {
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
      throw new Error(`Categoría no encontrada con ID: ${categoryId}`);
    }
    
    // Actualizar el documento
    await setDoc(categoryRef, updateData, { merge: true });
    
    // Obtener el documento actualizado
    const updatedSnap = await getDoc(categoryRef);
    const updatedCategory = { id: updatedSnap.id, ...updatedSnap.data() };
    
    logMessage('info', '✅ Categoría actualizada exitosamente', {
      categoryId,
      updatedFields: Object.keys(updateData)
    });
    
    return updatedCategory;
  } catch (error) {
    logMessage('error', '🚨 Error al actualizar categoría de Firebase', {
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
      throw new Error(`Categoría no encontrada con ID: ${categoryId}`);
    }
    
    // Si es una categoría padre y se especifica eliminar subcategorías
    if (categoryId.endsWith('-0000') && deleteSubcategory) {
      const subcategory = await getSubcategoryByParent(categoryId);
      
      // Eliminar todas las subcategorías primero usando Firebase v9+
      for (const subcat of subcategory) {
        const subcatRef = doc(db, COLLECTION_NAME, subcat.id);
        await deleteDoc(subcatRef);
      }
      
      logMessage('info', '🗑️ Subcategorías eliminadas', {
        parentCategoryId: categoryId,
        deletedCount: subcategory.length
      });
    }
    
    // Eliminar la categoría principal usando Firebase v9+
    await deleteDoc(categoryRef);
    
    logMessage('info', '✅ Categoría eliminada exitosamente', {
      categoryId,
      deletedSubcategory: deleteSubcategory
    });
    
    return true;
  } catch (error) {
    logMessage('error', '🚨 Error al eliminar categoría de Firebase', {
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
    const parentCategory = allCategory.filter(cat => cat.id.endsWith('-0000'));
    const subcategoryMap = new Map();
    
    // Agrupar subcategoria por categoría padre
    allCategory
      .filter(cat => !cat.id.endsWith('-0000'))
      .forEach(subcat => {
        const parentNumber = subcat.id.split('-')[1];
        const parentId = `CAT-${parentNumber}-0000`;
        
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
    
    logMessage('info', '🌳 Jerarquía de categoria obtenida', {
      totalParentCategory: parentCategory.length,
      totalSubcategory: allCategory.length - parentCategory.length
    });
    
    return hierarchy;
  } catch (error) {
    logMessage('error', '🚨 Error al obtener jerarquía de categorías de Firebase', {
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
