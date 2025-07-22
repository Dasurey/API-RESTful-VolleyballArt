export const validateProductData = (product) => {
  const { stock, sku, description, price, name, category } = product;

  if (!name || typeof name !== 'string') {
    return 'El nombre es obligatorio y debe ser texto';
  }

  if (typeof price !== 'number' || isNaN(price) || price < 0) {
    return 'El precio debe ser un numero no negativo';
  }

  if (!Number.isInteger(stock) || stock < 0) {
    return 'El stock debe ser un numero entero no negativo';
  }

  if (!sku || typeof sku !== 'string') {
    return 'El SKU es obligatorio y debe ser texto';
  }

  if (!description || typeof description !== 'string') {
    return 'La descripcion es obligatorio y debe ser texto';
  }

  if (!category || typeof category !== 'string') {
    return 'La categoria es obligatorio y debe ser texto';
  }

  return null;
};
