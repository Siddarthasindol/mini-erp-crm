import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { challanService } from '../services/challanService';
import { Challan } from '../types';
import { Loader } from '../components/common/Loader';
import { Badge } from '../components/common/Badge';
import { Button } from '../components/common/Button';
import { Card } from '../components/common/Card';
import { ConfirmDialog } from '../components/common/ConfirmDialog';
import { formatDate, formatDateTime, formatCurrency } from '../utils/formatters';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../hooks/useToast';
import { ArrowLeft, CheckCircle2, XCircle, Printer, Building, Calendar, User, FileText } from 'lucide-react';

export const ChallanDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [challan, setChallan] = useState<Challan | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Dialog states
  const [actionType, setActionType] = useState<'CONFIRM' | 'CANCEL' | null>(null);
  const [isActionLoading, setIsActionLoading] = useState(false);

  const { user } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    fetchChallanDetail();
  }, [id]);

  const fetchChallanDetail = async () => {
    if (!id) return;
    setIsLoading(true);
    try {
      const data = await challanService.getChallanById(Number(id));
      setChallan(data);
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Failed to load challan detail', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleExecuteAction = async () => {
    if (!challan || !actionType) return;
    setIsActionLoading(true);

    try {
      if (actionType === 'CONFIRM') {
        await challanService.confirmChallan(challan.id);
        showToast(`Sales Challan ${challan.challanNumber} confirmed! Stock deducted successfully.`, 'success');
      } else if (actionType === 'CANCEL') {
        await challanService.cancelChallan(challan.id);
        showToast(`Challan ${challan.challanNumber} cancelled.`, 'info');
      }
      setActionType(null);
      fetchChallanDetail();
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Action failed', 'error');
    } finally {
      setIsActionLoading(false);
    }
  };

  const calculateTotalValue = () => {
    if (!challan) return 0;
    return challan.items.reduce((sum, i) => sum + i.unitPriceSnapshot * i.quantity, 0);
  };

  if (isLoading || !challan) return <Loader />;

  return (
    <div>
      <div style={{ marginBottom: '1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Link to="/challans" className="btn btn-secondary btn-sm">
          <ArrowLeft size={16} /> Back to Challans
        </Link>
        <Button variant="secondary" size="sm" icon={<Printer size={16} />} onClick={() => window.print()}>
          Print Delivery Note
        </Button>
      </div>

      <Card style={{ marginBottom: '1.5rem', borderLeft: '6px solid #3b82f6' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <h1 className="page-title">{challan.challanNumber}</h1>
              <Badge status={challan.status} />
            </div>
            <p className="page-subtitle">Created on {formatDateTime(challan.createdAt)} by {challan.user?.name}</p>
          </div>

          {challan.status === 'DRAFT' && (
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <Button
                variant="success"
                icon={<CheckCircle2 size={18} />}
                onClick={() => setActionType('CONFIRM')}
              >
                Confirm & Deduct Stock
              </Button>
              <Button
                variant="danger"
                icon={<XCircle size={18} />}
                onClick={() => setActionType('CANCEL')}
              >
                Cancel Challan
              </Button>
            </div>
          )}
        </div>
      </Card>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '1.5rem' }}>
        {/* Customer & Order Metadata */}
        <Card>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1rem', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.5rem' }}>
            Consignee / Customer Details
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', fontSize: '0.9rem' }}>
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <Building size={18} color="#64748b" />
              <div>
                <div style={{ fontWeight: 700 }}>{challan.customer?.businessName}</div>
                <div style={{ fontSize: '0.8rem', color: '#64748b' }}>GSTIN: {challan.customer?.gstNumber || 'N/A'}</div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <User size={18} color="#64748b" />
              <div>
                <div style={{ fontWeight: 600 }}>Contact Person</div>
                <div>{challan.customer?.name} ({challan.customer?.mobile})</div>
              </div>
            </div>

            <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '0.85rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#64748b' }}>Total Quantity:</span>
                <span style={{ fontWeight: 700, color: '#2563eb' }}>{challan.totalQuantity} units</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#64748b' }}>Subtotal Value:</span>
                <span style={{ fontWeight: 800 }}>{formatCurrency(calculateTotalValue())}</span>
              </div>
            </div>
          </div>
        </Card>

        {/* Challan Line Items with Product Snapshots */}
        <Card>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <FileText size={18} /> Delivery Items (Product Snapshot Record)
          </h3>

          <div className="table-container">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Product Name (Snapshot)</th>
                  <th>SKU (Snapshot)</th>
                  <th>Unit Price</th>
                  <th>Quantity</th>
                  <th>Total Amount</th>
                </tr>
              </thead>
              <tbody>
                {challan.items.map((item) => (
                  <tr key={item.id}>
                    <td style={{ fontWeight: 600 }}>{item.productNameSnapshot}</td>
                    <td><code>{item.skuSnapshot}</code></td>
                    <td>{formatCurrency(item.unitPriceSnapshot)}</td>
                    <td style={{ fontWeight: 700 }}>{item.quantity} units</td>
                    <td style={{ fontWeight: 700 }}>{formatCurrency(item.unitPriceSnapshot * item.quantity)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>

      {/* Confirmation Dialog */}
      {actionType && (
        <ConfirmDialog
          isOpen={!!actionType}
          onClose={() => setActionType(null)}
          onConfirm={handleExecuteAction}
          isLoading={isActionLoading}
          title={actionType === 'CONFIRM' ? `Confirm Challan ${challan.challanNumber}` : `Cancel Challan ${challan.challanNumber}`}
          message={
            actionType === 'CONFIRM'
              ? `Are you sure you want to confirm Challan ${challan.challanNumber}? This will deduct product inventory and record OUT stock movements.`
              : `Are you sure you want to cancel draft Challan ${challan.challanNumber}?`
          }
          confirmText={actionType === 'CONFIRM' ? 'Confirm & Deduct Stock' : 'Cancel Challan'}
          confirmVariant={actionType === 'CONFIRM' ? 'success' : 'danger'}
        />
      )}
    </div>
  );
};
