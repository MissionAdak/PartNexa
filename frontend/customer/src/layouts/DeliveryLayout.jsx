import React, { useState, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import UnifiedHeader from '../components/layout/UnifiedHeader';
import DeliveryNavbar from '../components/delivery/DeliveryNavbar';
import DeliverySidebar from '../components/delivery/DeliverySidebar';

export const DeliveryLayout = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

  // Automatically close mobile drawer when navigating between routes
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  return (
    <div className="delivery-app-layout">
      <UnifiedHeader>
        <DeliveryNavbar onToggleSidebar={() => setMobileMenuOpen((prev) => !prev)} />
      </UnifiedHeader>
      <div className="delivery-body-wrapper">
        <DeliverySidebar
          isOpen={mobileMenuOpen}
          onClose={() => setMobileMenuOpen(false)}
        />
        <main className="delivery-main-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DeliveryLayout;
