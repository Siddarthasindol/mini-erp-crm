export const validateStockMovement = (body: any) => {
  const errors: string[] = [];

  if (!body.productId || typeof body.productId !== 'number') {
    errors.push('Product ID is required');
  }

  if (typeof body.quantity !== 'number' || body.quantity <= 0) {
    errors.push('Quantity must be a positive integer greater than zero');
  }

  if (!body.movementType || !['IN', 'OUT'].includes(body.movementType)) {
    errors.push(`Movement type must be either 'IN' or 'OUT'`);
  }

  if (!body.reason || typeof body.reason !== 'string' || !body.reason.trim()) {
    errors.push('Reason is required');
  }

  return { isValid: errors.length === 0, errors };
};
