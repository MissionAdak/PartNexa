import React, { useState } from 'react';

export default function SupplierLogo({ logoUrl, name, size = 42, fontSize = '0.95rem', style = {} }) {
  const [imageError, setImageError] = useState(false);

  const initials = (name || 'SP')
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase();

  // Distinct background gradients for initials based on name hash
  const getGradient = (str) => {
    const gradients = [
      'linear-gradient(135deg, #0284C7, #0D9488)',
      'linear-gradient(135deg, #2563EB, #7C3AED)',
      'linear-gradient(135deg, #D97706, #DC2626)',
      'linear-gradient(135deg, #059669, #10B981)',
      'linear-gradient(135deg, #4F46E5, #9333EA)',
      'linear-gradient(135deg, #E11D48, #BE123C)',
    ];
    let hash = 0;
    for (let i = 0; i < (str || '').length; i++) {
      hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    return gradients[Math.abs(hash) % gradients.length];
  };

  if (logoUrl && !imageError) {
    return (
      <img
        src={logoUrl}
        alt={name || 'Supplier Logo'}
        onError={() => setImageError(true)}
        style={{
          width: `${size}px`,
          height: `${size}px`,
          borderRadius: '10px',
          objectFit: 'contain',
          backgroundColor: '#FFFFFF',
          padding: '4px',
          border: '1px solid var(--border-color)',
          flexShrink: 0,
          ...style,
        }}
      />
    );
  }

  return (
    <div
      title={name || 'Supplier'}
      style={{
        width: `${size}px`,
        height: `${size}px`,
        borderRadius: '10px',
        background: getGradient(name),
        color: '#FFFFFF',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontWeight: 800,
        fontSize,
        flexShrink: 0,
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
        letterSpacing: '0.05em',
        userSelect: 'none',
        border: '1px solid rgba(255, 255, 255, 0.2)',
        ...style,
      }}
    >
      {initials}
    </div>
  );
}
