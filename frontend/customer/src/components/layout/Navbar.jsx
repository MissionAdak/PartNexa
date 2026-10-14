import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  Car,
  Bike,
  Plus,
  ArrowRight,
  Sun,
  Moon,
  Search,
  ShoppingCart,
  ChevronDown,
  Warehouse,
  Check,
  RotateCcw,
  Sparkles,
  User,
  Package,
  HelpCircle,
  LogOut,
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useCart } from '../../contexts/CartContext';
import { useVehicles } from '../../contexts/VehicleContext';
import VehicleSelectorModal from '../vehicle/VehicleSelectorModal';
import NotificationBell from '../notifications/NotificationBell';
import toast from 'react-hot-toast';
import PartNexaLogo from '../common/PartNexaLogo';
import './Navbar.css';

/**
 * Canonical Customer Desktop Navigation Configuration
 * Center links: Browse Parts, DIFM Services, Subscriptions, Sell Used Part
 * (My Vehicles is moved into the Select Vehicle dropdown/modal as "View My Garage")
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
];

/**
 * Compact, Expandable Search Bar
 * Width ~180px on wide desktop, shrinking to ~130px on compact desktop,
 * expands smoothly on focus without pushing actions off screen.
 */
const CompactSearchBar = () => {
  const [query, setQuery] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const navigate = useNavigate();

  const handleSearch = (e) => {
    e.preventDefault();
    if (query.trim()) {
      navigate(`/customer/products?search=${encodeURIComponent(query.trim())}`);
      setQuery('');
    }
  };

  return (
    <form
      className={`navbar-search ${isFocused ? 'focused' : ''}`}
      onSubmit={handleSearch}
      role="search"
    >
      <Search className="search-icon" size={15} strokeWidth={2} aria-hidden="true" />
      <input
        type="search"
        id="navbar-search-input"
        className="navbar-search-input"
        placeholder="Search parts, OEM..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        aria-label="Search spare parts"
      />
    </form>
  );
};

/**
 * Vehicle Selector Dropdown
 * Displays active vehicle with compact label ("Nexon" / "Tata Nexon" / "Select Vehicle")
 * Dropdown contains:
 * - Current Vehicle summary (make, model, variant, year, active fitment)
 * - Switch Vehicle (opens modal)
 * - View My Garage (navigates to /customer/vehicles)
 * - Add Vehicle (opens modal in wizard mode)
 */
