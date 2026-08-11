import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal';
import { Input } from '../common/Input';
import { Button } from '../common/Button';
import { Customer, CustomerType, CustomerStatus } from '../../types';

interface CustomerFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: Partial<Customer>) => Promise<void>;
  customer?: Customer | null;
  isLoading?: boolean;
}

export const CustomerFormModal: React.FC<CustomerFormModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  customer,
  isLoading = false,
}) => {
  const [formData, setFormData] = useState({
    name: '',
    mobile: '',
    email: '',
    businessName: '',
    gstNumber: '',
    customerType: 'WHOLESALE' as CustomerType,
    address: '',
    status: 'LEAD' as CustomerStatus,
    followUpDate: '',
    notes: '',
  });

  useEffect(() => {
    if (customer) {
      setFormData({
        name: customer.name || '',
        mobile: customer.mobile || '',
        email: customer.email || '',
        businessName: customer.businessName || '',
        gstNumber: customer.gstNumber || '',
        customerType: customer.customerType || 'WHOLESALE',
        address: customer.address || '',
        status: customer.status || 'LEAD',
        followUpDate: customer.followUpDate ? new Date(customer.followUpDate).toISOString().split('T')[0] : '',
        notes: customer.notes || '',
      });
    } else {
      setFormData({
        name: '',
        mobile: '',
        email: '',
        businessName: '',
        gstNumber: '',
        customerType: 'WHOLESALE',
        address: '',
        status: 'LEAD',
        followUpDate: '',
        notes: '',
      });
    }
  }, [customer, isOpen]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit(formData);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={customer ? 'Edit Customer' : 'Add New Customer'}
    >
      <form onSubmit={handleSubmit}>
        <div className="form-row">
          <Input
            label="Customer Name *"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
            placeholder="e.g. Rajesh Sharma"
          />
          <Input
            label="Business Name *"
            name="businessName"
            value={formData.businessName}
            onChange={handleChange}
            required
            placeholder="e.g. Apex Electricals Ltd"
          />
        </div>

        <div className="form-row">
          <Input
            label="Mobile Number *"
            name="mobile"
            value={formData.mobile}
            onChange={handleChange}
            required
            placeholder="+91 98200 11223"
          />
          <Input
            label="Email Address"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="contact@company.com"
          />
        </div>

        <div className="form-row">
          <Input
            label="GST Number (Optional)"
            name="gstNumber"
            value={formData.gstNumber}
            onChange={handleChange}
            placeholder="27AAACA12341Z1"
          />
          <div className="form-group">
            <label className="form-label">Customer Type *</label>
            <select
              className="form-control"
              name="customerType"
              value={formData.customerType}
              onChange={handleChange}
            >
              <option value="RETAIL">RETAIL</option>
              <option value="WHOLESALE">WHOLESALE</option>
              <option value="DISTRIBUTOR">DISTRIBUTOR</option>
            </select>
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">Address *</label>
          <input
            className="form-control"
            name="address"
            value={formData.address}
            onChange={handleChange}
            required
            placeholder="Complete street address & pincode"
          />
        </div>

        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Status *</label>
            <select
              className="form-control"
              name="status"
              value={formData.status}
              onChange={handleChange}
            >
              <option value="LEAD">LEAD</option>
              <option value="ACTIVE">ACTIVE</option>
              <option value="INACTIVE">INACTIVE</option>
            </select>
          </div>
          <Input
            label="Follow-up Date"
            name="followUpDate"
            type="date"
            value={formData.followUpDate}
            onChange={handleChange}
          />
        </div>

        <div className="form-group">
          <label className="form-label">CRM Notes</label>
          <textarea
            className="form-control"
            name="notes"
            rows={3}
            value={formData.notes}
            onChange={handleChange}
            placeholder="Add initial discussion or requirement notes..."
          />
        </div>

        <div className="modal-footer" style={{ padding: '1rem 0 0 0' }}>
          <Button type="button" variant="secondary" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" isLoading={isLoading}>
            {customer ? 'Update Customer' : 'Create Customer'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
