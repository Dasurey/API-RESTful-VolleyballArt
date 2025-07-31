const CategoryService = require('../services/category.service.js');
const { CATEGORIES_MESSAGES } = require('../utils/messages.utils.js');
const { 
  getCategoryResource,
  createCategoryResource,
  updateCategoryResource,
  deleteCategoryResource
} = require("../utils/category.utils.js");

/**
 * Obtener todas las categoria padre
 */
const getAllCategories = async (req, res) => {
  return getCategoryResource(
    () => CategoryService.getAllCategories(),
    req,
    res,
    CATEGORIES_MESSAGES.RESOURCE_CATEGORIES,
    {
      successMessage: CATEGORIES_MESSAGES.GET_ALL_SUCCESS,
      errorMessage: CATEGORIES_MESSAGES.GET_ALL_ERROR,
      notFoundMessage: CATEGORIES_MESSAGES.EMPTY_CATEGORIES
    }
  );
};
const getAllCategory = async (req, res) => {
  return getCategoryResource(
    () => CategoryService.getAllCategory(),
    req,
    res,
    CATEGORIES_MESSAGES.RESOURCE_CATEGORIES,
    {
      successMessage: CATEGORIES_MESSAGES.GET_ALL_SUCCESS,
      errorMessage: CATEGORIES_MESSAGES.GET_ALL_ERROR,
      notFoundMessage: CATEGORIES_MESSAGES.EMPTY_CATEGORIES
    }
  );
};

/**
 * Obtener categoría por ID con subcategoria
 */
const getCategoryById = async (req, res) => {
  const { id } = req.params;
  
  return getCategoryResource(
    () => CategoryService.getCategoryById(id),
    req,
    res,
    "categoría",
    {
      successMessage: CATEGORIES_MESSAGES.GET_BY_ID_SUCCESS,
      notFoundMessage: CATEGORIES_MESSAGES.NOT_FOUND(id),
      errorMessage: CATEGORIES_MESSAGES.GET_BY_ID_ERROR
    }
  );
};

/**
 * Obtener subcategoria de una categoría padre
 */
const getSubcategoryByParent = async (req, res) => {
  const { parentId } = req.params;
  
  return getCategoryResource(
    () => CategoryService.getSubcategoryByParent(parentId),
    req,
    res,
    "subcategoria",
    {
      successMessage: CATEGORIES_MESSAGES.GET_SUBCATEGORIES_SUCCESS,
      notFoundMessage: CATEGORIES_MESSAGES.NOT_FOUND_SUBCATEGORIES(parentId),
      errorMessage: CATEGORIES_MESSAGES.GET_SUBCATEGORIES_ERROR
    }
  );
};

/**
 * Crear nueva categoría padre
 */
const createCategory = async (req, res) => {
  return createCategoryResource(
    () => CategoryService.createCategory(req.body),
    req,
    res,
    "categoría",
    {
      successMessage: CATEGORIES_MESSAGES.CREATE_CATEGORY_SUCCESS,
      errorMessage: CATEGORIES_MESSAGES.CREATE_CATEGORY_ERROR
    }
  );
};

/**
 * Crear nueva subcategoría
 */
const createSubcategory = async (req, res) => {
  const { parentId } = req.params;
  
  return createCategoryResource(
    () => CategoryService.createSubcategory(parentId, req.body),
    req,
    res,
    "subcategoría",
    {
      successMessage: CATEGORIES_MESSAGES.CREATE_SUBCATEGORY_SUCCESS,
      errorMessage: CATEGORIES_MESSAGES.CREATE_SUBCATEGORY_ERROR
    }
  );
};

/**
 * Crear nueva subcategoría (estilo products con parentId en URL)
 */
const createSubcategorySimple = async (req, res) => {
  const { id } = req.params; // Obtener parentId de la URL
  
  return createCategoryResource(
    () => CategoryService.createSubcategory(id, req.body),
    req,
    res,
    "subcategoría",
    {
      successMessage: CATEGORIES_MESSAGES.CREATE_SUBCATEGORY_SUCCESS,
      errorMessage: CATEGORIES_MESSAGES.CREATE_SUBCATEGORY_ERROR
    }
  );
};