const VehicleSelectorDropdown = ({ onOpenModal, onAddVehicleModal }) => {
  const { vehicles, activeVehicle, primaryVehicle } = useVehicles();
  const displayVehicle = activeVehicle || primaryVehicle;
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const isTwoWheeler =
    displayVehicle?.variant?.model?.make?.type === 'BIKE' ||
    displayVehicle?.variant?.model?.make?.type === 'SCOOTER';

  // Compact vehicle name for pill (truncate so it never blows up navbar width)
  const shortName = displayVehicle
    ? displayVehicle.nickname ||
      displayVehicle.variant?.model?.name ||
      `${displayVehicle.variant?.model?.make?.name || ''} ${displayVehicle.variant?.model?.name || ''}`.trim() ||
      'Vehicle'
    : 'Select Vehicle';

  return (
    <div className="vehicle-dropdown-wrapper" ref={dropdownRef}>
      <button
        type="button"
        className={`vehicle-pill ${displayVehicle ? 'has-vehicle' : 'no-vehicle'} ${open ? 'dropdown-active' : ''}`}
        id="navbar-vehicle-selector-btn"
        onClick={() => setOpen(!open)}
        aria-expanded={open}
        aria-haspopup="true"
        aria-label="Vehicle selector menu"
        title={displayVehicle ? `Active Vehicle: ${shortName} (Click to manage)` : 'Select your vehicle'}
      >
        <span className="vehicle-pill-icon" aria-hidden="true">
          {isTwoWheeler ? <Bike size={15} strokeWidth={2} /> : <Car size={15} strokeWidth={2} />}
        </span>
        <span className="vehicle-pill-label">{shortName}</span>
        <ChevronDown size={13} strokeWidth={2.2} className={`vehicle-chevron ${open ? 'rotated' : ''}`} />
      </button>

      {open && (
        <div className="vehicle-dropdown-menu" role="menu" id="vehicle-dropdown-popover">
          {/* 1. Current Vehicle Section */}
          <div className="vdm-section vdm-current-vehicle">
            <div className="vdm-section-header">
              <span className="vdm-section-title">Current Vehicle</span>
              {displayVehicle && <span className="vdm-fitment-badge">Guaranteed Fitment</span>}
            </div>

            {displayVehicle ? (
              <div className="vdm-vehicle-card">
                <div className="vdm-card-icon">
                  {isTwoWheeler ? <Bike size={18} strokeWidth={2} /> : <Car size={18} strokeWidth={2} />}
                </div>
                <div className="vdm-card-text">
                  <div className="vdm-card-title">
                    {displayVehicle.nickname ||
                      `${displayVehicle.variant?.model?.make?.name || ''} ${displayVehicle.variant?.model?.name || ''}`}
                  </div>
                  <div className="vdm-card-meta">
                    {displayVehicle.variant?.year ? `${displayVehicle.variant.year} · ` : ''}
                    {displayVehicle.variant?.name || 'Standard'}
                    {displayVehicle.variant?.fuelType ? ` (${displayVehicle.variant.fuelType})` : ''}
                  </div>
                </div>
              </div>
            ) : (
              <div className="vdm-empty-card">
                <p className="vdm-empty-desc">No vehicle active. Select a vehicle to check compatibility across all parts.</p>
              </div>
            )}
          </div>

          <div className="vdm-divider" />

          {/* 2. Actions: Switch Vehicle, View My Garage, Add Vehicle */}
          <div className="vdm-actions-group">
            {/* Switch Vehicle */}
            <button
              type="button"
              className="vdm-action-item"
              id="vdm-switch-vehicle-btn"
              onClick={() => {
                setOpen(false);
                onOpenModal();
              }}
              role="menuitem"
            >
              <div className="vdm-action-icon-box action-switch">
                <RotateCcw size={15} strokeWidth={2} />
              </div>
              <div className="vdm-action-text">
                <span className="vdm-action-heading">Switch Vehicle</span>
                <span className="vdm-action-sub">Change active vehicle or choose model</span>
              </div>
            </button>

            {/* View My Garage -> Navigates to /customer/vehicles */}
            <button
              type="button"
              className="vdm-action-item"
              id="vdm-view-garage-btn"
              onClick={() => {
                setOpen(false);
                navigate('/customer/vehicles');
              }}
              role="menuitem"
            >
              <div className="vdm-action-icon-box action-garage">
                <Warehouse size={15} strokeWidth={2} />
              </div>
              <div className="vdm-action-text">
                <span className="vdm-action-heading">View My Garage</span>
                <span className="vdm-action-sub">Manage saved vehicles & service history</span>
              </div>
            </button>

            {/* Add Vehicle */}
            <button
              type="button"
              className="vdm-action-item"
              id="vdm-add-vehicle-btn"
              onClick={() => {
                setOpen(false);
                onAddVehicleModal();
              }}
              role="menuitem"
            >
              <div className="vdm-action-icon-box action-add">
                <Plus size={15} strokeWidth={2.2} />
              </div>
              <div className="vdm-action-text">
                <span className="vdm-action-heading">Add Vehicle</span>
                <span className="vdm-action-sub">Add another car, bike, or scooter</span>
              </div>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

/**
 * Compact User Menu
 * Displays avatar + first name + chevron (no unnecessary role text).
 */
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
        <ChevronDown size={13} strokeWidth={2.2} className={`user-chevron ${open ? 'rotated' : ''}`} />
      </button>

      {open && (
        <div className="dropdown-menu" role="menu">
          <div className="user-menu-header">
            <div className="user-menu-name">
              {user.firstName} {user.lastName}
            </div>
            <div className="user-menu-email">{user.email}</div>
          </div>
          <Link to="/customer/profile" className="dropdown-item" onClick={() => setOpen(false)} role="menuitem">
            <User size={15} strokeWidth={1.8} />
            <span>My Profile</span>
          </Link>
          <Link to="/customer/orders" className="dropdown-item" onClick={() => setOpen(false)} role="menuitem">
            <Package size={15} strokeWidth={1.8} />
            <span>My Orders</span>
          </Link>
          <Link to="/customer/vehicles" className="dropdown-item" onClick={() => setOpen(false)} role="menuitem">
            <Warehouse size={15} strokeWidth={1.8} />
            <span>My Garage</span>
          </Link>
          <Link to="/customer/my-subscriptions" className="dropdown-item" onClick={() => setOpen(false)} role="menuitem">
            <Sparkles size={15} strokeWidth={1.8} />
            <span>My Subscriptions</span>
          </Link>
          <Link to="/customer/support" className="dropdown-item" onClick={() => setOpen(false)} role="menuitem">
            <HelpCircle size={15} strokeWidth={1.8} />
            <span>Help & Support</span>
          </Link>
          <div className="dropdown-divider" />
          <button className="dropdown-item danger" onClick={onLogout} role="menuitem">
            <LogOut size={15} strokeWidth={1.8} />
            <span>Logout</span>
          </button>
        </div>
      )}
    </div>
  );
};

export default function Navbar() {
  const { user, logout } = useAuth();
  const { itemCount } = useCart();
  const navigate = useNavigate();
  const location = useLocation();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [vehicleSelectorOpen, setVehicleSelectorOpen] = useState(false);

  // Theme state: support light & dark across portals
  const [theme, setTheme] = useState(
    () => localStorage.getItem('partnexa_theme') || localStorage.getItem('partsphere_theme') || 'light'
  );

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
        {/* LEFT: PartNexa Brand Logo */}
        <div className="navbar-left">
          <PartNexaLogo
            id="navbar-logo"
            variant="horizontal"
            portal="customer"
            size="md"
            linkTo="/customer"
            ariaLabel="PartNexa Customer Home"
          />
        </div>

        {/* CENTER: Clean Canonical Navigation Links (Desktop) */}
        <div className="navbar-center" role="menubar">
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

        {/* RIGHT: Search, Select Vehicle, Theme, Cart, Bell, Profile/Login */}
        <div className="navbar-right">
          {/* Compact Search Field */}
          <div className="navbar-search-wrapper">
            <CompactSearchBar />
          </div>

          {/* Select Vehicle Dropdown */}
          <VehicleSelectorDropdown
            onOpenModal={() => setVehicleSelectorOpen(true)}
            onAddVehicleModal={() => setVehicleSelectorOpen(true)}
          />

          {/* Theme Switcher Button */}
          <button
            id="theme-toggle-btn"
            className="icon-action-btn theme-toggle-btn"
            onClick={toggleTheme}
            aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
            title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
          >
            {theme === 'dark' ? (
              <Sun size={17} strokeWidth={2} />
            ) : (
              <Moon size={17} strokeWidth={2} />
            )}
          </button>

          {/* Shopping Cart Button */}
          <Link
            to="/customer/cart"
            className={`icon-action-btn navbar-cart-btn ${isCartActive ? 'active' : ''}`}
            id="navbar-cart-btn"
            aria-label={`Shopping Cart${itemCount > 0 ? ` (${itemCount} items)` : ''}`}
            aria-current={isCartActive ? 'page' : undefined}
          >
            <ShoppingCart size={17} strokeWidth={2} />
            {itemCount > 0 && <span className="cart-badge">{itemCount}</span>}
          </Link>

          {/* Real Notification Bell */}
          <NotificationBell role="customer" />

          {/* User Auth Controls: Profile if logged in, Login + Register if unauthenticated */}
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

          {/* Mobile Drawer Hamburger (Hidden on desktop >= 900px) */}
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

      {/* Mobile Drawer (Only active when mobileOpen on screens < 900px) */}
      {mobileOpen && (
        <div className="mobile-menu animate-fade-in" id="mobile-menu-drawer">
          <div className="mobile-search-section">
            <CompactSearchBar />
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
                  <span className="mobile-link-arrow" aria-hidden="true">
                    <ArrowRight size={15} strokeWidth={1.8} />
                  </span>
                </Link>
              );
            })}

            {/* Garage Link in Mobile Drawer */}
            <Link
              to="/customer/vehicles"
              className={`mobile-link ${
                location.pathname.startsWith('/customer/vehicles') ? 'active' : ''
              }`}
              aria-current={location.pathname.startsWith('/customer/vehicles') ? 'page' : undefined}
              role="menuitem"
            >
              <span>My Garage</span>
              <span className="mobile-link-arrow" aria-hidden="true">
                <ArrowRight size={15} strokeWidth={1.8} />
              </span>
            </Link>

            <div className="mobile-menu-divider" />

            {user ? (
              <>
                <Link
                  to="/customer/orders"
                  className={`mobile-link ${
                    location.pathname.startsWith('/customer/orders') ? 'active' : ''
                  }`}
                  aria-current={location.pathname.startsWith('/customer/orders') ? 'page' : undefined}
                  role="menuitem"
                >
                  <span>My Orders</span>
                  <span className="mobile-link-arrow" aria-hidden="true">
                    <ArrowRight size={15} strokeWidth={1.8} />
                  </span>
                </Link>
                <Link
                  to="/customer/my-subscriptions"
                  className={`mobile-link ${
                    location.pathname === '/customer/my-subscriptions' ? 'active' : ''
                  }`}
                  aria-current={location.pathname === '/customer/my-subscriptions' ? 'page' : undefined}
                  role="menuitem"
                >
                  <span>My Subscriptions</span>
                  <span className="mobile-link-arrow" aria-hidden="true">
                    <ArrowRight size={15} strokeWidth={1.8} />
                  </span>
                </Link>
                <Link
                  to="/customer/profile"
                  className={`mobile-link ${
                    location.pathname.startsWith('/customer/profile') ? 'active' : ''
                  }`}
                  aria-current={location.pathname.startsWith('/customer/profile') ? 'page' : undefined}
                  role="menuitem"
                >
                  <span>Profile Settings</span>
                  <span className="mobile-link-arrow" aria-hidden="true">
                    <ArrowRight size={15} strokeWidth={1.8} />
                  </span>
                </Link>
              </>
            ) : (
              <div className="mobile-auth-actions">
                <Link to="/login" className="btn btn-outline btn-block" id="mobile-login-btn">
                  Login
                </Link>
                <Link to="/register" className="btn btn-primary btn-block" id="mobile-register-btn">
                  Register
                </Link>
              </div>
            )}

            <Link
              to="/customer/support"
              className={`mobile-link ${
                location.pathname.startsWith('/customer/support') ? 'active' : ''
              }`}
              aria-current={location.pathname.startsWith('/customer/support') ? 'page' : undefined}
              role="menuitem"
            >
              <span>Customer Support</span>
              <span className="mobile-link-arrow" aria-hidden="true">
                <ArrowRight size={15} strokeWidth={1.8} />
              </span>
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
}
