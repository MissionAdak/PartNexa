import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useCart } from '../../contexts/CartContext';
import { useVehicles } from '../../contexts/VehicleContext';
import VehicleSelectorModal from '../vehicle/VehicleSelectorModal';
import NotificationBell from '../notifications/NotificationBell';
import toast from 'react-hot-toast';
import './Navbar.css';

/**
 * Canonical Customer Navigation Configuration
 * Ensures active states are derived directly from current URL path
 * without requiring client-side click flags or route redirects.
 */
const NAV_ITEMS = [
  {
    name: 'Browse Parts',
    path: '/customer/products',
    id: 'nav-browse-parts',
    isActive: (pathname) =>
      pathname.startsWith('/customer/products') ||
      pathname.startsWith('/products'),
  },
  {
    name: 'DIFM Services',
    path: '/customer/services',
    id: 'nav-services',
    isActive: (pathname) =>
      pathname.startsWith('/customer/services') ||
      pathname.startsWith('/services'),
  },
  {
    name: 'Subscriptions',
    path: '/customer/subscriptions',
    id: 'nav-subscriptions',
    isActive: (pathname) =>
      pathname.startsWith('/customer/subscriptions') ||
      pathname.startsWith('/customer/my-subscriptions') ||
      pathname.startsWith('/subscriptions') ||
      pathname === '/my-subscriptions',
  },
  {
    name: 'Sell Used Part',
    path: '/customer/sell-used-parts',
    id: 'nav-sell-used-parts',
    isActive: (pathname) =>
      pathname.startsWith('/customer/sell-used-parts') ||
      pathname.startsWith('/sell-used-parts'),
  },
  {
    name: 'My Vehicles',
    path: '/customer/vehicles',
    id: 'nav-vehicles',
    isActive: (pathname) =>
      pathname.startsWith('/customer/vehicles') ||
      pathname.startsWith('/customer/garage') ||
      pathname.startsWith('/customer/onboarding/vehicle') ||
      pathname === '/vehicles' ||
      pathname === '/garage' ||
      pathname === '/onboarding/vehicle',
  },
];

const SearchBar = () => {
  const [query, setQuery] = useState('');
  const navigate = useNavigate();

  const handleSearch = (e) => {
    e.preventDefault();
    if (query.trim()) {
      // Directly navigate to canonical customer products search
      navigate(`/customer/products?search=${encodeURIComponent(query.trim())}`);
      setQuery('');
    }
  };

  return (
    <form className="navbar-search" onSubmit={handleSearch} role="search">
      <svg
        className="search-icon"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        aria-hidden="true"
      >
        <circle cx="11" cy="11" r="8" />
        <path d="m21 21-4.35-4.35" />
      </svg>
      <input
        type="search"
        id="navbar-search-input"
        className="form-input navbar-search-input"
        placeholder="Search 10,000+ spare parts, OEM numbers..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        aria-label="Search spare parts"
      />
    </form>
  );
};

