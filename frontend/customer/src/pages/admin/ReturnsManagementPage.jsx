import React, { useState, useEffect } from 'react';
import returnsService from '../../services/returnsService';
import toast from 'react-hot-toast';
import { RefreshCw, Package, Check, X, AlertTriangle, CheckCircle2, CreditCard, RotateCcw } from 'lucide-react';

export default function ReturnsManagementPage() {
  const [returns, setReturns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [search, setSearch] = useState('');

  // Modal states
  const [reviewModalData, setReviewModalData] = useState(null); // { returnItem, action: 'APPROVE' | 'REJECT' }
  const [rejectionReason, setRejectionReason] = useState('');
  const [inspectModalData, setInspectModalData] = useState(null); // returnItem
  const [inspectionOutcome, setInspectionOutcome] = useState('PASSED');
  const [inspectionCondition, setInspectionCondition] = useState('GOOD');
  const [inspectionNotes, setInspectionNotes] = useState('');
  const [refundConfirmData, setRefundConfirmData] = useState(null); // returnItem
  const [submittingAction, setSubmittingAction] = useState(false);

  const fetchReturns = async () => {
    setLoading(true);
    try {
      const data = await returnsService.adminListReturns({
        status: statusFilter !== 'ALL' ? statusFilter : undefined,
        search: search.trim() ? search.trim() : undefined,
      });
      setReturns(data || []);
    } catch (err) {
      toast.error('Failed to load return requests.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReturns();
  }, [statusFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchReturns();
  };

  // 1. Approve / Reject Handler
  const handleConfirmReview = async () => {
    if (!reviewModalData) return;
    const { returnItem, action } = reviewModalData;
    if (action === 'REJECT' && !rejectionReason.trim()) {
      toast.error('Please provide a reason for rejecting the return.');
      return;
    }

    try {
      setSubmittingAction(true);
      await returnsService.adminReviewReturn(returnItem.id, {
        action,
        rejectionReason: action === 'REJECT' ? rejectionReason.trim() : undefined,
      });
      toast.success(
        action === 'APPROVE'
          ? 'Return approved and reverse pickup assignment dispatched!'
          : 'Return request rejected.'
      );
      setReviewModalData(null);
      setRejectionReason('');
      fetchReturns();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit review.');
    } finally {
      setSubmittingAction(false);
    }
  };

  // 2. Inspection Outcome Handler
  const handleConfirmInspection = async () => {
    if (!inspectModalData) return;
    try {
      setSubmittingAction(true);
      await returnsService.adminInspectReturn(inspectModalData.id, {
        outcome: inspectionOutcome,
        condition: inspectionCondition,
        notes: inspectionNotes.trim() || undefined,
      });
      toast.success(
        inspectionOutcome === 'PASSED'
          ? 'Inspection passed! Sellable stock restocked in inventory.'
          : 'Inspection failed: Quarantined as damaged / unsellable.'
      );
      setInspectModalData(null);
      setInspectionNotes('');
      fetchReturns();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to record inspection.');
    } finally {
      setSubmittingAction(false);
    }
  };

  // 3. Process Refund Handler
  const handleConfirmRefund = async () => {
    if (!refundConfirmData) return;
    try {
      setSubmittingAction(true);
      const res = await returnsService.adminProcessRefund(refundConfirmData.id);
      toast.success(
        `Refund of ₹${Number(res.refundAmount || refundConfirmData.refundAmount).toLocaleString('en-IN')} successfully executed!`
      );
      setRefundConfirmData(null);
      fetchReturns();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to process refund.');
    } finally {
      setSubmittingAction(false);
    }
  };

  // KPIs
  const totalCount = returns.length;
  const pendingCount = returns.filter((r) => r.status === 'REQUESTED').length;
  const reverseLogisticsCount = returns.filter((r) =>
    ['APPROVED', 'PICKUP_ASSIGNED', 'PICKED_UP'].includes(r.status)
  ).length;
  const receivedAtHubCount = returns.filter((r) => r.status === 'RECEIVED').length;
  const readyRefundCount = returns.filter((r) =>
    ['INSPECTION_PASSED', 'REFUND_APPROVED'].includes(r.status)
  ).length;
  const refundedCount = returns.filter((r) => r.status === 'REFUNDED').length;
  const totalRefundedSum = returns
    .filter((r) => r.status === 'REFUNDED')
    .reduce((sum, r) => sum + Number(r.refundAmount || 0), 0);

  return (
    <div style={{ padding: '24px', maxWidth: '1400px', margin: '0 auto' }}>
      {/* Title & Description */}
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--text-primary)', margin: '0 0 6px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <RotateCcw size={26} strokeWidth={1.75} /> Spare-Part Returns & Refunds Oversight
        </h1>
        <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
          Manage customer returns, inspect reverse logistics deliveries, and process authoritative refunds.
        </p>
      </div>

      {/* KPI Cards */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))',
          gap: '16px',
          marginBottom: '28px',
        }}
      >
        <div style={kpiCardStyle}>
          <div style={kpiLabelStyle}>Total Returns</div>
          <div style={kpiValueStyle}>{totalCount}</div>
        </div>
        <div style={{ ...kpiCardStyle, borderLeft: '4px solid #D97706' }}>
          <div style={kpiLabelStyle}>Pending Review</div>
          <div style={{ ...kpiValueStyle, color: '#D97706' }}>{pendingCount}</div>
        </div>
        <div style={{ ...kpiCardStyle, borderLeft: '4px solid #3B82F6' }}>
          <div style={kpiLabelStyle}>Reverse Pickups</div>
          <div style={{ ...kpiValueStyle, color: '#3B82F6' }}>{reverseLogisticsCount}</div>
        </div>
        <div style={{ ...kpiCardStyle, borderLeft: '4px solid #8B5CF6' }}>
          <div style={kpiLabelStyle}>At Inspection Hub</div>
          <div style={{ ...kpiValueStyle, color: '#8B5CF6' }}>{receivedAtHubCount}</div>
        </div>
        <div style={{ ...kpiCardStyle, borderLeft: '4px solid #10B981' }}>
          <div style={kpiLabelStyle}>Inspection Passed</div>
          <div style={{ ...kpiValueStyle, color: '#10B981' }}>{readyRefundCount}</div>
        </div>
        <div style={{ ...kpiCardStyle, borderLeft: '4px solid #0D9488' }}>
          <div style={kpiLabelStyle}>Total Refunded</div>
          <div style={{ ...kpiValueStyle, color: '#0D9488', fontSize: '1.35rem' }}>
            ₹{totalRefundedSum.toLocaleString('en-IN')}
          </div>
        </div>
      </div>

      {/* Search and Status Filters */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '16px',
          marginBottom: '20px',
        }}
      >
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {[
            { key: 'ALL', label: 'All Requests' },
            { key: 'REQUESTED', label: 'Pending Review' },
            { key: 'PICKUP_ASSIGNED', label: 'In Reverse Pickup' },
            { key: 'RECEIVED', label: 'Hub Inspection' },
            { key: 'INSPECTION_PASSED', label: 'Ready for Refund' },
            { key: 'REFUNDED', label: 'Completed Refunds' },
            { key: 'REJECTED', label: 'Rejected' },
          ].map((f) => (
            <button
              key={f.key}
              onClick={() => setStatusFilter(f.key)}
              style={{
                padding: '6px 14px',
                borderRadius: '8px',
                fontSize: '0.82rem',
                fontWeight: 700,
                border: '1px solid var(--border-color)',
                cursor: 'pointer',
                background: statusFilter === f.key ? 'var(--color-primary-500, #0D9488)' : 'var(--bg-secondary)',
                color: statusFilter === f.key ? '#ffffff' : 'var(--text-secondary)',
              }}
            >
              {f.label}
            </button>
          ))}
        </div>

        <form onSubmit={handleSearchSubmit} style={{ display: 'flex', gap: '8px' }}>
          <input
            type="text"
            placeholder="Search Order #, Customer, Part..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              padding: '8px 14px',
              borderRadius: '8px',
              border: '1px solid var(--border-color)',
              background: 'var(--bg-secondary)',
              color: 'var(--text-primary)',
              fontSize: '0.85rem',
              outline: 'none',
              minWidth: '240px',
            }}
          />
          <button
            type="submit"
            style={{
              padding: '8px 16px',
              borderRadius: '8px',
              background: 'var(--bg-secondary)',
              border: '1px solid var(--border-color)',
              color: 'var(--text-primary)',
              fontWeight: 600,
              fontSize: '0.85rem',
              cursor: 'pointer',
            }}
          >
            Search
          </button>
        </form>
      </div>

      {/* Returns List */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text-secondary)' }}>
          <RefreshCw size={36} strokeWidth={1.75} style={{ color: 'var(--color-primary)', marginBottom: '8px' }} />
          <div>Loading return requests...</div>
        </div>
      ) : returns.length === 0 ? (
        <div
          style={{
            textAlign: 'center',
            padding: '60px 20px',
            background: 'var(--bg-secondary)',
            borderRadius: '16px',
            border: '1px solid var(--border-color)',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <Package size={44} strokeWidth={1.75} style={{ color: 'var(--text-muted)', marginBottom: '10px' }} />
          </div>
          <h3 style={{ margin: '0 0 6px', color: 'var(--text-primary)' }}>No Return Requests Found</h3>
          <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            There are no returns matching the selected status filter.
          </p>
        </div>
      ) : (
        <div
          style={{
            background: 'var(--color-bg-card)',
            borderRadius: '16px',
            border: '1px solid var(--border-color)',
            overflow: 'hidden',
          }}
        >
          <div className="table-responsive" style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
            <table style={{ width: '100%', minWidth: '850px', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
              <thead>
                <tr style={{ background: 'var(--bg-secondary)', borderBottom: '1px solid var(--border-color)' }}>
                  <th style={thStyle}>Return & Order</th>
                  <th style={thStyle}>Customer</th>
                  <th style={thStyle}>Returned Item</th>
                  <th style={thStyle}>Reason & Details</th>
                  <th style={thStyle}>Refund Value</th>
                  <th style={thStyle}>Status</th>
                  <th style={{ ...thStyle, textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {returns.map((ret) => {
                  const partName = ret.orderItem?.product?.name || 'Spare Part';
                  const customerName = ret.user ? `${ret.user.firstName || ''} ${ret.user.lastName || ''}`.trim() : 'Customer';
                  const orderNum = ret.order?.orderNumber || ret.orderId;
                  const unitPrice = Number(ret.orderItem?.unitPrice || 0);
                  const refundAmount = Number(ret.refundAmount || (unitPrice * ret.quantity));

                  return (
                    <tr
                      key={ret.id}
                      style={{
                        borderBottom: '1px solid var(--border-color)',
                        transition: 'background 0.15s',
                      }}
                    >
                      {/* Return ID & Order */}
                      <td style={tdStyle}>
                        <div style={{ fontWeight: 700, color: 'var(--text-primary)' }}>
                          #{orderNum}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                          ID: {ret.id.slice(0, 10)}...
                        </div>
                        <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                          {ret.requestedAt ? new Date(ret.requestedAt).toLocaleDateString() : 'Recent'}
                        </div>
                      </td>

                      {/* Customer */}
                      <td style={tdStyle}>
                        <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{customerName}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                          {ret.user?.phone || ret.order?.address?.phone || ret.user?.email}
                        </div>
                        <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                          {ret.order?.address?.city || 'Bengaluru'}
                        </div>
                      </td>

                      {/* Item */}
                      <td style={tdStyle}>
                        <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{partName}</div>
                        <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                          Qty: <strong>{ret.quantity}</strong> unit(s) · ₹{unitPrice.toLocaleString('en-IN')}/ea
                        </div>
                        {ret.orderItem?.product?.partNumber && (
                          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                            PN: {ret.orderItem.product.partNumber}
                          </div>
                        )}
                      </td>

                      {/* Reason */}
                      <td style={{ ...tdStyle, maxWidth: '240px' }}>
                        <div style={{ fontWeight: 700, color: 'var(--text-primary)' }}>
                          {ret.reason.replace(/_/g, ' ')}
                        </div>
                        {ret.details && (
                          <div
                            style={{
                              fontSize: '0.78rem',
                              color: 'var(--text-secondary)',
                              marginTop: '2px',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap',
                            }}
                            title={ret.details}
                          >
                            {ret.details}
                          </div>
                        )}
                        {ret.rejectionReason && (
                          <div style={{ fontSize: '0.75rem', color: '#EF4444', marginTop: '2px' }}>
                            Rejected: {ret.rejectionReason}
                          </div>
                        )}
                      </td>

                      {/* Refund Value */}
                      <td style={tdStyle}>
                        <div style={{ fontWeight: 800, fontSize: '0.95rem', color: '#0D9488' }}>
                          ₹{refundAmount.toLocaleString('en-IN')}
                        </div>
                        <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                          {ret.order?.paymentMethod === 'CASH_ON_DELIVERY' ? 'Direct Refund' : 'Razorpay Source'}
                        </div>
                      </td>

                      {/* Status */}
                      <td style={tdStyle}>
                        <span className={`return-badge return-badge-${ret.status.toLowerCase()}`}>
                          {ret.status.replace(/_/g, ' ')}
                        </span>
                      </td>

                      {/* Actions */}
                      <td style={{ ...tdStyle, textAlign: 'right' }}>
                        <div style={{ display: 'inline-flex', gap: '8px', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                          {/* If REQUESTED: Approve or Reject */}
                          {ret.status === 'REQUESTED' && (
                            <>
                              <button
                                onClick={() => setReviewModalData({ returnItem: ret, action: 'APPROVE' })}
                                style={{ ...actionBtnStyle, background: '#0D9488', color: '#ffffff' }}
                              >
                                Approve & Pickup
                              </button>
                              <button
                                onClick={() => setReviewModalData({ returnItem: ret, action: 'REJECT' })}
                                style={{ ...actionBtnStyle, background: 'rgba(239, 68, 68, 0.1)', color: '#EF4444', border: '1px solid #EF4444' }}
                              >
                                Reject
                              </button>
                            </>
                          )}

                          {/* If RECEIVED at Hub (or PICKED_UP): Inspect item */}
                          {['RECEIVED', 'PICKED_UP', 'PICKUP_ASSIGNED'].includes(ret.status) && (
                            <button
                              onClick={() => {
                                setInspectModalData(ret);
                                setInspectionOutcome('PASSED');
                                setInspectionCondition('GOOD');
                                setInspectionNotes('');
                              }}
                              style={{ ...actionBtnStyle, background: '#8B5CF6', color: '#ffffff' }}
                            >
                              Inspect Item
                            </button>
                          )}

                          {/* If INSPECTION_PASSED: Process Refund */}
                          {['INSPECTION_PASSED', 'REFUND_APPROVED', 'APPROVED'].includes(ret.status) && (
                            <button
                              onClick={() => setRefundConfirmData(ret)}
                              style={{ ...actionBtnStyle, background: '#10B981', color: '#ffffff' }}
                            >
                              Process Refund ₹{refundAmount.toLocaleString('en-IN')}
                            </button>
                          )}

                          {/* If REFUNDED */}
                          {ret.status === 'REFUNDED' && (
                            <span style={{ fontSize: '0.8rem', color: '#059669', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                              <Check size={14} strokeWidth={2} /> Refund Complete
                            </span>
                          )}

                          {/* If REJECTED */}
                          {ret.status === 'REJECTED' && (
                            <span style={{ fontSize: '0.8rem', color: '#DC2626', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                              <X size={14} strokeWidth={2} /> Rejected
                            </span>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 1. Review Modal (Approve or Reject) */}
      {reviewModalData && (
        <div className="modal-backdrop" onClick={() => !submittingAction && setReviewModalData(null)}>
          <div className="return-modal modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '480px' }}>
            <div className="modal-header">
              <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 800 }}>
                {reviewModalData.action === 'APPROVE' ? 'Approve Return Request' : 'Reject Return Request'}
              </h3>
              <button
                type="button"
                className="modal-close-btn"
                onClick={() => setReviewModalData(null)}
                disabled={submittingAction}
                style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', display: 'flex', alignItems: 'center' }}
              >
                <X size={20} strokeWidth={1.75} />
              </button>
            </div>

            <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                {reviewModalData.action === 'APPROVE' ? (
                  <>
                    Approving will automatically generate a <strong>RETURN_PICKUP</strong> delivery job for the fleet. A driver will be dispatched to collect the item from customer doorstep.
                  </>
                ) : (
                  <>Please specify why this return request is being rejected. The customer will receive this explanation.</>
                )}
              </p>

              {reviewModalData.action === 'REJECT' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                    Rejection Reason *
                  </label>
                  <textarea
                    rows={3}
                    placeholder="e.g. Return request submitted past eligible window / item marked as non-returnable / part already installed..."
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    style={{
                      padding: '10px 14px',
                      borderRadius: '8px',
                      border: '1px solid var(--border-color)',
                      background: 'var(--bg-primary)',
                      color: 'var(--text-primary)',
                      fontSize: '0.9rem',
                    }}
                  />
                </div>
              )}

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '8px' }}>
                <button
                  type="button"
                  onClick={() => setReviewModalData(null)}
                  disabled={submittingAction}
                  style={secondaryBtnStyle}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleConfirmReview}
                  disabled={submittingAction}
                  style={{
                    ...primaryBtnStyle,
                    background: reviewModalData.action === 'APPROVE' ? '#0D9488' : '#EF4444',
                  }}
                >
                  {submittingAction
                    ? 'Processing...'
                    : reviewModalData.action === 'APPROVE'
                    ? 'Confirm Approval & Dispatch Pickup'
                    : 'Confirm Rejection'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 2. Inspection Modal */}
      {inspectModalData && (
        <div className="modal-backdrop" onClick={() => !submittingAction && setInspectModalData(null)}>
          <div className="return-modal modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '520px' }}>
            <div className="modal-header">
              <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 800 }}>Record Quality Inspection</h3>
              <button
                type="button"
                className="modal-close-btn"
                onClick={() => setInspectModalData(null)}
                disabled={submittingAction}
                style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', display: 'flex', alignItems: 'center' }}
              >
                <X size={20} strokeWidth={1.75} />
              </button>
            </div>

            <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                Item: <strong>{inspectModalData.orderItem?.product?.name}</strong> (Qty: {inspectModalData.quantity})
              </div>

              {/* Inspection Outcome */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                  Inspection Outcome *
                </label>
                <select
                  value={inspectionOutcome}
                  onChange={(e) => setInspectionOutcome(e.target.value)}
                  style={selectStyle}
                >
                  <option value="PASSED">PASSED (Item meets quality return standard)</option>
                  <option value="FAILED">FAILED (Item damaged / tampered / invalid)</option>
                </select>
              </div>

              {/* Condition */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                  Physical Condition *
                </label>
                <select
                  value={inspectionCondition}
                  onChange={(e) => setInspectionCondition(e.target.value)}
                  style={selectStyle}
                >
                  <option value="GOOD">GOOD (Intact / Original Condition - Safe to Restock)</option>
                  <option value="UNOPENED">UNOPENED (Factory Sealed - Restock immediately)</option>
                  <option value="DAMAGED">DAMAGED (Damaged Stock - DO NOT RESTOCK)</option>
                </select>
              </div>

              {/* Restock Warning Banner */}
              <div
                style={{
                  padding: '12px 14px',
                  borderRadius: '8px',
                  fontSize: '0.82rem',
                  background: inspectionCondition === 'DAMAGED' || inspectionOutcome === 'FAILED' ? 'rgba(239, 68, 68, 0.1)' : 'rgba(16, 185, 129, 0.1)',
                  color: inspectionCondition === 'DAMAGED' || inspectionOutcome === 'FAILED' ? '#EF4444' : '#10B981',
                  border: `1px solid ${inspectionCondition === 'DAMAGED' || inspectionOutcome === 'FAILED' ? 'rgba(239, 68, 68, 0.3)' : 'rgba(16, 185, 129, 0.3)'}`,
                }}
              >
                {inspectionCondition === 'DAMAGED' || inspectionOutcome === 'FAILED' ? (
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                    <AlertTriangle size={15} strokeWidth={1.75} /> Damaged stock rule active: This part will NOT be added back to sellable inventory. It will be quarantined in damaged inventory.
                  </span>
                ) : (
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                    <CheckCircle2 size={15} strokeWidth={1.75} /> Stock restoration rule active: This part will be authoritatively restocked into PostgreSQL inventory with StockMovement type RETURN.
                  </span>
                )}
              </div>

              {/* Notes */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                  Inspector Notes
                </label>
                <textarea
                  rows={2}
                  placeholder="Notes on packaging, seal condition, testing result..."
                  value={inspectionNotes}
                  onChange={(e) => setInspectionNotes(e.target.value)}
                  style={{
                    padding: '10px 14px',
                    borderRadius: '8px',
                    border: '1px solid var(--border-color)',
                    background: 'var(--bg-primary)',
                    color: 'var(--text-primary)',
                    fontSize: '0.88rem',
                  }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '8px' }}>
                <button
                  type="button"
                  onClick={() => setInspectModalData(null)}
                  disabled={submittingAction}
                  style={secondaryBtnStyle}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleConfirmInspection}
                  disabled={submittingAction}
                  style={{ ...primaryBtnStyle, background: '#8B5CF6' }}
                >
                  {submittingAction ? 'Saving...' : 'Submit Inspection Outcome'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 3. Refund Confirmation Modal */}
      {refundConfirmData && (
        <div className="modal-backdrop" onClick={() => !submittingAction && setRefundConfirmData(null)}>
          <div className="return-modal modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '480px' }}>
            <div className="modal-header">
              <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 800 }}>Confirm & Execute Refund</h3>
              <button
                type="button"
                className="modal-close-btn"
                onClick={() => setRefundConfirmData(null)}
                disabled={submittingAction}
                style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', display: 'flex', alignItems: 'center' }}
              >
                <X size={20} strokeWidth={1.75} />
              </button>
            </div>

            <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ textAlign: 'center', padding: '16px 0', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <CreditCard size={40} strokeWidth={1.75} style={{ color: '#0D9488', marginBottom: '8px' }} />
                <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#0D9488' }}>
                  ₹{Number(refundConfirmData.refundAmount || 0).toLocaleString('en-IN')}
                </div>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                  Authoritative refund calculation for Order #{refundConfirmData.order?.orderNumber}
                </div>
              </div>

              <div
                style={{
                  padding: '12px 14px',
                  borderRadius: '8px',
                  background: 'var(--bg-secondary)',
                  border: '1px solid var(--border-color)',
                  fontSize: '0.82rem',
                  lineHeight: 1.5,
                }}
              >
                <div>• Customer: <strong>{refundConfirmData.user?.firstName} {refundConfirmData.user?.lastName}</strong></div>
                <div>• Method: <strong>{refundConfirmData.order?.paymentMethod === 'CASH_ON_DELIVERY' ? 'Direct Bank/UPI or Wallet' : 'Original Razorpay source'}</strong></div>
                <div>• Item: <strong>{refundConfirmData.orderItem?.product?.name}</strong> (Qty: {refundConfirmData.quantity})</div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '8px' }}>
                <button
                  type="button"
                  onClick={() => setRefundConfirmData(null)}
                  disabled={submittingAction}
                  style={secondaryBtnStyle}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleConfirmRefund}
                  disabled={submittingAction}
                  style={{ ...primaryBtnStyle, background: '#10B981' }}
                >
                  {submittingAction ? 'Processing...' : 'Execute Backend Refund'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const kpiCardStyle = {
  background: 'var(--color-bg-card)',
  borderRadius: '12px',
  border: '1px solid var(--border-color)',
  padding: '16px',
};

const kpiLabelStyle = {
  fontSize: '0.8rem',
  fontWeight: 600,
  color: 'var(--text-secondary)',
  marginBottom: '6px',
};

const kpiValueStyle = {
  fontSize: '1.5rem',
  fontWeight: 800,
  color: 'var(--text-primary)',
};

const thStyle = {
  padding: '12px 16px',
  color: 'var(--text-secondary)',
  fontWeight: 700,
  fontSize: '0.78rem',
  textTransform: 'uppercase',
  letterSpacing: '0.5px',
};

const tdStyle = {
  padding: '14px 16px',
  verticalAlign: 'middle',
};

const actionBtnStyle = {
  padding: '6px 12px',
  borderRadius: '6px',
  border: 'none',
  fontSize: '0.78rem',
  fontWeight: 700,
  cursor: 'pointer',
  transition: 'opacity 0.2s',
};

const primaryBtnStyle = {
  padding: '10px 18px',
  borderRadius: '8px',
  border: 'none',
  color: '#ffffff',
  fontWeight: 700,
  fontSize: '0.85rem',
  cursor: 'pointer',
};

const secondaryBtnStyle = {
  padding: '10px 16px',
  borderRadius: '8px',
  border: '1px solid var(--border-color)',
  background: 'var(--bg-secondary)',
  color: 'var(--text-secondary)',
  fontWeight: 600,
  fontSize: '0.85rem',
  cursor: 'pointer',
};

const selectStyle = {
  padding: '10px 14px',
  borderRadius: '8px',
  border: '1px solid var(--border-color)',
  background: 'var(--bg-primary)',
  color: 'var(--text-primary)',
  fontSize: '0.88rem',
  outline: 'none',
};
