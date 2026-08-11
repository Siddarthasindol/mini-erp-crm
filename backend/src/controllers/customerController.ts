import { Request, Response, NextFunction } from 'express';
import * as customerService from '../services/customerService';
import { sendSuccess } from '../utils/response';

export const createCustomer = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const customer = await customerService.createCustomer(req.body);
    return sendSuccess(res, customer, 'Customer created successfully', 201);
  } catch (error) {
    next(error);
  }
};

export const getCustomers = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await customerService.getCustomers({
      page: Number(req.query.page),
      limit: Number(req.query.limit),
      search: req.query.search as string,
      status: req.query.status as any,
      customerType: req.query.customerType as any,
    });
    return sendSuccess(res, result.data, 'Customers retrieved successfully', 200, result.pagination);
  } catch (error) {
    next(error);
  }
};

export const getCustomerById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = Number(req.params.id);
    const customer = await customerService.getCustomerById(id);
    return sendSuccess(res, customer, 'Customer details retrieved successfully');
  } catch (error) {
    next(error);
  }
};

export const updateCustomer = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = Number(req.params.id);
    const updated = await customerService.updateCustomer(id, req.body);
    return sendSuccess(res, updated, 'Customer updated successfully');
  } catch (error) {
    next(error);
  }
};

export const deleteCustomer = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = Number(req.params.id);
    await customerService.deleteCustomer(id);
    return sendSuccess(res, null, 'Customer deleted successfully');
  } catch (error) {
    next(error);
  }
};

export const addFollowUp = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const customerId = Number(req.params.id);
    const { note, followUpDate } = req.body;
    const followUp = await customerService.addCustomerFollowUp(
      customerId,
      note,
      followUpDate,
      req.user?.userId
    );
    return sendSuccess(res, followUp, 'Follow-up recorded successfully', 201);
  } catch (error) {
    next(error);
  }
};

export const getFollowUps = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const customerId = Number(req.params.id);
    const followUps = await customerService.getCustomerFollowUps(customerId);
    return sendSuccess(res, followUps, 'Follow-up history retrieved successfully');
  } catch (error) {
    next(error);
  }
};
