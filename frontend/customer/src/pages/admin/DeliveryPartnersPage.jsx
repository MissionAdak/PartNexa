import React, { useState, useEffect } from 'react';
import adminService from '../../services/adminService';
import toast from 'react-hot-toast';
import { Search, Star, MapPin, X, FileText, Inbox, ExternalLink } from 'lucide-react';

export default function DeliveryPartnersPage() {
  const [partners, setPartners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [search, setSearch] = useState('');

  // KYC Inspection Modal
  const [inspectPartner, setInspectPartner] = useState(null);
  const [isVerifying, setIsVerifying] = useState(false);

  // Rejection Reason Prompt State
  const [showRejectPrompt, setShowRejectPrompt] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');

  // Document Full View State
  const [previewDoc, setPreviewDoc] = useState(null);

  const fetchPartners = async () => {
    setLoading(true);
    try {
      const data = await adminService.listDeliveryPartners({
        status: statusFilter || undefined,
        search: search || undefined,
      });
      setPartners(data);
    } catch (err) {
      toast.error('Failed to load delivery fleet.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPartners();
  }, [statusFilter]);

  const handleVerifyKyc = async (status, reason = '') => {
    if (!inspectPartner) return;

    if (status === 'REJECTED' && !reason.trim()) {
      toast.error('Rejection requires a specific reason (e.g. "RC image is unreadable").');
      return;
    }

    setIsVerifying(true);
    try {
      await adminService.verifyDeliveryPartnerKyc(inspectPartner.id, {
        status,
        rejectionReason: status === 'REJECTED' ? reason.trim() : undefined,
      });
      toast.success(`Partner KYC marked as ${status} and activation updated.`);
      setInspectPartner(null);
      setShowRejectPrompt(false);
      setRejectionReason('');
      fetchPartners();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to verify partner KYC.');
    } finally {
      setIsVerifying(false);
    }
  };

  const handleToggleActivation = async (partner) => {
    const nextState = !partner.isActivated;
    try {
      await adminService.togglePartnerActivation(partner.id, nextState);
      toast.success(`Partner ${partner.driverName} ${nextState ? 'activated' : 'deactivated'}.`);
      fetchPartners();
    } catch (err) {
      toast.error('Failed to update partner activation status.');
    }
  };

  const formatDocName = (type = '') => {
    switch (type) {
      case 'PROFILE_PHOTO': return 'Profile Photograph';
      case 'AADHAAR_CARD': return 'Identity Proof (Aadhaar / ID)';
      case 'DRIVING_LICENSE': return 'Driving Licence (DL)';
      case 'VEHICLE_RC': return 'Vehicle Registration Certificate (RC)';
      case 'VEHICLE_PHOTO': return 'Vehicle Photograph';
      case 'INSURANCE': return 'Vehicle Insurance';
      case 'PAN_CARD': return 'PAN Card';
      default: return type.replace(/_/g, ' ');
    }
  };

  const quickRejectionReasons = [
    'RC image is unreadable',
    'Driving licence image is unclear or blurry',
    'Identity document does not match driver registration name',
    'Uploaded document appears to be expired',
    'Vehicle plate in photo does not match registration certificate',
  ];

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
          Delivery Fleet & KYC Verification
        </h1>
        <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
          Review partner licences, inspect private KYC documents, enforce compliance approvals, and monitor live fleet duty states.
        </p>
      </div>

      {/* Toolbar */}
      <div className="toolbar">
        <form onSubmit={(e) => { e.preventDefault(); fetchPartners(); }} className="search-box">
          <Search size={16} strokeWidth={1.75} style={{ color: 'var(--text-muted)' }} />
          <input
            type="text"
            placeholder="Search by vehicle number, rider name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <button type="submit" className="btn btn-primary btn-sm">Search</button>
        </form>

        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <option value="">All KYC States</option>
            <option value="APPROVED">Approved Only</option>
            <option value="PENDING">Pending Review</option>
            <option value="REJECTED">Rejected Only</option>
            <option value="NOT_SUBMITTED">Not Submitted</option>
          </select>
          <button onClick={() => { setSearch(''); setStatusFilter(''); fetchPartners(); }} className="btn btn-secondary btn-sm">
            Reset
          </button>
        </div>
      </div>

      {/* Fleet Table */}
      <div className="admin-card" style={{ padding: 0 }}>
        <div className="table-responsive">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Rider & City</th>
                <th>Vehicle & Plate</th>
                <th>Duty & Telemetry</th>
                <th>Deliveries & Registered</th>
                <th>COD Cash in Hand</th>
                <th>KYC & Account Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center', padding: '2.5rem', color: 'var(--text-muted)' }}>
                    Loading delivery fleet...
                  </td>
                </tr>
              ) : partners.length === 0 ? (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center', padding: '2.5rem', color: 'var(--text-muted)' }}>
                    No delivery partner records found.
                  </td>
                </tr>
              ) : (
                partners.map((p) => (
                  <tr key={p.id}>
                    <td>
                      <div style={{ fontWeight: 800, color: 'var(--text-primary)', fontSize: '0.95rem' }}>{p.driverName}</div>
                      <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>{p.driverEmail}</div>
                      <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{p.driverPhone}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--color-primary, #0284c7)', fontWeight: 600, marginTop: '0.15rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                        <MapPin size={12} strokeWidth={1.75} /> City: {p.city || 'Bengaluru'}
                      </div>
                    </td>
                    <td>
                      <div style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{p.vehicleNum || 'Plate Pending'}</div>
                      <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>{p.vehicleType || 'Two-Wheeler'}</div>
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.2rem' }}>
                        <span
                          style={{
                            width: '8px',
                            height: '8px',
                            borderRadius: '50%',
                            backgroundColor: p.isOnline ? 'var(--color-success, #10b981)' : 'var(--text-muted)',
                          }}
                        />
                        <span style={{ fontSize: '0.82rem', fontWeight: 700, color: p.isOnline ? 'var(--color-success, #10b981)' : 'var(--text-muted)' }}>
                          {p.isOnline ? 'ONLINE' : 'OFFLINE'}
                        </span>
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                        <Star size={12} strokeWidth={2} style={{ color: '#eab308', fill: '#eab308' }} /> {p.rating || 4.9} Rating • {p.activeTrips || 0} active trips
                      </div>
                    </td>
                    <td>
                      <div style={{ fontWeight: 700 }}>{p.completedDeliveries || 0} Delivered</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                        Reg: {p.registrationDate || p.createdAt ? new Date(p.registrationDate || p.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : 'Recent'}
                      </div>
                    </td>
                    <td>
                      <div style={{ fontWeight: 800, color: Number(p.cashInHand) > 0 ? 'var(--color-warning, #f59e0b)' : 'var(--text-muted)' }}>
                        ₹{Number(p.cashInHand || 0).toLocaleString('en-IN')}
                      </div>
                    </td>
                    <td>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem', alignItems: 'flex-start' }}>
                        <span
                          className={`badge ${
                            p.kycStatus === 'APPROVED'
                              ? 'badge-success'
                              : p.kycStatus === 'REJECTED'
                              ? 'badge-danger'
                              : 'badge-warning'
                          }`}
                        >
                          KYC: {p.kycStatus || 'NOT_SUBMITTED'}
                        </span>
                        <span
                          style={{
                            fontSize: '0.72rem',
                            padding: '0.15rem 0.45rem',
                            borderRadius: '4px',
                            backgroundColor: p.accountStatus === 'ACTIVE' ? 'rgba(34, 197, 94, 0.15)' : 'rgba(234, 179, 8, 0.15)',
                            color: p.accountStatus === 'ACTIVE' ? '#16a34a' : '#ca8a04',
                            fontWeight: 600,
                          }}
                        >
                          Account: {p.accountStatus || (p.isActivated ? 'ACTIVE' : 'PENDING_VERIFICATION')}
                        </span>
                      </div>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '0.4rem' }}>
                        <button
                          onClick={() => {
                            setInspectPartner(p);
                            setShowRejectPrompt(false);
                            setRejectionReason('');
                          }}
                          className="btn btn-sm btn-secondary"
                        >
                          Inspect KYC
                        </button>
                        <button
                          onClick={() => handleToggleActivation(p)}
                          className={`btn btn-sm ${p.isActivated ? 'btn-danger' : 'btn-success'}`}
                        >
                          {p.isActivated ? 'Deactivate' : 'Activate'}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* KYC Inspection Modal */}
      {inspectPartner && (
        <div className="modal-overlay" onClick={() => setInspectPartner(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '850px', width: '95%' }}>
            <div className="modal-header">
              <div>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                  KYC Review: {inspectPartner.driverName}
                </h3>
                <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                  Vehicle: {inspectPartner.vehicleNum} ({inspectPartner.vehicleType}) • Current Status: <strong>{inspectPartner.kycStatus}</strong>
                </div>
              </div>
              <button onClick={() => setInspectPartner(null)} style={{ color: 'var(--text-muted)', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
                <X size={20} strokeWidth={1.75} />
              </button>
            </div>

            <div className="modal-body" style={{ maxHeight: '70vh', overflowY: 'auto' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <h4 style={{ fontSize: '0.95rem', fontWeight: 700, margin: 0 }}>
                  Submitted Identity & Compliance Documents ({inspectPartner.kycDocuments?.length || 0})
                </h4>
                <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                  Click document to view full size with secure short-lived URL
                </span>
              </div>

              {inspectPartner.kycDocuments && inspectPartner.kycDocuments.length > 0 ? (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.2rem' }}>
                  {inspectPartner.kycDocuments.map((doc, i) => {
                    const isPdf = doc.mimeType === 'application/pdf' || doc.fileUrl?.includes('.pdf') || doc.objectKey?.toLowerCase().endsWith('.pdf');

                    return (
                      <div
                        key={i}
                        style={{
                          padding: '1rem',
                          borderRadius: 'var(--radius-md, 10px)',
                          backgroundColor: 'var(--bg-tertiary, #1e293b)',
                          border: '1px solid var(--border-color)',
                          display: 'flex',
                          flexDirection: 'column',
                          justifyContent: 'space-between',
                        }}
                      >
                        <div>
                          <div style={{ fontWeight: 800, fontSize: '0.88rem', color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
                            {formatDocName(doc.documentType)}
                          </div>

                          <div
                            onClick={() => setPreviewDoc(doc)}
                            style={{
                              height: '130px',
                              borderRadius: '8px',
                              backgroundColor: 'var(--bg-primary, #0f172a)',
                              overflow: 'hidden',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              cursor: 'pointer',
                              border: '1px solid var(--border-color)',
                              position: 'relative',
                            }}
                          >
                            {isPdf ? (
                              <div style={{ textAlign: 'center', padding: '1rem' }}>
                                <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '0.25rem' }}>
                                  <FileText size={36} strokeWidth={1.75} style={{ color: 'var(--text-muted)' }} />
                                </div>
                                <div style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-primary)', marginTop: '0.2rem' }}>
                                  PDF Document
                                </div>
                                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                                  Click to Inspect
                                </div>
                              </div>
                            ) : doc.fileUrl ? (
                              <img
                                src={doc.fileUrl}
                                alt={doc.documentType}
                                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                              />
                            ) : (
                              <FileText size={32} strokeWidth={1.75} style={{ color: 'var(--text-muted)' }} />
                            )}

                            <span
                              style={{
                                position: 'absolute',
                                bottom: '6px',
                                right: '6px',
                                backgroundColor: 'rgba(0,0,0,0.7)',
                                color: '#fff',
                                padding: '0.2rem 0.5rem',
                                borderRadius: '4px',
                                fontSize: '0.7rem',
                                fontWeight: 700,
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '0.25rem',
                              }}
                            >
                              <Search size={11} strokeWidth={1.75} /> View
                            </span>
                          </div>
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.75rem' }}>
                          <span className={`badge ${doc.verificationStatus === 'APPROVED' ? 'badge-success' : 'badge-warning'}`}>
                            {doc.verificationStatus || 'PENDING'}
                          </span>
                          <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                            {isPdf ? 'PDF' : 'Image'}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div style={{ padding: '2.5rem', textAlign: 'center', color: 'var(--text-muted)', backgroundColor: 'var(--bg-tertiary)', borderRadius: '10px' }}>
                  <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '0.5rem' }}>
                    <Inbox size={32} strokeWidth={1.75} style={{ color: 'var(--text-muted)' }} />
                  </div>
                  <div>No KYC documents have been uploaded yet for this delivery partner.</div>
                </div>
              )}

              {/* Rejection Prompt Panel */}
              {showRejectPrompt && (
                <div
                  style={{
                    marginTop: '1.5rem',
                    padding: '1.25rem',
                    borderRadius: '10px',
                    backgroundColor: 'rgba(239, 68, 68, 0.08)',
                    border: '1px solid rgba(239, 68, 68, 0.3)',
                  }}
                >
                  <div style={{ fontWeight: 800, fontSize: '0.92rem', color: '#ef4444', marginBottom: '0.35rem' }}>
                    Reason for Rejecting KYC (Required)
                  </div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>
                    The delivery partner will see this specific explanation on their KYC portal to replace and resubmit documents:
                  </div>

                  <input
                    type="text"
                    placeholder="e.g. RC image is unreadable"
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      borderRadius: '8px',
                      border: '1px solid rgba(239, 68, 68, 0.4)',
                      background: 'var(--bg-primary)',
                      color: 'var(--text-primary)',
                      marginBottom: '0.75rem',
                      fontSize: '0.9rem',
                    }}
                  />

                  {/* Quick Preset Buttons */}
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '1rem' }}>
                    {quickRejectionReasons.map((reason, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setRejectionReason(reason)}
                        style={{
                          fontSize: '0.75rem',
                          padding: '0.25rem 0.6rem',
                          borderRadius: '4px',
                          border: '1px solid var(--border-color)',
                          backgroundColor: 'var(--bg-primary)',
                          color: 'var(--text-secondary)',
                          cursor: 'pointer',
                        }}
                      >
                        {reason}
                      </button>
                    ))}
                  </div>

                  <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                    <button
                      type="button"
                      onClick={() => setShowRejectPrompt(false)}
                      className="btn btn-secondary btn-sm"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={() => handleVerifyKyc('REJECTED', rejectionReason)}
                      disabled={isVerifying || !rejectionReason.trim()}
                      className="btn btn-danger btn-sm"
                      style={{ fontWeight: 800 }}
                    >
                      Confirm Rejection & Notify Partner
                    </button>
                  </div>
                </div>
              )}
            </div>

            <div className="modal-footer" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                {!showRejectPrompt && (
                  <button
                    type="button"
                    onClick={() => setShowRejectPrompt(true)}
                    disabled={isVerifying}
                    className="btn btn-danger"
                  >
                    Reject KYC...
                  </button>
                )}
              </div>

              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <button
                  type="button"
                  onClick={() => setInspectPartner(null)}
                  className="btn btn-secondary"
                >
                  Close
                </button>
                <button
                  type="button"
                  onClick={() => handleVerifyKyc('APPROVED')}
                  disabled={isVerifying}
                  className="btn btn-success"
                  style={{ fontWeight: 800 }}
                >
                  {isVerifying ? 'Approving...' : 'Approve KYC & Activate Driver'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Full Document Viewer Modal */}
      {previewDoc && (
        <div
          className="modal-overlay"
          onClick={() => setPreviewDoc(null)}
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0,0,0,0.85)',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1.5rem',
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              maxWidth: '850px',
              width: '100%',
              backgroundColor: 'var(--bg-secondary, #1e293b)',
              borderRadius: '16px',
              overflow: 'hidden',
              boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)',
            }}
          >
            <div style={{ padding: '1rem 1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-color)' }}>
              <div>
                <h4 style={{ margin: 0, fontWeight: 800, fontSize: '1rem' }}>
                  {formatDocName(previewDoc.documentType)}
                </h4>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  Short-lived authenticated signed URL
                </span>
              </div>
              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                <a
                  href={previewDoc.fileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-secondary btn-sm"
                  style={{ fontSize: '0.75rem', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                >
                  Open in New Tab <ExternalLink size={12} strokeWidth={1.75} />
                </a>
                <button
                  onClick={() => setPreviewDoc(null)}
                  style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
                >
                  <X size={20} strokeWidth={1.75} />
                </button>
              </div>
            </div>
            <div style={{ padding: '1.5rem', textAlign: 'center', maxHeight: '75vh', overflow: 'auto' }}>
              {previewDoc.mimeType === 'application/pdf' || previewDoc.fileUrl?.includes('.pdf') ? (
                <iframe
                  src={previewDoc.fileUrl}
                  title="PDF Inspection"
                  style={{ width: '100%', height: '580px', border: 'none', borderRadius: '8px' }}
                />
              ) : (
                <img
                  src={previewDoc.fileUrl}
                  alt={previewDoc.documentType}
                  style={{ maxWidth: '100%', maxHeight: '68vh', objectFit: 'contain', borderRadius: '8px' }}
                />
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
