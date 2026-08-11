export const validateLogin = (body: any) => {
  const errors: string[] = [];
  if (!body.email || typeof body.email !== 'string' || !body.email.trim()) {
    errors.push('Email is required');
  }
  if (!body.password || typeof body.password !== 'string' || !body.password.trim()) {
    errors.push('Password is required');
  }
  return { isValid: errors.length === 0, errors };
};
