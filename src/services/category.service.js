const { RELATIVE_PATHS, LOG_LEVELS } = require('../config/paths.config.js');
const { VALIDATION_MESSAGES, CATEGORIES_MESSAGES, SERVICE_MESSAGES } = require('../utils/messages.utils.js');
const CategoryModel = require(RELATIVE_PATHS.FROM_SERVICES.MODELS_CATEGORY);
const { logMessage } = require(RELATIVE_PATHS.FROM_SERVICES.UTILS_RESPONSE);
const { 
  ValidationError, 
  NotFoundError, 
  ConflictError, 
  InternalServerError 
} = require('../utils/error.utils.js');

/**
 * Obtener todas las categoria padre
 */
const getAllCategory = async (queryProcessor = null) => {
  try {
    const category = await CategoryModel.getAllCategory(queryProcessor);
    
    logMessage(LOG_LEVELS.INFO, SERVICE_MESSAGES.SERVICE_CATEGORIES_GET_SUCCESS, {
      [SERVICE_MESSAGES.TOTAL_CATEGORY_FIELD]: category.length,
      [SERVICE_MESSAGES.SERVICE_FIELD]: SERVICE_MESSAGES.SERVICE_NAME_CATEGORY
    });
    
    return category;
  } catch (error) {
    throw new InternalServerError(
      undefined, // Usar mensaje por defecto
      { operation: 'getAllCategory', originalError: error.message, service: SERVICE_MESSAGES.SERVICE_NAME_CATEGORY }
    );
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
    throw new InternalServerError(
      undefined, // Usar mensaje por defecto
      { operation: 'getCategoryById', categoryId, originalError: error.message, service: SERVICE_MESSAGES.SERVICE_NAME_CATEGORY }
    );
  }
};

/**
 * Obtener subcategoria de una categoría padre
 * @param {string} parentCategoryId - ID de la categoría padre
 * @param {object} queryProcessor - Procesador de consultas
 */
const getSubcategoryByParent = async (parentCategoryId, queryProcessor = null) => {
  try {
    const subcategory = await CategoryModel.getSubcategoryByParent(parentCategoryId, queryProcessor);
    
    logMessage(LOG_LEVELS.INFO, SERVICE_MESSAGES.SERVICE_SUBCATEGORY_GET_SUCCESS, {
      [SERVICE_MESSAGES.PARENT_CATEGORY_ID_FIELD]: parentCategoryId,
      [SERVICE_MESSAGES.TOTAL_SUBCATEGORY_FIELD]: subcategory.length,
      [SERVICE_MESSAGES.SERVICE_FIELD]: SERVICE_MESSAGES.SERVICE_NAME_CATEGORY
    });
    
    return subcategory;
  } catch (error) {
    throw new InternalServerError(
      undefined, // Usar mensaje por defecto
      { operation: 'getSubcategoryByParent', parentCategoryId, originalError: error.message, service: SERVICE_MESSAGES.SERVICE_NAME_CATEGORY }
    );
  }
};

/**
 * Obtener todas las subcategorías
 */
