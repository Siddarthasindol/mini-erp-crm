export type Role = 'ADMIN' | 'SALES' | 'WAREHOUSE' | 'ACCOUNTS';

export type CustomerType = 'RETAIL' | 'WHOLESALE' | 'DISTRIBUTOR';
export type CustomerStatus = 'LEAD' | 'ACTIVE' | 'INACTIVE';
export type MovementType = 'IN' | 'OUT';
export type ChallanStatus = 'DRAFT' | 'CONFIRMED' | 'CANCELLED';

export interface User {
  id: number;
  name: string;
  email: string;
  role: Role;
  createdAt?: string;
}

export interface Customer {
  id: number;
  name: string;
  mobile: string;
  email?: string | null;
  businessName: string;
  gstNumber?: string | null;
  customerType: CustomerType;
  address: string;
  status: CustomerStatus;
  followUpDate?: string | null;
  notes?: string | null;
  createdAt: string;
  updatedAt: string;
  _count?: {
    followUps: number;
    challans: number;
  };
}

export interface CustomerFollowUp {
  id: number;
  customerId: number;
  note: string;
  followUpDate?: string | null;
  createdBy?: number | null;
  createdAt: string;
}

export interface Product {
  id: number;
  name: string;
  sku: string;
  category: string;
  unitPrice: number;
  currentStock: number;
  minimumStock: number;
  warehouseLocation: string;
  isLowStock?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface StockMovement {
  id: number;
  productId: number;
  product?: Product;
  quantity: number;
  movementType: MovementType;
  reason: string;
  createdBy: number;
  user?: Partial<User>;
  createdAt: string;
}

export interface ChallanItem {
  id: number;
  challanId: number;
  productId: number;
  product?: Product;
  productNameSnapshot: string;
  skuSnapshot: string;
  unitPriceSnapshot: number;
  quantity: number;
}

export interface Challan {
  id: number;
  challanNumber: string;
  customerId: number;
  customer: Customer;
  totalQuantity: number;
  status: ChallanStatus;
  createdBy: number;
  user?: Partial<User>;
  createdAt: string;
  updatedAt: string;
  items: ChallanItem[];
}

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  pagination?: Pagination;
  errors?: string[];
}

export interface DashboardStats {
  summary: {
    totalCustomers: number;
    totalProducts: number;
    lowStockCount: number;
    draftChallansCount: number;
    confirmedChallansCount: number;
    upcomingFollowUpsCount: number;
  };
  lowStockProducts: Product[];
  recentCustomers: Customer[];
  recentChallans: Challan[];
  upcomingFollowUps: Customer[];
}
