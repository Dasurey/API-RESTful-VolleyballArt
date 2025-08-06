const { db } = require('../config/db.config');
const { getDocumentById, executeFirebaseOperation } = require('../utils/firebase.utils');
const { logDatabase } = require('../utils/log.utils');
const { generateNextCategoryId, generateNextSubcategoryId } = require('../services/category.service');
const { processQuery, getQueryProcessingInfo } = require('../middlewares/query.middleware');
const { InternalServerError } = require('../utils/error.utils');
const { collection, doc, getDoc, getDocs, setDoc, deleteDoc } = require('firebase/firestore');

const COLLECTION_NAME = 'category';

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
    isParent: true,
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
    img: {
      src: subcategoryData.img?.src,
      alt: subcategoryData.img?.alt
    } || [],
    text: subcategoryData.text || '',
    parentCategoryId: subcategoryData.parentCategoryId,
    createdAt: subcategoryData.createdAt,
    updatedAt: subcategoryData.updatedAt
  };
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
    let parentCategory = allCategory.filter(cat => cat.id.endsWith('-0000'));

    // Aplicar procesamiento de consulta usando utilidades
    const processedCategories = processQuery(parentCategory, queryProcessor);

    // Estructurar categorías con orden específico
    const structuredCategories = processedCategories.map(category => structureParentCategory(category));

    // Obtener información de procesamiento
    const processingInfo = getQueryProcessingInfo(queryProcessor);

    logDatabase('📋 Categorías padre obtenidas', {
      totalCategory: structuredCategories.length,
      searchApplied: processingInfo.searchApplied,
      filtersApplied: processingInfo.filtersApplied
    });

    return structuredCategories;
  } catch (error) {
    throw new InternalServerError(
      undefined, // Usar mensaje por defecto
      { operation: 'getAllCategory', originalError: error.message, stack: error.stack }
    );
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
    if (categoryId.endsWith('-0000')) {
      const parentNumber = categoryId.split('-')[1];

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
        cat.id.startsWith(`CAT-${parentNumber}-`) && !cat.id.endsWith('-0000')
      );

      // Estructurar subcategorías con orden específico
      category.subcategory = subcategory.map(subcat => structureSubcategory(subcat));

      logDatabase('📂 Categoría obtenida con subcategorías', {
        categoryId,
        subcategoryCount: subcategory.length
      });
    }

    // Estructurar la categoría principal
    return structureParentCategory(category);
  } catch (error) {
    throw new InternalServerError(
      undefined, // Usar mensaje por defecto
      { operation: 'getCategoryById', categoryId, originalError: error.message, stack: error.stack }
    );
  }
};

/**
 * Obtener todas las subcategoria de una categoría padre
 * @param {string} parentCategoryId - ID de la categoría padre
 * @param {object} queryProcessor - Procesador de consultas
 */
const getSubcategoryByParent = async (parentCategoryId, queryProcessor = null) => {
  try {
    const parentNumber = parentCategoryId.split('-')[1];

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
      cat.id.startsWith(`CAT-${parentNumber}-`) && !cat.id.endsWith('-0000')
    );

    // Aplicar procesamiento de consulta usando utilidades
    const processedSubcategories = processQuery(subcategory, queryProcessor);

    // Estructurar subcategorías con orden específico
    const structuredSubcategories = processedSubcategories.map(subcat => structureSubcategory(subcat));

    // Obtener información de procesamiento
    const processingInfo = getQueryProcessingInfo(queryProcessor);

    logDatabase('📂 Subcategorías obtenidas', {
      parentCategoryId,
      subcategoryCount: structuredSubcategories.length,
      searchApplied: processingInfo.searchApplied,
      filtersApplied: processingInfo.filtersApplied
    });

    return structuredSubcategories;
  } catch (error) {
    throw new InternalServerError(
      undefined, // Usar mensaje por defecto
      { operation: 'getSubcategoryByParent', parentCategoryId, originalError: error.message, stack: error.stack }
    );
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
      cat.id.startsWith('CAT-') && !cat.id.endsWith('-0000')
    );

    // Aplicar procesamiento de consulta usando utilidades
    const processedSubcategories = processQuery(subcategory, queryProcessor);

    // Estructurar subcategorías con orden específico
    const structuredSubcategories = processedSubcategories.map(subcat => structureSubcategory(subcat));

    // Obtener información de procesamiento
    const processingInfo = getQueryProcessingInfo(queryProcessor);

    logDatabase('📂 Subcategorías obtenidas', {
      subcategoryCount: structuredSubcategories.length,
      searchApplied: processingInfo.searchApplied,
      filtersApplied: processingInfo.filtersApplied
    });

    return structuredSubcategories;
  } catch (error) {
    throw new InternalServerError(
      undefined, // Usar mensaje por defecto
      { operation: 'getAllSubcategory', originalError: error.message, stack: error.stack }
    );
  }
};

