import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ordersService, paymentsService, returnsService } from '../../services';
import { Button, Badge, Skeleton, EmptyState } from '../../components/ui';
import RazorpayModal from '../../components/checkout/RazorpayModal';
import {
  FileText,
  Banknote,
  Zap,
  Check,
  RotateCcw,
  ShieldCheck,
  Clock,
  CreditCard,
  XCircle,
  MapPin,
  Phone,
  Wrench,
  Calendar,
  Lock,
  Truck,
  MessageSquare,
  ClipboardList,
  X,
} from 'lucide-react';
import toast from 'react-hot-toast';
import './OrderDetailPage.css';

const OrderDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  // Payment states
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [activePaymentSession, setActivePaymentSession] = useState(null);
  const [isRetryingPayment, setIsRetryingPayment] = useState(false);
  const [isSwitchingToCOD, setIsSwitchingToCOD] = useState(false);

  // Return Request Modal States
  const [returnModalItem, setReturnModalItem] = useState(null);
  const [returnQty, setReturnQty] = useState(1);
  const [returnReason, setReturnReason] = useState('WRONG_PART');
  const [returnDetails, setReturnDetails] = useState('');
  const [returnPhotoUrl, setReturnPhotoUrl] = useState('');
  const [isSubmittingReturn, setIsSubmittingReturn] = useState(false);
  const [viewingReturnRecord, setViewingReturnRecord] = useState(null);

  const handleOpenReturnModal = (item) => {
    setReturnModalItem(item);
    setReturnQty(1);
    setReturnReason('WRONG_PART');
    setReturnDetails('');
    setReturnPhotoUrl('');
  };

  const handleSubmitReturn = async (e) => {
    e.preventDefault();
    if (!returnModalItem || !order) return;
    try {
      setIsSubmittingReturn(true);
      await returnsService.createReturn({
        orderId: order.id,
        orderItemId: returnModalItem.id,
        quantity: returnQty,
        reason: returnReason,
        details: returnDetails,
        photos: returnPhotoUrl ? [returnPhotoUrl] : [],
      });
      toast.success('Return request submitted! Our team will review it shortly.');
      setReturnModalItem(null);
      setReturnQty(1);
      setReturnDetails('');
      setReturnPhotoUrl('');
      await fetchOrderDetail();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit return request.');
    } finally {
      setIsSubmittingReturn(false);
    }
  };

  useEffect(() => {
    document.title = `Order #${id} | PartNexa`;
    fetchOrderDetail();
  }, [id]);

  const fetchOrderDetail = async () => {
    setLoading(true);
    try {
      const res = await ordersService.getOrder(id);
      if (res.data?.data) {
        setOrder(res.data.data);
      } else {
        setOrder(null);
      }
    } catch (err) {
      console.error('Failed to load order:', err);
      setOrder(null);
    } finally {
      setLoading(false);
    }
  };

  const handleLaunchPayment = async () => {
    if (!order) return;
    setIsRetryingPayment(true);
    try {
      const res = await paymentsService.retryPayment(order.id);
      const sessionData = res.data?.data;
      setActivePaymentSession(sessionData);
      setIsPaymentModalOpen(true);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to start payment session.');
    } finally {
      setIsRetryingPayment(false);
    }
  };

  const handlePaymentSuccess = async (result) => {
    setIsPaymentModalOpen(false);
    const toastId = toast.loading('Verifying payment signature with backend...');
    try {
      await paymentsService.verifyPayment({
        orderId: result.orderId,
        razorpayOrderId: result.razorpayOrderId,
        razorpayPaymentId: result.razorpayPaymentId,
        razorpaySignature: result.razorpaySignature,
      });
      toast.success('Payment verified! Order is now confirmed.', { id: toastId });
      fetchOrderDetail();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Verification failed.', { id: toastId });
    }
  };

  const handlePaymentFailure = async (errData) => {
    setIsPaymentModalOpen(false);
    try {
      await paymentsService.recordFailure({
        orderId: errData.orderId,
        errorCode: errData.errorCode || 'PAYMENT_FAILED',
        errorReason: errData.errorDescription || 'Payment declined by bank',
      });
    } catch (e) {
      console.error(e);
    }
    toast.error(errData.errorDescription || 'Payment declined');
    fetchOrderDetail();
  };

  const handlePaymentCancel = async (cancelData) => {
    setIsPaymentModalOpen(false);
    try {
      await paymentsService.recordFailure({
        orderId: cancelData.orderId,
        errorCode: 'PAYMENT_CANCELLED_BY_USER',
        errorReason: 'Payment cancelled in modal',
      });
    } catch (e) {
      console.error(e);
    }
    toast.error('Payment cancelled');
    fetchOrderDetail();
  };

  const handleSwitchToCOD = async () => {
    if (!order) return;
    setIsSwitchingToCOD(true);
    try {
      await paymentsService.switchPaymentMethod(order.id, {
        paymentMethod: 'CASH_ON_DELIVERY',
      });
      toast.success('Order switched to Cash on Delivery!');
      fetchOrderDetail();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to switch payment method.');
    } finally {
      setIsSwitchingToCOD(false);
    }
  };

  if (loading) {
    return (
      <div className="order-detail-page">
        <div className="container">
          <Skeleton height={60} borderRadius={12} />
          <div style={{ marginTop: '24px' }}>
            <Skeleton height={200} borderRadius={16} />
          </div>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="order-detail-page">
        <div className="container" style={{ padding: '60px 0', textAlign: 'center' }}>
          <EmptyState
            title="Order Not Found"
            description={`Could not find order "${id}". It may not exist or belongs to another customer account.`}
            action={
              <Link to="/orders" style={{ textDecoration: 'none' }}>
                <Button variant="primary">Return to My Orders</Button>
              </Link>
            }
          />
        </div>
      </div>
    );
  }

  // Derive status milestones based on real order state
  const isDelivered = order.status === 'DELIVERED';
  const isShipped = ['SHIPPED', 'DISPATCHED', 'OUT_FOR_DELIVERY', 'DELIVERED'].includes(order.status);
  const isOutForDelivery = ['OUT_FOR_DELIVERY', 'DELIVERED'].includes(order.status);
  const isDifmCompleted = order.difmRequest?.status === 'COMPLETED';

  const trackingEvents = Array.isArray(order.tracking) ? order.tracking : [];

  return (
    <div className="order-detail-page">
      <div className="container">
        {/* Top bar */}
        <div className="order-detail-top">
          <div className="order-detail-title-wrap">
            <h1>Order #{order.orderNumber || order.id}</h1>
            <p style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '6px' }}>
              <span>Placed on {order.createdAt ? new Date(order.createdAt).toLocaleString() : 'Recently'} · Payment:</span>
              <strong>
                {order.paymentMethod === 'CASH_ON_DELIVERY' ? (
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                    <Banknote size={14} strokeWidth={1.75} /> Cash on Delivery
                  </span>
                ) : (
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                    <Zap size={14} strokeWidth={1.75} /> Razorpay
                  </span>
                )}
              </strong>
            </p>
          </div>
          <div style={{ display: 'flex', gap: '12px' }}>
            <Link to="/orders" style={{ textDecoration: 'none' }}>
              <Button variant="outline" size="sm">
                ← Back to Orders
              </Button>
            </Link>
            <Button
              variant="teal"
              size="sm"
              onClick={() => toast.success(`Invoice for #${order.orderNumber || order.id} downloaded`)}
            >
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                <FileText size={14} strokeWidth={1.75} /> Download Invoice
              </span>
            </Button>
          </div>
        </div>

        {/* Live Milestone Progress */}
        <div className="tracking-stepper-card">
          <div className="stepper-header">
            <div className="stepper-header-title">Live Fulfillment & Delivery Tracking</div>
            <div className="stepper-eta">
              Status: <span style={{ fontWeight: 700, color: 'var(--color-primary-600)' }}>{order.status}</span>
            </div>
          </div>

          <div className="stepper-track">
            <div className={`stepper-step ${order.status !== 'CANCELLED' ? 'completed' : 'danger'}`}>
              <div className="stepper-dot">
                <Check size={12} strokeWidth={2.2} />
              </div>
              <div>
                <div className="stepper-label">Order Confirmed</div>
                <div className="stepper-time">
                  {order.createdAt ? new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Verified'}
                </div>
              </div>
            </div>

            <div className={`stepper-step ${isShipped ? 'completed' : 'pending'}`}>
              <div className="stepper-dot">{isShipped ? <Check size={12} strokeWidth={2.2} /> : '2'}</div>
              <div>
                <div className="stepper-label">Dispatched / In Transit</div>
                <div className="stepper-time">{isShipped ? 'On the way' : 'Pending dispatch'}</div>
              </div>
            </div>

            <div className={`stepper-step ${isOutForDelivery ? 'completed' : 'pending'}`}>
              <div className="stepper-dot">{isOutForDelivery ? <Check size={12} strokeWidth={2.2} /> : '3'}</div>
              <div>
                <div className="stepper-label">Out for Delivery</div>
                <div className="stepper-time">{isOutForDelivery ? 'With Delivery Rider' : 'Pending route'}</div>
              </div>
            </div>

            <div className={`stepper-step ${isDelivered ? 'completed' : 'pending'}`}>
              <div className="stepper-dot">{isDelivered ? <Check size={12} strokeWidth={2.2} /> : '4'}</div>
              <div>
                <div className="stepper-label">Delivered</div>
                <div className="stepper-time">{isDelivered ? 'Delivered to Doorstep' : 'Awaiting arrival'}</div>
              </div>
            </div>

            {order.difmType && order.difmType !== 'NO_INSTALLATION' && (
              <div className={`stepper-step ${isDifmCompleted ? 'completed' : 'pending'}`}>
                <div className="stepper-dot">{isDifmCompleted ? <Check size={12} strokeWidth={2.2} /> : '5'}</div>
                <div>
                  <div className="stepper-label">
                    {order.difmType === 'HOME_INSTALLATION' ? 'Home Installation' : 'Workshop Fitment'}
                  </div>
                  <div className="stepper-time">
                    {isDifmCompleted ? 'Installation Completed' : order.difmRequest?.status || 'Scheduled'}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Real Chronological Activity Logs */}
          {trackingEvents.length > 0 && (
            <div style={{ marginTop: '24px', paddingTop: '16px', borderTop: '1px solid var(--border-color)' }}>
              <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                Chronological Activity Log ({trackingEvents.length} events)
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {trackingEvents.map((t, idx) => (
                  <div key={t.id || idx} style={{ display: 'flex', gap: '12px', alignItems: 'flex-start', fontSize: '0.85rem' }}>
                    <span style={{ color: 'var(--color-primary-500)', fontWeight: 700 }}>•</span>
                    <div style={{ flex: 1 }}>
                      <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{t.status}: </span>
                      <span style={{ color: 'var(--text-secondary)' }}>{t.message}</span>
                    </div>
                    <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem', whiteSpace: 'nowrap' }}>
                      {new Date(t.createdAt).toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Two-column Order Details */}
        <div className="order-detail-grid">
          {/* Left Column: Items */}
          <div className="order-detail-items-col">
            <div className="order-items-card">
              <h2 className="card-title-bordered">Ordered Items ({order.items?.length || 0})</h2>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {(order.items || []).map((item) => {
                  const unitPrice = Number(item.unitPrice || item.priceSnapshot || 0);
                  const totalPrice = Number(item.totalPrice || (unitPrice * item.quantity));
                  const imgUrl = item.product?.images?.[0]?.url || 'https://images.unsplash.com/photo-1600790142055-619df03207e6?w=200';

                  // Item return eligibility logic
                  const isItemDelivered = order.status === 'DELIVERED';
                  const activeReturn = (order.returnRequests || []).find(
                    (r) => r.orderItemId === item.id && !['REJECTED', 'CANCELLED'].includes(r.status)
                  );
                  const anyReturn = (order.returnRequests || []).find((r) => r.orderItemId === item.id);
                  const itemElig = item.returnEligibility || {};
                  const isEligible = isItemDelivered && itemElig.eligible && !activeReturn;
                  const isWindowEnded = isItemDelivered && !itemElig.isWithinWindow && !activeReturn;

                  return (
                    <div
                      key={item.id}
                      className="order-item-row"
                    >
                      <div className="order-item-main">
                        <img
                          src={imgUrl}
                          alt=""
                          className="order-item-img"
                          loading="lazy"
                          decoding="async"
                        />
                        <div className="order-item-info">
                          <div className="order-item-name">
                            {item.product?.name || 'Automotive Component'}
                          </div>
                          <div className="text-xs text-muted" style={{ marginTop: '2px' }}>
                            Qty: {item.quantity} × ₹{unitPrice.toLocaleString('en-IN')}
                            {item.product?.partNumber && ` · Part #${item.product.partNumber}`}
                          </div>

                          {/* ELIGIBILITY & RETURN STATUS STRIP */}
                          {isItemDelivered && (
                            <div className="item-return-status-strip">
                              {activeReturn ? (
                                <span className={`return-badge return-badge-${activeReturn.status.toLowerCase()}`} style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                                  <RotateCcw size={12} strokeWidth={1.75} /> Return: {activeReturn.status.replace(/_/g, ' ')}
                                </span>
                              ) : isEligible ? (
                                <span className="return-window-tag eligible" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                                  <ShieldCheck size={12} strokeWidth={1.75} /> {itemElig.message || 'Return available'}
                                </span>
                              ) : isWindowEnded ? (
                                <span className="return-window-tag expired" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                                  <Clock size={12} strokeWidth={1.75} /> Return window ended
                                </span>
                              ) : null}
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="order-item-action-col">
                        <div className="order-item-price">
                          ₹{totalPrice.toLocaleString('en-IN')}
                        </div>

                        {/* RETURN BUTTON: Appears ONLY when order is DELIVERED, within window, and not already in return */}
                        {isItemDelivered && isEligible && (
                          <button
                            type="button"
                            className="btn-return-action"
                            onClick={() => handleOpenReturnModal(item)}
                            style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                          >
                            <RotateCcw size={13} strokeWidth={1.75} /> Return Item
                          </button>
                        )}

                        {anyReturn && (
                          <button
                            type="button"
                            className="btn-return-details"
                            onClick={() => setViewingReturnRecord(anyReturn)}
                          >
                            View Return Details
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Price Breakdown */}
              <div
                style={{
                  marginTop: '20px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '10px',
                  fontSize: '0.95rem',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)' }}>
                  <span>Subtotal</span>
                  <span>₹{Number(order.subtotal || 0).toLocaleString('en-IN')}</span>
                </div>
                {Number(order.installationFee || 0) > 0 && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)' }}>
                    <span>Professional Installation (DIFM)</span>
                    <span>₹{Number(order.installationFee).toLocaleString('en-IN')}</span>
                  </div>
                )}
                {Number(order.homeVisitSurcharge || 0) > 0 && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)' }}>
                    <span>Doorstep Visit Surcharge</span>
                    <span>₹{Number(order.homeVisitSurcharge).toLocaleString('en-IN')}</span>
                  </div>
                )}
                <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)' }}>
                  <span>Delivery Fee</span>
                  <span>{Number(order.deliveryFee || 0) > 0 ? `₹${Number(order.deliveryFee).toLocaleString('en-IN')}` : <span className="text-success font-semibold">FREE</span>}</span>
                </div>
                {Number(order.discount || 0) > 0 && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--color-success-600)' }}>
                    <span>Coupon Discount</span>
                    <span>-₹{Number(order.discount).toLocaleString('en-IN')}</span>
                  </div>
                )}
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    fontWeight: 800,
                    fontSize: '1.2rem',
                    color: 'var(--text-primary)',
                    paddingTop: '12px',
                    borderTop: '1px solid var(--border-color)',
                  }}
                >
                  <span>Grand Total</span>
                  <span>₹{Number(order.total || 0).toLocaleString('en-IN')}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Details & Assignments */}
          <div className="order-detail-side-col">
            {/* Payment Status Card */}
            <div className="order-side-card" id="order-payment-status-card">
              <h3 className="card-title-bordered" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <CreditCard size={18} strokeWidth={1.75} /> Payment Status
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.9rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Method:</span>
                  <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                    {order.paymentMethod === 'CASH_ON_DELIVERY' ? (
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                        <Banknote size={14} strokeWidth={1.75} /> Cash on Delivery
                      </span>
                    ) : (
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                        <Zap size={14} strokeWidth={1.75} /> Razorpay Online
                      </span>
                    )}
                  </span>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Payment Status:</span>
                  <span>
                    {order.paymentStatus === 'PAID' || order.paymentStatus === 'CAPTURED' ? (
                      <span className="status-pill-paid" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                        <Check size={12} strokeWidth={2.2} /> PAID
                      </span>
                    ) : order.paymentMethod === 'CASH_ON_DELIVERY' ? (
                      <span className="status-pill-cod" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                        <Clock size={12} strokeWidth={1.75} /> PENDING COD
                      </span>
                    ) : order.paymentStatus === 'FAILED' ? (
                      <span className="status-pill-pending" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                        <XCircle size={12} strokeWidth={1.75} /> FAILED
                      </span>
                    ) : (
                      <span className="status-pill-pending" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                        <Clock size={12} strokeWidth={1.75} /> PENDING
                      </span>
                    )}
                  </span>
                </div>

                {order.payment?.razorpayPaymentId && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>Payment ID:</span>
                    <span style={{ fontFamily: 'monospace', fontSize: '0.8rem', color: 'var(--text-primary)' }}>
                      {order.payment.razorpayPaymentId}
                    </span>
                  </div>
                )}

                {/* If payment is failed or pending online, allow Retry or Switch to COD */}
                {order.paymentStatus !== 'CAPTURED' && order.paymentStatus !== 'PAID' && order.paymentMethod !== 'CASH_ON_DELIVERY' && (
                  <div style={{ marginTop: '12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <Button
                      variant="primary"
                      size="sm"
                      fullWidth
                      onClick={handleLaunchPayment}
                      loading={isRetryingPayment}
                      id="order-retry-payment-btn"
                    >
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                        <RotateCcw size={14} strokeWidth={1.75} /> Complete / Retry Payment
                      </span>
                    </Button>
                    <Button
                      variant="teal"
                      size="sm"
                      fullWidth
                      onClick={handleSwitchToCOD}
                      loading={isSwitchingToCOD}
                      id="order-switch-cod-btn"
                    >
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                        <Banknote size={14} strokeWidth={1.75} /> Switch to Cash on Delivery
                      </span>
                    </Button>
                  </div>
                )}
              </div>
            </div>

            {/* Delivery Address Card */}
            <div className="order-side-card">
              <h3 className="card-title-bordered" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <MapPin size={18} strokeWidth={1.75} /> Delivery Address
              </h3>
              <div style={{ fontSize: '0.9rem', lineHeight: 1.5, color: 'var(--text-secondary)' }}>
                <div style={{ fontWeight: 700, color: 'var(--text-primary)', marginBottom: '4px' }}>
                  {order.address?.fullName || 'Customer'}
                </div>
                <div>{order.address?.line1}</div>
                {order.address?.line2 && <div>{order.address.line2}</div>}
                <div>
                  {order.address?.city}, {order.address?.state} - {order.address?.pincode}
                </div>
                <div style={{ marginTop: '8px', color: 'var(--text-muted)', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                  <Phone size={13} strokeWidth={1.75} /> {order.address?.phone || 'Phone not specified'}
                </div>
              </div>
            </div>

            {/* DIFM Installation Details (if requested) */}
            {order.difmType && order.difmType !== 'NO_INSTALLATION' && (
              <div
                className="order-side-card"
                style={{ borderColor: 'var(--color-teal-400)', background: 'var(--bg-surface)' }}
              >
                <h3 className="card-title-bordered" style={{ color: 'var(--color-teal-600)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Wrench size={16} strokeWidth={1.75} /> {order.difmType === 'HOME_INSTALLATION' ? 'Doorstep Mechanic (Option A)' : 'Partnered Workshop (Option B)'}
                </h3>
                <div style={{ fontSize: '0.9rem', lineHeight: 1.5, color: 'var(--text-secondary)' }}>
                  <div style={{ fontWeight: 700, color: 'var(--text-primary)' }}>
                    {order.difmRequest?.shop?.name || 'Assigned Partner Workshop'}
                  </div>
                  {order.difmRequest?.shop?.phone && (
                    <div className="text-xs text-muted" style={{ marginTop: '2px', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                      <Phone size={12} strokeWidth={1.75} /> Workshop Contact: {order.difmRequest.shop.phone}
                    </div>
                  )}
                  <div style={{ marginTop: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Status:</span>
                    <Badge variant={order.difmRequest?.status === 'COMPLETED' ? 'success' : 'teal'}>
                      {order.difmRequest?.status || 'SCHEDULED'}
                    </Badge>
                  </div>
                  {order.difmRequest?.preferredDate && (
                    <div style={{ marginTop: '6px', fontSize: '0.8rem', color: 'var(--text-muted)', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                      <Calendar size={12} strokeWidth={1.75} /> Scheduled Date: {new Date(order.difmRequest.preferredDate).toLocaleDateString()}
                    </div>
                  )}

                  {/* Step 11: Installation Confirmation Code Box */}
                  {(order.installationConfirmationCode || order.difmRequest?.serviceBooking?.completionCode) && !isDifmCompleted && (
                    <div
                      className="installation-code-card"
                      style={{
                        marginTop: '1rem',
                        padding: '1rem',
                        borderRadius: '10px',
                        background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.08) 0%, rgba(6, 182, 212, 0.08) 100%)',
                        border: '1.5px dashed #10B981',
                        textAlign: 'center',
                      }}
                    >
                      <div style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#059669', marginBottom: '0.35rem', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                        <Lock size={13} strokeWidth={1.75} /> Installation Confirmation Code
                      </div>
                      <div
                        style={{
                          fontSize: '1.85rem',
                          fontWeight: 800,
                          letterSpacing: '0.35em',
                          color: '#0F172A',
                          fontFamily: 'monospace',
                          margin: '0.35rem 0',
                          userSelect: 'all',
                        }}
                        id="installation-confirmation-code-display"
                      >
                        {order.installationConfirmationCode || order.difmRequest?.serviceBooking?.completionCode}
                      </div>
                      <p style={{ margin: '0', fontSize: '0.78rem', color: '#475569', lineHeight: 1.4 }}>
                        Share this code verbally only after installation is completed to your satisfaction.
                      </p>
                    </div>
                  )}

                  {isDifmCompleted && (
                    <div
                      style={{
                        marginTop: '1rem',
                        padding: '0.65rem 0.85rem',
                        borderRadius: '8px',
                        background: 'rgba(16, 185, 129, 0.12)',
                        border: '1px solid rgba(16, 185, 129, 0.3)',
                        color: '#065F46',
                        fontSize: '0.82rem',
                        fontWeight: 600,
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                      }}
                    >
                      <ShieldCheck size={16} strokeWidth={1.75} style={{ color: '#065F46' }} />
                      <span>Verified by Customer Confirmation Code</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Delivery Assignment Info */}
            {order.deliveryAssignments && order.deliveryAssignments.length > 0 && (
              <div className="order-side-card">
                <h3 className="card-title-bordered" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Truck size={18} strokeWidth={1.75} /> Logistics Partner
                </h3>
                <div style={{ fontSize: '0.9rem', lineHeight: 1.5, color: 'var(--text-secondary)' }}>
                  <div style={{ fontWeight: 700, color: 'var(--text-primary)' }}>
                    {order.deliveryAssignments[0].deliveryPartner?.user
                      ? `${order.deliveryAssignments[0].deliveryPartner.user.firstName} ${order.deliveryAssignments[0].deliveryPartner.user.lastName}`
                      : 'Delivery Fleet Broadcast'}
                  </div>
                  <div style={{ marginTop: '6px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Trip Status:</span>
                    <Badge variant={order.deliveryAssignments[0].status === 'DELIVERED' ? 'success' : 'primary'}>
                      {order.deliveryAssignments[0].status}
                    </Badge>
                  </div>
                </div>
              </div>
            )}

            <div className="order-side-card">
              <h3 className="card-title-bordered">Need Assistance?</h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '16px' }}>
                Questions about your order fitment, return request, or rescheduling technician?
              </p>
              <Link to={`/support?orderId=${order.orderNumber || order.id}`} style={{ textDecoration: 'none' }}>
                <Button variant="outline" size="sm" fullWidth>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                    <MessageSquare size={14} strokeWidth={1.75} /> Contact PartNexa Support
                  </span>
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Razorpay Modal for Retrying Payment on Order Detail */}
      <RazorpayModal
        isOpen={isPaymentModalOpen}
        paymentData={activePaymentSession}
        onSuccess={handlePaymentSuccess}
        onFailure={handlePaymentFailure}
        onCancel={handlePaymentCancel}
      />

      {/* Return Request Modal */}
      {returnModalItem && (
        <div className="modal-backdrop" onClick={() => !isSubmittingReturn && setReturnModalItem(null)}>
          <div className="return-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <RotateCcw size={22} strokeWidth={1.75} style={{ color: 'var(--color-primary)' }} />
                <div>
                  <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 800 }}>Request Spare-Part Return</h3>
                  <p style={{ margin: '2px 0 0', fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                    Order #{order.orderNumber}
                  </p>
                </div>
              </div>
              <button
                type="button"
                className="modal-close-btn"
                onClick={() => setReturnModalItem(null)}
                disabled={isSubmittingReturn}
              >
                <X size={18} strokeWidth={1.75} />
              </button>
            </div>

            <form onSubmit={handleSubmitReturn} className="return-modal-form">
              {/* Item Info Box */}
              <div className="return-item-preview">
                <img
                  src={returnModalItem.product?.images?.[0]?.url || 'https://images.unsplash.com/photo-1600790142055-619df03207e6?w=200'}
                  alt=""
                  style={{ width: '48px', height: '48px', borderRadius: '8px', objectFit: 'cover' }}
                  loading="lazy"
                  decoding="async"
                />
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--text-primary)' }}>
                    {returnModalItem.product?.name || 'Selected Spare Part'}
                  </div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                    Unit Price: ₹{Number(returnModalItem.unitPrice || returnModalItem.priceSnapshot || 0).toLocaleString('en-IN')} · Ordered Qty: {returnModalItem.quantity}
                  </div>
                </div>
              </div>

              {/* Quantity Selector */}
              <div className="return-form-group">
                <label>Quantity to Return</label>
                <select
                  value={returnQty}
                  onChange={(e) => setReturnQty(Number(e.target.value))}
                  className="return-form-select"
                >
                  {Array.from({ length: returnModalItem.quantity }, (_, i) => i + 1).map((q) => (
                    <option key={q} value={q}>
                      {q} {q === 1 ? 'unit' : 'units'}
                    </option>
                  ))}
                </select>
              </div>

              {/* Reason Selector */}
              <div className="return-form-group">
                <label>Reason for Return *</label>
                <select
                  value={returnReason}
                  onChange={(e) => setReturnReason(e.target.value)}
                  className="return-form-select"
                  required
                >
                  <option value="WRONG_PART">Wrong Part</option>
                  <option value="COMPATIBILITY_ISSUE">Compatibility Issue</option>
                  <option value="DAMAGED_PRODUCT">Damaged Product</option>
                  <option value="DEFECTIVE_PART">Defective Part</option>
                  <option value="DIFFERENT_FROM_DESCRIPTION">Different From Description</option>
                  <option value="OTHER">Other</option>
                </select>
              </div>

              {/* Explanation Textarea */}
              <div className="return-form-group">
                <label>Explanation / Defect Details</label>
                <textarea
                  value={returnDetails}
                  onChange={(e) => setReturnDetails(e.target.value)}
                  placeholder="Please describe why this item is being returned (fitment mismatch, broken clip, leakage, etc.)..."
                  rows={3}
                  className="return-form-textarea"
                />
              </div>

              {/* Optional Photo URL */}
              <div className="return-form-group">
                <label>Optional Photo Proof URL</label>
                <input
                  type="url"
                  value={returnPhotoUrl}
                  onChange={(e) => setReturnPhotoUrl(e.target.value)}
                  placeholder="https://images.example.com/part-photo.jpg"
                  className="return-form-input"
                />
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  Clear photos of product label, serial number, and packaging speed up inspection approval.
                </span>
              </div>

              {/* Pickup Address */}
              <div className="return-form-group">
                <label>Doorstep Pickup Address</label>
                <div
                  style={{
                    padding: '10px 14px',
                    borderRadius: '8px',
                    background: 'var(--bg-secondary)',
                    border: '1px solid var(--border-color)',
                    fontSize: '0.85rem',
                    lineHeight: 1.4,
                  }}
                >
                  <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                    {order.address?.fullName || 'Customer Doorstep'} · {order.address?.phone || ''}
                  </div>
                  <div style={{ color: 'var(--text-secondary)' }}>
                    {order.address?.line1 || ''}, {order.address?.city || ''} - {order.address?.pincode || ''}
                  </div>
                </div>
              </div>

              {/* Refund Info Summary Box */}
              <div className="return-summary-card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontWeight: 600, color: 'var(--text-secondary)' }}>Authoritative Refund Amount:</span>
                  <span style={{ fontWeight: 800, fontSize: '1.15rem', color: '#0D9488' }}>
                    ₹{(Number(returnModalItem.unitPrice || returnModalItem.priceSnapshot || 0) * returnQty).toLocaleString('en-IN')}
                  </span>
                </div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', borderTop: '1px solid rgba(13, 148, 136, 0.2)', paddingTop: '8px' }}>
                  Refund Method: <strong>{order.paymentMethod === 'CASH_ON_DELIVERY' ? 'Direct Bank/UPI or Wallet' : 'Original Razorpay source account'}</strong>
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  * Refund is processed immediately after the reverse pickup partner delivers the part to our hub and quality inspection passes.
                </div>
              </div>

              {/* Footer */}
              <div className="modal-footer">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setReturnModalItem(null)}
                  disabled={isSubmittingReturn}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  loading={isSubmittingReturn}
                >
                  Submit Return Request
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Return Details Modal */}
      {viewingReturnRecord && (
        <div className="modal-backdrop" onClick={() => setViewingReturnRecord(null)}>
          <div className="return-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <ClipboardList size={22} strokeWidth={1.75} style={{ color: 'var(--color-primary)' }} />
                <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 800 }}>Return Request Details</h3>
              </div>
              <button
                type="button"
                className="modal-close-btn"
                onClick={() => setViewingReturnRecord(null)}
              >
                <X size={18} strokeWidth={1.75} />
              </button>
            </div>

            <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Return ID:</span>
                <strong style={{ fontSize: '0.85rem', color: 'var(--text-primary)' }}>{viewingReturnRecord.id}</strong>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Current Status:</span>
                <span className={`return-badge return-badge-${viewingReturnRecord.status.toLowerCase()}`}>
                  {viewingReturnRecord.status.replace(/_/g, ' ')}
                </span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Refund Amount:</span>
                <strong style={{ fontSize: '1.1rem', color: '#0D9488' }}>
                  ₹{Number(viewingReturnRecord.refundAmount || 0).toLocaleString('en-IN')}
                </strong>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Quantity:</span>
                <strong style={{ fontSize: '0.9rem', color: 'var(--text-primary)' }}>{viewingReturnRecord.quantity} unit(s)</strong>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Reason:</span>
                <strong style={{ fontSize: '0.9rem', color: 'var(--text-primary)' }}>{viewingReturnRecord.reason.replace(/_/g, ' ')}</strong>
              </div>

              {viewingReturnRecord.details && (
                <div style={{ background: 'var(--bg-secondary)', padding: '12px', borderRadius: '8px', fontSize: '0.85rem' }}>
                  <div style={{ fontWeight: 600, color: 'var(--text-primary)', marginBottom: '4px' }}>Customer Explanation:</div>
                  <div style={{ color: 'var(--text-secondary)' }}>{viewingReturnRecord.details}</div>
                </div>
              )}

              {viewingReturnRecord.rejectionReason && (
                <div style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)', padding: '12px', borderRadius: '8px', fontSize: '0.85rem' }}>
                  <div style={{ fontWeight: 700, color: '#EF4444', marginBottom: '4px' }}>Rejection Reason:</div>
                  <div style={{ color: 'var(--text-primary)' }}>{viewingReturnRecord.rejectionReason}</div>
                </div>
              )}

              {/* Status Timeline Progress */}
              <div style={{ marginTop: '10px', padding: '12px', borderRadius: '8px', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', fontSize: '0.8rem', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div style={{ fontWeight: 700, color: 'var(--text-primary)', marginBottom: '4px' }}>Return Lifecycle Tracking:</div>
                <div>• Requested on: {viewingReturnRecord.requestedAt ? new Date(viewingReturnRecord.requestedAt).toLocaleString() : 'N/A'}</div>
                {viewingReturnRecord.approvedAt && <div>• Approved on: {new Date(viewingReturnRecord.approvedAt).toLocaleString()}</div>}
                {viewingReturnRecord.pickupAt && <div>• Picked up on: {new Date(viewingReturnRecord.pickupAt).toLocaleString()}</div>}
                {viewingReturnRecord.receivedAt && <div>• Received at hub: {new Date(viewingReturnRecord.receivedAt).toLocaleString()}</div>}
                {viewingReturnRecord.inspectedAt && <div>• Inspected on: {new Date(viewingReturnRecord.inspectedAt).toLocaleString()}</div>}
                {viewingReturnRecord.refundedAt && <div style={{ color: '#0D9488', fontWeight: 700 }}>• Refund completed on: {new Date(viewingReturnRecord.refundedAt).toLocaleString()}</div>}
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '8px' }}>
                <Button variant="primary" size="sm" onClick={() => setViewingReturnRecord(null)}>
                  Close
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderDetailPage;
