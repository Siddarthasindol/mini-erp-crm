export const validateCreateChallan = (body: any) => {
  const errors: string[] = [];

  if (!body.customerId || typeof body.customerId !== 'number') {
    errors.push('Customer ID is required');
  }

  if (!Array.isArray(body.items) || body.items.length === 0) {
    errors.push('At least one challan item is required');
  } else {
    body.items.forEach((item: any, idx: number) => {
      if (!item.productId || typeof item.productId !== 'number') {
        errors.push(`Item ${idx + 1}: Valid product ID is required`);
      }
      if (typeof item.quantity !== 'number' || item.quantity <= 0) {
        errors.push(`Item ${idx + 1}: Quantity must be a positive integer`);
      }
    });
  }

  return { isValid: errors.length === 0, errors };
};
