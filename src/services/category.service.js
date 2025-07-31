const CategoryModel = require('../model/category.model.js');
const { logMessage } = require('../utils/response.utils.js');
const { VALIDATION_MESSAGES, CATEGORIES_MESSAGES } = require('../utils/messages.utils.js');

/**
 * Obtener todas las categoria padre
 */
const getAllCategory = async () => {
  try {
    const category = await CategoryModel.getAllCategory();
    
    logMessage('info', '📋 Servicio: Categorías obtenidas exitosamente', {
      totalCategory: category.length,
      service: 'category'
    });
    
    return category;
  } catch (error) {
    logMessage('error', '🚨 Error en servicio al obtener categoria', {
      error: error.message,
      service: 'category'
    });
    throw error;
  }
};

/**
 * Obtener categoría por ID con subcategoria
 * @param {string} categoryId - ID de la categoría
 */
const getCategoryById = async (categoryId) => {
  try {
    const category = await CategoryModel.getCategoryById(categoryId);
    
    if (category) {
      logMessage('info', '📂 Servicio: Categoría obtenida exitosamente', {
        categoryId,
        hasSubcategory: !!(category.subcategory && category.subcategory.length > 0),
        service: 'category'
      });
    }
    
    return category;
  } catch (error) {
    logMessage('error', '🚨 Error en servicio al obtener categoría por ID', {
      categoryId,
      error: error.message,
      service: 'category'
    });
    throw error;
  }
};

/**
 * Obtener subcategoria de una categoría padre
 * @param {string} parentCategoryId - ID de la categoría padre
 */
const getSubcategoryByParent = async (parentCategoryId) => {
  try {
    const subcategory = await CategoryModel.getSubcategoryByParent(parentCategoryId);
    
    logMessage('info', '📂 Servicio: Subcategoria obtenidas exitosamente', {
      parentCategoryId,
      totalSubcategory: subcategory.length,
      service: 'category'
    });
    
    return subcategory;
  } catch (error) {
    logMessage('error', '🚨 Error en servicio al obtener subcategoria', {
      parentCategoryId,
      error: error.message,
      service: 'category'
    });
    throw error;
  }
};

/**
 * Crear nueva categoría padre
 * @param {Object} categoryData - Datos de la categoría
 */
const createCategory = async (categoryData) => {
  try {
    // Validar datos requeridos
    if (!categoryData.title || categoryData.title.trim() === '') {
      throw new Error(VALIDATION_MESSAGES.CATEGORY_TITLE_REQUIRED);
    }
    
    const newCategory = await CategoryModel.createCategory(categoryData);
    
    logMessage('info', '✅ Servicio: Categoría creada exitosamente', {
      categoryId: newCategory.id,
      title: newCategory.title,
      service: 'category'
    });
    
    return newCategory;
  } catch (error) {
    logMessage('error', '🚨 Error en servicio al crear categoría', {
      categoryData: categoryData.title || 'Sin título',
      error: error.message,
      service: 'category'
    });
    throw error;
  }
};

/**
 * Crear nueva subcategoría
 * @param {string} parentCategoryId - ID de la categoría padre
 * @param {Object} subcategoryData - Datos de la subcategoría
 */
const createSubcategory = async (parentCategoryId, subcategoryData) => {
  try {
    // Validar datos requeridos
    if (!subcategoryData.title || subcategoryData.title.trim() === '') {
      throw new Error(VALIDATION_MESSAGES.SUBCATEGORY_TITLE_REQUIRED);
    }
    
    if (!parentCategoryId || !parentCategoryId.endsWith('-0000')) {
      throw new Error(VALIDATION_MESSAGES.CATEGORY_PARENT_ID_INVALID);
    }
    
    const newSubcategory = await CategoryModel.createSubcategory(parentCategoryId, subcategoryData);
    
    logMessage('info', '✅ Servicio: Subcategoría creada exitosamente', {
      subcategoryId: newSubcategory.id,
      parentCategoryId,
      title: newSubcategory.title,
      service: 'category'
    });
    
    return newSubcategory;
  } catch (error) {
    logMessage('error', '🚨 Error en servicio al crear subcategoría', {
      parentCategoryId,
      subcategoryData: subcategoryData.title || 'Sin título',
      error: error.message,
      service: 'category'
    });
    throw error;
  }
};

/**
 * Actualizar categoría o subcategoría
 * @param {string} categoryId - ID de la categoría
 * @param {Object} updateData - Datos a actualizar
 */
const updateCategory = async (categoryId, updateData) => {
  try {
    // Validar que hay datos para actualizar
    if (!updateData || Object.keys(updateData).length === 0) {
      throw new Error('No hay datos para actualizar');
    }
    
    const updatedCategory = await CategoryModel.updateCategory(categoryId, updateData);
    
    if (updatedCategory) {
      logMessage('info', '✅ Servicio: Categoría actualizada exitosamente', {
        categoryId,
        updatedFields: Object.keys(updateData),
        service: 'category'
      });
    }
    
    return updatedCategory;
  } catch (error) {
    logMessage('error', '🚨 Error en servicio al actualizar categoría', {
      categoryId,
      updateData: Object.keys(updateData || {}),
      error: error.message,
      service: 'category'
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
    
    // Si es categoría padre y no se especifica eliminar subcategoria, verificar que no tenga subcategoria
    if (categoryId.endsWith('-0000') && !deleteSubcategory) {
      const subcategory = await CategoryModel.getSubcategoryByParent(categoryId);
      if (subcategory.length > 0) {
        throw new Error(CATEGORIES_MESSAGES.CANNOT_DELETE_HAS_SUBCATEGORIES);
      }
    }
    
    const result = await CategoryModel.deleteCategory(categoryId, options);
    
    if (result) {
      logMessage('info', '✅ Servicio: Categoría eliminada exitosamente', {
        categoryId,
        deletedSubcategory: deleteSubcategory,
        service: 'category'
      });
    }
    
    return result;
  } catch (error) {
    logMessage('error', '🚨 Error en servicio al eliminar categoría', {
      categoryId,
      options,
      error: error.message,
      service: 'category'
    });
    throw error;
  }
};

/**
 * Obtener jerarquía completa de categoria
 */
const getCategoryHierarchy = async () => {
  try {
    const hierarchy = await CategoryModel.getCategoryHierarchy();
    
    logMessage('info', '🌳 Servicio: Jerarquía de categoria obtenida exitosamente', {
      totalParentCategory: hierarchy.length,
      totalSubcategory: hierarchy.reduce((acc, cat) => acc + (cat.subcategory?.length || 0), 0),
      service: 'category'
    });
    
    return hierarchy;
  } catch (error) {
    logMessage('error', '🚨 Error en servicio al obtener jerarquía de categoria', {
      error: error.message,
      service: 'category'
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
  getCategoryHierarchy
};
