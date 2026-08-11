import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { dashboardService } from '../services/dashboardService';
import { DashboardStats } from '../types';
import { Loader } from '../components/common/Loader';
import { Card } from '../components/common/Card';
import { Badge } from '../components/common/Badge';
import { formatDate, formatCurrency } from '../utils/formatters';
import {
  Users,
  Package,
  AlertTriangle,
  FileClock,
  CheckCircle2,
  Calendar,
  ArrowRight,
  TrendingUp,
} from 'lucide-react';

export const Dashboard: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const data = await dashboardService.getStats();
      setStats(data);
    } catch (err) {
      console.error('Failed to load dashboard metrics:', err);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading || !stats) return <Loader />;

  const { summary, lowStockProducts, recentCustomers, recentChallans, upcomingFollowUps } = stats;

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Executive Dashboard</h1>
          <p className="page-subtitle">Real-time overview of Wholesale Operations, Inventory & CRM</p>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="card-grid">
        <Card className="stat-card">
          <div>
            <div className="stat-label">Total Customers</div>
            <div className="stat-value">{summary.totalCustomers}</div>
          </div>
          <div className="stat-icon" style={{ backgroundColor: '#dbeafe', color: '#1d4ed8' }}>
            <Users size={24} />
          </div>
        </Card>

        <Card className="stat-card">
          <div>
            <div className="stat-label">Total Products</div>
            <div className="stat-value">{summary.totalProducts}</div>
          </div>
          <div className="stat-icon" style={{ backgroundColor: '#f0fdf4', color: '#15803d' }}>
            <Package size={24} />
          </div>
        </Card>

        <Card className="stat-card">
          <div>
            <div className="stat-label">Low Stock Alerts</div>
            <div className="stat-value" style={{ color: summary.lowStockCount > 0 ? '#dc2626' : undefined }}>
              {summary.lowStockCount}
            </div>
          </div>
          <div className="stat-icon" style={{ backgroundColor: '#fef2f2', color: '#b91c1c' }}>
            <AlertTriangle size={24} />
          </div>
        </Card>

        <Card className="stat-card">
          <div>
            <div className="stat-label">Draft Challans</div>
            <div className="stat-value">{summary.draftChallansCount}</div>
          </div>
          <div className="stat-icon" style={{ backgroundColor: '#fffbeb', color: '#b45309' }}>
            <FileClock size={24} />
          </div>
        </Card>

        <Card className="stat-card">
          <div>
            <div className="stat-label">Confirmed Challans</div>
            <div className="stat-value">{summary.confirmedChallansCount}</div>
          </div>
          <div className="stat-icon" style={{ backgroundColor: '#f0fdf4', color: '#047857' }}>
            <CheckCircle2 size={24} />
          </div>
        </Card>

        <Card className="stat-card">
          <div>
            <div className="stat-label">Upcoming CRM Follow-ups</div>
            <div className="stat-value">{summary.upcomingFollowUpsCount}</div>
          </div>
          <div className="stat-icon" style={{ backgroundColor: '#ecfeff', color: '#0e7490' }}>
            <Calendar size={24} />
          </div>
        </Card>
      </div>

      {/* Main Grid Sections */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '1.5rem' }}>
        
        {/* Low Stock Alerts Section */}
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#991b1b' }}>
              <AlertTriangle size={18} /> Low Stock Products Alert ({lowStockProducts.length})
            </h3>
            <Link to="/products" className="btn btn-secondary btn-sm">
              View All <ArrowRight size={14} />
            </Link>
          </div>
          {lowStockProducts.length === 0 ? (
            <p style={{ color: '#64748b', fontSize: '0.9rem' }}>All stock levels are healthy above minimum thresholds.</p>
          ) : (
            <div className="table-container">
              <table className="custom-table">
                <thead>
                  <tr>
                    <th>Product</th>
                    <th>SKU</th>
                    <th>Stock</th>
                    <th>Min Limit</th>
                    <th>Location</th>
                  </tr>
                </thead>
                <tbody>
                  {lowStockProducts.map((p) => (
                    <tr key={p.id}>
                      <td style={{ fontWeight: 600 }}>{p.name}</td>
                      <td><code>{p.sku}</code></td>
                      <td style={{ color: '#dc2626', fontWeight: 700 }}>{p.currentStock}</td>
                      <td>{p.minimumStock}</td>
                      <td>{p.warehouseLocation}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Recent Challans Section */}
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <TrendingUp size={18} /> Recent Sales Challans
            </h3>
            <Link to="/challans" className="btn btn-secondary btn-sm">
              View All <ArrowRight size={14} />
            </Link>
          </div>
          <div className="table-container">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Challan No</th>
                  <th>Customer</th>
                  <th>Total Qty</th>
                  <th>Status</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {recentChallans.map((ch) => (
                  <tr key={ch.id}>
                    <td>
                      <Link to={`/challans/${ch.id}`} style={{ fontWeight: 700 }}>
                        {ch.challanNumber}
                      </Link>
                    </td>
                    <td>{ch.customer?.businessName || ch.customer?.name}</td>
                    <td>{ch.totalQuantity} units</td>
                    <td><Badge status={ch.status} /></td>
                    <td>{formatDate(ch.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Upcoming CRM Follow-ups Section */}
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Calendar size={18} /> Upcoming CRM Follow-ups
            </h3>
            <Link to="/customers" className="btn btn-secondary btn-sm">
              View Customers <ArrowRight size={14} />
            </Link>
          </div>
          <div className="table-container">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Customer</th>
                  <th>Business</th>
                  <th>Follow-up Date</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {upcomingFollowUps.map((cust) => (
                  <tr key={cust.id}>
                    <td style={{ fontWeight: 600 }}>{cust.name}</td>
                    <td>{cust.businessName}</td>
                    <td style={{ fontWeight: 600, color: '#2563eb' }}>{formatDate(cust.followUpDate)}</td>
                    <td>
                      <Link to={`/customers/${cust.id}`} className="btn btn-secondary btn-sm">
                        View CRM Log
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recent Customers Section */}
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Users size={18} /> Recently Added Customers
            </h3>
            <Link to="/customers" className="btn btn-secondary btn-sm">
              View All <ArrowRight size={14} />
            </Link>
          </div>
          <div className="table-container">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Customer Name</th>
                  <th>Business Name</th>
                  <th>Type</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {recentCustomers.map((c) => (
                  <tr key={c.id}>
                    <td>
                      <Link to={`/customers/${c.id}`} style={{ fontWeight: 600 }}>
                        {c.name}
                      </Link>
                    </td>
                    <td>{c.businessName}</td>
                    <td><Badge status={c.customerType} /></td>
                    <td><Badge status={c.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
};
