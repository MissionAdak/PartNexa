import React from 'react';
import { NavLink } from 'react-router-dom';
import PartNexaLogo from '../common/PartNexaLogo';
import {
  LayoutDashboard,
  Factory,
  ClipboardList,
  RotateCcw,
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
  { path: '/admin', label: 'Overview Dashboard', icon: LayoutDashboard, end: true },
  { path: '/admin/procurement', label: 'Bulk Procurement', icon: Factory },
  { path: '/admin/orders', label: 'Orders & DIFM', icon: ClipboardList },
  { path: '/admin/returns', label: 'Returns & Refunds', icon: RotateCcw },
  { path: '/admin/customers', label: 'Customers', icon: Users },
  { path: '/admin/shops', label: 'Mechanical Workshops', icon: Wrench },
  { path: '/admin/delivery-partners', label: 'Delivery Fleet & KYC', icon: Bike },
  { path: '/admin/products-inventory', label: 'Catalog & Inventory', icon: Package },
  { path: '/admin/platform-config', label: 'Platform & DIFM Config', icon: Settings },
  { path: '/admin/used-parts', label: 'Used Parts Oversight', icon: Repeat },
  { path: '/admin/deliveries', label: 'Live Dispatches', icon: MapPin },
  { path: '/admin/care-hub', label: 'Customer Care Hub', icon: Headphones },
];

export default function AdminSidebar() {
  return (
    <aside
      style={{
        width: 'var(--sidebar-width)',
        flexShrink: 0,
        position: 'sticky',
        top: 'var(--total-header-height, 110px)',
        height: 'calc(100vh - var(--total-header-height, 110px))',
        backgroundColor: 'var(--bg-secondary)',
        borderRight: '1px solid var(--border-color)',
        display: 'flex',
        flexDirection: 'column',
        overflowY: 'auto',
        zIndex: 100,
      }}
    >
      {/* Sidebar Brand Section */}
      <div
        style={{
          padding: '1rem 1.25rem',
          display: 'flex',
          alignItems: 'center',
          borderBottom: '1px solid var(--border-color)',
        }}
      >
        <PartNexaLogo
          variant="horizontal"
          portal="admin"
          size="md"
          linkTo="/admin"
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

        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.end || item.path === '/'}
            style={({ isActive }) => ({
              display: 'flex',
              alignItems: 'center',
              gap: '0.85rem',
              padding: '0.7rem 0.85rem',
              borderRadius: 'var(--radius-md)',
              fontSize: '0.88rem',
              fontWeight: isActive ? 700 : 500,
              color: isActive ? 'var(--color-primary)' : 'var(--text-secondary)',
              backgroundColor: isActive ? 'var(--color-primary-bg)' : 'transparent',
              transition: 'all 0.15s ease',
              borderLeft: isActive ? '3px solid var(--color-primary)' : '3px solid transparent',
            })}
          >
            <item.icon size={18} strokeWidth={1.75} style={{ flexShrink: 0 }} />
            <span>{item.label}</span>
          </NavLink>
        ))}
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
