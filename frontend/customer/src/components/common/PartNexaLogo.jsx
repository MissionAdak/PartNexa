import React, { useId } from 'react';
import { Link } from 'react-router-dom';
import './PartNexaLogo.css';

/**
 * Universal PartNexa Brand Logo Component
 * Modern Automotive-Tech Identity: Spare Parts + Repair/Service + Circular Reuse Ecosystem
 *
 * @param {'horizontal' | 'compact' | 'icon' | 'stacked'} variant - Visual presentation layout
 * @param {'customer' | 'workshop' | 'delivery' | 'admin' | null} portal - Active portal configuration
 * @param {'sm' | 'md' | 'lg' | 'xl' | number} size - Predefined or explicit pixel dimension
 * @param {string | false | null} linkTo - Route destination (or false to render plain div)
 * @param {boolean} showTagline - Force display of automotive-tech subtitle
 * @param {string} className - Additional CSS class names
 * @param {object} style - Inline style overrides
 */
export default function PartNexaLogo({
  id: idProp = undefined,
  variant = 'horizontal',
  portal = null,
  size = 'md',
  linkTo = undefined,
  showTagline = false,
  className = '',
  style = {},
  ariaLabel = undefined,
}) {
  const rawId = useId();
  const id = rawId.replace(/[^a-zA-Z0-9_-]/g, '');

  // Calculate default routing target
  const resolveTarget = () => {
    if (linkTo === false || linkTo === null) return null;
    if (typeof linkTo === 'string') return linkTo;

    switch (portal) {
      case 'workshop':
      case 'shop':
        return '/shop';
      case 'delivery':
        return '/delivery';
      case 'admin':
        return '/admin';
      case 'customer':
      default:
        return '/customer';
    }
  };

  const targetPath = resolveTarget();

  // Portal text specifications
  const portalConfig = {
    workshop: {
      badge: 'WORKSHOP',
      subtitle: 'Mechanical Workshop Console',
    },
    shop: {
      badge: 'WORKSHOP',
      subtitle: 'Mechanical Workshop Console',
    },
    delivery: {
      badge: 'DELIVERY',
      subtitle: 'Delivery Partner Portal',
    },
    admin: {
      badge: 'ADMIN',
      subtitle: 'Admin Console',
    },
    customer: {
      badge: null,
      subtitle: 'Automotive Spares & Services',
    },
  };

  const activePortalInfo = portal ? portalConfig[portal] : null;

  // Custom size style calculation if numeric
  const isNumericSize = typeof size === 'number';
  const customDimensions = isNumericSize
    ? {
        emblemSize: size,
        fontSize: Math.round(size * 0.42),
      }
    : null;

  // The Pure Vector PartNexa Emblem
  const renderEmblem = () => (
    <div
      className="partnexa-logo-emblem"
      style={customDimensions ? { width: customDimensions.emblemSize, height: customDimensions.emblemSize } : {}}
      aria-hidden="true"
    >
      <svg
        viewBox="0 0 48 48"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="partnexa-emblem-svg"
      >
        <defs>
          {/* Primary Electric Blue Gradient (Parts & Speed) */}
          <linearGradient id={`pn-blue-${id}`} x1="6" y1="8" x2="42" y2="28" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#38BDF8" />
            <stop offset="50%" stopColor="#0284C7" />
            <stop offset="100%" stopColor="#0369A1" />
          </linearGradient>

          {/* Secondary Performance Teal Gradient (Circularity & Workshop) */}
          <linearGradient id={`pn-teal-${id}`} x1="42" y1="28" x2="6" y2="40" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#2DD4BF" />
            <stop offset="50%" stopColor="#0D9488" />
            <stop offset="100%" stopColor="#0F766E" />
          </linearGradient>

          {/* Technical Squircle Background Gradient */}
          <linearGradient id={`pn-bg-${id}`} x1="0" y1="0" x2="48" y2="48" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#0B1528" />
            <stop offset="100%" stopColor="#062224" />
          </linearGradient>
        </defs>

        {/* Outer Precision Squircle Housing */}
        <rect
          x="2"
          y="2"
          width="44"
          height="44"
          rx="12"
          fill={`url(#pn-bg-${id})`}
          stroke="#0284C7"
          strokeOpacity="0.4"
          strokeWidth="1.5"
        />

        {/* Flow 1: Top 'P' / Automotive Component Precision Loop */}
        <path
          d="M13 34V15C13 11.6863 15.6863 9 19 9H27C31.4183 9 35 12.5817 35 17C35 21.4183 31.4183 25 27 25H20"
          stroke={`url(#pn-blue-${id})`}
          strokeWidth="4.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Flow 2: Return Nexus / Mechanical Service & Circular Ecosystem Loop */}
        <path
          d="M35 17V33C35 36.3137 32.3137 39 29 39H21C16.5817 39 13 35.4183 13 31C13 26.5817 16.5817 23 21 23H28"
          stroke={`url(#pn-teal-${id})`}
          strokeWidth="4.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Central Precision Fitment Hub (Direct Alignment Core) */}
        <circle cx="24" cy="24" r="3.2" fill="#FFFFFF" />
        <circle cx="24" cy="24" r="1.5" fill="#0284C7" />

        {/* Tech Calibration Balance Nodes */}
        <circle cx="27" cy="17" r="1.5" fill="#38BDF8" />
        <circle cx="21" cy="31" r="1.5" fill="#2DD4BF" />
      </svg>
    </div>
  );

  // Accessible Label
  const resolvedAria =
    ariaLabel ||
    (portal ? `PartNexa ${portal.toUpperCase()} Home` : 'PartNexa Automotive Home');

  // Container Classes
  const containerClasses = [
    'partnexa-logo-container',
    `variant-${variant}`,
    !isNumericSize ? `size-${size}` : '',
    targetPath ? 'partnexa-logo-link' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  const content = (
    <>
      {renderEmblem()}

      {variant !== 'icon' && (
        <div className="partnexa-logo-content">
          <div className="partnexa-logo-wordmark-row">
            <span
              className="partnexa-word-part"
              style={customDimensions ? { fontSize: customDimensions.fontSize } : {}}
            >
              Part
            </span>
            <span
              className="partnexa-word-nexa"
              style={customDimensions ? { fontSize: customDimensions.fontSize } : {}}
            >
              Nexa
            </span>

            {activePortalInfo?.badge && (
              <span
                className={`partnexa-portal-badge ${portal === 'shop' ? 'workshop' : portal}`}
                aria-label={`${activePortalInfo.badge} Portal`}
              >
                {activePortalInfo.badge}
              </span>
            )}
          </div>

          {(showTagline || (variant !== 'compact' && activePortalInfo?.subtitle)) && (
            <div className="partnexa-logo-subtitle">
              {activePortalInfo?.subtitle || 'Automotive Spares & Services'}
            </div>
          )}
        </div>
      )}
    </>
  );

  if (targetPath) {
    return (
      <Link
        id={idProp}
        to={targetPath}
        className={containerClasses}
        style={style}
        aria-label={resolvedAria}
      >
        {content}
      </Link>
    );
  }

  return (
    <div id={idProp} className={containerClasses} style={style} aria-label={resolvedAria}>
      {content}
    </div>
  );
}
