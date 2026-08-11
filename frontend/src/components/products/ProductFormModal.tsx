import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal';
import { Input } from '../common/Input';
import { Button } from '../common/Button';
import { Product } from '../../types';

interface ProductFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: Partial<Product>) => Promise<void>;
  product?: Product | null;
  isLoading?: boolean;
}

export const ProductFormModal: React.FC<ProductFormModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  product,
  isLoading = false,
}) => {
  const [formData, setFormData] = useState({
    name: '',
    sku: '',
    category: '',
    unitPrice: 0,
    currentStock: 0,
    minimumStock: 10,
    warehouseLocation: '',
  });

  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name || '',
        sku: product.sku || '',
        category: product.category || '',
        unitPrice: product.unitPrice || 0,
        currentStock: product.currentStock || 0,
        minimumStock: product.minimumStock || 0,
        warehouseLocation: product.warehouseLocation || '',
      });
    } else {
      setFormData({
        name: '',
        sku: '',
        category: 'Electrical & Cables',
        unitPrice: 0,
        currentStock: 0,
        minimumStock: 10,
        warehouseLocation: 'Bay A1',
      });
    }
  }, [product, isOpen]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'number' ? Number(value) : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit(formData);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={product ? 'Edit Product' : 'Add New Inventory Product'}
    >
      <form onSubmit={handleSubmit}>
        <Input
          label="Product Name *"
          name="name"
          value={formData.name}
          onChange={handleChange}
          required
          placeholder="e.g. Heavy Duty Copper Cable 100m"
        />

        <div className="form-row">
          <Input
            label="SKU / Code *"
            name="sku"
            value={formData.sku}
            onChange={handleChange}
            required
            placeholder="e.g. CABL-3C-100"
          />
          <Input
            label="Category *"
            name="category"
            value={formData.category}
            onChange={handleChange}
            required
            placeholder="e.g. Electrical & Cables"
          />
        </div>

        <div className="form-row">
          <Input
            label="Unit Price (INR ₹) *"
            name="unitPrice"
            type="number"
            min="0"
            step="0.01"
            value={formData.unitPrice}
            onChange={handleChange}
            required
          />
          <Input
            label="Warehouse Location *"
            name="warehouseLocation"
            value={formData.warehouseLocation}
            onChange={handleChange}
            required
            placeholder="e.g. Bay A1 - Rack 04"
          />
        </div>

        <div className="form-row">
          <Input
            label="Current Stock Quantity *"
            name="currentStock"
            type="number"
            min="0"
            value={formData.currentStock}
            onChange={handleChange}
            required
          />
          <Input
            label="Minimum Stock Threshold *"
            name="minimumStock"
            type="number"
            min="0"
            value={formData.minimumStock}
            onChange={handleChange}
            required
          />
        </div>

        <div className="modal-footer" style={{ padding: '1rem 0 0 0' }}>
          <Button type="button" variant="secondary" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" isLoading={isLoading}>
            {product ? 'Update Product' : 'Create Product'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
