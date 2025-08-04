const { RELATIVE_PATHS } = require('../config/paths.config.js');
const { CATEGORIES_MESSAGES, CATEGORY_CONSTANTS } = require('../utils/messages.utils.js');
const CategoryService = require(RELATIVE_PATHS.FROM_CONTROLLERS.SERVICES_CATEGORY);
const { controllerWrapper } = require('../utils/async.utils.js');
const { 
  ValidationError, 
  NotFoundError, 
  ConflictError, 
  InternalServerError 
} = require('../utils/error.utils.js');

/**
 * Obtener todas las categoria padre
 */
const getAllCategories = controllerWrapper(async (req, res) => {
  const categories = await CategoryService.getAllCategories();
  
  if (!categories || categories.length === 0) {
    throw new NotFoundError();
  }
  
  res.status(200).json({
    success: true,
    message: CATEGORIES_MESSAGES.GET_ALL_SUCCESS,
    resource: CATEGORIES_MESSAGES.RESOURCE_CATEGORIES,
    data: categories
  });
});

const getAllCategory = controllerWrapper(async (req, res) => {
  const categories = await CategoryService.getAllCategory(req.queryProcessor);
  
  if (!categories || categories.length === 0) {
    throw new NotFoundError();
  }
  
  res.status(200).json({
    success: true,
    message: CATEGORIES_MESSAGES.GET_ALL_SUCCESS,
    resource: CATEGORIES_MESSAGES.RESOURCE_CATEGORIES,
    data: categories
  });
});

/**
 * Obtener categoría por ID con subcategoria
 */
const getCategoryById = controllerWrapper(async (req, res) => {
  const { id } = req.params;
  
  const category = await CategoryService.getCategoryById(id);
  
  if (!category) {
    throw new NotFoundError();
  }
  
  res.status(200).json({
    success: true,
    message: CATEGORIES_MESSAGES.GET_BY_ID_SUCCESS,
    resource: CATEGORY_CONSTANTS.CATEGORY_SINGULAR,
    data: category
  });
});

/**
 * Obtener subcategoria de una categoría padre
 */
const getSubcategoryByParent = controllerWrapper(async (req, res) => {
  const { parentId } = req.params;
  
  const subcategories = await CategoryService.getSubcategoryByParent(parentId, req.queryProcessor);
  
  if (!subcategories || subcategories.length === 0) {
    throw new NotFoundError();
  }
  
  res.status(200).json({
    success: true,
    message: CATEGORIES_MESSAGES.GET_SUBCATEGORIES_SUCCESS,
    resource: CATEGORY_CONSTANTS.SUBCATEGORY_SINGULAR,
    data: subcategories
  });
});

/**
 * Obtener todas las subcategorías
 */
const getAllSubcategory = controllerWrapper(async (req, res) => {
  const subcategories = await CategoryService.getAllSubcategory(req.queryProcessor);
  
  if (!subcategories || subcategories.length === 0) {
    throw new NotFoundError();
  }
  
  res.status(200).json({
    success: true,
    message: CATEGORIES_MESSAGES.GET_SUBCATEGORIES_SUCCESS,
    resource: CATEGORY_CONSTANTS.SUBCATEGORIES_PLURAL,
    data: subcategories
  });
});

/**
 * Obtener subcategoría específica por ID
 */
const getSubcategorySpecific = controllerWrapper(async (req, res) => {
  const { categoryId, subcategoryId } = req.params;
  
  const subcategory = await CategoryService.getSubcategorySpecific(categoryId, subcategoryId);
  
  if (!subcategory) {
    throw new NotFoundError();
  }
  
  res.status(200).json({
    success: true,
    message: CATEGORIES_MESSAGES.GET_BY_ID_SUCCESS,
    resource: CATEGORY_CONSTANTS.SUBCATEGORY_SINGULAR,
    data: subcategory
  });
});

/**
 * Crear nueva categoría padre
 */
const createCategory = controllerWrapper(async (req, res) => {
  const newCategory = await CategoryService.createCategory(req.body);
  
  res.status(201).json({
    success: true,
    message: CATEGORIES_MESSAGES.CREATE_CATEGORY_SUCCESS,
    resource: CATEGORY_CONSTANTS.CATEGORY_SINGULAR,
    data: newCategory
  });
});

/**
 * Crear nueva subcategoría
 */
const createSubcategory = controllerWrapper(async (req, res) => {
  const { parentId } = req.params;
  
  const newSubcategory = await CategoryService.createSubcategory(parentId, req.body);
  
  res.status(201).json({
    success: true,
    message: CATEGORIES_MESSAGES.CREATE_SUBCATEGORY_SUCCESS,
    resource: CATEGORY_CONSTANTS.SUBCATEGORY_SINGULAR,
    data: newSubcategory
  });
});

/**
 * Crear nueva subcategoría (estilo products con parentId en URL)
 */
