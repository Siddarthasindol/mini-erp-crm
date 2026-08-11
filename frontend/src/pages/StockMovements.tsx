import React, { useState, useEffect, useCallback } from 'react';
import { stockService } from '../services/stockService';
import { productService } from '../services/productService';
import { StockMovement, Product, Pagination as PaginationType, MovementType } from '../types';
import { Loader } from '../components/common/Loader';
import { Badge } from '../components/common/Badge';
import { Pagination } from '../components/common/Pagination';
import { Button } from '../components/common/Button';
import { StockMovementModal } from '../components/stock/StockMovementModal';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../hooks/useToast';
import { formatDateTime } from '../utils/formatters';
import { ArrowLeftRight, ArrowDownLeft, ArrowUpRight, PlusCircle } from 'lucide-react';

export const StockMovements: React.FC = () => {
  const [movements, setMovements] = useState<StockMovement[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [pagination, setPagination] = useState<PaginationType>({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 1,
  });

  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { user } = useAuth();
  const { showToast } = useToast();

  const fetchMovements = useCallback(async (page = 1) => {
    setIsLoading(true);
    try {
      const res = await stockService.getStockMovements(page, 20);
      setMovements(res.data || []);
      if (res.pagination) {
        setPagination(res.pagination);
      }
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Failed to load stock movements', 'error');
    } finally {
      setIsLoading(false);
    }
  }, [showToast]);

  const fetchProductsList = async () => {
    try {
      const res = await productService.getProducts({ limit: 100 });
      setProducts(res.data || []);
    } catch (err) {
      console.error('Failed to load products list for modal', err);
    }
  };

  useEffect(() => {
    fetchMovements(1);
    fetchProductsList();
  }, [fetchMovements]);

  const handleRecordMovement = async (data: {
    productId: number;
    quantity: number;
    movementType: MovementType;
    reason: string;
  }) => {
    try {
      await stockService.createStockMovement(data);
      showToast(`Stock ${data.movementType} movement recorded successfully`, 'success');
      setIsModalOpen(false);
      fetchMovements(1);
      fetchProductsList();
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Failed to record stock movement', 'error');
    }
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Inventory Stock Movements Log</h1>
          <p className="page-subtitle">Real-time audit log of direct IN (procurement) and OUT (sales/disposal) stock changes</p>
        </div>

        {(user?.role === 'ADMIN' || user?.role === 'WAREHOUSE') && (
          <Button
            variant="primary"
            icon={<PlusCircle size={18} />}
            onClick={() => setIsModalOpen(true)}
          >
            Record Direct Movement
          </Button>
        )}
      </div>

      {isLoading ? (
        <Loader />
      ) : movements.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '3rem 0', color: '#64748b' }}>
          No stock movements recorded yet.
        </div>
      ) : (
        <div className="table-container">
          <table className="custom-table">
            <thead>
              <tr>
                <th>Date & Time</th>
                <th>Product Name</th>
                <th>SKU</th>
                <th>Movement Type</th>
                <th>Quantity</th>
                <th>Reason / Reference</th>
                <th>Recorded By</th>
              </tr>
            </thead>
            <tbody>
              {movements.map((m) => (
                <tr key={m.id}>
                  <td style={{ fontSize: '0.85rem' }}>{formatDateTime(m.createdAt)}</td>
                  <td style={{ fontWeight: 600 }}>{m.product?.name || `Product #${m.productId}`}</td>
                  <td><code>{m.product?.sku || 'N/A'}</code></td>
                  <td>
                    {m.movementType === 'IN' ? (
                      <span className="badge badge-success">
                        <ArrowDownLeft size={12} /> IN (Procurement)
                      </span>
                    ) : (
                      <span className="badge badge-danger">
                        <ArrowUpRight size={12} /> OUT (Reduction)
                      </span>
                    )}
                  </td>
                  <td style={{ fontWeight: 700, fontSize: '1rem', color: m.movementType === 'IN' ? '#047857' : '#b91c1c' }}>
                    {m.movementType === 'IN' ? `+${m.quantity}` : `-${m.quantity}`} units
                  </td>
                  <td>{m.reason}</td>
                  <td>{m.user?.name || `User #${m.createdBy}`}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <Pagination
            page={pagination.page}
            totalPages={pagination.totalPages}
            total={pagination.total}
            limit={pagination.limit}
            onPageChange={(newPage) => fetchMovements(newPage)}
          />
        </div>
      )}

      {/* Stock Movement Modal */}
      {products.length > 0 && (
        <StockMovementModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSubmit={handleRecordMovement}
          products={products}
        />
      )}
    </div>
  );
};
