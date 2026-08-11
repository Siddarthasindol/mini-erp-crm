import { Request, Response, NextFunction } from 'express';
import * as stockService from '../services/stockService';
import { sendSuccess } from '../utils/response';

export const createStockMovement = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { productId, quantity, movementType, reason } = req.body;
    const movement = await stockService.createStockMovement({
      productId: Number(productId),
      quantity: Number(quantity),
      movementType,
      reason,
      userId: req.user!.userId,
    });
    return sendSuccess(res, movement, 'Stock movement recorded successfully', 201);
  } catch (error) {
    next(error);
  }
};

export const getStockMovements = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 20;
    const result = await stockService.getStockMovements(page, limit);
    return sendSuccess(res, result.data, 'Stock movements retrieved successfully', 200, result.pagination);
  } catch (error) {
    next(error);
  }
};
