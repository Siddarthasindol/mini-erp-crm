import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { customerService } from '../services/customerService';
import { Customer, Pagination as PaginationType } from '../types';
import { Loader } from '../components/common/Loader';
import { Badge } from '../components/common/Badge';
import { Pagination } from '../components/common/Pagination';
import { Button } from '../components/common/Button';
import { CustomerFormModal } from '../components/customers/CustomerFormModal';
import { ConfirmDialog } from '../components/common/ConfirmDialog';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../hooks/useToast';
import { formatDate } from '../utils/formatters';
import { UserPlus, Search, Edit2, Trash2, Eye, MessageSquarePlus } from 'lucide-react';
import { FollowUpModal } from '../components/customers/FollowUpModal';

export const Customers: React.FC = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [pagination, setPagination] = useState<PaginationType>({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 1,
  });

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  // Modal states
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [customerToDelete, setCustomerToDelete] = useState<Customer | null>(null);

  // Follow-up modal
  const [isFollowUpOpen, setIsFollowUpOpen] = useState(false);
  const [customerForFollowUp, setCustomerForFollowUp] = useState<Customer | null>(null);

  const { user } = useAuth();
  const { showToast } = useToast();

  const fetchCustomers = useCallback(async (page = 1) => {
    setIsLoading(true);
    try {
      const res = await customerService.getCustomers({
        page,
        limit: 10,
        search,
        status: statusFilter || undefined,
        customerType: typeFilter || undefined,
      });
      setCustomers(res.data || []);
      if (res.pagination) {
        setPagination(res.pagination);
      }
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Failed to fetch customer directory', 'error');
    } finally {
      setIsLoading(false);
    }
  }, [search, statusFilter, typeFilter, showToast]);

  useEffect(() => {
    fetchCustomers(1);
  }, [fetchCustomers]);

  const handleCreateOrUpdate = async (data: Partial<Customer>) => {
    try {
      if (selectedCustomer) {
        await customerService.updateCustomer(selectedCustomer.id, data);
        showToast('Customer record updated successfully', 'success');
      } else {
        await customerService.createCustomer(data);
        showToast('New customer created successfully', 'success');
      }
      setIsFormOpen(false);
      setSelectedCustomer(null);
      fetchCustomers(pagination.page);
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Error saving customer record', 'error');
    }
  };

  const handleDelete = async () => {
    if (!customerToDelete) return;
    try {
      await customerService.deleteCustomer(customerToDelete.id);
      showToast('Customer record deleted successfully', 'success');
      setIsDeleteOpen(false);
      setCustomerToDelete(null);
      fetchCustomers(pagination.page);
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Error deleting customer', 'error');
    }
  };

  const handleAddFollowUp = async (note: string, followUpDate?: string) => {
    if (!customerForFollowUp) return;
    try {
      await customerService.addFollowUp(customerForFollowUp.id, note, followUpDate);
      showToast('Follow-up log saved successfully', 'success');
      setIsFollowUpOpen(false);
      setCustomerForFollowUp(null);
      fetchCustomers(pagination.page);
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Failed to record follow-up', 'error');
    }
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Customer CRM Directory</h1>
          <p className="page-subtitle">Manage retail, wholesale, and distributor accounts & follow-up activities</p>
        </div>

        {(user?.role === 'ADMIN' || user?.role === 'SALES' || user?.role === 'ACCOUNTS') && (
          <Button
            variant="primary"
            icon={<UserPlus size={18} />}
            onClick={() => {
              setSelectedCustomer(null);
              setIsFormOpen(true);
            }}
          >
            Add Customer
          </Button>
        )}
      </div>

      {/* Filter and Search Bar */}
      <div className="filter-bar">
        <div className="search-input-wrapper">
          <Search size={18} className="search-icon" />
          <input
            type="text"
            placeholder="Search by customer name, business, mobile, email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <select
            className="filter-select"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="">All Statuses</option>
            <option value="LEAD">LEAD</option>
            <option value="ACTIVE">ACTIVE</option>
            <option value="INACTIVE">INACTIVE</option>
          </select>

          <select
            className="filter-select"
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
          >
            <option value="">All Types</option>
            <option value="WHOLESALE">WHOLESALE</option>
            <option value="DISTRIBUTOR">DISTRIBUTOR</option>
            <option value="RETAIL">RETAIL</option>
          </select>
        </div>
      </div>

      {/* Customers Table */}
      {isLoading ? (
        <Loader />
      ) : customers.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '3rem 0', color: '#64748b' }}>
          No customers found matching the search/filter criteria.
        </div>
      ) : (
        <div className="table-container">
          <table className="custom-table">
            <thead>
              <tr>
                <th>Customer Name</th>
                <th>Business Name</th>
                <th>Mobile / Email</th>
                <th>Type</th>
                <th>Status</th>
                <th>Follow-up Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {customers.map((c) => (
                <tr key={c.id}>
                  <td>
                    <Link to={`/customers/${c.id}`} style={{ fontWeight: 600 }}>
                      {c.name}
                    </Link>
                  </td>
                  <td style={{ fontWeight: 500 }}>{c.businessName}</td>
                  <td>
                    <div>{c.mobile}</div>
                    {c.email && <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{c.email}</div>}
                  </td>
                  <td><Badge status={c.customerType} /></td>
                  <td><Badge status={c.status} /></td>
                  <td>
                    {c.followUpDate ? (
                      <span style={{ fontWeight: 600, color: '#2563eb' }}>{formatDate(c.followUpDate)}</span>
                    ) : (
                      <span style={{ color: '#94a3b8' }}>None</span>
                    )}
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '0.4rem' }}>
                      <Link
                        to={`/customers/${c.id}`}
                        className="btn btn-secondary btn-sm"
                        title="View Details"
                      >
                        <Eye size={14} />
                      </Link>

                      {(user?.role === 'ADMIN' || user?.role === 'SALES' || user?.role === 'ACCOUNTS') && (
                        <>
                          <button
                            className="btn btn-secondary btn-sm"
                            title="Add Follow-up"
                            onClick={() => {
                              setCustomerForFollowUp(c);
                              setIsFollowUpOpen(true);
                            }}
                          >
                            <MessageSquarePlus size={14} />
                          </button>
                          <button
                            className="btn btn-secondary btn-sm"
                            title="Edit Customer"
                            onClick={() => {
                              setSelectedCustomer(c);
                              setIsFormOpen(true);
                            }}
                          >
                            <Edit2 size={14} />
                          </button>
                        </>
                      )}

                      {user?.role === 'ADMIN' && (
                        <button
                          className="btn btn-danger btn-sm"
                          title="Delete Customer"
                          onClick={() => {
                            setCustomerToDelete(c);
                            setIsDeleteOpen(true);
                          }}
                        >
                          <Trash2 size={14} />
                        </button>
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
            onPageChange={(newPage) => fetchCustomers(newPage)}
          />
        </div>
      )}

      {/* Customer Add/Edit Modal */}
      <CustomerFormModal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSubmit={handleCreateOrUpdate}
        customer={selectedCustomer}
      />

      {/* Follow Up Log Modal */}
      {customerForFollowUp && (
        <FollowUpModal
          isOpen={isFollowUpOpen}
          onClose={() => setIsFollowUpOpen(false)}
          onSubmit={handleAddFollowUp}
          customerName={customerForFollowUp.businessName || customerForFollowUp.name}
        />
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmDialog
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={handleDelete}
        title="Confirm Customer Deletion"
        message={`Are you sure you want to delete customer '${customerToDelete?.businessName || customerToDelete?.name}'? This action cannot be undone.`}
        confirmText="Delete Customer"
        confirmVariant="danger"
      />
    </div>
  );
};