/**
 * Obtener subcategoría específica por ID
 * @param {string} parentCategoryId - ID de la categoría padre
 * @param {string} subcategoryId - ID de la subcategoría
 */
const getSubcategorySpecific = async (parentCategoryId, subcategoryId) => {
  try {
    // Obtener documento directamente por ID
    const categoryRef = doc(db, COLLECTION_NAME, subcategoryId);
    const docSnap = await getDoc(categoryRef);

    if (!docSnap.exists()) {
      logDatabase('🚨 Subcategoría no encontrada', {
        parentCategoryId,
        subcategoryId
      });
      return null; // Solo retornar null, no lanzar errores
    }

    const data = docSnap.data();
    const subcategory = {
      id: docSnap.id,
      title: data.title,
      ...data
    };

    logDatabase('📂 Subcategorías obtenidas', {
      parentCategoryId,
      subcategoryId
    });

    // Estructurar subcategoría con orden específico
    return structureSubcategory(subcategory);
  } catch (error) {
    // Solo para errores reales de Firebase/Sistema
    throw new InternalServerError(
      undefined, // Usar mensaje por defecto
      { operation: 'getSubcategorySpecific', parentCategoryId, subcategoryId, originalError: error.message, stack: error.stack }
    );
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

  logDatabase('✅ Categoría padre creada exitosamente', {
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
    return null; // Solo retornar null, el servicio decidirá el error
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

  logDatabase('✅ Subcategoría creada exitosamente', {
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
      return null; // Solo retornar null, el servicio decidirá el error
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

    logDatabase('✅ Categoría actualizada exitosamente', {
      categoryId,
      updatedFields: Object.keys(updateData)
    });

    // Determinar si es categoría padre o subcategoría y estructurar en consecuencia
    if (categoryId.endsWith('-0000')) {
      return structureParentCategory(updatedCategory);
    } else {
      return structureSubcategory(updatedCategory);
    }
  } catch (error) {
    // Solo para errores reales de Firebase/Sistema
    throw new InternalServerError(
      undefined, // Usar mensaje por defecto
      { operation: 'updateCategory', categoryId, originalError: error.message, stack: error.stack }
    );
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
      return null; // Solo retornar null, el servicio decidirá el error
    }

    // Si es una categoría padre y se especifica eliminar subcategorías
    if (categoryId.endsWith('-0000') && deleteSubcategory) {
      const subcategory = await getSubcategoryByParent(categoryId);

      // Eliminar todas las subcategorías primero usando Firebase v9+
      for (const subcat of subcategory) {
        const subcatRef = doc(db, COLLECTION_NAME, subcat.id);
        await deleteDoc(subcatRef);
      }

      logDatabase('🗑️ Subcategorías eliminadas exitosamente', {
        parentCategoryId: categoryId,
        deletedCount: subcategory.length
      });
    }

    // Eliminar la categoría principal usando Firebase v9+
    await deleteDoc(categoryRef);

    logDatabase('🗑️ Categoría eliminada exitosamente', {
      categoryId,
      deletedSubcategory: deleteSubcategory
    });

    return true;
  } catch (error) {
    // Solo para errores reales de Firebase/Sistema
    throw new InternalServerError(
      undefined, // Usar mensaje por defecto
      { operation: 'deleteCategory', categoryId, originalError: error.message, stack: error.stack }
    );
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

    logDatabase('🌳 Jerarquía de categoría obtenida exitosamente', {
      totalParentCategory: parentCategory.length,
      totalSubcategory: allCategory.length - parentCategory.length
    });

    return hierarchy;
  } catch (error) {
    throw new InternalServerError(
      undefined, // Usar mensaje por defecto
      { operation: 'getCategoryHierarchy', originalError: error.message, stack: error.stack }
    );
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
