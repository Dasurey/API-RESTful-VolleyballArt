
const { db } = require('../config/db');
const { getAllDocuments, getDocumentById, createDocument, updateDocument, deleteDocument } = require('../config/firebase');
const { dbServiceWrapper } = require('../middlewares/async');

const COLLECTION_NAME = 'category';

/**
 * Generar el próximo ID para categoría padre
 */
const generateParentId = dbServiceWrapper(async () => {
  const allDocs = await getAllDocuments(db, COLLECTION_NAME);
  if (allDocs.length === 0) return 'CAT-0001-0000';

  let maxNumber = 0;
  allDocs.forEach(doc => {
    if (doc.id.endsWith('-0000')) {
      const number = parseInt(doc.id.split('-')[1]);
      if (number > maxNumber) maxNumber = number;
    }
  });

  return `CAT-${(maxNumber + 1).toString().padStart(4, '0')}-0000`;
}, 'generateParentId');

/**
 * Generar el próximo ID para subcategoría
 */
const generateSubcategoryId = dbServiceWrapper(async (parentId) => {
  const parentNumber = parentId.split('-')[1];
  const allDocs = await getAllDocuments(db, COLLECTION_NAME);

  let maxSubNumber = 0;
  allDocs.forEach(doc => {
    if (doc.id.startsWith(`CAT-${parentNumber}-`) && !doc.id.endsWith('-0000')) {
      const subNumber = parseInt(doc.id.split('-')[2]);
      if (subNumber > maxSubNumber) maxSubNumber = subNumber;
    }
  });

  return `CAT-${parentNumber}-${(maxSubNumber + 1).toString().padStart(4, '0')}`;
}, 'generateSubcategoryId');

/**
 * Estructurar categoría padre con orden específico de campos
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
 * Obtener todas las categorías padre
 */
const getAllCategory = dbServiceWrapper(async () => {
  const allCategory = await getAllDocuments(db, COLLECTION_NAME);
  const parentCategory = allCategory.filter(cat => cat.id.endsWith('-0000'));
  return parentCategory.map(category => structureParentCategory(category));
}, 'getAllCategory');

/**
 * Obtener categoría por ID con sus subcategorías
 */
const getCategoryById = dbServiceWrapper(async (categoryId) => {
  const category = await getDocumentById(db, COLLECTION_NAME, categoryId);
  if (!category) return null;

  if (categoryId.endsWith('-0000')) {
    const parentNumber = categoryId.split('-')[1];
    const allCategory = await getAllDocuments(db, COLLECTION_NAME);
    const subcategory = allCategory.filter(cat =>
      cat.id.startsWith(`CAT-${parentNumber}-`) && !cat.id.endsWith('-0000')
    );
    category.subcategory = subcategory.map(subcat => structureSubcategory(subcat));
  }
  return structureParentCategory(category);
}, 'getCategoryById');

/**
 * Obtener todas las subcategorías de una categoría padre
 */
const getSubcategoryByParent = dbServiceWrapper(async (parentCategoryId) => {
  const parentNumber = parentCategoryId.split('-')[1];
  const allCategory = await getAllDocuments(db, COLLECTION_NAME);
  const subcategory = allCategory.filter(cat =>
    cat.id.startsWith(`CAT-${parentNumber}-`) && !cat.id.endsWith('-0000')
  );
  return subcategory.map(subcat => structureSubcategory(subcat));
}, 'getSubcategoryByParent');

/**
 * Obtener todas las subcategorías
 */
const getAllSubcategory = dbServiceWrapper(async () => {
  const allCategory = await getAllDocuments(db, COLLECTION_NAME);
  const subcategory = allCategory.filter(cat =>
    cat.id.startsWith('CAT-') && !cat.id.endsWith('-0000')
  );
  return subcategory.map(subcat => structureSubcategory(subcat));
}, 'getAllSubcategory');

/**
 * Obtener subcategoría específica por ID
 */
const getSubcategorySpecific = dbServiceWrapper(async (subcategoryId) => {
  const subcategory = await getDocumentById(db, COLLECTION_NAME, subcategoryId);
  if (!subcategory) return null;
  return structureSubcategory(subcategory);
}, 'getSubcategorySpecific');

/**
 * Crear una nueva categoría padre
 */
const createCategory = dbServiceWrapper(async (categoryId, categoryData) => {
  const now = new Date().toISOString();
  const data = {
    title: categoryData.title,
    ...categoryData,
    createdAt: now,
    updatedAt: now
  };

  await createDocument(db, COLLECTION_NAME, categoryId, data);
  return structureParentCategory({ id: categoryId, ...data });
}, 'createCategory');

/**
 * Crear una nueva subcategoría
 */
const createSubcategory = dbServiceWrapper(async (subcategoryId, subcategoryData) => {
  const now = new Date().toISOString();
  const data = {
    title: subcategoryData.title,
    ...subcategoryData,
    createdAt: now,
    updatedAt: now
  };

  await createDocument(db, COLLECTION_NAME, subcategoryId, data);
  return structureSubcategory({ id: subcategoryId, ...data });
}, 'createSubcategory');

/**
 * Actualizar una categoría o subcategoría
 */
const updateCategory = dbServiceWrapper(async (categoryId, updateData) => {
  const data = {
    ...updateData,
    updatedAt: new Date().toISOString()
  };

  const updated = await updateDocument(db, COLLECTION_NAME, categoryId, data);
  if (!updated) return null;

  return categoryId.endsWith('-0000') 
    ? structureParentCategory(updated)
    : structureSubcategory(updated);
}, 'updateCategory');

/**
 * Eliminar una categoría o subcategoría
 */
const deleteCategory = dbServiceWrapper(async (categoryId, options = {}) => {
  return deleteDocument(db, COLLECTION_NAME, categoryId, options);
}, 'deleteCategory');

/**
 * Obtener jerarquía completa de categorías
 */
const getCategoryHierarchy = dbServiceWrapper(async () => {
  // Obtener todas las categorías
  const allDocs = await getAllDocuments(db, COLLECTION_NAME);
  
  // Filtrar las categorías padre
  const parentCategories = allDocs.filter(doc => doc.id.endsWith('-0000'));
  
  // Para cada categoría padre, obtener sus subcategorías
  const hierarchy = parentCategories.map(parent => {
    const parentNumber = parent.id.split('-')[1];
    const subcategories = allDocs.filter(doc => 
      doc.id.startsWith(`CAT-${parentNumber}-`) && !doc.id.endsWith('-0000')
    );

    return structureParentCategory({
      ...parent,
      subcategory: subcategories.map(sub => structureSubcategory(sub))
    });
  });

  return hierarchy;
}, 'getCategoryHierarchy');

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
  generateParentId,
  generateSubcategoryId,
  getCategoryHierarchy
};
