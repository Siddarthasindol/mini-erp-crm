import api from './api';
import { StockMovement, ApiResponse, MovementType } from '../types';

export const stockService = {
  getStockMovements: async (page = 1, limit = 20) => {
    const res = await api.get<ApiResponse<StockMovement[]>>('/stock-movements', {
      params: { page, limit },
    });
    return res.data;
  },

  createStockMovement: async (data: {
    productId: number;
    quantity: number;
    movementType: MovementType;
    reason: string;
  }): Promise<StockMovement> => {
    const res = await api.post<ApiResponse<StockMovement>>('/stock-movements', data);
    return res.data.data!;
  },
};
