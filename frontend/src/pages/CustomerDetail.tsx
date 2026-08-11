import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { customerService } from '../services/customerService';
import { Customer, CustomerFollowUp } from '../types';
import { Loader } from '../components/common/Loader';
import { Card } from '../components/common/Card';
import { Badge } from '../components/common/Badge';
import { Button } from '../components/common/Button';
import { FollowUpModal } from '../components/customers/FollowUpModal';
import { formatDate, formatDateTime } from '../utils/formatters';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../hooks/useToast';
import { ArrowLeft, MessageSquarePlus, Building2, Phone, Mail, MapPin, FileText, Calendar } from 'lucide-react';

export const CustomerDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [customer, setCustomer] = useState<(Customer & { followUps: CustomerFollowUp[]; challans: any[] }) | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isFollowUpOpen, setIsFollowUpOpen] = useState(false);

  const { user } = useAuth();
  const { showToast } = useToast();

  useEffect(() => {
    fetchDetail();
  }, [id]);

  const fetchDetail = async () => {
    if (!id) return;
    setIsLoading(true);
    try {
      const data = await customerService.getCustomerById(Number(id));
      setCustomer(data);
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Failed to load customer profile', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddFollowUp = async (note: string, followUpDate?: string) => {
    if (!id) return;
    try {
      await customerService.addFollowUp(Number(id), note, followUpDate);
      showToast('Follow-up log recorded successfully', 'success');
      setIsFollowUpOpen(false);
      fetchDetail();
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Failed to record follow-up', 'error');
    }
  };

  if (isLoading || !customer) return <Loader />;

  return (
    <div>
      <div style={{ marginBottom: '1.25rem' }}>
        <Link to="/customers" className="btn btn-secondary btn-sm">
          <ArrowLeft size={16} /> Back to Customers
        </Link>
      </div>

      <div className="page-header">
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <h1 className="page-title">{customer.businessName}</h1>
            <Badge status={customer.status} />
            <Badge status={customer.customerType} />
          </div>
          <p className="page-subtitle">Contact Person: {customer.name}</p>
        </div>

        {(user?.role === 'ADMIN' || user?.role === 'SALES' || user?.role === 'ACCOUNTS') && (
          <Button
            variant="primary"
            icon={<MessageSquarePlus size={18} />}
            onClick={() => setIsFollowUpOpen(true)}
          >
            Record Follow-up
          </Button>
        )}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '1.5rem' }}>
        {/* Left Column: Profile Card */}
        <Card>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1.25rem', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.5rem' }}>
            Company Details
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', fontSize: '0.9rem' }}>
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <Building2 size={18} color="#64748b" />
              <div>
                <div style={{ fontWeight: 600 }}>GSTIN / Tax ID</div>
                <div>{customer.gstNumber || 'Not Registered'}</div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <Phone size={18} color="#64748b" />
              <div>
                <div style={{ fontWeight: 600 }}>Mobile Number</div>
                <div>{customer.mobile}</div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <Mail size={18} color="#64748b" />
              <div>
                <div style={{ fontWeight: 600 }}>Email</div>
                <div>{customer.email || 'N/A'}</div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <MapPin size={18} color="#64748b" />
              <div>
                <div style={{ fontWeight: 600 }}>Address</div>
                <div>{customer.address}</div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <Calendar size={18} color="#64748b" />
              <div>
                <div style={{ fontWeight: 600 }}>Next Scheduled Follow-up</div>
                <div style={{ color: '#2563eb', fontWeight: 600 }}>
                  {formatDate(customer.followUpDate)}
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Right Column: Follow-up Timeline & Recent Sales */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          {/* CRM Follow-up Log History */}
          <Card>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1rem' }}>
              CRM Follow-up Activity History ({customer.followUps.length})
            </h3>

            {customer.followUps.length === 0 ? (
              <p style={{ color: '#64748b', fontSize: '0.9rem' }}>No CRM follow-up logs recorded yet.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {customer.followUps.map((f) => (
                  <div
                    key={f.id}
                    style={{
                      padding: '1rem',
                      backgroundColor: '#f8fafc',
                      borderRadius: '8px',
                      borderLeft: '4px solid #3b82f6',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem', fontSize: '0.8rem', color: '#64748b' }}>
                      <span>Recorded on {formatDateTime(f.createdAt)}</span>
                      {f.followUpDate && (
                        <span style={{ fontWeight: 600, color: '#2563eb' }}>
                          Next Follow-up: {formatDate(f.followUpDate)}
                        </span>
                      )}
                    </div>
                    <div style={{ fontSize: '0.925rem', color: '#0f172a' }}>{f.note}</div>
                  </div>
                ))}
              </div>
            )}
          </Card>

          {/* Sales Challans History */}
          <Card>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <FileText size={18} /> Customer Sales Challans ({customer.challans.length})
            </h3>

            {customer.challans.length === 0 ? (
              <p style={{ color: '#64748b', fontSize: '0.9rem' }}>No sales challans generated for this customer yet.</p>
            ) : (
              <div className="table-container">
                <table className="custom-table">
                  <thead>
                    <tr>
                      <th>Challan No</th>
                      <th>Total Quantity</th>
                      <th>Status</th>
                      <th>Created Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {customer.challans.map((ch) => (
                      <tr key={ch.id}>
                        <td>
                          <Link to={`/challans/${ch.id}`} style={{ fontWeight: 700 }}>
                            {ch.challanNumber}
                          </Link>
                        </td>
                        <td>{ch.totalQuantity} units</td>
                        <td><Badge status={ch.status} /></td>
                        <td>{formatDate(ch.createdAt)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Card>

        </div>
      </div>

      <FollowUpModal
        isOpen={isFollowUpOpen}
        onClose={() => setIsFollowUpOpen(false)}
        onSubmit={handleAddFollowUp}
        customerName={customer.businessName || customer.name}
      />
    </div>
  );
};
