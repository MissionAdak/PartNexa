import React, { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './ProtectedRoute';

// Layouts (Synchronous for structural stability)
import CustomerLayout from '../layouts/CustomerLayout';
import ShopLayout from '../layouts/ShopLayout';
import DeliveryLayout from '../layouts/DeliveryLayout';
import AdminLayout from '../layouts/AdminLayout';

// Core Landing Page (Eager for instant above-the-fold paint)
import HomePage from '../pages/HomePage';

// Lazy-loaded Public & Auth Pages
const LoginPage = lazy(() => import('../pages/LoginPage'));
const RegisterPage = lazy(() => import('../pages/RegisterPage'));
const UnauthorizedPage = lazy(() => import('../pages/UnauthorizedPage'));
const NotFoundPage = lazy(() => import('../pages/NotFoundPage'));

// Lazy-loaded Customer Pages
const ProductsPage = lazy(() => import('../pages/ProductsPage'));
const ProductDetailPage = lazy(() => import('../pages/ProductDetailPage'));
const VehiclesPage = lazy(() => import('../pages/VehiclesPage'));
const VehicleOnboardingPage = lazy(() => import('../pages/VehicleOnboardingPage'));
const CartPage = lazy(() => import('../pages/CartPage'));
const CheckoutPage = lazy(() => import('../pages/CheckoutPage'));
const ServicesPage = lazy(() => import('../pages/ServicesPage'));
const SubscriptionsPage = lazy(() => import('../pages/SubscriptionsPage'));
const SubscriptionPlanDetailPage = lazy(() => import('../pages/SubscriptionPlanDetailPage'));
const MySubscriptionsPage = lazy(() => import('../pages/MySubscriptionsPage'));
const SellUsedPartPage = lazy(() => import('../pages/customer/SellUsedPartPage'));
const OrdersPage = lazy(() => import('../pages/OrdersPage'));
const OrderDetailPage = lazy(() => import('../pages/OrderDetailPage'));
const ProfilePage = lazy(() => import('../pages/ProfilePage'));
const SupportPage = lazy(() => import('../pages/SupportPage'));
const NotificationPage = lazy(() => import('../pages/NotificationPage'));

// Lazy-loaded Shop Pages
const ShopDashboardPage = lazy(() => import('../pages/shop/ShopDashboardPage'));
const ServiceCalendarPage = lazy(() => import('../pages/shop/ServiceCalendarPage'));
const CommissionLedgerPage = lazy(() => import('../pages/shop/CommissionLedgerPage'));
const DeliveriesPage = lazy(() => import('../pages/shop/DeliveriesPage'));
const UsedPartIntakePage = lazy(() => import('../pages/shop/UsedPartIntakePage'));
const ShopTicketsPage = lazy(() => import('../pages/shop/ShopTicketsPage'));
const ShopProfilePage = lazy(() => import('../pages/shop/ShopProfilePage'));
const ShopRegisterPage = lazy(() => import('../pages/shop/ShopRegisterPage'));

// Lazy-loaded Delivery Pages
const DeliveryDashboardPage = lazy(() => import('../pages/delivery/DeliveryDashboardPage'));
const AvailableJobsPage = lazy(() => import('../pages/delivery/AvailableJobsPage'));
const MyTripsPage = lazy(() => import('../pages/delivery/MyTripsPage'));
const JobDetailPage = lazy(() => import('../pages/delivery/JobDetailPage'));
const UsedPartInspectionPage = lazy(() => import('../pages/delivery/UsedPartInspectionPage'));
const UsedPartsListPage = lazy(() => import('../pages/delivery/UsedPartsListPage'));
const CodReconciliationPage = lazy(() => import('../pages/delivery/CodReconciliationPage'));
const KycUploadPage = lazy(() => import('../pages/delivery/KycUploadPage'));
const DeliveryProfilePage = lazy(() => import('../pages/delivery/DeliveryProfilePage'));
const DeliveryRegisterPage = lazy(() => import('../pages/delivery/DeliveryRegisterPage'));

// Lazy-loaded Admin Pages
const AdminDashboardPage = lazy(() => import('../pages/admin/AdminDashboardPage'));
const OrdersManagementPage = lazy(() => import('../pages/admin/OrdersManagementPage'));
const CustomersPage = lazy(() => import('../pages/admin/CustomersPage'));
const ShopsManagementPage = lazy(() => import('../pages/admin/ShopsManagementPage'));
const DeliveryPartnersPage = lazy(() => import('../pages/admin/DeliveryPartnersPage'));
const ProductsInventoryPage = lazy(() => import('../pages/admin/ProductsInventoryPage'));
const PlatformConfigPage = lazy(() => import('../pages/admin/PlatformConfigPage'));
const UsedPartsOversightPage = lazy(() => import('../pages/admin/UsedPartsOversightPage'));
const DeliveriesOversightPage = lazy(() => import('../pages/admin/DeliveriesOversightPage'));
const CustomerCareHubPage = lazy(() => import('../pages/admin/CustomerCareHubPage'));
const ProcurementDashboardPage = lazy(() => import('../pages/admin/ProcurementDashboardPage'));
const SupplierDetailPage = lazy(() => import('../pages/admin/SupplierDetailPage'));
const PurchaseOrderDetailPage = lazy(() => import('../pages/admin/PurchaseOrderDetailPage'));
const ReturnsManagementPage = lazy(() => import('../pages/admin/ReturnsManagementPage'));

const RouteFallback = () => (
  <div
    style={{
      minHeight: '60vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '1rem',
      color: 'var(--text-muted, #94a3b8)',
    }}
  >
    <div
      style={{
        width: '36px',
        height: '36px',
        border: '3px solid rgba(2, 132, 199, 0.15)',
        borderTopColor: 'var(--color-primary, #0284c7)',
        borderRadius: '50%',
        animation: 'spin 0.8s linear infinite',
      }}
    />
    <span style={{ fontSize: '0.88rem', fontWeight: 500, letterSpacing: '0.02em' }}>
      Loading page...
    </span>
    <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
  </div>
);

export const AppRoutes = () => {
  return (
    <Suspense fallback={<RouteFallback />}>
      <Routes>
      {/* Root redirect to Customer Marketplace */}
      <Route path="/" element={<Navigate to="/customer" replace />} />

      {/* Unified Authentication */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/unauthorized" element={<UnauthorizedPage />} />

      {/* Role-specific registration routes */}
      <Route path="/shop/register" element={<ShopRegisterPage />} />
      <Route path="/delivery/register" element={<DeliveryRegisterPage />} />
      <Route path="/shop/login" element={<Navigate to="/login?redirect=/shop" replace />} />
      <Route path="/delivery/login" element={<Navigate to="/login?redirect=/delivery" replace />} />
      <Route path="/admin/login" element={<Navigate to="/login?redirect=/admin" replace />} />

      {/* ============================================================ */}
      {/* 1. CUSTOMER PORTAL (/customer/* and root aliases)             */}
      {/* ============================================================ */}
      <Route element={<CustomerLayout />}>
        <Route path="/customer" element={<HomePage />} />
        <Route path="/customer/products" element={<ProductsPage />} />
        <Route path="/customer/products/:id" element={<ProductDetailPage />} />
        <Route path="/customer/products/slug/:slug" element={<ProductDetailPage />} />
        <Route path="/customer/vehicles" element={<VehiclesPage />} />
        <Route path="/customer/garage" element={<Navigate to="/customer/vehicles" replace />} />
        <Route
          path="/customer/onboarding/vehicle"
          element={
            <ProtectedRoute allowedRoles={['CUSTOMER']}>
              <VehicleOnboardingPage />
            </ProtectedRoute>
          }
        />
        <Route path="/customer/cart" element={<CartPage />} />
        <Route
          path="/customer/checkout"
          element={
            <ProtectedRoute allowedRoles={['CUSTOMER']}>
              <CheckoutPage />
            </ProtectedRoute>
          }
        />
        <Route path="/customer/services" element={<ServicesPage />} />
        <Route path="/customer/subscriptions" element={<SubscriptionsPage />} />
        <Route path="/customer/subscriptions/:id" element={<SubscriptionPlanDetailPage />} />
        <Route
          path="/customer/my-subscriptions"
          element={
            <ProtectedRoute allowedRoles={['CUSTOMER']}>
              <MySubscriptionsPage />
            </ProtectedRoute>
          }
        />
        <Route path="/customer/sell-used-parts" element={<SellUsedPartPage />} />
        <Route
          path="/customer/orders"
          element={
            <ProtectedRoute allowedRoles={['CUSTOMER']}>
              <OrdersPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/customer/orders/:id"
          element={
            <ProtectedRoute allowedRoles={['CUSTOMER']}>
              <OrderDetailPage />
            </ProtectedRoute>
          }
        />
        <Route path="/customer/support" element={<SupportPage />} />
        <Route
          path="/customer/profile"
          element={
            <ProtectedRoute allowedRoles={['CUSTOMER']}>
              <ProfilePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/customer/notifications"
          element={
            <ProtectedRoute allowedRoles={['CUSTOMER']}>
              <NotificationPage portal="customer" />
            </ProtectedRoute>
          }
        />
        <Route path="/notifications" element={<Navigate to="/customer/notifications" replace />} />

        {/* Backward-Compatible Direct Aliases */}
        <Route path="/products" element={<Navigate to="/customer/products" replace />} />
        <Route path="/products/:id" element={<ProductDetailPage />} />
        <Route path="/products/slug/:slug" element={<ProductDetailPage />} />
        <Route path="/cart" element={<Navigate to="/customer/cart" replace />} />
        <Route path="/checkout" element={<Navigate to="/customer/checkout" replace />} />
        <Route path="/services" element={<Navigate to="/customer/services" replace />} />
        <Route path="/subscriptions" element={<Navigate to="/customer/subscriptions" replace />} />
        <Route path="/subscriptions/:id" element={<SubscriptionPlanDetailPage />} />
        <Route
          path="/my-subscriptions"
          element={
            <ProtectedRoute allowedRoles={['CUSTOMER']}>
              <MySubscriptionsPage />
            </ProtectedRoute>
          }
        />
        <Route path="/vehicles" element={<Navigate to="/customer/vehicles" replace />} />
        <Route path="/garage" element={<Navigate to="/customer/vehicles" replace />} />
        <Route
          path="/onboarding/vehicle"
          element={
            <ProtectedRoute allowedRoles={['CUSTOMER']}>
              <VehicleOnboardingPage />
            </ProtectedRoute>
          }
        />
        <Route path="/sell-used-parts" element={<Navigate to="/customer/sell-used-parts" replace />} />
        <Route path="/orders" element={<Navigate to="/customer/orders" replace />} />
        <Route
          path="/orders/:id"
          element={
            <ProtectedRoute allowedRoles={['CUSTOMER']}>
              <OrderDetailPage />
            </ProtectedRoute>
          }
        />
        <Route path="/support" element={<Navigate to="/customer/support" replace />} />
        <Route path="/profile" element={<Navigate to="/customer/profile" replace />} />

        {/* Workshop direct aliases */}
        <Route path="/calendar" element={<Navigate to="/shop/calendar" replace />} />
        <Route path="/commission" element={<Navigate to="/shop/commission" replace />} />
        <Route path="/deliveries" element={<Navigate to="/shop/deliveries" replace />} />

        {/* Delivery direct aliases */}
        <Route path="/kyc" element={<Navigate to="/delivery/kyc" replace />} />
        <Route path="/cod" element={<Navigate to="/delivery/cod" replace />} />
      </Route>

      {/* ============================================================ */}
      {/* 2. MECHANICAL WORKSHOP PORTAL (/shop/*)                       */}
      {/* ============================================================ */}
      <Route
        path="/shop"
        element={
          <ProtectedRoute allowedRoles={['SHOP_OWNER']}>
            <ShopLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<ShopDashboardPage />} />
        <Route path="calendar" element={<ServiceCalendarPage />} />
        <Route path="commission" element={<CommissionLedgerPage />} />
        <Route path="deliveries" element={<DeliveriesPage />} />
        <Route path="used-parts" element={<UsedPartIntakePage />} />
        <Route path="tickets" element={<ShopTicketsPage />} />
        <Route path="profile" element={<ShopProfilePage />} />
        <Route path="notifications" element={<NotificationPage portal="shop" />} />
      </Route>

      {/* ============================================================ */}
      {/* 3. DELIVERY PARTNER PORTAL (/delivery/*)                     */}
      {/* ============================================================ */}
      <Route
        path="/delivery"
        element={
          <ProtectedRoute allowedRoles={['DELIVERY_PARTNER']}>
            <DeliveryLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<DeliveryDashboardPage />} />
        <Route path="dashboard" element={<Navigate to="/delivery" replace />} />
        <Route path="jobs/available" element={<AvailableJobsPage />} />
        <Route path="jobs/my" element={<MyTripsPage />} />
        <Route path="jobs/:id" element={<JobDetailPage />} />
        <Route path="jobs/:id/inspect" element={<UsedPartInspectionPage />} />
        <Route path="used-parts" element={<UsedPartsListPage />} />
        <Route path="cod" element={<CodReconciliationPage />} />
        <Route path="kyc" element={<KycUploadPage />} />
        <Route path="profile" element={<DeliveryProfilePage />} />
        <Route path="notifications" element={<NotificationPage portal="delivery" />} />
      </Route>

      {/* ============================================================ */}
      {/* 4. EXECUTIVE ADMIN CONSOLE (/admin/*)                         */}
      {/* ============================================================ */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute allowedRoles={['ADMIN', 'SUPER_ADMIN']}>
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<AdminDashboardPage />} />
        <Route path="procurement" element={<ProcurementDashboardPage />} />
        <Route path="procurement/suppliers" element={<ProcurementDashboardPage initialTab="suppliers" />} />
        <Route path="procurement/suppliers/:id" element={<SupplierDetailPage />} />
        <Route path="procurement/catalog" element={<ProcurementDashboardPage initialTab="catalog" />} />
        <Route path="procurement/orders" element={<ProcurementDashboardPage initialTab="pos" />} />
        <Route path="procurement/orders/:id" element={<PurchaseOrderDetailPage />} />
        <Route path="procurement/pos" element={<ProcurementDashboardPage initialTab="pos" />} />
        <Route path="procurement/pos/:id" element={<PurchaseOrderDetailPage />} />
        <Route path="procurement/history" element={<ProcurementDashboardPage initialTab="history" />} />
        <Route path="orders" element={<OrdersManagementPage />} />
        <Route path="returns" element={<ReturnsManagementPage />} />
        <Route path="customers" element={<CustomersPage />} />
        <Route path="shops" element={<ShopsManagementPage />} />
        <Route path="delivery-partners" element={<DeliveryPartnersPage />} />
        <Route path="products-inventory" element={<ProductsInventoryPage />} />
        <Route path="platform-config" element={<PlatformConfigPage />} />
        <Route path="used-parts" element={<UsedPartsOversightPage />} />
        <Route path="deliveries" element={<DeliveriesOversightPage />} />
        <Route path="care-hub" element={<CustomerCareHubPage />} />
        <Route path="notifications" element={<NotificationPage portal="admin" />} />
      </Route>

      {/* Global 404 Catch-All */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  </Suspense>
);
};

export default AppRoutes;
