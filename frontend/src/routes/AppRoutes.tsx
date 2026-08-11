import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { ProtectedRoute } from './ProtectedRoute';
import { MainLayout } from '../components/layout/MainLayout';

import { Login } from '../pages/Login';
import { Dashboard } from '../pages/Dashboard';
import { Customers } from '../pages/Customers';
import { CustomerDetail } from '../pages/CustomerDetail';
import { Products } from '../pages/Products';
import { StockMovements } from '../pages/StockMovements';
import { Challans } from '../pages/Challans';
import { CreateChallan } from '../pages/CreateChallan';
import { ChallanDetail } from '../pages/ChallanDetail';

export const AppRoutes: React.FC = () => {
  return (
    <Routes>
      {/* Public Route */}
      <Route path="/login" element={<Login />} />

      {/* Protected Routes inside Main Layout */}
      <Route element={<ProtectedRoute />}>
        <Route element={<MainLayout />}>
          <Route path="/dashboard" element={<Dashboard />} />

          {/* Customer CRM */}
          <Route path="/customers" element={<Customers />} />
          <Route path="/customers/:id" element={<CustomerDetail />} />

          {/* Products & Inventory */}
          <Route path="/products" element={<Products />} />

          {/* Stock Movements */}
          <Route
            path="/stock-movements"
            element={
              <ProtectedRoute allowedRoles={['ADMIN', 'WAREHOUSE']} />
            }
          >
            <Route index element={<StockMovements />} />
          </Route>

          {/* Sales Delivery Challans */}
          <Route path="/challans" element={<Challans />} />
          <Route path="/challans/create" element={<CreateChallan />} />
          <Route path="/challans/:id" element={<ChallanDetail />} />

          {/* Default Redirect */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Route>
      </Route>
    </Routes>
  );
};
