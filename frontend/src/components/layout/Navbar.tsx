import React from 'react';
import { useAuth } from '../../hooks/useAuth';
import { LogOut, User as UserIcon } from 'lucide-react';

export const Navbar: React.FC = () => {
  const { user, logout } = useAuth();

  return (
    <header className="navbar">
      <div style={{ fontSize: '0.9rem', color: '#64748b', fontWeight: 500 }}>
        Wholesale & Distribution Portal
      </div>

      <div className="navbar-user-info">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <div
            style={{
              width: '34px',
              height: '34px',
              borderRadius: '50%',
              backgroundColor: '#e2e8f0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#475569',
            }}
          >
            <UserIcon size={18} />
          </div>
          <div>
            <div style={{ fontSize: '0.9rem', fontWeight: 600, color: '#0f172a' }}>
              {user?.name}
            </div>
            <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{user?.email}</div>
          </div>
        </div>

        <span className={`user-badge role-${user?.role}`}>{user?.role}</span>

        <button className="btn-logout" onClick={logout} title="Sign Out">
          <LogOut size={16} />
          <span>Logout</span>
        </button>
      </div>
    </header>
  );
};
