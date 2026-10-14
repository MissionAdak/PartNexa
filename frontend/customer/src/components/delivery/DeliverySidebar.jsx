import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useDeliveryAuth } from '../../contexts/DeliveryAuthContext';
import { LayoutDashboard, Package, Bike, Search, Banknote, ShieldCheck, Settings, Star, X } from 'lucide-react';

export const DeliverySidebar = ({ isOpen = false, onClose }) => {
  const { partner, kyc } = useDeliveryAuth();
  const location = useLocation();

  const navItems = [
    { label: 'Rider Dashboard', path: '/delivery', icon: LayoutDashboard, end: true },
    { label: 'Available Jobs', path: '/delivery/jobs/available', icon: Package },
    { label: 'Active Trips', path: '/delivery/jobs/my', icon: Bike },
    { label: 'Used-Part Pickups', path: '/delivery/used-parts', icon: Search },
    { label: 'COD & Reconciliation', path: '/delivery/cod', icon: Banknote },
    { label: 'KYC & Verification', path: '/delivery/kyc', icon: ShieldCheck },
    { label: 'Vehicle & Profile', path: '/delivery/profile', icon: Settings },
  ];

  const isItemActive = (itemPath, isEnd) => {
    const current = location.pathname;
    if (isEnd || itemPath === '/delivery' || itemPath === '/') {
      return current === itemPath || current === `${itemPath}/`;
    }
    return current === itemPath || current.startsWith(`${itemPath}/`);
  };

  const handleLinkClick = () => {
    if (onClose) onClose();
  };

  return (
    <>
      {/* Mobile Drawer Overlay Backdrop */}
      {isOpen && (
        <div
          className="delivery-sidebar-backdrop"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      <aside className={`delivery-sidebar ${isOpen ? 'open' : ''}`}>
        <div>
          {/* Mobile Header with Close Button */}
          <div className="delivery-sidebar-mobile-header">
            <span style={{ fontWeight: 800, fontSize: '1rem', color: 'var(--color-primary)' }}>
              PartNexa Logistics
            </span>
            <button
              type="button"
              onClick={onClose}
              className="delivery-sidebar-close-btn"
              aria-label="Close menu"
            >
              <X size={20} />
            </button>
          </div>

          {/* Rider Status Summary Widget */}
          {partner && (
            <div
              style={{
                padding: '1rem',
                borderRadius: 'var(--radius-md)',
                background: 'var(--color-bg-elevated)',
                border: '1px solid var(--color-border)',
                marginBottom: '1.25rem',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                <span style={{ fontSize: '0.725rem', fontWeight: 700, color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>
                  Rider Status
                </span>
                <span
                  style={{
                    fontSize: '0.725rem',
                    fontWeight: 800,
                    color: partner.verificationStatus === 'APPROVED' ? 'var(--color-emerald)' : 'var(--color-amber)',
                  }}
                >
                  {partner.verificationStatus}
                </span>
              </div>
              <div style={{ fontSize: '0.9rem', fontWeight: 800 }}>
                {partner.vehicleType || 'Motorcycle'}
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                Reg: {partner.vehicleNum || 'Not registered'}
              </div>
              <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.65rem', paddingTop: '0.65rem', borderTop: '1px solid var(--color-border)' }}>
                <div>
                  <span style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)' }}>Rating: </span>
                  <span style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--color-amber)', display: 'inline-flex', alignItems: 'center', gap: '0.2rem' }}>
                    <Star size={12} fill="currentColor" /> {partner.rating || 5.0}
                  </span>
                </div>
                <div>
                  <span style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)' }}>Trips: </span>
                  <span style={{ fontSize: '0.85rem', fontWeight: 800 }}>
                    {partner.totalDeliveries || 0}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Navigation List */}
          <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = isItemActive(item.path, item.end);
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  end={item.end || item.path === '/delivery' || item.path === '/'}
                  onClick={handleLinkClick}
                  className={`delivery-sidebar-nav-link ${active ? 'active' : ''}`}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                    padding: '0.65rem 0.95rem',
                    borderRadius: 'var(--radius-md)',
                    fontSize: '0.875rem',
                    fontWeight: 600,
                    color: active ? 'var(--color-primary)' : 'var(--color-text-secondary)',
                    background: active ? 'var(--color-primary-glow)' : 'transparent',
                    border: active ? '1px solid var(--color-primary-glow)' : '1px solid transparent',
                    transition: 'all var(--transition-fast)',
                    textDecoration: 'none',
                  }}
                >
                  <Icon size={18} strokeWidth={1.75} style={{ flexShrink: 0 }} />
                  <span>{item.label}</span>
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* Footer Info: PartNexa Logistics Version */}
        <div
          style={{
            padding: '0.85rem',
            borderRadius: 'var(--radius-md)',
            background: 'var(--color-surface)',
            border: '1px solid var(--color-border)',
            fontSize: '0.725rem',
            color: 'var(--color-text-muted)',
            textAlign: 'center',
          }}
        >
          <div style={{ fontWeight: 700, color: 'var(--color-text-primary)' }}>PartNexa Logistics Hub</div>
          <div>PartNexa Logistics Network</div>
        </div>
      </aside>
    </>
  );
};

export default DeliverySidebar;
