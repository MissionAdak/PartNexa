import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import procurementService from '../../services/procurementService';
import SupplierLogo from '../../components/admin/procurement/SupplierLogo';
import ReceiveStockModal from '../../components/admin/procurement/ReceiveStockModal';

export default function PurchaseOrderDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [po, setPo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isReceiveOpen, setIsReceiveOpen] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);

  const fetchPo = async () => {
    try {
      setLoading(true);
      const data = await procurementService.getPurchaseOrderById(id);
      setPo(data);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load purchase order details.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPo();
  }, [id]);

  const handleUpdateStatus = async (newStatus) => {
    setUpdatingStatus(true);
    try {
      const updated = await procurementService.updatePurchaseOrderStatus(
        id,
        newStatus,
        `PO status transitioned to ${newStatus} by Admin`
      );
      setPo(updated);
      toast.success(`Purchase Order status updated to ${newStatus}!`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update status.');
    } finally {
      setUpdatingStatus(false);
    }
  };

  const getStatusBadge = (status) => {
    const config = {
      DRAFT: { label: 'Draft', bg: 'rgba(148, 163, 184, 0.15)', text: 'var(--text-muted)' },
      SUBMITTED: { label: 'Submitted', bg: 'rgba(37, 99, 235, 0.15)', text: 'var(--admin-blue)' },
      SUPPLIER_CONFIRMED: { label: 'Confirmed', bg: 'rgba(6, 182, 212, 0.15)', text: 'var(--color-info)' },
      PROCESSING: { label: 'Processing', bg: 'rgba(245, 158, 11, 0.15)', text: 'var(--color-warning)' },
      SHIPPED: { label: 'Shipped', bg: 'rgba(139, 92, 246, 0.15)', text: 'var(--color-purple)' },
      IN_TRANSIT: { label: 'In Transit', bg: 'rgba(56, 189, 248, 0.2)', text: '#0284C7' },
      PARTIALLY_RECEIVED: { label: 'Partially Received', bg: 'rgba(245, 158, 11, 0.2)', text: '#D97706' },
      RECEIVED: { label: 'Received', bg: 'rgba(16, 185, 129, 0.18)', text: 'var(--color-success)' },
      COMPLETED: { label: 'Completed', bg: 'rgba(16, 185, 129, 0.25)', text: 'var(--color-success)' },
      CANCELLED: { label: 'Cancelled', bg: 'rgba(239, 68, 68, 0.15)', text: 'var(--color-danger)' },
    };
    const c = config[status] || { label: status, bg: 'var(--bg-tertiary)', text: 'var(--text-primary)' };
    return (
      <span
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.35rem',
          padding: '0.25rem 0.75rem',
          borderRadius: 'var(--radius-full)',
          fontSize: '0.78rem',
          fontWeight: 700,
          backgroundColor: c.bg,
          color: c.text,
        }}
      >
        <span style={{ width: '7px', height: '7px', borderRadius: '50%', backgroundColor: c.text }} />
        {c.label}
      </span>
    );
  };

  if (loading) {
    return (
      <div style={{ padding: '4rem', textAlign: 'center', color: 'var(--text-muted)' }}>
        Loading Purchase Order Details from PostgreSQL...
      </div>
    );
  }

  if (!po) {
    return (
      <div style={{ padding: '3rem', textAlign: 'center' }}>
        <h3>Purchase Order Not Found</h3>
        <button
          onClick={() => navigate('/admin/procurement/orders')}
          style={{
            marginTop: '1rem',
            padding: '0.5rem 1rem',
            borderRadius: 'var(--radius-sm)',
            border: 'none',
            backgroundColor: 'var(--admin-blue)',
            color: '#FFFFFF',
            cursor: 'pointer',
          }}
        >
          Back to Purchase Orders
        </button>
      </div>
    );
  }

  const items = po.items || [];
  const totalOrdered = items.reduce((sum, it) => sum + it.orderedQuantity, 0);
  const totalReceived = items.reduce((sum, it) => sum + it.receivedQuantity, 0);
  const canReceive = !['COMPLETED', 'RECEIVED', 'CANCELLED'].includes(po.status);
  const receipts = po.goodsReceipts || [];

  return (
    <div style={{ maxWidth: '1440px', margin: '0 auto', paddingBottom: '3rem' }}>
      {/* Back Button */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
        <button
          onClick={() => navigate('/admin/procurement/orders')}
          style={{
            background: 'none',
            border: 'none',
            color: 'var(--admin-blue)',
            fontWeight: 700,
            fontSize: '0.85rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.35rem',
          }}
        >
          ← Back to Purchase Orders
        </button>

        <button
          onClick={() => navigate('/admin/procurement')}
          style={{
            background: 'none',
            border: 'none',
            color: 'var(--text-muted)',
            fontWeight: 600,
            fontSize: '0.82rem',
            cursor: 'pointer',
          }}
        >
          Bulk Procurement Hub ↗
        </button>
      </div>

      {/* Main Order Header Banner */}
      <div
        className="admin-card"
        style={{
          padding: '1.5rem',
          marginBottom: '1.5rem',
          borderRadius: 'var(--radius-lg)',
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '1.25rem',
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '1.6rem', fontWeight: 900, color: 'var(--admin-blue)', letterSpacing: '-0.02em' }}>
              {po.poNumber}
            </span>
            {getStatusBadge(po.status)}
            <span
              style={{
                fontSize: '0.78rem',
                fontWeight: 700,
                padding: '0.2rem 0.6rem',
                borderRadius: 'var(--radius-sm)',
                backgroundColor: 'var(--bg-tertiary)',
                color: 'var(--text-secondary)',
              }}
            >
              Payment: {po.paymentStatus}
            </span>
          </div>

          <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.4rem', display: 'flex', gap: '1.25rem', flexWrap: 'wrap' }}>
            <span>Created: <strong>{new Date(po.createdAt).toLocaleString()}</strong></span>
            <span>Expected Delivery: <strong>{po.expectedDelivery ? new Date(po.expectedDelivery).toLocaleDateString() : 'Standard Logistics'}</strong></span>
            {po.notes && <span>Notes: <em>{po.notes}</em></span>}
          </div>
        </div>

        {/* Action Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', flexWrap: 'wrap' }}>
          {canReceive && (
            <button
              onClick={() => setIsReceiveOpen(true)}
              style={{
                padding: '0.65rem 1.25rem',
                borderRadius: 'var(--radius-md)',
                border: 'none',
                backgroundColor: 'var(--color-success)',
                color: '#FFFFFF',
                fontWeight: 800,
                fontSize: '0.88rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.45rem',
                boxShadow: '0 4px 12px rgba(16, 185, 129, 0.35)',
              }}
            >
              <span>📥</span> Receive Stock
            </button>
          )}

          {/* Quick Lifecycle Progress Actions */}
          {['SUBMITTED', 'SUPPLIER_CONFIRMED', 'PROCESSING'].includes(po.status) && (
            <button
              disabled={updatingStatus}
              onClick={() => handleUpdateStatus('SHIPPED')}
              style={{
                padding: '0.65rem 1rem',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border-color)',
                backgroundColor: 'var(--bg-secondary)',
                color: 'var(--text-primary)',
                fontWeight: 700,
                fontSize: '0.85rem',
                cursor: 'pointer',
              }}
            >
              📦 Mark Shipped
            </button>
          )}

          {po.status === 'SHIPPED' && (
            <button
              disabled={updatingStatus}
              onClick={() => handleUpdateStatus('IN_TRANSIT')}
              style={{
                padding: '0.65rem 1rem',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border-color)',
                backgroundColor: 'var(--bg-secondary)',
                color: 'var(--text-primary)',
                fontWeight: 700,
                fontSize: '0.85rem',
                cursor: 'pointer',
              }}
            >
              🚚 Mark In Transit
            </button>
          )}

          {po.status === 'SUBMITTED' && (
            <button
              disabled={updatingStatus}
              onClick={() => handleUpdateStatus('SUPPLIER_CONFIRMED')}
              style={{
                padding: '0.65rem 1rem',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border-color)',
                backgroundColor: 'var(--bg-secondary)',
                color: 'var(--text-primary)',
                fontWeight: 700,
                fontSize: '0.85rem',
                cursor: 'pointer',
              }}
            >
              ✓ Confirm Supplier
            </button>
          )}
        </div>
      </div>

      {/* Grid: Supplier Details & Financial Breakdown */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.25rem', marginBottom: '1.5rem' }}>
        {/* Supplier Info Card */}
        <div className="admin-card" style={{ padding: '1.25rem' }}>
          <div style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.85rem' }}>
            Supplier Profile & Commercial Terms
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
            <SupplierLogo logoUrl={po.supplier?.logoUrl} name={po.supplier?.name} size={54} fontSize="1.2rem" />
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ fontSize: '1.15rem', fontWeight: 800 }}>{po.supplier?.name}</span>
                <span
                  style={{
                    fontSize: '0.65rem',
                    fontWeight: 700,
                    padding: '0.15rem 0.45rem',
                    borderRadius: 'var(--radius-full)',
                    backgroundColor: 'rgba(37, 99, 235, 0.12)',
                    color: 'var(--admin-blue)',
                  }}
                >
                  Demo Supplier
                </span>
              </div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                {po.supplier?.city}, {po.supplier?.state} • GST: {po.supplier?.gstNumber}
              </div>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.65rem', fontSize: '0.8rem', backgroundColor: 'var(--bg-tertiary)', padding: '0.85rem', borderRadius: 'var(--radius-sm)' }}>
            <div>
              <div style={{ color: 'var(--text-muted)', fontSize: '0.72rem' }}>CONTACT DESK</div>
              <div style={{ fontWeight: 600 }}>{po.supplier?.contactPerson || 'Procurement Representative'}</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{po.supplier?.email}</div>
            </div>
            <div>
              <div style={{ color: 'var(--text-muted)', fontSize: '0.72rem' }}>PHONE / DISPATCH</div>
              <div style={{ fontWeight: 600 }}>{po.supplier?.phone || '+91 98000 00000'}</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Type: {po.supplier?.supplierType || 'DISTRIBUTOR'}</div>
            </div>
          </div>
        </div>

        {/* Financial Summary Card */}
        <div className="admin-card" style={{ padding: '1.25rem' }}>
          <div style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.85rem' }}>
            Financial Breakdown & Authorization
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem', fontSize: '0.85rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Base Catalog Subtotal</span>
              <span style={{ fontWeight: 700 }}>₹{Number(po.subtotal).toLocaleString('en-IN')}</span>
            </div>

            {Number(po.bulkDiscount) > 0 && (
              <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--color-success)' }}>
                <span style={{ fontWeight: 600 }}>Bulk Quantity Savings</span>
                <span style={{ fontWeight: 700 }}>-₹{Number(po.bulkDiscount).toLocaleString('en-IN')}</span>
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-secondary)' }}>GST (18% Statutory Rate)</span>
              <span style={{ fontWeight: 600 }}>₹{Number(po.tax).toLocaleString('en-IN')}</span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Freight & Palletized Shipping</span>
              <span style={{ fontWeight: 600 }}>
                {Number(po.shipping) === 0 ? 'FREE B2B FREIGHT' : `₹${Number(po.shipping).toLocaleString('en-IN')}`}
              </span>
            </div>

            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                paddingTop: '0.65rem',
                marginTop: '0.35rem',
                borderTop: '2px dashed var(--border-color)',
                fontSize: '1.15rem',
                fontWeight: 900,
                color: 'var(--text-primary)',
              }}
            >
              <span>Authorized Procurement Total</span>
              <span style={{ color: 'var(--color-success)' }}>₹{Number(po.totalCost).toLocaleString('en-IN')}</span>
            </div>

            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '0.2rem', textAlign: 'right' }}>
              Payment Method: {po.paymentMethod || 'DEMO_PAYMENT'} • Status: <strong>{po.paymentStatus}</strong>
            </div>
          </div>
        </div>
      </div>

      {/* PO Line Items Table */}
      <div className="admin-card" style={{ padding: '1.25rem', marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <div>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 800, margin: 0 }}>
              Procured Line Items ({items.length} parts, {totalOrdered} total units)
            </h3>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
              Distinct spare-part brands and verified vehicle compatibility mapped to PartNexa inventory
            </div>
          </div>

          <div style={{ textAlign: 'right', fontSize: '0.85rem' }}>
            <span style={{ color: 'var(--text-muted)' }}>Received: </span>
            <strong style={{ color: totalReceived === totalOrdered ? 'var(--color-success)' : '#D97706' }}>
              {totalReceived} of {totalOrdered} units
            </strong>
          </div>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table className="admin-table" style={{ width: '100%', fontSize: '0.85rem' }}>
            <thead>
              <tr>
                <th>Spare Part & Part Number</th>
                <th>Spare-Part Brand</th>
                <th>Compatible Vehicle</th>
                <th>Unit Cost</th>
                <th>Ordered</th>
                <th>Received</th>
                <th>Remaining</th>
                <th style={{ textAlign: 'right' }}>Line Total</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => {
                const remaining = Math.max(0, item.orderedQuantity - item.receivedQuantity);
                return (
                  <tr key={item.id}>
                    <td>
                      <div style={{ fontWeight: 800, color: 'var(--text-primary)' }}>{item.partName}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontFamily: 'monospace' }}>
                        PN: {item.partNumber}
                      </div>
                    </td>
                    <td>
                      <span
                        style={{
                          padding: '0.2rem 0.5rem',
                          borderRadius: 'var(--radius-sm)',
                          backgroundColor: 'var(--bg-tertiary)',
                          fontWeight: 700,
                          fontSize: '0.78rem',
                          color: 'var(--text-primary)',
                        }}
                      >
                        {item.brandName}
                      </span>
                    </td>
                    <td>
                      <div style={{ fontWeight: 600 }}>
                        {item.vehicleMakeName} {item.vehicleModelName}
                      </div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                        Compatible Model
                      </div>
                    </td>
                    <td>
                      <div style={{ fontWeight: 700 }}>₹{Number(item.unitPrice).toLocaleString('en-IN')}</div>
                      {Number(item.bulkDiscount) > 0 && (
                        <div style={{ fontSize: '0.72rem', color: 'var(--color-success)' }}>
                          -₹{Number(item.bulkDiscount).toLocaleString('en-IN')} bulk
                        </div>
                      )}
                    </td>
                    <td style={{ fontWeight: 700 }}>{item.orderedQuantity}</td>
                    <td>
                      <span
                        style={{
                          fontWeight: 800,
                          color: item.receivedQuantity > 0 ? 'var(--color-success)' : 'var(--text-muted)',
                        }}
                      >
                        {item.receivedQuantity}
                      </span>
                    </td>
                    <td>
                      <span style={{ fontWeight: 700, color: remaining > 0 ? '#D97706' : 'var(--text-muted)' }}>
                        {remaining}
                      </span>
                    </td>
                    <td style={{ textAlign: 'right', fontWeight: 800, color: 'var(--text-primary)' }}>
                      ₹{Number(item.totalCost).toLocaleString('en-IN')}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Inbound Goods Receipt History */}
      <div className="admin-card" style={{ padding: '1.25rem' }}>
        <h3 style={{ fontSize: '1.05rem', fontWeight: 800, margin: '0 0 0.35rem' }}>
          Goods Receipt Notes (GRN) & Inbound Consignments ({receipts.length})
        </h3>
        <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
          Real-time physical stock intake logs verified by PartNexa Central Logistics. Each recorded GRN increases platform inventory.
        </p>

        {receipts.length === 0 ? (
          <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)', backgroundColor: 'var(--bg-tertiary)', borderRadius: 'var(--radius-sm)' }}>
            No goods receipts recorded yet for this Purchase Order. Click <strong>"Receive Stock"</strong> once the consignment arrives at the logistics hub.
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className="admin-table" style={{ width: '100%', fontSize: '0.82rem' }}>
              <thead>
                <tr>
                  <th>GRN Number</th>
                  <th>Carrier & Tracking</th>
                  <th>Items & Quantities Intake</th>
                  <th>Date Recorded</th>
                  <th>Inspection Notes</th>
                </tr>
              </thead>
              <tbody>
                {receipts.map((gr) => (
                  <tr key={gr.id}>
                    <td>
                      <strong style={{ color: 'var(--color-success)', fontFamily: 'monospace' }}>
                        {gr.receiptNumber}
                      </strong>
                    </td>
                    <td>
                      <div>{gr.carrier || 'Logistics Fleet'}</div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                        Waybill: {gr.trackingNumber}
                      </div>
                    </td>
                    <td>
                      {gr.items?.map((gri) => {
                        const matchingItem = items.find((it) => it.id === gri.poItemId);
                        return (
                          <div key={gri.id} style={{ marginBottom: '0.2rem' }}>
                            <span style={{ fontWeight: 700, color: 'var(--color-success)' }}>
                              +{gri.quantityReceived} units
                            </span>{' '}
                            <span>{matchingItem?.partName || 'Part'}</span>
                          </div>
                        );
                      })}
                    </td>
                    <td>{new Date(gr.createdAt).toLocaleString()}</td>
                    <td style={{ color: 'var(--text-secondary)' }}>{gr.notes || 'Goods verified in good condition'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Receive Stock Modal */}
      {isReceiveOpen && (
        <ReceiveStockModal
          isOpen={isReceiveOpen}
          onClose={() => setIsReceiveOpen(false)}
          purchaseOrder={po}
          onStockReceived={fetchPo}
        />
      )}
    </div>
  );
}
