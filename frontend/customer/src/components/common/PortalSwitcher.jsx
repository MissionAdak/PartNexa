import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { ExternalLink } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

export const PortalSwitcher = () => {
  const location = useLocation();
  const { user, logout } = useAuth();

  const portals = [
    {
      label: 'Customer',
      path: '/customer',
      icon: (
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="8" cy="21" r="1" /><circle cx="19" cy="21" r="1" />
          <path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12" />
        </svg>
      ),
      color: 'var(--color-primary, #0284C7)',
    },
    {
      label: 'Workshop',
      path: '/shop',
      icon: (
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
        </svg>
      ),
      color: 'var(--color-teal, #0D9488)',
    },
    {
      label: 'Delivery',
      path: '/delivery',
      icon: (
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="1" y="3" width="15" height="13" rx="1" />
          <polygon points="16 8 20 8 23 11 23 16 16 16 16 8" />
          <circle cx="5.5" cy="18.5" r="2.5" /><circle cx="18.5" cy="18.5" r="2.5" />
        </svg>
      ),
      color: 'var(--color-orange, #FF6B35)',
    },
    {
      label: 'Admin',
      path: '/admin',
      icon: (
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
        </svg>
      ),
      color: 'var(--color-primary-dark, #2563EB)',
    },
  ];

  const currentPortal = portals.find((p) => location.pathname.startsWith(p.path)) || portals[0];

  return (
    <div
      className="portal-switcher-bar"
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 1rem',
        minHeight: 'var(--portal-bar-height, 38px)',
        width: '100%',
        boxSizing: 'border-box',
        background: 'var(--color-bg-elevated, #0f172a)',
        fontSize: '0.8rem',
        fontWeight: 600,
        position: 'relative',
        backdropFilter: 'blur(8px)',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', overflowX: 'auto', padding: '2px 0' }}>
        <span
          style={{
            fontSize: '0.7rem',
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
            color: 'var(--color-text-muted, #94a3b8)',
            fontWeight: 800,
            whiteSpace: 'nowrap',
          }}
        >
          Portals:
        </span>

        {portals.map((portal) => {
          const isActive = location.pathname.startsWith(portal.path);
          return (
            <NavLink
              key={portal.path}
              to={portal.path}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.35rem',
                padding: '0.2rem 0.65rem',
                borderRadius: '6px',
                color: isActive ? '#FFFFFF' : 'var(--color-text-secondary, #cbd5e1)',
                backgroundColor: isActive ? portal.color : 'transparent',
                textDecoration: 'none',
                fontSize: '0.78rem',
                fontWeight: isActive ? 700 : 500,
                border: isActive ? 'none' : '1px solid var(--color-border, rgba(255,255,255,0.08))',
                transition: 'all 0.15s ease',
                whiteSpace: 'nowrap',
              }}
            >
              <span>{portal.icon}</span>
              <span>{portal.label}</span>
            </NavLink>
          );
        })}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', whiteSpace: 'nowrap' }}>
        {user ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted, #94a3b8)' }}>
              <strong style={{ color: 'var(--color-text-primary, #ffffff)' }}>{user.firstName || user.email}</strong> ({user.role})
            </span>
            <NavLink
              to="/login"
              style={{
                fontSize: '0.7rem',
                padding: '0.15rem 0.45rem',
                borderRadius: '4px',
                background: 'rgba(255,255,255,0.08)',
                color: 'var(--color-primary-light, #38bdf8)',
                textDecoration: 'none',
                fontWeight: 600,
              }}
              title="Switch demo account or portal role"
            >
              Switch Role ⇄
            </NavLink>
            <button
              type="button"
              onClick={logout}
              style={{
                fontSize: '0.7rem',
                padding: '0.15rem 0.45rem',
                borderRadius: '4px',
                background: 'rgba(239, 68, 68, 0.1)',
                color: '#ef4444',
                border: 'none',
                cursor: 'pointer',
                fontWeight: 600,
              }}
              title="Sign out of PartNexa"
            >
              Logout
            </button>
          </div>
        ) : (
          <NavLink
            to="/login"
            style={{
              fontSize: '0.75rem',
              color: 'var(--color-primary, #38bdf8)',
              textDecoration: 'none',
              fontWeight: 700,
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
            }}
          >
            Sign In <ExternalLink size={12} strokeWidth={2} />
          </NavLink>
        )}
      </div>
    </div>
  );
};

export default PortalSwitcher;
