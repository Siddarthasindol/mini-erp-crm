import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { customerService } from '../services/customerService';
import { productService } from '../services/productService';
import { challanService } from '../services/challanService';
import { Customer, Product } from '../types';
import { Loader } from '../components/common/Loader';
import { Button } from '../components/common/Button';
import { Card } from '../components/common/Card';
import { formatCurrency } from '../utils/formatters';
import { useToast } from '../hooks/useToast';
import { ArrowLeft, Plus, Trash2, CheckCircle2, Save, AlertTriangle } from 'lucide-react';

interface SelectedItem {
  productId: number;
  quantity: number;
}

export const CreateChallan: React.FC = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedCustomerId, setSelectedCustomerId] = useState<number | ''>('');
  const [items, setItems] = useState<SelectedItem[]>([
    { productId: 0, quantity: 1 },
  ]);

  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const navigate = useNavigate();
  const { showToast } = useToast();

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    setIsLoading(true);
    try {
      const [custRes, prodRes] = await Promise.all([
        customerService.getCustomers({ limit: 100 }),
        productService.getProducts({ limit: 100 }),
      ]);
      setCustomers(custRes.data || []);
      const prodList = prodRes.data || [];
      setProducts(prodList);
      if (prodList.length > 0) {
        setItems([{ productId: prodList[0].id, quantity: 1 }]);
      }
    } catch (err) {
      showToast('Failed to load customers and products list', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddItemRow = () => {
    if (products.length === 0) return;
    setItems((prev) => [...prev, { productId: products[0].id, quantity: 1 }]);
  };

  const handleRemoveItemRow = (index: number) => {
    if (items.length <= 1) return;
    setItems((prev) => prev.filter((_, idx) => idx !== index));
  };

  const handleItemChange = (index: number, field: keyof SelectedItem, value: number) => {
    setItems((prev) => {
      const copy = [...prev];
      copy[index] = { ...copy[index], [field]: value };
      return copy;
    });
  };

  const calculateGrandTotalQty = () => {
    return items.reduce((sum, i) => sum + (Number(i.quantity) || 0), 0);
  };

  const calculateGrandTotalValue = () => {
    return items.reduce((sum, i) => {
      const prod = products.find((p) => p.id === i.productId);
      const price = prod ? prod.unitPrice : 0;
      return sum + price * (Number(i.quantity) || 0);
    }, 0);
  };

  const handleSaveChallan = async (confirmImmediately = false) => {
    if (!selectedCustomerId) {
      showToast('Please select a customer for the challan', 'warning');
      return;
    }

    if (items.some((i) => !i.productId || i.quantity <= 0)) {
      showToast('Please select valid products and positive quantities', 'warning');
      return;
    }

    setIsSubmitting(true);
    try {
      // 1. Create DRAFT challan
      const newChallan = await challanService.createChallan({
        customerId: Number(selectedCustomerId),
        items: items.map((i) => ({ productId: Number(i.productId), quantity: Number(i.quantity) })),
      });

      if (confirmImmediately) {
        // 2. Immediately attempt confirmation
        await challanService.confirmChallan(newChallan.id);
        showToast(`Challan ${newChallan.challanNumber} created & confirmed! Stock updated.`, 'success');
      } else {
        showToast(`Draft Challan ${newChallan.challanNumber} created successfully.`, 'success');
      }

      navigate(`/challans/${newChallan.id}`);
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Failed to create sales challan', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) return <Loader />;

  return (
    <div>
      <div style={{ marginBottom: '1.25rem' }}>
        <Link to="/challans" className="btn btn-secondary btn-sm">
          <ArrowLeft size={16} /> Back to Challans List
        </Link>
      </div>

      <div className="page-header">
        <div>
          <h1 className="page-title">Create Sales Delivery Challan</h1>
          <p className="page-subtitle">Select customer, add products, review available stock & generate delivery challan</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.5rem' }}>
        {/* Main Items Form */}
        <Card>
          <div className="form-group" style={{ marginBottom: '1.5rem' }}>
            <label className="form-label">Select Customer Account *</label>
            <select
              className="form-control"
              value={selectedCustomerId}
              onChange={(e) => setSelectedCustomerId(Number(e.target.value))}
              required
            >
              <option value="">-- Choose Customer --</option>
              {customers.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.businessName} ({c.name} - {c.mobile}) - {c.customerType}
                </option>
              ))}
            </select>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 700 }}>Challan Line Items</h3>
            <Button type="button" variant="secondary" size="sm" icon={<Plus size={14} />} onClick={handleAddItemRow}>
              Add Product Line
            </Button>
          </div>

          <div className="table-container" style={{ marginBottom: '1.5rem' }}>
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Current Stock</th>
                  <th>Unit Price</th>
                  <th>Quantity</th>
                  <th>Subtotal</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {items.map((row, idx) => {
                  const currentProd = products.find((p) => p.id === row.productId);
                  const availableStock = currentProd ? currentProd.currentStock : 0;
                  const price = currentProd ? currentProd.unitPrice : 0;
                  const subtotal = price * row.quantity;
                  const isInsufficient = currentProd && row.quantity > availableStock;

                  return (
                    <tr key={idx}>
                      <td style={{ minWidth: '220px' }}>
                        <select
                          className="form-control"
                          value={row.productId}
                          onChange={(e) => handleItemChange(idx, 'productId', Number(e.target.value))}
                        >
                          {products.map((p) => (
                            <option key={p.id} value={p.id}>
                              {p.name} (SKU: {p.sku})
                            </option>
                          ))}
                        </select>
                      </td>
                      <td>
                        <span style={{ fontWeight: 700, color: isInsufficient ? '#dc2626' : '#059669' }}>
                          {availableStock} units
                        </span>
                        {isInsufficient && (
                          <div style={{ fontSize: '0.7rem', color: '#dc2626', fontWeight: 600 }}>
                            <AlertTriangle size={10} /> Exceeds Stock!
                          </div>
                        )}
                      </td>
                      <td>{formatCurrency(price)}</td>
                      <td style={{ width: '110px' }}>
                        <input
                          type="number"
                          min="1"
                          className="form-control"
                          value={row.quantity}
                          onChange={(e) => handleItemChange(idx, 'quantity', Number(e.target.value))}
                        />
                      </td>
                      <td style={{ fontWeight: 600 }}>{formatCurrency(subtotal)}</td>
                      <td>
                        <button
                          className="btn btn-danger btn-sm"
                          disabled={items.length <= 1}
                          onClick={() => handleRemoveItemRow(idx)}
                        >
                          <Trash2 size={14} />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Summary Card */}
        <Card>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1.25rem', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.5rem' }}>
            Challan Summary
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', marginBottom: '1.5rem', fontSize: '0.95rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: '#64748b' }}>Total Item Lines:</span>
              <span style={{ fontWeight: 600 }}>{items.length}</span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: '#64748b' }}>Total Quantity:</span>
              <span style={{ fontWeight: 700, fontSize: '1.1rem', color: '#2563eb' }}>
                {calculateGrandTotalQty()} units
              </span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid #e2e8f0', paddingTop: '0.85rem' }}>
              <span style={{ fontWeight: 700 }}>Estimated Total Value:</span>
              <span style={{ fontWeight: 800, fontSize: '1.2rem', color: '#0f172a' }}>
                {formatCurrency(calculateGrandTotalValue())}
              </span>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <Button
              variant="secondary"
              icon={<Save size={18} />}
              isLoading={isSubmitting}
              onClick={() => handleSaveChallan(false)}
              style={{ width: '100%' }}
            >
              Save as DRAFT (No Stock Deduct)
            </Button>

            <Button
              variant="success"
              icon={<CheckCircle2 size={18} />}
              isLoading={isSubmitting}
              onClick={() => handleSaveChallan(true)}
              style={{ width: '100%' }}
            >
              Save & Confirm (Deduct Stock)
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
};