const UserMenu = ({ user, onLogout }) => {
  const [open, setOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div className="user-menu-wrapper" ref={menuRef}>
      <button
        id="user-menu-btn"
        className="user-avatar-btn"
        onClick={() => setOpen(!open)}
        aria-expanded={open}
        aria-haspopup="true"
        aria-label="User account menu"
      >
        <div className="user-avatar">
          {user.firstName ? user.firstName[0].toUpperCase() : 'U'}
        </div>
        <span className="user-name-label">{user.firstName}</span>
        <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>

      {open && (
        <div className="dropdown-menu" role="menu">
          <div className="user-menu-header">
            <div className="user-menu-name">
              {user.firstName} {user.lastName}
            </div>
            <div className="user-menu-email">
              {user.email}
            </div>
          </div>
          <Link to="/customer/profile" className="dropdown-item" onClick={() => setOpen(false)} role="menuitem">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
            My Profile
          </Link>
          <Link to="/customer/orders" className="dropdown-item" onClick={() => setOpen(false)} role="menuitem">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
              <line x1="3" y1="6" x2="21" y2="6" />
              <path d="M16 10a4 4 0 0 1-8 0" />
            </svg>
            My Orders
          </Link>
          <Link to="/customer/notifications" className="dropdown-item" onClick={() => setOpen(false)} role="menuitem" id="nav-notifications-link">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
              <path d="M13.73 21a2 2 0 0 1-3.46 0" />
            </svg>
            Notifications
          </Link>
          <Link to="/customer/my-subscriptions" className="dropdown-item" onClick={() => setOpen(false)} role="menuitem" id="nav-my-subscriptions-link">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
            </svg>
            My Subscriptions
          </Link>
          <Link to="/customer/vehicles" className="dropdown-item" onClick={() => setOpen(false)} role="menuitem">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <rect x="2" y="7" width="20" height="14" rx="2" />
              <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
            </svg>
            My Vehicles
          </Link>
          <Link to="/customer/support" className="dropdown-item" onClick={() => setOpen(false)} role="menuitem">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <circle cx="12" cy="12" r="10" />
              <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
              <line x1="12" y1="17" x2="12.01" y2="17" />
            </svg>
            Help & Support
          </Link>
          <div className="dropdown-divider" />
          <button className="dropdown-item danger" onClick={onLogout} role="menuitem">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
            Logout
          </button>
        </div>
      )}
    </div>
  );
};

