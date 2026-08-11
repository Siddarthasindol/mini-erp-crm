import React from 'react';
import { AlertTriangle } from 'lucide-react';

interface LowStockBadgeProps {
  currentStock: number;
  minimumStock: number;
}

export const LowStockBadge: React.FC<LowStockBadgeProps> = ({ currentStock, minimumStock }) => {
  if (currentStock > minimumStock) return null;

  return (
    <span className="badge badge-critical" title={`Current stock (${currentStock}) is <= Minimum limit (${minimumStock})`}>
      <AlertTriangle size={12} />
      <span>LOW STOCK ({currentStock}/{minimumStock})</span>
    </span>
  );
};
