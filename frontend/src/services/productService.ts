import api from './api';
import { Product, StockMovement, ApiResponse } from '../types';

export interface ProductParams {
  page?: number;
  limit?: number;
  search?: string;
  category?: string;
}

export const productService = {
  getProducts: async (params?: ProductParams) => {
    const res = await api.get<ApiResponse<Product[]>>('/products', { params });
    return res.data;
  },

  getLowStockProducts: async (): Promise<Product[]> => {
    const res = await api.get<ApiResponse<Product[]>>('/products/low-stock');
    return res.data.data!;
  },

  getProductById: async (id: number): Promise<Product> => {
    const res = await api.get<ApiResponse<Product>>(`/products/${id}`);
    return res.data.data!;
  },

  createProduct: async (data: Partial<Product>): Promise<Product> => {
    const res = await api.post<ApiResponse<Product>>('/products', data);
    return res.data.data!;
  },

  updateProduct: async (id: number, data: Partial<Product>): Promise<Product> => {
    const res = await api.put<ApiResponse<Product>>(`/products/${id}`, data);
    return res.data.data!;
  },

  deleteProduct: async (id: number): Promise<void> => {
    await api.delete(`/products/${id}`);
  },

  getProductStockMovements: async (id: number): Promise<StockMovement[]> => {
    const res = await api.get<ApiResponse<StockMovement[]>>(`/products/${id}/stock-movements`);
    return res.data.data!;
  },
};