const Navbar = () => {
  const { user, logout } = useAuth();
  const { itemCount } = useCart();
  const { activeVehicle, primaryVehicle } = useVehicles();
  const displayVehicle = activeVehicle || primaryVehicle;
  const navigate = useNavigate();
  const location = useLocation();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [vehicleSelectorOpen, setVehicleSelectorOpen] = useState(false);

  // Theme state: support light & dark across all unified portals
  const [theme, setTheme] = useState(() => localStorage.getItem('partnexa_theme') || localStorage.getItem('partsphere_theme') || 'light');

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('partnexa_theme', theme);
    const handleThemeChange = (e) => {
      if (e.detail) setTheme(e.detail);
    };
    window.addEventListener('theme:change', handleThemeChange);
    return () => window.removeEventListener('theme:change', handleThemeChange);
  }, [theme]);

  const toggleTheme = () => {
    const next = theme === 'dark' ? 'light' : 'dark';
    setTheme(next);
    window.dispatchEvent(new CustomEvent('theme:change', { detail: next }));
  };

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile drawer on route transition
  const lastPathRef = useRef(location.pathname);
  useEffect(() => {
    if (lastPathRef.current !== location.pathname) {
      lastPathRef.current = location.pathname;
      setMobileOpen(false);
    }
  }, [location.pathname]);

  const handleLogout = async () => {
    await logout();
    toast.success('Logged out successfully.');
    navigate('/customer');
  };

  const isCartActive = location.pathname.startsWith('/customer/cart') || location.pathname === '/cart';

  return (
    <nav className={`navbar ${scrolled ? 'navbar-scrolled' : ''}`} role="navigation" aria-label="Main navigation">
      <div className="navbar-inner">
        {/* Brand Logo - Navigates directly to Canonical Customer Home */}
        <Link to="/customer" className="navbar-logo" id="navbar-logo" aria-label="PartNexa Customer Home">
          <div className="logo-icon">
            <svg viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
              <rect width="36" height="36" rx="10" fill="url(#brandGradNavbar)" />
              <path d="M10 24L18 10L26 24" stroke="#FFFFFF" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M13 19H23" stroke="#FFFFFF" strokeWidth="2.5" strokeLinecap="round"/>
              <circle cx="18" cy="20" r="2.5" fill="#0D9488" />
              <defs>
                <linearGradient id="brandGradNavbar" x1="0" y1="0" x2="36" y2="36" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#0284C7" />
                  <stop offset="1" stopColor="#0D9488" />
                </linearGradient>
              </defs>
            </svg>
          </div>
          <span className="logo-text">
            Part<span className="text-primary">Nexa</span>
          </span>
        </Link>

        {/* Global Search (Desktop / Tablet Wide) */}
        <div className="navbar-search-wrapper">
          <SearchBar />
        </div>

        {/* Canonical Desktop Links with Clean Active Indicator */}
        <div className="navbar-links" role="menubar">
          {NAV_ITEMS.map((item) => {
            const active = item.isActive(location.pathname);
            return (
              <Link
                key={item.path}
                to={item.path}
                id={item.id}
                className={`nav-link ${active ? 'active' : ''}`}
                aria-current={active ? 'page' : undefined}
                role="menuitem"
              >
                {item.name}
              </Link>
            );
          })}
        </div>

        {/* Header Actions (Active Vehicle Pill, Theme Toggle, Cart, Auth) */}
        <div className="navbar-actions">
          {/* Prominent Active Vehicle Indicator */}
          {displayVehicle ? (
            <div className="navbar-vehicle-indicator">
              <button
                type="button"
                className="vehicle-pill"
                id="navbar-primary-vehicle-pill"
                onClick={() => setVehicleSelectorOpen(true)}
                title="Active Vehicle for Fitment (Click to switch)"
                aria-label="Active vehicle selector"
              >
                <span className="vehicle-pill-icon" aria-hidden="true">
                  {displayVehicle.variant?.model?.make?.type === 'BIKE' ||
                  displayVehicle.variant?.model?.make?.type === 'SCOOTER'
                    ? '🏍️'
                    : '🚗'}
                </span>
                <div className="vehicle-pill-info">
                  <span className="vehicle-pill-name">
                    {displayVehicle.nickname ||
                      `${displayVehicle.variant?.model?.make?.name || ''} ${
                        displayVehicle.variant?.model?.name || ''
                      }`}
                  </span>
                  <span className="vehicle-pill-sub">
                    {displayVehicle.variant?.year ? `${displayVehicle.variant.year} · ` : ''}
                    {displayVehicle.variant?.name || 'Active'}
                  </span>
                </div>
                <span className="vehicle-pill-badge">Active</span>
              </button>
            </div>
          ) : (
            <div className="navbar-vehicle-indicator">
              <button
                type="button"
                className="vehicle-pill vehicle-pill-select"
                id="navbar-add-vehicle-pill"
                onClick={() => setVehicleSelectorOpen(true)}
                title="Select your vehicle for guaranteed fitment"
                aria-label="Select Vehicle"
              >
                <span className="vehicle-pill-icon" aria-hidden="true">🚗</span>
                <div className="vehicle-pill-info">
                  <span className="vehicle-pill-name">Select Vehicle</span>
                </div>
                <span className="vehicle-pill-badge-add">+</span>
              </button>
            </div>
          )}

          {/* Theme Switcher */}
          <button
            id="theme-toggle-btn"
            className="theme-toggle-btn"
            onClick={toggleTheme}
            aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
            title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
          >
            {theme === 'dark' ? (
              <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                <circle cx="12" cy="12" r="5" />
                <line x1="12" y1="1" x2="12" y2="3" />
                <line x1="12" y1="21" x2="12" y2="23" />
                <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
                <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
                <line x1="1" y1="12" x2="3" y2="12" />
                <line x1="21" y1="12" x2="23" y2="12" />
                <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
                <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
              </svg>
            ) : (
              <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
              </svg>
            )}
          </button>

          {/* Cart Button */}
          <Link
            to="/customer/cart"
            className={`navbar-cart-btn ${isCartActive ? 'active' : ''}`}
            id="navbar-cart-btn"
            aria-label={`Shopping Cart${itemCount > 0 ? ` (${itemCount} items)` : ''}`}
            aria-current={isCartActive ? 'page' : undefined}
          >
            <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <circle cx="9" cy="21" r="1" />
              <circle cx="20" cy="21" r="1" />
              <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
            </svg>
            {itemCount > 0 && <span className="cart-badge">{itemCount}</span>}
          </Link>

          {/* Real Notification Bell */}
          <NotificationBell role="customer" />

          {/* User Auth Controls */}
          {user ? (
            <UserMenu user={user} onLogout={handleLogout} />
          ) : (
            <div className="navbar-auth-group">
              <Link to="/login" className="btn btn-ghost btn-sm" id="navbar-login-btn">
                Login
              </Link>
              <Link to="/register" className="btn btn-primary btn-sm" id="navbar-register-btn">
                Register
              </Link>
            </div>
          )}

          {/* Mobile Hamburger Toggle */}
          <button
            className={`hamburger ${mobileOpen ? 'open' : ''}`}
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label={mobileOpen ? 'Close navigation menu' : 'Open navigation menu'}
            aria-expanded={mobileOpen}
            id="mobile-menu-btn"
          >
            <span />
            <span />
            <span />
          </button>
        </div>
      </div>

      {/* Mobile / Tablet Drawer */}
      {mobileOpen && (
        <div className="mobile-menu animate-fade-in" id="mobile-menu-drawer">
          <div className="mobile-search-section">
            <SearchBar />
          </div>

          <div className="mobile-links" role="menu">
            {NAV_ITEMS.map((item) => {
              const active = item.isActive(location.pathname);
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`mobile-link ${active ? 'active' : ''}`}
                  aria-current={active ? 'page' : undefined}
                  role="menuitem"
                >
                  <span>{item.name}</span>
                  <span className="mobile-link-arrow" aria-hidden="true">→</span>
                </Link>
              );
            })}

            <div className="mobile-menu-divider" />

            {user ? (
              <>
                <Link
                  to="/customer/orders"
                  className={`mobile-link ${
                    location.pathname.startsWith('/customer/orders') || location.pathname === '/orders'
                      ? 'active'
                      : ''
                  }`}
                  aria-current={
                    location.pathname.startsWith('/customer/orders') || location.pathname === '/orders'
                      ? 'page'
                      : undefined
                  }
                  role="menuitem"
                >
                  <span>My Orders</span>
                  <span className="mobile-link-arrow" aria-hidden="true">→</span>
                </Link>
                <Link
                  to="/customer/my-subscriptions"
                  className={`mobile-link ${
                    location.pathname === '/customer/my-subscriptions' ? 'active' : ''
                  }`}
                  aria-current={
                    location.pathname === '/customer/my-subscriptions' ? 'page' : undefined
                  }
                  role="menuitem"
                >
                  <span>My Subscriptions</span>
                  <span className="mobile-link-arrow" aria-hidden="true">→</span>
                </Link>
                <Link
                  to="/customer/profile"
                  className={`mobile-link ${
                    location.pathname.startsWith('/customer/profile') || location.pathname === '/profile'
                      ? 'active'
                      : ''
                  }`}
                  aria-current={
                    location.pathname.startsWith('/customer/profile') || location.pathname === '/profile'
                      ? 'page'
                      : undefined
                  }
                  role="menuitem"
                >
                  <span>Profile Settings</span>
                  <span className="mobile-link-arrow" aria-hidden="true">→</span>
                </Link>
              </>
            ) : (
              <div className="mobile-auth-actions">
                <Link to="/login" className="btn btn-outline btn-block" id="mobile-login-btn">
                  Login
                </Link>
                <Link to="/register" className="btn btn-primary btn-block" id="mobile-register-btn">
                  Create Account
                </Link>
              </div>
            )}

            <Link
              to="/customer/support"
              className={`mobile-link ${
                location.pathname.startsWith('/customer/support') || location.pathname === '/support'
                  ? 'active'
                  : ''
              }`}
              aria-current={
                location.pathname.startsWith('/customer/support') || location.pathname === '/support'
                  ? 'page'
                  : undefined
              }
              role="menuitem"
            >
              <span>Customer Support</span>
              <span className="mobile-link-arrow" aria-hidden="true">→</span>
            </Link>
          </div>
        </div>
      )}

      {/* Global Vehicle Selector Modal */}
      <VehicleSelectorModal
        isOpen={vehicleSelectorOpen}
        onClose={() => setVehicleSelectorOpen(false)}
        title="Select Vehicle for Part Fitment"
      />
    </nav>
  );
};

export default Navbar;
