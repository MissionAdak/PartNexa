import React from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import DeliveryNavbar from './DeliveryNavbar';
import DeliverySidebar from './DeliverySidebar';
import { useDeliveryAuth } from '../../contexts/DeliveryAuthContext';
import PartNexaLogo from '../common/PartNexaLogo';

export const DeliveryLayout = () => {
  const { user, loading } = useDeliveryAuth();

  if (loading) {
    return (
      <div
        style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'var(--color-bg)',
          color: 'var(--color-text-primary)',
          fontFamily: 'var(--font-primary)',
        }}
      >
        <div style={{ textAlign: 'center' }}>
          <div style={{ marginBottom: '1rem', display: 'flex', justifyContent: 'center' }}>
            <PartNexaLogo variant="icon" size={48} linkTo={false} />
          </div>
          <div style={{ fontWeight: 700, fontSize: '1.1rem' }}>Loading PartNexa Rider Portal...</div>
        </div>
      </div>
    );
  }

  // If not authenticated, redirect to login
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <DeliveryNavbar />
      <div style={{ display: 'flex', flex: 1 }}>
        <DeliverySidebar />
        <main
          style={{
            flex: 1,
            background: 'var(--color-bg)',
            overflowY: 'auto',
            paddingBottom: '3rem',
          }}
        >
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DeliveryLayout;
