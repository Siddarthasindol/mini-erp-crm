import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { Input } from '../common/Input';
import { Button } from '../common/Button';
import { Product, MovementType } from '../../types';

interface StockMovementModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: {
    productId: number;
    quantity: number;
    movementType: MovementType;
    reason: string;
  }) => Promise<void>;
  products: Product[];
  isLoading?: boolean;
}

export const StockMovementModal: React.FC<StockMovementModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  products,
  isLoading = false,
}) => {
  const [productId, setProductId] = useState<number>(products[0]?.id || 0);
  const [quantity, setQuantity] = useState<number>(1);
  const [movementType, setMovementType] = useState<MovementType>('IN');
  const [reason, setReason] = useState<string>('Stock Inward Procurement');

  const selectedProduct = products.find((p) => p.id === productId);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!productId || quantity <= 0 || !reason.trim()) return;
    await onSubmit({
      productId,
      quantity,
      movementType,
      reason,
    });
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Record Stock Movement (IN / OUT)">
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label className="form-label">Select Product *</label>
          <select
            className="form-control"
            value={productId}
            onChange={(e) => setProductId(Number(e.target.value))}
            required
          >
            {products.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name} (SKU: {p.sku}) - Current Stock: {p.currentStock}
              </option>
            ))}
          </select>
        </div>

        {selectedProduct && (
          <div
            style={{
              padding: '0.75rem 1rem',
              backgroundColor: '#f1f5f9',
              borderRadius: '6px',
              marginBottom: '1rem',
              fontSize: '0.85rem',
            }}
          >
            <div><strong>Location:</strong> {selectedProduct.warehouseLocation}</div>
            <div><strong>Available Stock:</strong> {selectedProduct.currentStock} units</div>
          </div>
        )}

        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Movement Type *</label>
            <select
              className="form-control"
              value={movementType}
              onChange={(e) => setMovementType(e.target.value as MovementType)}
            >
              <option value="IN">IN (Add Stock)</option>
              <option value="OUT">OUT (Deduct Stock)</option>
            </select>
          </div>
          <Input
            label="Quantity *"
            type="number"
            min="1"
            value={quantity}
            onChange={(e) => setQuantity(Number(e.target.value))}
            required
          />
        </div>

        <div className="form-group">
          <label className="form-label">Reason / Reference *</label>
          <input
            className="form-control"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            required
            placeholder="e.g. Purchase order PO-88, Damaged stock disposal..."
          />
        </div>

        <div className="modal-footer" style={{ padding: '1rem 0 0 0' }}>
          <Button type="button" variant="secondary" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" isLoading={isLoading}>
            Record Movement
          </Button>
        </div>
      </form>
    </Modal>
  );
};
