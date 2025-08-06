const CategoryModel = require('../model/category.model');
const { logAndExecute } = require('../utils/log.utils');
const { ValidationError, NotFoundError, ConflictError, InternalServerError } = require('../utils/error.utils');

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
 * Obtener todas las categoria padre
 */
const getAllCategory = async (queryProcessor = null) => {
  try {
    const category = await CategoryModel.getAllCategory(queryProcessor);
    
    logAndExecute('info', '📋 Categorías obtenidas exitosamente', {
      totalCategory: category.length,
      service: 'category'
    }, 'API');
    
    return category;
  } catch (error) {
    throw new InternalServerError(
      undefined, // Usar mensaje por defecto
      { operation: 'getAllCategory', originalError: error.message, service: 'category' }
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
    
    // Si no se encuentra la categoría, lanzar NotFoundError (404)
    if (!category) {
      throw new NotFoundError(`🔍 Categoría con ID ${categoryId} no encontrada`);
    }
    
    logAndExecute('info', '📂 Categoría obtenida exitosamente', {
      categoryId: categoryId,
      hasSubcategory: !!(category.subcategory && category.subcategory.length > 0),
      service: 'category'
    });
    
    return category;
  } catch (error) {
    // Si ya es un error de validación/no encontrado, re-lanzarlo
    if (error instanceof NotFoundError || error instanceof ValidationError) {
      throw error;
    }
    
    // Solo para errores internos reales
    throw new InternalServerError(
      undefined, // Usar mensaje por defecto
      { operation: 'getCategoryById', categoryId, originalError: error.message, service: 'category' }
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
    
    logAndExecute('info', '📂 Subcategoria obtenidas exitosamente', {
      parentCategoryId: parentCategoryId,
      totalSubcategory: subcategory.length,
      service: 'category'
    });
    
    return subcategory;
  } catch (error) {
    throw new InternalServerError(
      undefined, // Usar mensaje por defecto
      { operation: 'getSubcategoryByParent', parentCategoryId, originalError: error.message, service: 'category' }
    );
  }
};

/**
 * Obtener todas las subcategorías
 */
const getAllSubcategory = async (queryProcessor = null) => {
  try {
    const subcategory = await CategoryModel.getAllSubcategory(queryProcessor);
    
    logAndExecute('info', '📂 Subcategoria obtenidas exitosamente', {
      totalSubcategory: subcategory.length,
      service: 'category'
    });
    
    return subcategory;
  } catch (error) {
    throw new InternalServerError(
      undefined, // Usar mensaje por defecto
      { operation: 'getAllSubcategory', originalError: error.message, service: 'category' }
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
    // Validar que subcategoryId corresponde al parentCategoryId
    const parentNumber = parentCategoryId.split('-')[1];
    if (!subcategoryId.startsWith(`CAT-${parentNumber}-`)) {
      throw new ValidationError(`La subcategoría ${subcategoryId} no pertenece a la categoría padre ${parentCategoryId}`);
    }
    
    const subcategory = await CategoryModel.getSubcategorySpecific(parentCategoryId, subcategoryId);
    
    // Si no se encuentra la subcategoría, lanzar NotFoundError (404)
    if (!subcategory) {
      throw new NotFoundError(`🔍 Subcategoría con ID ${subcategoryId} no encontrada en categoría padre ${parentCategoryId}`);
    }
    
    logAndExecute('info', '📂 Subcategoria obtenidas exitosamente', {
      parentCategoryId: parentCategoryId,
      subcategoryId: subcategoryId,
      service: 'category'
    });
    
    return subcategory;
  } catch (error) {
    // Si ya es un error de validación/no encontrado, re-lanzarlo
    if (error instanceof NotFoundError || error instanceof ValidationError) {
      throw error;
    }
    
    // Solo para errores internos reales
    throw new InternalServerError(
      undefined, // Usar mensaje por defecto
      { operation: 'getSubcategorySpecific', parentCategoryId, subcategoryId, originalError: error.message, service: 'category' }
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
    if (!categoryData.title || categoryData.title.trim() === '') {
      throw new ValidationError('El título de la categoría es obligatorio');
    }
    
    // Extraer subcategorías si existen
    const { subcategory, ...parentCategoryData } = categoryData;
    
    // Crear la categoría padre primero
    const newCategory = await CategoryModel.createCategory(parentCategoryData);
    
    logAndExecute('info', '✅ Categoría creada exitosamente', {
      categoryId: newCategory.id,
      title: newCategory.title,
      service: 'category'
    });
    
    // Si hay subcategorías, crearlas
    if (subcategory && Array.isArray(subcategory) && subcategory.length > 0) {
      const createdSubcategories = [];
      
      for (const subcategoryData of subcategory) {
        try {
          const newSubcategory = await CategoryModel.createSubcategory(newCategory.id, subcategoryData);
          createdSubcategories.push(newSubcategory);
          
          logAndExecute('info', '✅ Subcategoría creada exitosamente', {
            subcategoryId: newSubcategory.id,
            parentCategoryId: newCategory.id,
            title: newSubcategory.title,
            service: 'category'
          });
        } catch (subcategoryError) {
          logAndExecute('error', '🚨 Error en servicio al crear subcategoría', {
            parentCategoryId: newCategory.id,
            subcategoryData: subcategoryData.title || 'Sin título',
            error: subcategoryError.message,
            service: 'category'
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
    // Si ya es un error de validación/no encontrado, re-lanzarlo
    if (error instanceof NotFoundError || error instanceof ValidationError) {
      throw error;
    }
    
    // Solo para errores internos reales
    throw new InternalServerError(
      undefined, // Usar mensaje por defecto
      { operation: 'createCategory', categoryTitle: categoryData.title || 'Sin título', originalError: error.message, service: 'category' }
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
    if (!subcategoryData.title || subcategoryData.title.trim() === '') {
      throw new ValidationError('El título de la subcategoría es obligatorio');
    }
    
    if (!parentCategoryId || !parentCategoryId.endsWith('-0000')) {
      throw new ValidationError('ID de categoría padre inválido');
    }
    
    const newSubcategory = await CategoryModel.createSubcategory(parentCategoryId, subcategoryData);
    
    // Si el modelo retorna null, significa que la categoría padre no existe
    if (!newSubcategory) {
      throw new NotFoundError(`🔍 Categoría padre con ID ${parentCategoryId} no encontrada`);
    }
    
    logAndExecute('info', '✅ Subcategoría creada exitosamente', {
      subcategoryId: newSubcategory.id,
      parentCategoryId: parentCategoryId,
      title: newSubcategory.title,
      service: 'category'
    });
    
    return newSubcategory;
  } catch (error) {
    // Si ya es un error de validación/no encontrado, re-lanzarlo
    if (error instanceof NotFoundError || error instanceof ValidationError) {
      throw error;
    }
    
    // Solo para errores internos reales
    throw new InternalServerError(
      undefined, // Usar mensaje por defecto
      { operation: 'createSubcategory', parentCategoryId, subcategoryTitle: subcategoryData.title || 'Sin título', originalError: error.message, service: 'category' }
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
      throw new ValidationError('No se proporcionaron datos para actualizar');
    }
    
    const updatedCategory = await CategoryModel.updateCategory(categoryId, updateData);
    
    // Si el modelo retorna null, significa que la categoría no existe
    if (!updatedCategory) {
      throw new NotFoundError(`🔍 Categoría con ID ${categoryId} no encontrada para actualizar`);
    }
    
    logAndExecute('info', '✅ Categoría actualizada exitosamente', {
      categoryId: categoryId,
      updatedFields: Object.keys(updateData),
      service: 'category'
    });
    
    return updatedCategory;
  } catch (error) {
    // Si ya es un error de validación/no encontrado, re-lanzarlo
    if (error instanceof NotFoundError || error instanceof ValidationError) {
      throw error;
    }
    
    // Solo para errores internos reales
    throw new InternalServerError(
      undefined, // Usar mensaje por defecto
      { operation: 'updateCategory', categoryId, updateFields: Object.keys(updateData || {}), originalError: error.message, service: 'category' }
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
    if (categoryId.endsWith('-0000') && !deleteSubcategory) {
      const subcategory = await CategoryModel.getSubcategoryByParent(categoryId);
      if (subcategory.length > 0) {
        throw new ConflictError('No se puede eliminar la categoría padre porque tiene subcategorías asociadas');
      }
    }
    
    const result = await CategoryModel.deleteCategory(categoryId, options);
    
    // Si el modelo retorna null, significa que la categoría no existe
    if (!result) {
      throw new NotFoundError(`🔍 Categoría con ID ${categoryId} no encontrada para eliminar`);
    }
    
    logAndExecute('info', '✅ Categoría eliminada exitosamente', {
      categoryId: categoryId,
      deletedSubcategory: deleteSubcategory,
      service: 'category'
    });
    
    return result;
  } catch (error) {
    // Si ya es un error de validación/no encontrado/conflicto, re-lanzarlo
    if (error instanceof NotFoundError || error instanceof ValidationError || error instanceof ConflictError) {
      throw error;
    }
    
    // Solo para errores internos reales
    throw new InternalServerError(
      undefined, // Usar mensaje por defecto
      { operation: 'deleteCategory', categoryId, options, originalError: error.message, service: 'category' }
    );
  }
};

/**
 * Obtener jerarquía completa de categoria
 */
const getCategoryHierarchy = async () => {
  try {
    const hierarchy = await CategoryModel.getCategoryHierarchy();

    logAndExecute('info', '🌳 Jerarquía de categoría obtenida exitosamente', {
      totalParentCategory: hierarchy.length,
      totalSubcategory: hierarchy.reduce((acc, cat) => acc + (cat.subcategory?.length || 0), 0),
      service: 'category'
    });
    
    return hierarchy;
  } catch (error) {
    throw new InternalServerError(
      undefined, // Usar mensaje por defecto
      { operation: 'getCategoryHierarchy', originalError: error.message, service: 'category' }
    );
  }
};

module.exports = {
  generateNextSubcategoryId, 
  generateNextCategoryId,
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
