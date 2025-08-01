const { RELATIVE_PATHS, LOG_LEVELS } = require('../config/paths.config.js');
const { VALIDATION_MESSAGES, CATEGORIES_MESSAGES, SERVICE_MESSAGES } = require('../utils/messages.utils.js');
const CategoryModel = require(RELATIVE_PATHS.FROM_SERVICES.MODELS_CATEGORY);
const { logMessage } = require(RELATIVE_PATHS.FROM_SERVICES.UTILS_RESPONSE);

/**
 * Obtener todas las categoria padre
 */
const getAllCategory = async () => {
  try {
    const category = await CategoryModel.getAllCategory();
    
    logMessage(LOG_LEVELS.INFO, SERVICE_MESSAGES.SERVICE_CATEGORIES_GET_SUCCESS, {
      [SERVICE_MESSAGES.TOTAL_CATEGORY_FIELD]: category.length,
      [SERVICE_MESSAGES.SERVICE_FIELD]: SERVICE_MESSAGES.SERVICE_NAME_CATEGORY
    });
    
    return category;
  } catch (error) {
    logMessage(LOG_LEVELS.ERROR, SERVICE_MESSAGES.SERVICE_CATEGORIES_GET_ERROR, {
      error: error.message,
      [SERVICE_MESSAGES.SERVICE_FIELD]: SERVICE_MESSAGES.SERVICE_NAME_CATEGORY
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
      logMessage(LOG_LEVELS.INFO, SERVICE_MESSAGES.SERVICE_CATEGORY_GET_SUCCESS, {
        [SERVICE_MESSAGES.CATEGORY_ID_FIELD]: categoryId,
        [SERVICE_MESSAGES.HAS_SUBCATEGORY_FIELD]: !!(category.subcategory && category.subcategory.length > 0),
        [SERVICE_MESSAGES.SERVICE_FIELD]: SERVICE_MESSAGES.SERVICE_NAME_CATEGORY
      });
    }
    
    return category;
  } catch (error) {
    logMessage(LOG_LEVELS.ERROR, SERVICE_MESSAGES.SERVICE_CATEGORY_GET_ERROR, {
      [SERVICE_MESSAGES.CATEGORY_ID_FIELD]: categoryId,
      error: error.message,
      [SERVICE_MESSAGES.SERVICE_FIELD]: SERVICE_MESSAGES.SERVICE_NAME_CATEGORY
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
    
    logMessage(LOG_LEVELS.INFO, SERVICE_MESSAGES.SERVICE_SUBCATEGORY_GET_SUCCESS, {
      [SERVICE_MESSAGES.PARENT_CATEGORY_ID_FIELD]: parentCategoryId,
      [SERVICE_MESSAGES.TOTAL_SUBCATEGORY_FIELD]: subcategory.length,
      [SERVICE_MESSAGES.SERVICE_FIELD]: SERVICE_MESSAGES.SERVICE_NAME_CATEGORY
    });
    
    return subcategory;
  } catch (error) {
    logMessage(LOG_LEVELS.ERROR, SERVICE_MESSAGES.SERVICE_SUBCATEGORY_GET_ERROR, {
      [SERVICE_MESSAGES.PARENT_CATEGORY_ID_FIELD]: parentCategoryId,
      error: error.message,
      [SERVICE_MESSAGES.SERVICE_FIELD]: SERVICE_MESSAGES.SERVICE_NAME_CATEGORY
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
    if (!categoryData.title || categoryData.title.trim() === SERVICE_MESSAGES.EMPTY_STRING) {
      throw new Error(VALIDATION_MESSAGES.CATEGORY_TITLE_REQUIRED);
    }
    
    const newCategory = await CategoryModel.createCategory(categoryData);
    
    logMessage(LOG_LEVELS.INFO, SERVICE_MESSAGES.SERVICE_CATEGORY_CREATE_SUCCESS, {
      [SERVICE_MESSAGES.CATEGORY_ID_FIELD]: newCategory.id,
      [SERVICE_MESSAGES.TITLE_FIELD]: newCategory.title,
      [SERVICE_MESSAGES.SERVICE_FIELD]: SERVICE_MESSAGES.SERVICE_NAME_CATEGORY
    });
    
    return newCategory;
  } catch (error) {
    logMessage(LOG_LEVELS.ERROR, SERVICE_MESSAGES.SERVICE_CATEGORY_CREATE_ERROR, {
      categoryData: categoryData.title || SERVICE_MESSAGES.NO_TITLE_DEFAULT,
      error: error.message,
      [SERVICE_MESSAGES.SERVICE_FIELD]: SERVICE_MESSAGES.SERVICE_NAME_CATEGORY
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
    if (!subcategoryData.title || subcategoryData.title.trim() === SERVICE_MESSAGES.EMPTY_STRING) {
      throw new Error(VALIDATION_MESSAGES.SUBCATEGORY_TITLE_REQUIRED);
    }
    
    if (!parentCategoryId || !parentCategoryId.endsWith(SERVICE_MESSAGES.PARENT_CATEGORY_SUFFIX)) {
      throw new Error(VALIDATION_MESSAGES.CATEGORY_PARENT_ID_INVALID);
    }
    
    const newSubcategory = await CategoryModel.createSubcategory(parentCategoryId, subcategoryData);
    
    logMessage(LOG_LEVELS.INFO, SERVICE_MESSAGES.SERVICE_SUBCATEGORY_CREATE_SUCCESS, {
      [SERVICE_MESSAGES.SUBCATEGORY_ID_FIELD]: newSubcategory.id,
      [SERVICE_MESSAGES.PARENT_CATEGORY_ID_FIELD]: parentCategoryId,
      [SERVICE_MESSAGES.TITLE_FIELD]: newSubcategory.title,
      [SERVICE_MESSAGES.SERVICE_FIELD]: SERVICE_MESSAGES.SERVICE_NAME_CATEGORY
    });
    
    return newSubcategory;
  } catch (error) {
    logMessage(LOG_LEVELS.ERROR, SERVICE_MESSAGES.SERVICE_SUBCATEGORY_CREATE_ERROR, {
      [SERVICE_MESSAGES.PARENT_CATEGORY_ID_FIELD]: parentCategoryId,
      subcategoryData: subcategoryData.title || SERVICE_MESSAGES.NO_TITLE_DEFAULT,
      error: error.message,
      [SERVICE_MESSAGES.SERVICE_FIELD]: SERVICE_MESSAGES.SERVICE_NAME_CATEGORY
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
      throw new Error(SERVICE_MESSAGES.NO_UPDATE_DATA_ERROR);
    }
    
    const updatedCategory = await CategoryModel.updateCategory(categoryId, updateData);
    
    if (updatedCategory) {
      logMessage(LOG_LEVELS.INFO, SERVICE_MESSAGES.SERVICE_CATEGORY_UPDATE_SUCCESS, {
        [SERVICE_MESSAGES.CATEGORY_ID_FIELD]: categoryId,
        [SERVICE_MESSAGES.UPDATED_FIELDS_FIELD]: Object.keys(updateData),
        [SERVICE_MESSAGES.SERVICE_FIELD]: SERVICE_MESSAGES.SERVICE_NAME_CATEGORY
      });
    }
    
    return updatedCategory;
  } catch (error) {
    logMessage(LOG_LEVELS.ERROR, SERVICE_MESSAGES.SERVICE_CATEGORY_UPDATE_ERROR, {
      [SERVICE_MESSAGES.CATEGORY_ID_FIELD]: categoryId,
      updateData: Object.keys(updateData || {}),
      error: error.message,
      [SERVICE_MESSAGES.SERVICE_FIELD]: SERVICE_MESSAGES.SERVICE_NAME_CATEGORY
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
    if (categoryId.endsWith(SERVICE_MESSAGES.PARENT_CATEGORY_SUFFIX) && !deleteSubcategory) {
      const subcategory = await CategoryModel.getSubcategoryByParent(categoryId);
      if (subcategory.length > 0) {
        throw new Error(CATEGORIES_MESSAGES.CANNOT_DELETE_HAS_SUBCATEGORIES);
      }
    }
    
    const result = await CategoryModel.deleteCategory(categoryId, options);
    
    if (result) {
      logMessage(LOG_LEVELS.INFO, SERVICE_MESSAGES.SERVICE_CATEGORY_DELETE_SUCCESS, {
        [SERVICE_MESSAGES.CATEGORY_ID_FIELD]: categoryId,
        [SERVICE_MESSAGES.DELETED_SUBCATEGORY_FIELD]: deleteSubcategory,
        [SERVICE_MESSAGES.SERVICE_FIELD]: SERVICE_MESSAGES.SERVICE_NAME_CATEGORY
      });
    }
    
    return result;
  } catch (error) {
    logMessage(LOG_LEVELS.ERROR, SERVICE_MESSAGES.SERVICE_CATEGORY_DELETE_ERROR, {
      [SERVICE_MESSAGES.CATEGORY_ID_FIELD]: categoryId,
      options,
      error: error.message,
      [SERVICE_MESSAGES.SERVICE_FIELD]: SERVICE_MESSAGES.SERVICE_NAME_CATEGORY
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
    
    logMessage(LOG_LEVELS.INFO, SERVICE_MESSAGES.SERVICE_HIERARCHY_GET_SUCCESS, {
      [SERVICE_MESSAGES.TOTAL_PARENT_CATEGORY_FIELD]: hierarchy.length,
      [SERVICE_MESSAGES.TOTAL_SUBCATEGORY_FIELD]: hierarchy.reduce((acc, cat) => acc + (cat.subcategory?.length || 0), 0),
      [SERVICE_MESSAGES.SERVICE_FIELD]: SERVICE_MESSAGES.SERVICE_NAME_CATEGORY
    });
    
    return hierarchy;
  } catch (error) {
    logMessage(LOG_LEVELS.ERROR, SERVICE_MESSAGES.SERVICE_HIERARCHY_GET_ERROR, {
      error: error.message,
      [SERVICE_MESSAGES.SERVICE_FIELD]: SERVICE_MESSAGES.SERVICE_NAME_CATEGORY
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
