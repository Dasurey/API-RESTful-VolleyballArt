const CategoryModel = require('../model/category.model');
const { dbServiceWrapper } = require('../middlewares/async');
const { processQuery } = require('../utils/query');

/**
 * Obtener subcategoría específica por ID
 * @param {string} parentCategoryId - ID de la categoría padre
 * @param {string} subcategoryId - ID de la subcategoría
 */
const getSpecificSubcategory = dbServiceWrapper(async (parentCategoryId, subcategoryId, queryProcessor = null) => {
  // Validar que subcategoryId corresponde al parentCategoryId
  const parentNumber = parentCategoryId.split('-')[1];
  if (!subcategoryId.startsWith(`CAT-${parentNumber}-`)) {
    return null;  // El controlador manejará este caso como un error de validación
  }
  
  const subcategory = await CategoryModel.getSubcategorySpecific(parentCategoryId, subcategoryId);
  if (!subcategory) return null;  // El controlador manejará este caso como un 404
  
  return processQuery([subcategory], queryProcessor)?.[0] || subcategory;
}, 'getSpecificSubcategory');

/**
 * Operaciones de lectura de categorías
 */
const categoryQueries = {
  /**
   * Obtener subcategoría específica
   */
  getSpecificSubcategory,
  
  /**
   * Obtener todas las categorías padre
   */
  getAllParent: dbServiceWrapper(async (queryProcessor = null) => {
    const categories = await CategoryModel.getAllCategory();
    return processQuery(categories, queryProcessor);
  }, 'getAllParent'),

  /**
   * Obtener categoría por ID con sus subcategorías
   */
  getById: dbServiceWrapper(async (categoryId) => {
    return CategoryModel.getCategoryById(categoryId);
  }, 'getById'),

  /**
   * Obtener subcategorías de una categoría padre
   */
  getSubcategories: dbServiceWrapper(async (parentId, queryProcessor = null) => {
    const subcategories = await CategoryModel.getSubcategoryByParent(parentId);
    return processQuery(subcategories, queryProcessor);
  }, 'getSubcategories'),

  /**
   * Obtener todas las subcategorías
   */
  getAllSubcategories: dbServiceWrapper(async (queryProcessor = null) => {
    const subcategories = await CategoryModel.getAllSubcategory();
    return processQuery(subcategories, queryProcessor);
  }, 'getAllSubcategories')
};



/**
 * Operaciones de creación de categorías
 */
const categoryCreation = {
  /**
   * Crear nueva categoría padre con subcategorías opcionales
   */
  createParent: dbServiceWrapper(async (categoryData) => {
    const { subcategories, ...parentData } = categoryData;
    const newId = await CategoryModel.generateParentId();
    const newCategory = await CategoryModel.createCategory(newId, parentData);

    if (Array.isArray(subcategories) && subcategories.length > 0) {
      const createdSubcategories = [];
      for (const subData of subcategories) {
        const subId = await CategoryModel.generateSubcategoryId(newId);
        const newSub = await CategoryModel.createSubcategory(subId, {
          ...subData,
          parentCategoryId: newId
        });
        createdSubcategories.push(newSub);
      }

      if (createdSubcategories.length > 0) {
        newCategory.subcategories = createdSubcategories;
      }
    }

    return newCategory;
  }, 'createParent'),

  /**
   * Crear nueva subcategoría
   */
  createSubcategory: dbServiceWrapper(async (parentId, subcategoryData) => {
    // Verificar que existe la categoría padre
    const parent = await CategoryModel.getCategoryById(parentId);
    if (!parent) return null;

    const newId = await CategoryModel.generateSubcategoryId(parentId);
    return CategoryModel.createSubcategory(newId, {
      ...subcategoryData,
      parentCategoryId: parentId
    });
  }, 'createSubcategory')
};

/**
 * Operaciones de modificación de categorías
 */
const categoryModification = {
  /**
   * Actualizar categoría o subcategoría
   */
  update: dbServiceWrapper(async (categoryId, updateData) => {
    if (!updateData || Object.keys(updateData).length === 0) return null;
    return CategoryModel.updateCategory(categoryId, updateData);
  }, 'update'),

  /**
   * Eliminar categoría o subcategoría
   */
  delete: dbServiceWrapper(async (categoryId, options = {}) => {
    const { deleteSubcategories = false } = options;

    // Si es categoría padre, verificar subcategorías
    if (categoryId.endsWith('-0000') && !deleteSubcategories) {
      const subs = await CategoryModel.getSubcategoryByParent(categoryId);
      if (subs.length > 0) return null;
    }

    return CategoryModel.deleteCategory(categoryId, options);
  }, 'delete')
};

/**
 * Obtener jerarquía completa de categoria
 */
const getCategoryHierarchy = dbServiceWrapper(async (queryProcessor = null) => {
  const hierarchy = await CategoryModel.getCategoryHierarchy();
  return processQuery(hierarchy, queryProcessor);
}, 'getCategoryHierarchy');

// Exportar todas las operaciones organizadas
module.exports = {
  queries: {
    ...categoryQueries,
    hierarchy: getCategoryHierarchy
  },
  creation: categoryCreation,
  modification: categoryModification
};
