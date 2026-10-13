import React, { useState, useEffect } from 'react';
import adminService from '../../services/adminService';
import toast from 'react-hot-toast';
import { Car, MapPin, Store, Wrench, AlertTriangle, X } from 'lucide-react';

export default function UsedPartsOversightPage() {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [editingItem, setEditingItem] = useState(null);
  const [valuationInput, setValuationInput] = useState('');
  const [overrideReason, setOverrideReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedPhotosModal, setSelectedPhotosModal] = useState(null);

  const fetchListings = async () => {
    setLoading(true);
    try {
      const data = await adminService.listUsedParts({ status: statusFilter || undefined });
      setListings(data);
    } catch (err) {
      toast.error('Failed to load used parts.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchListings();
  }, [statusFilter]);

  const handleOpenEdit = (item) => {
    setEditingItem(item);
    setValuationInput(
      item.intake?.adminOverridePrice ||
      item.finalValuation ||
      item.intake?.recommendedListingPrice ||
      item.estimatedValuation ||
      2799
    );
    setOverrideReason(item.intake?.adminOverrideReason || '');
  };

  const handleSaveValuation = async (e) => {
    e.preventDefault();
    if (!overrideReason || overrideReason.trim().length < 5) {
      toast.error('Administrative override requires a mandatory justification note (minimum 5 characters).');
      return;
    }

    setIsSubmitting(true);
    try {
      await adminService.valueUsedPart(editingItem.id, Number(valuationInput), overrideReason.trim());
      toast.success(`Valuation override of ₹${valuationInput} recorded with audit reason.`);
      setEditingItem(null);
      setOverrideReason('');
      fetchListings();
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to update valuation.';
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleQuickPayout = async (item) => {
    try {
      await adminService.payoutUsedPart(item.id);
      toast.success(`Seller payout of ₹${item.payoutAmount || item.intake?.recommendedSellerPayout || 2500} released.`);
      fetchListings();
    } catch (err) {
      toast.error('Failed to release payout.');
    }
  };

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
          Garage-First Used-Parts Resale & Technical Oversight
        </h1>
        <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
          Monitor partner garage physical inspections, technical checkpoint scores, automated catalog valuations, and seller payouts.
        </p>
      </div>

      {/* Toolbar */}
      <div className="toolbar" style={{ marginBottom: '1.5rem', display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          style={{ padding: '0.5rem 0.75rem', borderRadius: '8px', border: '1px solid var(--border-color)' }}
        >
          <option value="">All Workflow States</option>
          <option value="SUBMITTED">Submitted</option>
          <option value="GARAGE_ASSIGNED">Assigned to Garage</option>
          <option value="PART_RECEIVED">Part Received at Garage</option>
          <option value="OFFER_READY">Offer Ready (Customer Decision)</option>
          <option value="PAYOUT_PENDING">Payout Pending</option>
          <option value="PAID">Seller Paid</option>
          <option value="LISTED">Listed on Marketplace</option>
          <option value="REJECTED">Failed Inspection</option>
        </select>
        <button onClick={() => { setStatusFilter(''); fetchListings(); }} className="btn btn-secondary btn-sm">
          Reset
        </button>
      </div>

      {/* Table */}
      <div className="admin-card" style={{ padding: 0 }}>
        <div className="table-responsive">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Listing & Component</th>
                <th>Garage & Technician</th>
                <th>Inspection Scores</th>
                <th>Photos</th>
                <th>Valuation & Payout</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center', padding: '2.5rem', color: 'var(--text-muted)' }}>
                    Loading used parts inspections...
                  </td>
                </tr>
              ) : listings.length === 0 ? (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center', padding: '2.5rem', color: 'var(--text-muted)' }}>
                    No used part listings found for this filter.
                  </td>
                </tr>
              ) : (
                listings.map((item) => {
                  const intake = item.intake;
                  const allPhotos = [
                    ...(Array.isArray(item.images) ? item.images : []),
                    ...(Array.isArray(intake?.photos) ? intake.photos : []),
                  ].filter(Boolean);

                  return (
                    <tr key={item.id}>
                      {/* Listing & Component */}
                      <td>
                        <div style={{ fontWeight: 800, color: 'var(--text-primary)', fontSize: '0.92rem' }}>
                          {item.title}
                        </div>
                        <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <Car size={13} strokeWidth={1.75} /> {item.vehicleModel} • {item.partNumber ? `PN: ${item.partNumber}` : 'No SKU'}
                        </div>
                        <div style={{ fontSize: '0.74rem', color: 'var(--text-secondary)', marginTop: '2px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                          Seller: {item.seller?.fullName || item.sellerName || 'Customer'} (<MapPin size={11} strokeWidth={1.75} /> {item.location || 'Pan-India'})
                        </div>
                      </td>

                      {/* Garage & Technician */}
                      <td>
                        <div style={{ fontWeight: 700, fontSize: '0.86rem', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <Store size={14} strokeWidth={1.75} /> {item.assignedShop?.shopName || intake?.shop?.shopName || 'Pending Assignment'}
                        </div>
                        <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <Wrench size={12} strokeWidth={1.75} /> Tech: {intake?.inspectorName || 'Unassigned'}
                        </div>
                        <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>
                          Mode: {item.handoverMethod === 'DROPOFF' ? 'Drop-Off' : 'Pickup'}
                        </div>
                      </td>

                      {/* Inspection Scores */}
                      <td>
                        {intake && intake.inspectionScore ? (
                          <div>
                            <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                              <span
                                className={`badge ${
                                  intake.technicalResult === 'PASSED'
                                    ? 'badge-success'
                                    : intake.technicalResult === 'REPAIR_REQUIRED'
                                    ? 'badge-warning'
                                    : 'badge-danger'
                                }`}
                              >
                                {intake.technicalResult || 'INSPECTED'}
                              </span>
                              <span style={{ fontWeight: 800, fontSize: '0.85rem', color: 'var(--color-primary)' }}>
                                Grade {intake.overallGrade || item.conditionGrade || 'B'} ({intake.inspectionScore}/100)
                              </span>
                            </div>
                            <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', marginTop: '3px' }}>
                              Phys: {intake.physicalConditionRating}/5 • Func: {intake.functionalTestRating}/5 • Wear: {intake.wearLevelRating}/5 • Safe: {intake.safetyConfidenceRating}/5
                            </div>
                          </div>
                        ) : (
                          <span className="badge badge-secondary">Pending Inspection</span>
                        )}
                      </td>

                      {/* Photos */}
                      <td>
                        {allPhotos.length > 0 ? (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <img
                              src={
                                allPhotos[0].startsWith('http')
                                  ? allPhotos[0]
                                  : `${import.meta.env.VITE_API_URL?.replace('/api','') || (window.location.hostname === 'localhost' ? 'http://localhost:5000' : 'https://partnexa-api-wed5.onrender.com')}${allPhotos[0]}`
                              }
                              alt="Part"
                              style={{ width: '42px', height: '42px', objectFit: 'cover', borderRadius: '6px', cursor: 'pointer' }}
                              onClick={() => setSelectedPhotosModal(allPhotos)}
                            />
                            {allPhotos.length > 1 && (
                              <span
                                style={{ fontSize: '0.74rem', color: 'var(--color-primary)', cursor: 'pointer', fontWeight: 700 }}
                                onClick={() => setSelectedPhotosModal(allPhotos)}
                              >
                                +{allPhotos.length - 1} photos
                              </span>
                            )}
                          </div>
                        ) : (
                          <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>No photos</span>
                        )}
                      </td>

                      {/* Valuation & Payout */}
                      <td>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                          Ref New: ₹{intake?.referenceNewPrice || '—'}
                        </div>
                        <div style={{ fontWeight: 800, color: '#0f766e', fontSize: '0.92rem' }}>
                          Listing: ₹{(item.finalValuation || intake?.recommendedListingPrice || item.estimatedValuation || 0).toLocaleString('en-IN')}
                        </div>
                        <div style={{ fontSize: '0.78rem', color: '#059669', fontWeight: 700 }}>
                          Seller Payout: ₹{(item.payoutAmount || intake?.recommendedSellerPayout || Math.round((item.finalValuation || 0) * 0.9)).toLocaleString('en-IN')}
                        </div>
                        {intake?.adminOverridePrice && (
                          <div style={{ fontSize: '0.7rem', color: '#d97706', marginTop: '2px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <AlertTriangle size={12} strokeWidth={1.75} /> Overridden: ₹{intake.adminOverridePrice} ({intake.adminOverrideReason})
                          </div>
                        )}
                      </td>

                      {/* Status */}
                      <td>
                        <span
                          className={`badge ${
                            item.status === 'LISTED' || item.status === 'PAID'
                              ? 'badge-success'
                              : item.status === 'OFFER_READY'
                              ? 'badge-info'
                              : item.status === 'REJECTED'
                              ? 'badge-danger'
                              : 'badge-warning'
                          }`}
                        >
                          {item.status}
                        </span>
                        {intake?.customerOfferStatus && (
                          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                            Offer: <strong>{intake.customerOfferStatus}</strong>
                          </div>
                        )}
                      </td>

                      {/* Actions */}
                      <td>
                        <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap' }}>
                          <button
                            onClick={() => handleOpenEdit(item)}
                            className="btn btn-sm btn-secondary"
                            title="Override Recommended Price"
                          >
                            Review / Override
                          </button>
                          {item.status === 'PAYOUT_PENDING' && (
                            <button
                              onClick={() => handleQuickPayout(item)}
                              className="btn btn-sm btn-primary"
                            >
                              Release Payout
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Admin Price Override Modal */}
      {editingItem && (
        <div className="modal-overlay" onClick={() => setEditingItem(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '520px' }}>
            <div className="modal-header">
              <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                Administrative Valuation Review: {editingItem.title}
              </h3>
              <button onClick={() => setEditingItem(null)} style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
                <X size={20} strokeWidth={1.75} />
              </button>
            </div>
            <form onSubmit={handleSaveValuation}>
              <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '1rem', padding: '1rem' }}>
                <div style={{ background: 'var(--bg-secondary)', padding: '12px', borderRadius: '8px' }}>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    Technician: <strong>{editingItem.intake?.inspectorName || 'Garage Tech'}</strong> at <strong>{editingItem.assignedShop?.shopName || 'Workshop'}</strong>
                  </div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                    Automated Catalog Resale: <strong>₹{editingItem.intake?.recommendedListingPrice || editingItem.finalValuation || '—'}</strong> (Seller Payout: <strong>₹{editingItem.intake?.recommendedSellerPayout || '—'}</strong>)
                  </div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                    Overall Grade: <strong>{editingItem.intake?.overallGrade || 'B'}</strong> • Score: <strong>{editingItem.intake?.inspectionScore || '—'}/100</strong>
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '0.4rem' }}>
                    Overridden Resale Listing Price (₹) *
                  </label>
                  <input
                    type="number"
                    value={valuationInput}
                    onChange={(e) => setValuationInput(e.target.value)}
                    style={{ width: '100%', fontSize: '1.1rem', fontWeight: 800, padding: '8px', borderRadius: '6px', border: '1px solid var(--border-color)' }}
                    required
                    min="100"
                  />
                  <div style={{ fontSize: '0.76rem', color: '#059669', fontWeight: 700, marginTop: '4px' }}>
                    Projected Seller Payout (Margin adjusted): ₹{Math.round(Number(valuationInput || 0) * 0.893)}
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '0.4rem' }}>
                    Administrative Override Reason (Mandatory) *
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Enter reason for overriding workshop technical valuation (e.g. Catalog price adjustment, rare component vintage bonus, minor cosmetic tolerance adjustment)..."
                    value={overrideReason}
                    onChange={(e) => setOverrideReason(e.target.value)}
                    style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid var(--border-color)', fontSize: '0.88rem' }}
                    required
                  />
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                    Minimum 5 characters. Mandatory for audit logging.
                  </span>
                </div>
              </div>
              <div className="modal-footer" style={{ padding: '1rem', display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                <button type="button" onClick={() => setEditingItem(null)} className="btn btn-secondary">Cancel</button>
                <button type="submit" className="btn btn-primary" loading={isSubmitting}>
                  Save Valuation Override
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Photos Lightbox Modal */}
      {selectedPhotosModal && (
        <div className="modal-overlay" onClick={() => setSelectedPhotosModal(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '650px' }}>
            <div className="modal-header">
              <h3>Technical Inspection Photos</h3>
              <button onClick={() => setSelectedPhotosModal(null)} style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
                <X size={20} strokeWidth={1.75} />
              </button>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '10px', padding: '1rem' }}>
              {selectedPhotosModal.map((url, idx) => (
                <img
                  key={idx}
                  src={
                    url.startsWith('http')
                      ? url
                      : `${import.meta.env.VITE_API_URL?.replace('/api','') || (window.location.hostname === 'localhost' ? 'http://localhost:5000' : 'https://partnexa-api-wed5.onrender.com')}${url}`
                  }
                  alt={`Part inspection photo ${idx + 1}`}
                  style={{ width: '100%', height: '140px', objectFit: 'cover', borderRadius: '8px' }}
                />
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
