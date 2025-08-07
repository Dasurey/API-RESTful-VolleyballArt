const CategoryService = require('../services/category.service');
const { controllerWrapper } = require('../middlewares/async');
const { ValidationError, NotFoundError, ConflictError, InternalServerError } = require('../middlewares/error');

/**
 * Obtener todas las categoria padre
 */
const getAllCategory = controllerWrapper(async (req, res) => {
  const category = await CategoryService.getAllCategory(req.queryProcessor);
  
  // Solo lanzar error si no hay queryProcessor (consulta básica) y no hay categorías
  if (!category || (category.length === 0 && !req.queryProcessor)) {
    throw new NotFoundError();
  }
  
  res.status(200).json({
    success: true,
    message: '📋 Categorías obtenidas exitosamente',
    resource: 'category',
    data: category || []
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
    message: '📂 Categoría obtenida exitosamente',
    resource: 'category',
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
    message: '📂 Subcategorías obtenidas exitosamente',
    resource: 'subcategory',
    data: subcategories
  });
});

/**
 * Obtener todas las subcategorías
 */
const getAllSubcategory = controllerWrapper(async (req, res) => {
  const subcategories = await CategoryService.getAllSubcategory(req.queryProcessor);
  
  // Solo lanzar error si no hay queryProcessor (consulta básica) y no hay subcategorías
  if (!subcategories || (subcategories.length === 0 && !req.queryProcessor)) {
    throw new NotFoundError();
  }
  
  res.status(200).json({
    success: true,
    message: '📂 Subcategorías obtenidas exitosamente',
    resource: 'subcategory',
    data: subcategories || []
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
    message: '📂 Categoría obtenida exitosamente',
    resource: 'subcategory',
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
    message: '✅ Categoría creada exitosamente',
    resource: 'category',
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
    message: '✅ Subcategoría creada exitosamente',
    resource: 'subcategory',
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
    message: '✅ Subcategoría creada exitosamente',
    resource: 'subcategory',
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
    message: '✅ Categoría actualizada exitosamente',
    resource: 'category',
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
    message: '✅ Categoría actualizada exitosamente',
    resource: 'category',
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
    message: '✅ Subcategoría actualizada exitosamente',
    resource: 'subcategory',
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
    deleteSubcategory: deleteSubcategory === 'true' 
  });
  
  if (!result) {
    throw new NotFoundError();
  }
  
  res.status(200).json({
    success: true,
    message: '✅ Categoría eliminada exitosamente',
    resource: 'category'
  });
});

/**
 * Eliminar categoría específica
 */
const deleteCategorySpecific = controllerWrapper(async (req, res) => {
  const { id } = req.params;
  const { deleteSubcategory } = req.query; // Query parameter opcional
  
  const result = await CategoryService.deleteCategory(id, { 
    deleteSubcategory: deleteSubcategory === 'true' 
  });
  
  if (!result) {
    throw new NotFoundError();
  }
  
  res.status(200).json({
    success: true,
    message: '✅ Categoría eliminada exitosamente',
    resource: 'category'
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
    message: '✅ Subcategoría eliminada exitosamente',
    resource: 'subcategory'
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
    message: '🌳 Jerarquía de categorías obtenida exitosamente',
    resource: 'Jerarquía de categoria',
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
