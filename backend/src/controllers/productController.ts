import { Request, Response, NextFunction } from 'express';
import * as productService from '../services/productService';
import { sendSuccess } from '../utils/response';

export const createProduct = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const product = await productService.createProduct(req.body);
    return sendSuccess(res, product, 'Product created successfully', 201);
  } catch (error) {
    next(error);
  }
};

export const getProducts = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await productService.getProducts({
      page: Number(req.query.page),
      limit: Number(req.query.limit),
      search: req.query.search as string,
      category: req.query.category as string,
    });
    return sendSuccess(res, result.data, 'Products retrieved successfully', 200, result.pagination);
  } catch (error) {
    next(error);
  }
};

export const getLowStockProducts = async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const products = await productService.getLowStockProducts();
    return sendSuccess(res, products, 'Low stock products retrieved successfully');
  } catch (error) {
    next(error);
  }
};

export const getProductById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = Number(req.params.id);
    const product = await productService.getProductById(id);
    return sendSuccess(res, product, 'Product details retrieved successfully');
  } catch (error) {
    next(error);
  }
};

export const updateProduct = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = Number(req.params.id);
    const updated = await productService.updateProduct(id, req.body);
    return sendSuccess(res, updated, 'Product updated successfully');
  } catch (error) {
    next(error);
  }
};

export const deleteProduct = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = Number(req.params.id);
    await productService.deleteProduct(id);
    return sendSuccess(res, null, 'Product deleted successfully');
  } catch (error) {
    next(error);
  }
};

export const getProductStockMovements = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = Number(req.params.id);
    const movements = await productService.getProductStockMovements(id);
    return sendSuccess(res, movements, 'Product stock movement history retrieved successfully');
  } catch (error) {
    next(error);
  }
};
