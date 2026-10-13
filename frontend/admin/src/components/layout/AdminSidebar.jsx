import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import PartNexaLogo from '../common/PartNexaLogo';
import {
  LayoutDashboard,
  Users,
  Wrench,
  Bike,
  Package,
  Settings,
  Repeat,
  MapPin,
  Headphones,
} from 'lucide-react';

const navItems = [
  { path: '/', label: 'Overview Dashboard', icon: LayoutDashboard, end: true },
  { path: '/customers', label: 'Customers', icon: Users },
  { path: '/shops', label: 'Mechanical Workshops', icon: Wrench },
  { path: '/delivery-partners', label: 'Delivery Fleet & KYC', icon: Bike },
  { path: '/products-inventory', label: 'Catalog & Inventory', icon: Package },
  { path: '/platform-config', label: 'Platform & DIFM Config', icon: Settings },
  { path: '/used-parts', label: 'Used Parts Oversight', icon: Repeat },
  { path: '/deliveries', label: 'Live Dispatches', icon: MapPin },
  { path: '/care-hub', label: 'Customer Care Hub', icon: Headphones },
];

export default function AdminSidebar() {
  const location = useLocation();

  const isItemActive = (itemPath, isEnd) => {
    const current = location.pathname;
    if (isEnd || itemPath === '/') {
      return current === '/' || current === '';
    }
    return current === itemPath || current.startsWith(`${itemPath}/`);
  };

  return (
    <aside
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        bottom: 0,
        width: 'var(--sidebar-width)',
        backgroundColor: 'var(--bg-secondary)',
        borderRight: '1px solid var(--border-color)',
        display: 'flex',
        flexDirection: 'column',
        zIndex: 101,
      }}
    >
      {/* Brand Header */}
      <div
        style={{
          height: 'var(--navbar-height)',
          display: 'flex',
          alignItems: 'center',
          padding: '0 1.5rem',
          borderBottom: '1px solid var(--border-color)',
          gap: '0.75rem',
        }}
      >
        <PartNexaLogo
          variant="horizontal"
          portal="admin"
          size="md"
          linkTo="/"
        />
      </div>

      {/* Nav Items */}
      <div style={{ padding: '1.25rem 0.85rem', display: 'flex', flexDirection: 'column', gap: '0.35rem', flex: 1, overflowY: 'auto' }}>
        <div
          style={{
            fontSize: '0.7rem',
            fontWeight: 700,
            textTransform: 'uppercase',
            color: 'var(--text-muted)',
            padding: '0 0.75rem 0.5rem',
            letterSpacing: '0.05em',
          }}
        >
          Operations & Control
        </div>

        {navItems.map((item) => {
          const active = isItemActive(item.path, item.end);
          return (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.end || item.path === '/'}
              className={`admin-sidebar-nav-link ${active ? 'active' : ''}`}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.85rem',
                padding: '0.7rem 0.85rem',
                borderRadius: 'var(--radius-md)',
                fontSize: '0.88rem',
                fontWeight: active ? 700 : 500,
                color: active ? 'var(--color-primary)' : 'var(--text-secondary)',
                backgroundColor: active ? 'var(--color-primary-bg)' : 'transparent',
                transition: 'all 0.15s ease',
                borderLeft: active ? '3px solid var(--color-primary)' : '3px solid transparent',
                textDecoration: 'none',
              }}
            >
              <item.icon size={18} strokeWidth={1.75} style={{ flexShrink: 0 }} />
              <span>{item.label}</span>
            </NavLink>
          );
        })}
      </div>

      {/* Environment Footer */}
      <div
        style={{
          padding: '1rem 1.25rem',
          borderTop: '1px solid var(--border-color)',
          backgroundColor: 'var(--bg-tertiary)',
        }}
      >
        <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-primary)' }}>
          PartNexa Engine v1.0.0
        </div>
        <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
          Environment: Production-Ready
        </div>
      </div>
    </aside>
  );
}
