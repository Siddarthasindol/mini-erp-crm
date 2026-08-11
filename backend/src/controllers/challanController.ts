import { Request, Response, NextFunction } from 'express';
import * as challanService from '../services/challanService';
import { sendSuccess } from '../utils/response';

export const createChallan = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { customerId, items } = req.body;
    const challan = await challanService.createChallan(
      Number(customerId),
      items,
      req.user!.userId
    );
    return sendSuccess(res, challan, 'Draft sales challan created successfully', 201);
  } catch (error) {
    next(error);
  }
};

export const getChallans = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const status = req.query.status as any;
    const search = req.query.search as string;
    const result = await challanService.getChallans(page, limit, status, search);
    return sendSuccess(res, result.data, 'Challans retrieved successfully', 200, result.pagination);
  } catch (error) {
    next(error);
  }
};

export const getChallanById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = Number(req.params.id);
    const challan = await challanService.getChallanById(id);
    return sendSuccess(res, challan, 'Challan details retrieved successfully');
  } catch (error) {
    next(error);
  }
};

export const updateChallan = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = Number(req.params.id);
    const { customerId, items } = req.body;
    const updated = await challanService.updateChallan(
      id,
      customerId ? Number(customerId) : undefined,
      items
    );
    return sendSuccess(res, updated, 'Draft challan updated successfully');
  } catch (error) {
    next(error);
  }
};

export const confirmChallan = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = Number(req.params.id);
    const confirmed = await challanService.confirmChallan(id, req.user!.userId);
    return sendSuccess(res, confirmed, 'Sales challan confirmed and stock updated successfully');
  } catch (error) {
    next(error);
  }
};

export const cancelChallan = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = Number(req.params.id);
    const cancelled = await challanService.cancelChallan(id);
    return sendSuccess(res, cancelled, 'Challan cancelled successfully');
  } catch (error) {
    next(error);
  }
};
