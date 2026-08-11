import api from './api';
import { Challan, ApiResponse, ChallanStatus } from '../types';

export interface CreateChallanInput {
  customerId: number;
  items: {
    productId: number;
    quantity: number;
  }[];
}

export const challanService = {
  getChallans: async (page = 1, limit = 10, status?: ChallanStatus, search?: string) => {
    const res = await api.get<ApiResponse<Challan[]>>('/challans', {
      params: { page, limit, status, search },
    });
    return res.data;
  },

  getChallanById: async (id: number): Promise<Challan> => {
    const res = await api.get<ApiResponse<Challan>>(`/challans/${id}`);
    return res.data.data!;
  },

  createChallan: async (data: CreateChallanInput): Promise<Challan> => {
    const res = await api.post<ApiResponse<Challan>>('/challans', data);
    return res.data.data!;
  },

  updateChallan: async (id: number, data: CreateChallanInput): Promise<Challan> => {
    const res = await api.put<ApiResponse<Challan>>(`/challans/${id}`, data);
    return res.data.data!;
  },

  confirmChallan: async (id: number): Promise<Challan> => {
    const res = await api.post<ApiResponse<Challan>>(`/challans/${id}/confirm`);
    return res.data.data!;
  },

  cancelChallan: async (id: number): Promise<Challan> => {
    const res = await api.post<ApiResponse<Challan>>(`/challans/${id}/cancel`);
    return res.data.data!;
  },
};
