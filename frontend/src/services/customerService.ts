import api from './api';
import { Customer, CustomerFollowUp, ApiResponse } from '../types';

export interface CustomerParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  customerType?: string;
}

export const customerService = {
  getCustomers: async (params?: CustomerParams) => {
    const res = await api.get<ApiResponse<Customer[]>>('/customers', { params });
    return res.data;
  },

  getCustomerById: async (id: number): Promise<Customer & { followUps: CustomerFollowUp[]; challans: any[] }> => {
    const res = await api.get<ApiResponse<Customer & { followUps: CustomerFollowUp[]; challans: any[] }>>(`/customers/${id}`);
    return res.data.data!;
  },

  createCustomer: async (data: Partial<Customer>): Promise<Customer> => {
    const res = await api.post<ApiResponse<Customer>>('/customers', data);
    return res.data.data!;
  },

  updateCustomer: async (id: number, data: Partial<Customer>): Promise<Customer> => {
    const res = await api.put<ApiResponse<Customer>>(`/customers/${id}`, data);
    return res.data.data!;
  },

  deleteCustomer: async (id: number): Promise<void> => {
    await api.delete(`/customers/${id}`);
  },

  addFollowUp: async (id: number, note: string, followUpDate?: string): Promise<CustomerFollowUp> => {
    const res = await api.post<ApiResponse<CustomerFollowUp>>(`/customers/${id}/followups`, {
      note,
      followUpDate,
    });
    return res.data.data!;
  },

  getFollowUps: async (id: number): Promise<CustomerFollowUp[]> => {
    const res = await api.get<ApiResponse<CustomerFollowUp[]>>(`/customers/${id}/followups`);
    return res.data.data!;
  },
};
