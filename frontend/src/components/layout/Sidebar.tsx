import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import {
  LayoutDashboard,
  Users,
  Package,
  ArrowLeftRight,
  FileText,
  ShieldCheck,
} from 'lucide-react';

export const Sidebar: React.FC = () => {
  const { user } = useAuth();

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <div className="sidebar-logo-icon">ERP</div>
        <div>
          <div className="sidebar-title">Mini ERP + CRM</div>
          <div className="sidebar-subtitle">Operations Portal</div>
        </div>
      </div>

      <nav className="sidebar-nav">
        <NavLink to="/dashboard" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
          <LayoutDashboard size={18} />
          <span>Dashboard</span>
        </NavLink>

        <NavLink to="/customers" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
          <Users size={18} />
          <span>Customers CRM</span>
        </NavLink>

        <NavLink to="/products" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
          <Package size={18} />
          <span>Products Inventory</span>
        </NavLink>

        {(user?.role === 'ADMIN' || user?.role === 'WAREHOUSE') && (
          <NavLink to="/stock-movements" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
            <ArrowLeftRight size={18} />
            <span>Stock Movements</span>
          </NavLink>
        )}

        <NavLink to="/challans" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
          <FileText size={18} />
          <span>Sales Challans</span>
        </NavLink>

        {user?.role === 'ADMIN' && (
          <div style={{ marginTop: '1.5rem', paddingTop: '1rem', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
            <div style={{ padding: '0 1rem 0.5rem 1rem', fontSize: '0.7rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>
              Administration
            </div>
            <div className="nav-item opacity-60 cursor-not-allowed">
              <ShieldCheck size={18} />
              <span>User Roles (System)</span>
            </div>
          </div>
        )}
      </nav>
    </aside>
  );
};
