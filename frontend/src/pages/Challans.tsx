import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { challanService } from '../services/challanService';
import { Challan, Pagination as PaginationType, ChallanStatus } from '../types';
import { Loader } from '../components/common/Loader';
import { Badge } from '../components/common/Badge';
import { Pagination } from '../components/common/Pagination';
import { Button } from '../components/common/Button';
import { ConfirmDialog } from '../components/common/ConfirmDialog';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../hooks/useToast';
import { formatDate } from '../utils/formatters';
import { FilePlus, Search, Eye, CheckCircle2, XCircle } from 'lucide-react';

export const Challans: React.FC = () => {
  const [challans, setChallans] = useState<Challan[]>([]);
  const [pagination, setPagination] = useState<PaginationType>({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 1,
  });

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);

  // Confirm / Cancel Dialog states
  const [selectedChallan, setSelectedChallan] = useState<Challan | null>(null);
  const [actionType, setActionType] = useState<'CONFIRM' | 'CANCEL' | null>(null);
  const [isActionLoading, setIsActionLoading] = useState(false);

  const { user } = useAuth();
  const { showToast } = useToast();

  const fetchChallans = useCallback(async (page = 1) => {
    setIsLoading(true);
    try {
      const res = await challanService.getChallans(
        page,
        10,
        (statusFilter as ChallanStatus) || undefined,
        search
      );
      setChallans(res.data || []);
      if (res.pagination) {
        setPagination(res.pagination);
      }
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Failed to fetch sales challans', 'error');
    } finally {
      setIsLoading(false);
    }
  }, [search, statusFilter, showToast]);

  useEffect(() => {
    fetchChallans(1);
  }, [fetchChallans]);

  const handleExecuteAction = async () => {
    if (!selectedChallan || !actionType) return;
    setIsActionLoading(true);

    try {
      if (actionType === 'CONFIRM') {
        await challanService.confirmChallan(selectedChallan.id);
        showToast(`Sales Challan ${selectedChallan.challanNumber} confirmed! Stock deducted successfully.`, 'success');
      } else if (actionType === 'CANCEL') {
        await challanService.cancelChallan(selectedChallan.id);
        showToast(`Challan ${selectedChallan.challanNumber} cancelled.`, 'info');
      }
      setSelectedChallan(null);
      setActionType(null);
      fetchChallans(pagination.page);
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Operation failed';
      showToast(msg, 'error');
    } finally {
      setIsActionLoading(false);
    }
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Sales Delivery Challans</h1>
          <p className="page-subtitle">Create draft challans, confirm orders with atomic inventory deduction & issue delivery notes</p>
        </div>

        {(user?.role === 'ADMIN' || user?.role === 'SALES') && (
          <Link to="/challans/create" className="btn btn-primary">
            <FilePlus size={18} /> Create New Challan
          </Link>
        )}
      </div>

      {/* Filter and Search Bar */}
      <div className="filter-bar">
        <div className="search-input-wrapper">
          <Search size={18} className="search-icon" />
          <input
            type="text"
            placeholder="Search by challan number (CH-00001) or customer business name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <select
          className="filter-select"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="">All Statuses</option>
          <option value="DRAFT">DRAFT</option>
          <option value="CONFIRMED">CONFIRMED</option>
          <option value="CANCELLED">CANCELLED</option>
        </select>
      </div>

      {/* Challans Table */}
      {isLoading ? (
        <Loader />
      ) : challans.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '3rem 0', color: '#64748b' }}>
          No delivery challans found.
        </div>
      ) : (
        <div className="table-container">
          <table className="custom-table">
            <thead>
              <tr>
                <th>Challan No</th>
                <th>Customer Business</th>
                <th>Contact Name</th>
                <th>Total Quantity</th>
                <th>Status</th>
                <th>Created Date</th>
                <th>Created By</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {challans.map((ch) => (
                <tr key={ch.id}>
                  <td>
                    <Link to={`/challans/${ch.id}`} style={{ fontWeight: 700, fontSize: '0.95rem' }}>
                      {ch.challanNumber}
                    </Link>
                  </td>
                  <td style={{ fontWeight: 600 }}>{ch.customer?.businessName}</td>
                  <td>{ch.customer?.name}</td>
                  <td style={{ fontWeight: 700 }}>{ch.totalQuantity} units</td>
                  <td><Badge status={ch.status} /></td>
                  <td>{formatDate(ch.createdAt)}</td>
                  <td>{ch.user?.name}</td>
                  <td>
                    <div style={{ display: 'flex', gap: '0.4rem' }}>
                      <Link to={`/challans/${ch.id}`} className="btn btn-secondary btn-sm" title="View Details">
                        <Eye size={14} />
                      </Link>

                      {ch.status === 'DRAFT' && (
                        <>
                          <button
                            className="btn btn-success btn-sm"
                            title="Confirm Challan & Deduct Stock"
                            onClick={() => {
                              setSelectedChallan(ch);
                              setActionType('CONFIRM');
                            }}
                          >
                            <CheckCircle2 size={14} /> Confirm
                          </button>

                          {(user?.role === 'ADMIN' || user?.role === 'SALES') && (
                            <button
                              className="btn btn-danger btn-sm"
                              title="Cancel Challan"
                              onClick={() => {
                                setSelectedChallan(ch);
                                setActionType('CANCEL');
                              }}
                            >
                              <XCircle size={14} />
                            </button>
                          )}
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <Pagination
            page={pagination.page}
            totalPages={pagination.totalPages}
            total={pagination.total}
            limit={pagination.limit}
            onPageChange={(newPage) => fetchChallans(newPage)}
          />
        </div>
      )}

      {/* Confirmation Dialog for Confirm/Cancel */}
      {selectedChallan && actionType && (
        <ConfirmDialog
          isOpen={!!selectedChallan}
          onClose={() => {
            setSelectedChallan(null);
            setActionType(null);
          }}
          onConfirm={handleExecuteAction}
          isLoading={isActionLoading}
          title={actionType === 'CONFIRM' ? `Confirm Challan ${selectedChallan.challanNumber}` : `Cancel Challan ${selectedChallan.challanNumber}`}
          message={
            actionType === 'CONFIRM'
              ? `Are you sure you want to confirm Challan ${selectedChallan.challanNumber} for ${selectedChallan.customer?.businessName}? Stock will be permanently deducted from inventory via an atomic transaction.`
              : `Are you sure you want to cancel draft Challan ${selectedChallan.challanNumber}?`
          }
          confirmText={actionType === 'CONFIRM' ? 'Confirm & Deduct Stock' : 'Cancel Challan'}
          confirmVariant={actionType === 'CONFIRM' ? 'success' : 'danger'}
        />
      )}
    </div>
  );
};
