import React from 'react';
import { useShopAuth } from '../contexts/ShopAuthContext';
import { Link } from 'react-router-dom';
import { Check, Moon, Sun, ExternalLink } from 'lucide-react';
import PartNexaLogo from './common/PartNexaLogo';

export const ShopNavbar = () => {
  const { shop, user, logout, theme, toggleTheme } = useShopAuth();

  return (
    <header
      style={{
        height: 'var(--navbar-height)',
        backgroundColor: 'var(--color-bg-card)',
        borderBottom: '1px solid var(--color-border)',
        padding: '0 1.5rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        position: 'sticky',
        top: 0,
        zIndex: 50,
        boxShadow: 'var(--shadow-sm)',
      }}
    >
      {/* Brand & Partner Identification */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
        <PartNexaLogo
          variant="horizontal"
          portal="workshop"
          size="md"
          linkTo="/"
        />

        {shop && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.6rem',
              padding: '0.35rem 0.85rem',
              background: 'var(--color-bg-elevated)',
              border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius-full)',
              fontSize: '0.825rem',
            }}
          >
            <span style={{ fontWeight: 600, color: 'var(--color-text-primary)' }}>{shop.name}</span>
            <span style={{ color: 'var(--color-text-muted)' }}>•</span>
            <span style={{ color: 'var(--color-text-secondary)' }}>{shop.city}</span>
            <span className="badge badge-success" style={{ fontSize: '0.65rem', padding: '0.15rem 0.45rem', display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
              <Check size={11} strokeWidth={2.2} /> Verified Partner
            </span>
          </div>
        )}
      </div>

      {/* Right Controls */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        {/* Receiving Jobs Status Pill */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.45rem',
            fontSize: '0.8rem',
            fontWeight: 600,
            color: '#10B981',
            background: 'var(--color-success-bg)',
            padding: '0.35rem 0.75rem',
            borderRadius: 'var(--radius-full)',
            border: '1px solid rgba(16, 185, 129, 0.2)',
          }}
        >
          <span style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: '#10B981', animation: 'pulse 1.5s infinite' }} />
          Online & Receiving DIFM
        </div>

        {/* Dark / Light Mode Switcher */}
        <button
          onClick={toggleTheme}
          className="btn btn-secondary btn-sm"
          title={`Switch to ${theme === 'light' ? 'Dark' : 'Light'} Mode`}
          style={{
            padding: '0.45rem 0.75rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem',
            fontSize: '0.825rem',
            fontWeight: 600,
          }}
        >
          {theme === 'light' ? <Moon size={14} strokeWidth={1.75} /> : <Sun size={14} strokeWidth={1.75} />}
          <span>{theme === 'light' ? 'Dark Mode' : 'Light Mode'}</span>
        </button>

        {/* Customer Portal Link */}
        <a
          href="http://localhost:5173"
          target="_blank"
          rel="noopener noreferrer"
          className="btn btn-outline btn-sm"
          style={{ fontSize: '0.78rem', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
        >
          Customer Portal <ExternalLink size={12} strokeWidth={1.75} />
        </a>

        {/* Owner Profile & Logout */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', borderLeft: '1px solid var(--color-border)', paddingLeft: '1rem' }}>
          <div
            style={{
              width: 34,
              height: 34,
              borderRadius: '50%',
              backgroundColor: 'var(--color-primary-glow)',
              border: '1px solid var(--color-primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 700,
              fontSize: '0.85rem',
              color: 'var(--color-primary)',
            }}
          >
            {user?.firstName?.[0] || 'S'}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontSize: '0.825rem', fontWeight: 600, color: 'var(--color-text-primary)' }}>
              {user?.firstName} {user?.lastName}
            </span>
            <span style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)' }}>Owner</span>
          </div>
          <button
            onClick={logout}
            className="btn btn-secondary btn-sm"
            style={{ marginLeft: '0.5rem', color: 'var(--color-error)' }}
            title="Sign out of Shop Portal"
          >
            Sign out
          </button>
        </div>
      </div>
    </header>
  );
};

export default ShopNavbar;