const createSubcategorySimple = controllerWrapper(async (req, res) => {
  const { id } = req.params; // Obtener parentId de la URL
  
  const newSubcategory = await CategoryService.createSubcategory(id, req.body);
  
  res.status(201).json({
    success: true,
    message: CATEGORIES_MESSAGES.CREATE_SUBCATEGORY_SUCCESS,
    resource: CATEGORY_CONSTANTS.SUBCATEGORY_SINGULAR,
    data: newSubcategory
  });
});

/**
 * Actualizar categoría o subcategoría
 */
const updateCategory = controllerWrapper(async (req, res) => {
  const { id } = req.params;
  
  const updatedCategory = await CategoryService.updateCategory(id, req.body);
  
  if (!updatedCategory) {
    throw new NotFoundError();
  }
  
  res.status(200).json({
    success: true,
    message: CATEGORIES_MESSAGES.UPDATE_CATEGORY_SUCCESS,
    resource: CATEGORY_CONSTANTS.CATEGORY_SINGULAR,
    data: updatedCategory
  });
});

/**
 * Actualizar categoría específica
 */
const updateCategorySpecific = controllerWrapper(async (req, res) => {
  const { id } = req.params;
  
  const updatedCategory = await CategoryService.updateCategory(id, req.body);
  
  if (!updatedCategory) {
    throw new NotFoundError();
  }
  
  res.status(200).json({
    success: true,
    message: CATEGORIES_MESSAGES.UPDATE_CATEGORY_SUCCESS,
    resource: CATEGORY_CONSTANTS.CATEGORY_SINGULAR,
    data: updatedCategory
  });
});

/**
 * Actualizar subcategoría específica
 */
const updateSubcategorySpecific = controllerWrapper(async (req, res) => {
  const { categoryId, subcategoryId } = req.params;
  
  const updatedSubcategory = await CategoryService.updateCategory(subcategoryId, req.body);
  
  if (!updatedSubcategory) {
    throw new NotFoundError();
  }
  
  res.status(200).json({
    success: true,
    message: CATEGORIES_MESSAGES.UPDATE_SUBCATEGORY_SUCCESS,
    resource: CATEGORY_CONSTANTS.SUBCATEGORY_SINGULAR,
    data: updatedSubcategory
  });
});

/**
 * Eliminar categoría o subcategoría
 */
const deleteCategory = controllerWrapper(async (req, res) => {
  const { id } = req.params;
  const { deleteSubcategory } = req.query; // Query parameter opcional
  
  const result = await CategoryService.deleteCategory(id, { 
    deleteSubcategory: deleteSubcategory === CATEGORY_CONSTANTS.BOOLEAN_TRUE 
  });
  
  if (!result) {
    throw new NotFoundError();
  }
  
  res.status(200).json({
    success: true,
    message: CATEGORIES_MESSAGES.DELETE_CATEGORY_SUCCESS,
    resource: CATEGORY_CONSTANTS.CATEGORY_SINGULAR
  });
});

/**
 * Eliminar categoría específica
 */
const deleteCategorySpecific = controllerWrapper(async (req, res) => {
  const { id } = req.params;
  const { deleteSubcategory } = req.query; // Query parameter opcional
  
  const result = await CategoryService.deleteCategory(id, { 
    deleteSubcategory: deleteSubcategory === CATEGORY_CONSTANTS.BOOLEAN_TRUE 
  });
  
  if (!result) {
    throw new NotFoundError();
  }
  
  res.status(200).json({
    success: true,
    message: CATEGORIES_MESSAGES.DELETE_CATEGORY_SUCCESS,
    resource: CATEGORY_CONSTANTS.CATEGORY_SINGULAR
  });
});

/**
 * Eliminar subcategoría específica
 */
const deleteSubcategorySpecific = controllerWrapper(async (req, res) => {
  const { categoryId, subcategoryId } = req.params;
  
  const result = await CategoryService.deleteCategory(subcategoryId);
  
  if (!result) {
    throw new NotFoundError();
  }
  
  res.status(200).json({
    success: true,
    message: CATEGORIES_MESSAGES.DELETE_SUBCATEGORY_SUCCESS,
    resource: CATEGORY_CONSTANTS.SUBCATEGORY_SINGULAR
  });
});

/**
 * Obtener jerarquía completa de categoria con subcategoria
 */
const getCategoryHierarchy = controllerWrapper(async (req, res) => {
  const hierarchy = await CategoryService.getCategoryHierarchy();
  
  if (!hierarchy) {
    throw new NotFoundError();
  }
  
  res.status(200).json({
    success: true,
    message: CATEGORIES_MESSAGES.GET_HIERARCHY_SUCCESS,
    resource: CATEGORY_CONSTANTS.CATEGORY_HIERARCHY,
    data: hierarchy
  });
});

module.exports = {
  getAllCategory,
  getCategoryById,
  getSubcategoryByParent,
  getAllSubcategory,
  getSubcategorySpecific,
  createCategory,
  createSubcategory,
  createSubcategorySimple,
  updateCategory,
  updateCategorySpecific,
  updateSubcategorySpecific,
  deleteCategory,
  deleteCategorySpecific,
  deleteSubcategorySpecific,
  getCategoryHierarchy
};
