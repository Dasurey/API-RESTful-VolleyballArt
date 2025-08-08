const CategoryService = require('../services/category.service');
const { controllerWrapper } = require('../middlewares/async');
const { ValidationError, NotFoundError, ConflictError, InternalServerError } = require('../middlewares/error');
const { DataResponse, CreatedResponse, UpdatedResponse, DeletedResponse } = require('../utils/success');

/**
 * Obtener todas las categoria padre
 */
const getAllCategory = controllerWrapper(async (req, res) => {
  const categories = await CategoryService.queries.getAllParent(req.queryProcessor);
  
  // Solo lanzar error si no hay queryProcessor (consulta básica) y no hay categorías
  if (!categories || (categories.length === 0 && !req.queryProcessor)) {
    throw new NotFoundError('🔍 No se encontraron categorías');
  }
  
  return new DataResponse('📋 Categorías obtenidas exitosamente', categories).send(res);
});

/**
 * Obtener categoría por ID con subcategoria
 */
const getCategoryById = controllerWrapper(async (req, res) => {
  const { id } = req.params;
  
  const category = await CategoryService.queries.getById(id);
  
  if (!category) {
    throw new NotFoundError('🔍 Categoría no encontrada');
  }
  
  return new DataResponse('📂 Categoría obtenida exitosamente', category).send(res);
});

/**
 * Obtener subcategoria de una categoría padre
 */
const getSubcategoryByParent = controllerWrapper(async (req, res) => {
  const { parentId } = req.params;
  
  const subcategories = await CategoryService.queries.getSubcategories(parentId, req.queryProcessor);
  
  if (!subcategories || subcategories.length === 0) {
    throw new NotFoundError('🔍 No se encontraron subcategorías para esta categoría');
  }
  
  return new DataResponse('📂 Subcategorías obtenidas exitosamente', subcategories).send(res);
});

/**
 * Obtener todas las subcategorías
 */
const getAllSubcategory = controllerWrapper(async (req, res) => {
  const subcategories = await CategoryService.queries.getAllSubcategories(req.queryProcessor);
  
  // Solo lanzar error si no hay queryProcessor (consulta básica) y no hay subcategorías
  if (!subcategories || (subcategories.length === 0 && !req.queryProcessor)) {
    throw new NotFoundError('🔍 No se encontraron subcategorías');
  }
  
  return new DataResponse('📂 Subcategorías obtenidas exitosamente', subcategories).send(res);
});

/**
 * Obtener subcategoría específica por ID
 */
const getSubcategorySpecific = controllerWrapper(async (req, res) => {
  const { categoryId, subcategoryId } = req.params;
  
  const subcategory = await CategoryService.queries.getSpecificSubcategory(categoryId, subcategoryId, req.queryProcessor);
  
  if (!subcategory) {
    // Verificar si es un error de validación basado en el formato del ID
    const parentNumber = categoryId.split('-')[1];
    if (!subcategoryId.startsWith(`CAT-${parentNumber}-`)) {
      throw new ValidationError(`La subcategoría ${subcategoryId} no pertenece a la categoría padre ${categoryId}`);
    }
    // Si no es error de validación, entonces es un 404
    throw new NotFoundError(`🔍 Subcategoría con ID ${subcategoryId} no encontrada en categoría padre ${categoryId}`);
  }
  
  return new DataResponse('📂 Subcategoría obtenida exitosamente', subcategory).send(res);
});

/**
 * Crear nueva categoría padre
 */
const createCategory = controllerWrapper(async (req, res) => {
  const newCategory = await CategoryService.creation.createParent(req.body);
  
  return new CreatedResponse('✅ Categoría creada exitosamente', newCategory).send(res);
});

/**
 * Crear nueva subcategoría
 */
const createSubcategory = controllerWrapper(async (req, res) => {
  const { parentId } = req.params;
  
  const newSubcategory = await CategoryService.creation.createSubcategory(parentId, req.body);
  
  if (!newSubcategory) {
    throw new NotFoundError('🔍 Categoría padre no encontrada');
  }
  
  return new CreatedResponse('✅ Subcategoría creada exitosamente', newSubcategory).send(res);
});

