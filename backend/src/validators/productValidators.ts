export const validateProduct = (body: any) => {
  const errors: string[] = [];

  if (!body.name || typeof body.name !== 'string' || !body.name.trim()) {
    errors.push('Product name is required');
  }

  if (!body.sku || typeof body.sku !== 'string' || !body.sku.trim()) {
    errors.push('SKU code is required');
  }

  if (!body.category || typeof body.category !== 'string' || !body.category.trim()) {
    errors.push('Category is required');
  }

  if (typeof body.unitPrice !== 'number' || body.unitPrice < 0) {
    errors.push('Unit price must be a non-negative number');
  }

  if (typeof body.currentStock !== 'number' || body.currentStock < 0) {
    errors.push('Current stock must be a non-negative integer');
  }

  if (typeof body.minimumStock !== 'number' || body.minimumStock < 0) {
    errors.push('Minimum stock must be a non-negative integer');
  }

  if (!body.warehouseLocation || typeof body.warehouseLocation !== 'string' || !body.warehouseLocation.trim()) {
    errors.push('Warehouse location is required');
  }

  return { isValid: errors.length === 0, errors };
};
