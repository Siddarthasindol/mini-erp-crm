import { Request, Response, NextFunction } from 'express';
import { BadRequestError } from '../utils/errors';

export const validateBody = (validatorFn: (body: any) => { isValid: boolean; errors: string[] }) => {
  return (req: Request, _res: Response, next: NextFunction) => {
    const { isValid, errors } = validatorFn(req.body);
    if (!isValid) {
      return next(new BadRequestError('Validation failed', errors));
    }
    next();
  };
};