/**
 * Actualizar categoría o subcategoría
 */
const updateCategory = async (req, res) => {
  const { id } = req.params;
  
  return updateCategoryResource(
    () => CategoryService.updateCategory(id, req.body),
    req,
    res,
    "categoría",
    {
      successMessage: CATEGORIES_MESSAGES.UPDATE_CATEGORY_SUCCESS,
      errorMessage: CATEGORIES_MESSAGES.UPDATE_CATEGORY_ERROR
    }
  );
};

/**
 * Actualizar categoría específica (estilo RESTful)
 */
const updateCategorySpecific = async (req, res) => {
  const { id } = req.params;
  
  return updateCategoryResource(
    () => CategoryService.updateCategory(id, req.body),
    req,
    res,
    "categoría",
    {
      successMessage: CATEGORIES_MESSAGES.UPDATE_CATEGORY_SUCCESS,
      errorMessage: CATEGORIES_MESSAGES.UPDATE_CATEGORY_ERROR
    }
  );
};

/**
 * Actualizar subcategoría específica (estilo RESTful)
 */
const updateSubcategorySpecific = async (req, res) => {
  const { categoryId, subcategoryId } = req.params;
  
  return updateCategoryResource(
    () => CategoryService.updateCategory(subcategoryId, req.body),
    req,
    res,
    "subcategoría",
    {
      successMessage: CATEGORIES_MESSAGES.UPDATE_SUBCATEGORY_SUCCESS,
      errorMessage: CATEGORIES_MESSAGES.UPDATE_SUBCATEGORY_ERROR
    }
  );
};

/**
 * Eliminar categoría o subcategoría
 */
const deleteCategory = async (req, res) => {
  const { id } = req.params;
  const { deleteSubcategory } = req.query; // Query parameter opcional
  
  return deleteCategoryResource(
    () => CategoryService.deleteCategory(id, { 
      deleteSubcategory: deleteSubcategory === 'true' 
    }),
    req,
    res,
    "categoría",
    {
      successMessage: CATEGORIES_MESSAGES.DELETE_CATEGORY_SUCCESS,
      errorMessage: CATEGORIES_MESSAGES.DELETE_CATEGORY_ERROR
    }
  );
};

/**
 * Eliminar categoría específica (estilo RESTful)
 */
const deleteCategorySpecific = async (req, res) => {
  const { id } = req.params;
  const { deleteSubcategory } = req.query; // Query parameter opcional
  
  return deleteCategoryResource(
    () => CategoryService.deleteCategory(id, { 
      deleteSubcategory: deleteSubcategory === 'true' 
    }),
    req,
    res,
    "categoría",
    {
      successMessage: CATEGORIES_MESSAGES.DELETE_CATEGORY_SUCCESS,
      errorMessage: CATEGORIES_MESSAGES.DELETE_CATEGORY_ERROR
    }
  );
};

/**
 * Eliminar subcategoría específica (estilo RESTful)
 */
const deleteSubcategorySpecific = async (req, res) => {
  const { categoryId, subcategoryId } = req.params;
  
  return deleteCategoryResource(
    () => CategoryService.deleteCategory(subcategoryId),
    req,
    res,
    "subcategoría",
    {
      successMessage: CATEGORIES_MESSAGES.DELETE_SUBCATEGORY_SUCCESS,
      errorMessage: CATEGORIES_MESSAGES.DELETE_SUBCATEGORY_ERROR
    }
  );
};

/**
 * Obtener jerarquía completa de categoria con subcategoria
 */
const getCategoryHierarchy = async (req, res) => {
  return getCategoryResource(
    () => CategoryService.getCategoryHierarchy(),
    req,
    res,
    "jerarquía de categoria",
    {
      successMessage: CATEGORIES_MESSAGES.GET_HIERARCHY_SUCCESS,
      errorMessage: CATEGORIES_MESSAGES.GET_HIERARCHY_ERROR
    }
  );
};

module.exports = {
  getAllCategory,
  getCategoryById,
  getSubcategoryByParent,
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
