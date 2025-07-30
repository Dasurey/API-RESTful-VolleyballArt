export const validateProductData = (product) => {
  const { title, img, price, previous_price, description, category, subcategory, outstanding } = product;

  if (!title || typeof title !== 'string') {
    return 'El título es obligatorio y debe ser texto';
  }

  if (!Array.isArray(img) || img.length === 0) {
    return 'Las imágenes son obligatorias y deben ser un array';
  }

  for (const image of img) {
    if (!image.src || typeof image.src !== 'string') {
      return 'La URL de la imagen es obligatoria y debe ser texto';
    }
    if (!image.alt || typeof image.alt !== 'string') {
      return 'El texto alternativo de la imagen es obligatorio y debe ser texto';
    }
    if (typeof image.carousel !== 'boolean') {
      return 'El estado del carrusel de la imagen es obligatorio y debe ser booleano';
    }
  }

  if (typeof price !== 'number' || isNaN(price) || price < 0) {
    return 'El precio debe ser un número no negativo';
  }

  // previous_price puede ser null o un número no negativo
  if (previous_price !== null && (typeof previous_price !== 'number' || isNaN(previous_price) || previous_price < 0)) {
    return 'El precio anterior debe ser un número no negativo o null';
  }

  if (!description || typeof description !== 'string') {
    return 'La descripción es obligatoria y debe ser texto';
  }

  if (!category || typeof category !== 'number') {
    return 'La categoría es obligatoria y debe ser un número';
  }

  if (!subcategory || typeof subcategory !== 'number') {
    return 'La subcategoría es obligatoria y debe ser un número';
  }

  if (typeof outstanding !== 'boolean') {
    return 'El estado destacado es obligatorio y debe ser booleano';
  }

  return null;
};