const getAllSubcategory = async (queryProcessor = null) => {
  try {
    const subcategory = await CategoryModel.getAllSubcategory(queryProcessor);
    
    logMessage(LOG_LEVELS.INFO, SERVICE_MESSAGES.SERVICE_SUBCATEGORY_GET_SUCCESS, {
      [SERVICE_MESSAGES.TOTAL_SUBCATEGORY_FIELD]: subcategory.length,
      [SERVICE_MESSAGES.SERVICE_FIELD]: SERVICE_MESSAGES.SERVICE_NAME_CATEGORY
    });
    
    return subcategory;
  } catch (error) {
    throw new InternalServerError(
      undefined, // Usar mensaje por defecto
      { operation: 'getAllSubcategory', originalError: error.message, service: SERVICE_MESSAGES.SERVICE_NAME_CATEGORY }
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
    const subcategory = await CategoryModel.getSubcategorySpecific(parentCategoryId, subcategoryId);
    
    if (subcategory) {
      logMessage(LOG_LEVELS.INFO, SERVICE_MESSAGES.SERVICE_SUBCATEGORY_GET_SUCCESS, {
        [SERVICE_MESSAGES.PARENT_CATEGORY_ID_FIELD]: parentCategoryId,
        [SERVICE_MESSAGES.SUBCATEGORY_ID_FIELD]: subcategoryId,
        [SERVICE_MESSAGES.SERVICE_FIELD]: SERVICE_MESSAGES.SERVICE_NAME_CATEGORY
      });
    }
    
    return subcategory;
  } catch (error) {
    throw new InternalServerError(
      undefined, // Usar mensaje por defecto
      { operation: 'getSubcategorySpecific', parentCategoryId, subcategoryId, originalError: error.message, service: SERVICE_MESSAGES.SERVICE_NAME_CATEGORY }
    );
  }
};

/**
 * Crear nueva categoría padre (opcionalmente con subcategorías)
 * @param {Object} categoryData - Datos de la categoría
 */
const createCategory = async (categoryData) => {
  try {
    // Validar datos requeridos
    if (!categoryData.title || categoryData.title.trim() === SERVICE_MESSAGES.EMPTY_STRING) {
      throw new ValidationError();
    }
    
    // Extraer subcategorías si existen
    const { subcategory, ...parentCategoryData } = categoryData;
    
    // Crear la categoría padre primero
    const newCategory = await CategoryModel.createCategory(parentCategoryData);
    
    logMessage(LOG_LEVELS.INFO, SERVICE_MESSAGES.SERVICE_CATEGORY_CREATE_SUCCESS, {
      [SERVICE_MESSAGES.CATEGORY_ID_FIELD]: newCategory.id,
      [SERVICE_MESSAGES.TITLE_FIELD]: newCategory.title,
      [SERVICE_MESSAGES.SERVICE_FIELD]: SERVICE_MESSAGES.SERVICE_NAME_CATEGORY
    });
    
    // Si hay subcategorías, crearlas
    if (subcategory && Array.isArray(subcategory) && subcategory.length > 0) {
      const createdSubcategories = [];
      
      for (const subcategoryData of subcategory) {
        try {
          const newSubcategory = await CategoryModel.createSubcategory(newCategory.id, subcategoryData);
          createdSubcategories.push(newSubcategory);
          
          logMessage(LOG_LEVELS.INFO, SERVICE_MESSAGES.SERVICE_SUBCATEGORY_CREATE_SUCCESS, {
            [SERVICE_MESSAGES.SUBCATEGORY_ID_FIELD]: newSubcategory.id,
            [SERVICE_MESSAGES.PARENT_CATEGORY_ID_FIELD]: newCategory.id,
            [SERVICE_MESSAGES.TITLE_FIELD]: newSubcategory.title,
            [SERVICE_MESSAGES.SERVICE_FIELD]: SERVICE_MESSAGES.SERVICE_NAME_CATEGORY
          });
        } catch (subcategoryError) {
          logMessage(LOG_LEVELS.ERROR, SERVICE_MESSAGES.SERVICE_SUBCATEGORY_CREATE_ERROR, {
            [SERVICE_MESSAGES.PARENT_CATEGORY_ID_FIELD]: newCategory.id,
            subcategoryData: subcategoryData.title || SERVICE_MESSAGES.NO_TITLE_DEFAULT,
            error: subcategoryError.message,
            [SERVICE_MESSAGES.SERVICE_FIELD]: SERVICE_MESSAGES.SERVICE_NAME_CATEGORY
          });
          // Continuar con las demás subcategorías aunque una falle
        }
      }
      
      // Agregar las subcategorías creadas a la respuesta
      if (createdSubcategories.length > 0) {
        newCategory.subcategory = createdSubcategories;
      }
    }
    
    return newCategory;
  } catch (error) {
    throw new InternalServerError(
      undefined, // Usar mensaje por defecto
      { operation: 'createCategory', categoryTitle: categoryData.title || SERVICE_MESSAGES.NO_TITLE_DEFAULT, originalError: error.message, service: SERVICE_MESSAGES.SERVICE_NAME_CATEGORY }
    );
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
      throw new ValidationError();
    }
    
    if (!parentCategoryId || !parentCategoryId.endsWith(SERVICE_MESSAGES.PARENT_CATEGORY_SUFFIX)) {
      throw new ValidationError();
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
    throw new InternalServerError(
      undefined, // Usar mensaje por defecto
      { operation: 'createSubcategory', parentCategoryId, subcategoryTitle: subcategoryData.title || SERVICE_MESSAGES.NO_TITLE_DEFAULT, originalError: error.message, service: SERVICE_MESSAGES.SERVICE_NAME_CATEGORY }
    );
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
      throw new ValidationError();
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
    throw new InternalServerError(
      undefined, // Usar mensaje por defecto
      { operation: 'updateCategory', categoryId, updateFields: Object.keys(updateData || {}), originalError: error.message, service: SERVICE_MESSAGES.SERVICE_NAME_CATEGORY }
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
    
    // Si es categoría padre y no se especifica eliminar subcategoria, verificar que no tenga subcategoria
    if (categoryId.endsWith(SERVICE_MESSAGES.PARENT_CATEGORY_SUFFIX) && !deleteSubcategory) {
      const subcategory = await CategoryModel.getSubcategoryByParent(categoryId);
      if (subcategory.length > 0) {
        throw new ConflictError();
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
    throw new InternalServerError(
      undefined, // Usar mensaje por defecto
      { operation: 'deleteCategory', categoryId, options, originalError: error.message, service: SERVICE_MESSAGES.SERVICE_NAME_CATEGORY }
    );
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
    throw new InternalServerError(
      undefined, // Usar mensaje por defecto
      { operation: 'getCategoryHierarchy', originalError: error.message, service: SERVICE_MESSAGES.SERVICE_NAME_CATEGORY }
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
  getCategoryHierarchy
};