/**
 * Crear nueva subcategoría (estilo products con parentId en URL)
 */
const createSubcategorySimple = controllerWrapper(async (req, res) => {
  const { id } = req.params; // Obtener parentId de la URL
  
  const newSubcategory = await CategoryService.creation.createSubcategory(id, req.body);
  
  if (!newSubcategory) {
    throw new NotFoundError('🔍 Categoría padre no encontrada');
  }
  
  return new CreatedResponse('✅ Subcategoría creada exitosamente', newSubcategory).send(res);
});

/**
 * Actualizar categoría o subcategoría
 */
const updateCategory = controllerWrapper(async (req, res) => {
  const { id } = req.params;
  
  const updatedCategory = await CategoryService.modification.update(id, req.body);
  
  if (!updatedCategory) {
    throw new NotFoundError('🔍 Categoría no encontrada');
  }
  
  return new UpdatedResponse('✅ Categoría actualizada exitosamente', updatedCategory).send(res);
});

/**
 * Actualizar categoría específica
 */
const updateCategorySpecific = controllerWrapper(async (req, res) => {
  const { id } = req.params;
  
  const updatedCategory = await CategoryService.modification.update(id, req.body);
  
  if (!updatedCategory) {
    throw new NotFoundError('🔍 Categoría no encontrada');
  }
  
  return new UpdatedResponse('✅ Categoría actualizada exitosamente', updatedCategory).send(res);
});

/**
 * Actualizar subcategoría específica
 */
const updateSubcategorySpecific = controllerWrapper(async (req, res) => {
  const { categoryId, subcategoryId } = req.params;
  
  const updatedSubcategory = await CategoryService.modification.update(subcategoryId, req.body);
  
  if (!updatedSubcategory) {
    throw new NotFoundError('🔍 Subcategoría no encontrada');
  }
  
  return new UpdatedResponse('✅ Subcategoría actualizada exitosamente', updatedSubcategory).send(res);
});

/**
 * Eliminar categoría o subcategoría
 */
const deleteCategory = controllerWrapper(async (req, res) => {
  const { id } = req.params;
  const { deleteSubcategory } = req.query; // Query parameter opcional
  
  const result = await CategoryService.modification.delete(id, { 
    deleteSubcategories: deleteSubcategory === 'true' 
  });
  
  if (!result) {
    throw new NotFoundError('🔍 Categoría no encontrada o tiene subcategorías');
  }
  
  return new DeletedResponse('✅ Categoría eliminada exitosamente').send(res);
});

/**
 * Eliminar categoría específica
 */
const deleteCategorySpecific = controllerWrapper(async (req, res) => {
  const { id } = req.params;
  const { deleteSubcategory } = req.query; // Query parameter opcional
  
  const result = await CategoryService.modification.delete(id, { 
    deleteSubcategories: deleteSubcategory === 'true' 
  });
  
  if (!result) {
    throw new NotFoundError('🔍 Categoría no encontrada o tiene subcategorías');
  }
  
  return new DeletedResponse('✅ Categoría eliminada exitosamente').send(res);
});

/**
 * Eliminar subcategoría específica
 */
const deleteSubcategorySpecific = controllerWrapper(async (req, res) => {
  const { categoryId, subcategoryId } = req.params;
  
  const result = await CategoryService.modification.delete(subcategoryId);
  
  if (!result) {
    throw new NotFoundError('🔍 Subcategoría no encontrada');
  }
  
  return new DeletedResponse('✅ Subcategoría eliminada exitosamente').send(res);
});

/**
 * Obtener jerarquía completa de categoria con subcategoria
 */
const getCategoryHierarchy = controllerWrapper(async (req, res) => {
  const hierarchy = await CategoryService.queries.hierarchy(req.queryProcessor);
  
  if (!hierarchy || hierarchy.length === 0) {
    throw new NotFoundError('🔍 No se encontró ninguna categoría');
  }
  
  return new DataResponse(
    '🌳 Jerarquía de categorías obtenida exitosamente', 
    hierarchy, 
    hierarchy.length
  ).send(res);
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
