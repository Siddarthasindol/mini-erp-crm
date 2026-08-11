export const validateCustomer = (body: any) => {
  const errors: string[] = [];

  if (!body.name || typeof body.name !== 'string' || !body.name.trim()) {
    errors.push('Customer name is required');
  }

  if (!body.mobile || typeof body.mobile !== 'string' || !body.mobile.trim()) {
    errors.push('Mobile number is required');
  }

  if (!body.businessName || typeof body.businessName !== 'string' || !body.businessName.trim()) {
    errors.push('Business name is required');
  }

  if (body.email && (typeof body.email !== 'string' || !/\S+@\S+\.\S+/.test(body.email))) {
    errors.push('Valid email address is required if provided');
  }

  const validTypes = ['RETAIL', 'WHOLESALE', 'DISTRIBUTOR'];
  if (body.customerType && !validTypes.includes(body.customerType)) {
    errors.push(`Invalid customer type. Must be one of: ${validTypes.join(', ')}`);
  }

  const validStatuses = ['LEAD', 'ACTIVE', 'INACTIVE'];
  if (body.status && !validStatuses.includes(body.status)) {
    errors.push(`Invalid customer status. Must be one of: ${validStatuses.join(', ')}`);
  }

  if (!body.address || typeof body.address !== 'string' || !body.address.trim()) {
    errors.push('Address is required');
  }

  return { isValid: errors.length === 0, errors };
};

export const validateFollowUp = (body: any) => {
  const errors: string[] = [];
  if (!body.note || typeof body.note !== 'string' || !body.note.trim()) {
    errors.push('Follow-up note is required');
  }
  return { isValid: errors.length === 0, errors };
};
