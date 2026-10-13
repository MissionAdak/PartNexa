import React, { useState, useEffect } from 'react';
import shopService from '../../services/shopService';
import toast from 'react-hot-toast';

export const UsedPartIntakePage = () => {
  const [intakes, setIntakes] = useState([]);
  const [loading, setLoading] = useState(true);

  // Active item for Structured Inspection
  const [activeInspectionItem, setActiveInspectionItem] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // Structured Technical Inspection Form State
  const [inspectionForm, setInspectionForm] = useState({
    partTitle: '',
    partNumber: '',
    vehicleCompatibility: '',
    // Ratings 1-5
    physicalConditionRating: 4,
    functionalTestRating: 5,
    wearLevelRating: 3,
    safetyConfidenceRating: 5,
    // Checkpoints
    visualDamage: 'None / Pristine cosmetic state',
    corrosionLevel: 'NONE',
    mountingPointsOk: true,
    electricalWorking: true,
    benchTestNotes: '',
    safetyTestNotes: '',
    repairRequired: false,
    repairNotes: '',
    repairEstimatedCost: 0,
    technicalResult: 'PASSED', // PASSED | REPAIR_REQUIRED | FAILED
    technicianNotes: '',
    inspectorName: 'Lead Workshop Technician',
    photos: '',
  });

  const fetchIntakes = async () => {
    setLoading(true);
    try {
      const res = await shopService.getUsedParts();
      setIntakes(res.data || []);
    } catch (err) {
      toast.error('Failed to load used part intakes.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchIntakes();
  }, []);

  // Quick action: Mark part received at workshop
  const handleMarkReceived = async (item) => {
    try {
      await shopService.receiveUsedPart(item.id);
      toast.success(`Part marked as received at workshop!`);
      fetchIntakes();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update receipt status.');
    }
  };

  // Open Structured Inspection Modal for a selected intake item
  const handleStartInspection = (item) => {
    setActiveInspectionItem(item);
    setInspectionForm({
      partTitle: item.partTitle || item.listing?.title || '',
      partNumber: item.partNumber || item.listing?.partNumber || '',
      vehicleCompatibility: item.vehicleCompatibility || item.vehicleModel || item.listing?.vehicleModel || '',
      physicalConditionRating: item.physicalConditionRating || 4,
      functionalTestRating: item.functionalTestRating || 5,
      wearLevelRating: item.wearLevelRating || 3,
      safetyConfidenceRating: item.safetyConfidenceRating || 5,
      visualDamage: item.visualDamage || 'None / Pristine cosmetic state',
      corrosionLevel: item.corrosionLevel || 'NONE',
      mountingPointsOk: item.mountingPointsOk !== false,
      electricalWorking: item.electricalWorking !== false,
      benchTestNotes: item.benchTestNotes || 'Bench tested with 12V probe. Operational within tolerance.',
      safetyTestNotes: item.safetyTestNotes || 'Passed integrity stress and casing thermal checks.',
      repairRequired: Boolean(item.repairRequired),
      repairNotes: item.repairNotes || '',
      repairEstimatedCost: 0,
      technicalResult: item.technicalResult || 'PASSED',
      technicianNotes: item.technicianNotes || 'Verified authentic OEM component. Clean casing and functional connector pins.',
      inspectorName: item.inspectorName || 'Lead Workshop Technician',
      photos: Array.isArray(item.photos) ? item.photos.join(', ') : '',
    });
  };

  // Submit Structured Inspection Form
  const handleSubmitInspection = async (e) => {
    e.preventDefault();
    if (!inspectionForm.partTitle || !inspectionForm.technicianNotes) {
      toast.error('Please complete part identification and technician notes.');
      return;
    }

    setSubmitting(true);
    try {
      const photoArray = inspectionForm.photos
        ? inspectionForm.photos.split(',').map((p) => p.trim()).filter(Boolean)
        : [];

      await shopService.submitTechnicalInspection(activeInspectionItem.id, {
        ...inspectionForm,
        photos: photoArray,
      });

      toast.success('Technical inspection completed! Valuation generated & offer sent to customer.');
      setActiveInspectionItem(null);
      fetchIntakes();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit inspection.');
    } finally {
      setSubmitting(false);
    }
  };

  // Live Score & Valuation Preview Calculation
  const calculateLiveValuation = () => {
    const phys = Number(inspectionForm.physicalConditionRating) || 4;
    const func = Number(inspectionForm.functionalTestRating) || 5;
    const wear = Number(inspectionForm.wearLevelRating) || 3;
    const safe = Number(inspectionForm.safetyConfidenceRating) || 5;

    let score = Math.round((phys / 5) * 25 + (func / 5) * 35 + (wear / 5) * 20 + (safe / 5) * 20);
    if (inspectionForm.technicalResult === 'FAILED') score = 0;

    let grade = 'B';
    if (score >= 90) grade = 'A';
    else if (score >= 75) grade = 'B';
    else if (score >= 55) grade = 'C';
    else grade = 'D';

    // Estimate reference OEM new price from listing asking price or fallback ₹4,000
    const asking = Number(activeInspectionItem?.listing?.askingPrice || activeInspectionItem?.askingPrice || 2600);
    const refNewPrice = Math.max(1000, Math.round((asking / 0.65) / 100) * 100 || 4000);

    let minRatio = grade === 'A' ? 0.72 : (grade === 'B' ? 0.65 : (grade === 'C' ? 0.45 : 0.25));
    let maxRatio = grade === 'A' ? 0.82 : (grade === 'B' ? 0.725 : (grade === 'C' ? 0.55 : 0.35));

    let minResale = Math.round((refNewPrice * minRatio) / 50) * 50;
    let maxResale = Math.round((refNewPrice * maxRatio) / 50) * 50;

    const mid = (minResale + maxResale) / 2;
    const recommendedListing = Math.floor(mid / 100) * 100 + 99;
    const recommendedPayout = Math.round((recommendedListing * 0.893) / 10) * 10;

    return {
      score,
      grade,
      refNewPrice,
      minResale,
      maxResale,
      recommendedListing,
      recommendedPayout,
    };
  };

  const preview = activeInspectionItem ? calculateLiveValuation() : null;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', maxWidth: '1200px', margin: '0 auto' }}>
      {/* Page Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.85rem', fontWeight: 800, marginBottom: '0.25rem' }}>
            Garage-First Used Spare Part Inspection
          </h1>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>
            Structured bench test, multi-point grading, and automated catalog valuation before resale listing.
          </p>
        </div>

        <button onClick={fetchIntakes} className="btn btn-secondary btn-sm">
          ↻ Refresh Queue
        </button>
      </div>

      {/* Intakes Queue */}
      {loading ? (
        <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--color-text-muted)' }}>
          Loading workshop inspection queue...
        </div>
      ) : intakes.length === 0 ? (
        <div className="card" style={{ padding: '3.5rem', textAlign: 'center' }}>
          <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>🔧</div>
          <h3 style={{ fontSize: '1.25rem', marginBottom: '0.35rem' }}>No Parts in Workshop Queue</h3>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '0.88rem', maxWidth: '460px', margin: '0 auto' }}>
            When customers register pre-owned components and select your workshop for drop-off or pickup, they will appear here.
          </p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: '1.25rem' }}>
          {intakes.map((item) => {
            const isAssigned = item.status === 'GARAGE_ASSIGNED';
            const isReceived = item.status === 'PART_RECEIVED';
            const isInspected = item.status === 'OFFER_PENDING_CUSTOMER' || item.status === 'OFFER_ACCEPTED' || item.status === 'INSPECTION_COMPLETE';
            const isAccepted = item.status === 'OFFER_ACCEPTED' || item.customerOfferStatus === 'ACCEPTED';
            const isDeclined = item.status === 'OFFER_DECLINED' || item.customerOfferStatus === 'DECLINED';
            const isFailed = item.status === 'REJECTED_FAILED_INSPECTION' || item.technicalResult === 'FAILED';

            return (
              <div
                key={item.id}
                className="card"
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  borderTop: isAccepted
                    ? '4px solid var(--color-success)'
                    : isInspected
                    ? '4px solid var(--color-primary)'
                    : isReceived
                    ? '4px solid var(--color-warning)'
                    : '4px solid var(--color-border)',
                }}
              >
                <div>
                  {/* Top Meta Bar */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                    <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-text-muted)' }}>
                      {item.listing?.id ? `Listing #${item.listing.id.slice(0, 8)}` : `Intake #${item.id.slice(0, 8)}`}
                    </span>
                    <span
                      className={`badge ${
                        isAccepted
                          ? 'badge-success'
                          : isInspected
                          ? 'badge-info'
                          : isReceived
                          ? 'badge-warning'
                          : isFailed
                          ? 'badge-error'
                          : 'badge-neutral'
                      }`}
                    >
                      {item.status?.replace(/_/g, ' ')}
                    </span>
                  </div>

                  {/* Title & Vehicle */}
                  <h3 style={{ fontSize: '1.12rem', fontWeight: 700, marginBottom: '0.35rem', color: 'var(--text-primary)' }}>
                    {item.partTitle}
                  </h3>
                  <div style={{ fontSize: '0.82rem', color: 'var(--color-text-muted)', marginBottom: '0.85rem' }}>
                    Vehicle: <strong style={{ color: 'var(--text-primary)' }}>{item.vehicleModel || 'Universal'}</strong>
                    {item.partNumber && <> • Part No: <strong>{item.partNumber}</strong></>}
                  </div>

                  {/* Customer Handover Details */}
                  <div
                    style={{
                      background: 'var(--color-bg-elevated, rgba(2, 132, 199, 0.05))',
                      border: '1px solid var(--color-border)',
                      borderRadius: 'var(--radius-md)',
                      padding: '0.75rem',
                      fontSize: '0.82rem',
                      marginBottom: '0.85rem',
                    }}
                  >
                    <div style={{ marginBottom: '0.25rem' }}>
                      <strong>Customer Seller:</strong> {item.sellerName || item.listing?.seller?.firstName || 'PartNexa Customer'}
                    </div>
                    <div>
                      <strong>Handover Method:</strong>{' '}
                      <span className="badge badge-neutral" style={{ fontSize: '0.7rem' }}>
                        {item.listing?.deliveryMethod === 'PICKUP' ? '🚚 Courier Pickup' : '🚗 Workshop Drop-Off'}
                      </span>
                    </div>
                  </div>

                  {/* Inspection Summary if completed */}
                  {item.inspectedAt && (
                    <div
                      style={{
                        background: 'rgba(16, 185, 129, 0.08)',
                        border: '1px solid rgba(16, 185, 129, 0.25)',
                        borderRadius: 'var(--radius-md)',
                        padding: '0.75rem',
                        fontSize: '0.82rem',
                        marginBottom: '0.85rem',
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
                        <span>
                          <strong>Grade:</strong>{' '}
                          <span className="badge badge-success" style={{ fontWeight: 800 }}>
                            {item.overallGrade || 'B'} ({item.inspectionScore || 85}/100)
                          </span>
                        </span>
                        <span style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)' }}>
                          Result: <strong>{item.technicalResult}</strong>
                        </span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--color-text-secondary)', fontSize: '0.8rem' }}>
                        <span>Recommended Resale: <strong>₹{item.recommendedListingPrice || '—'}</strong></span>
                        <span style={{ color: 'var(--color-success)', fontWeight: 700 }}>
                          Offer: ₹{item.recommendedSellerPayout || '—'}
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Card Actions */}
                <div style={{ borderTop: '1px solid var(--color-border)', paddingTop: '0.85rem', marginTop: '0.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '0.5rem' }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                    {new Date(item.createdAt).toLocaleDateString('en-IN')}
                  </span>

                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    {isAssigned && (
                      <button onClick={() => handleMarkReceived(item)} className="btn btn-secondary btn-sm">
                        📥 Mark Part Received
                      </button>
                    )}

                    {(isReceived || isAssigned || !item.inspectedAt) && (
                      <button onClick={() => handleStartInspection(item)} className="btn btn-primary btn-sm">
                        🔍 Perform Technical Inspection
                      </button>
                    )}

                    {item.inspectedAt && (
                      <button onClick={() => handleStartInspection(item)} className="btn btn-secondary btn-sm">
                        👁 View / Re-inspect
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ============================================================ */}
      {/* GOOGLE FORM-STYLE STRUCTURED TECHNICAL INSPECTION MODAL */}
      {/* ============================================================ */}
      {activeInspectionItem && (
        <div className="modal-overlay" style={{ backdropFilter: 'blur(4px)', zIndex: 1100 }}>
          <div
            className="modal-card"
            style={{
              maxWidth: '860px',
              width: '95%',
              maxHeight: '90vh',
              overflowY: 'auto',
              padding: '2rem',
              borderRadius: 'var(--radius-lg)',
            }}
          >
            {/* Form Title Banner */}
            <div
              style={{
                background: 'linear-gradient(135deg, rgba(2, 132, 199, 0.12), rgba(14, 165, 233, 0.05))',
                border: '1px solid rgba(2, 132, 199, 0.25)',
                borderRadius: 'var(--radius-md)',
                padding: '1.25rem',
                marginBottom: '1.5rem',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span className="badge badge-primary" style={{ fontSize: '0.75rem', fontWeight: 800 }}>
                  PARTNEXA WORKSHOP INSPECTION PROTOCOL
                </span>
                <span style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>
                  Intake #{activeInspectionItem.id.slice(0, 8)}
                </span>
              </div>
              <h2 style={{ fontSize: '1.45rem', fontWeight: 800, marginTop: '0.35rem', marginBottom: '0.25rem' }}>
                Technical Inspection & Valuation Assessment
              </h2>
              <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', margin: 0 }}>
                Perform bench testing and structural review to generate an automated verified resale valuation based on PartNexa catalog pricing.
              </p>
            </div>

            <form onSubmit={handleSubmitInspection} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              {/* SECTION 1: Part Identification & Compatibility */}
              <div style={{ border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', padding: '1.25rem', background: 'var(--color-bg-surface)' }}>
                <h3 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--color-primary)' }}>
                  <span>1.</span> Component Identification & Compatibility
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem' }}>
                  <div className="form-group">
                    <label className="form-label">Part Title *</label>
                    <input
                      type="text"
                      className="form-input"
                      value={inspectionForm.partTitle}
                      onChange={(e) => setInspectionForm({ ...inspectionForm, partTitle: e.target.value })}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">OEM Part Number (From Stamping)</label>
                    <input
                      type="text"
                      className="form-input"
                      value={inspectionForm.partNumber}
                      onChange={(e) => setInspectionForm({ ...inspectionForm, partNumber: e.target.value })}
                      placeholder="e.g. 31100-M79F01"
                    />
                  </div>
                  <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                    <label className="form-label">Verified Vehicle Compatibility</label>
                    <input
                      type="text"
                      className="form-input"
                      value={inspectionForm.vehicleCompatibility}
                      onChange={(e) => setInspectionForm({ ...inspectionForm, vehicleCompatibility: e.target.value })}
                      placeholder="e.g. Maruti Swift (2018-2023), Baleno 1.2 Petrol"
                    />
                  </div>
                </div>
              </div>

              {/* SECTION 2: Cosmetic & Structural Inspection */}
              <div style={{ border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', padding: '1.25rem', background: 'var(--color-bg-surface)' }}>
                <h3 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--color-primary)' }}>
                  <span>2.</span> Cosmetic & Structural Integrity Checkpoints
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem' }}>
                  <div className="form-group">
                    <label className="form-label">Visual Damage Check</label>
                    <select
                      className="form-select"
                      value={inspectionForm.visualDamage}
                      onChange={(e) => setInspectionForm({ ...inspectionForm, visualDamage: e.target.value })}
                    >
                      <option value="None / Pristine cosmetic state">None / Pristine cosmetic state</option>
                      <option value="Minor Surface Scratches (Cleanable)">Minor Surface Scratches (Cleanable)</option>
                      <option value="Noticeable Scuffs / Road Dirt">Noticeable Scuffs / Road Dirt</option>
                      <option value="Dented / Cracked Casing">Dented / Cracked Casing</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Corrosion & Oxidation</label>
                    <select
                      className="form-select"
                      value={inspectionForm.corrosionLevel}
                      onChange={(e) => setInspectionForm({ ...inspectionForm, corrosionLevel: e.target.value })}
                    >
                      <option value="NONE">None — Bright Clean Metal / Plastic</option>
                      <option value="MINOR">Minor Surface Tarnish / Dust</option>
                      <option value="MODERATE">Moderate Rusting (Wire-brushable)</option>
                      <option value="SEVERE">Severe Corrosion / Pitting</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Mounting Points & Brackets</label>
                    <select
                      className="form-select"
                      value={inspectionForm.mountingPointsOk ? 'YES' : 'NO'}
                      onChange={(e) => setInspectionForm({ ...inspectionForm, mountingPointsOk: e.target.value === 'YES' })}
                    >
                      <option value="YES">100% Intact OEM Tabs & Bolt Holes</option>
                      <option value="NO">Broken / Missing / Damaged Mounts</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* SECTION 3: Functional & Bench Test */}
              <div style={{ border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', padding: '1.25rem', background: 'var(--color-bg-surface)' }}>
                <h3 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--color-primary)' }}>
                  <span>3.</span> Electrical & Mechanical Bench Testing
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem' }}>
                  <div className="form-group">
                    <label className="form-label">Electrical / Mechanical Operation</label>
                    <select
                      className="form-select"
                      value={inspectionForm.electricalWorking ? 'YES' : 'NO'}
                      onChange={(e) => setInspectionForm({ ...inspectionForm, electricalWorking: e.target.value === 'YES' })}
                    >
                      <option value="YES">Fully Operational within OEM Tolerance</option>
                      <option value="NO">Intermittent / Seized / Non-functional</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Repair Required Before Resale?</label>
                    <select
                      className="form-select"
                      value={inspectionForm.repairRequired ? 'YES' : 'NO'}
                      onChange={(e) => setInspectionForm({ ...inspectionForm, repairRequired: e.target.value === 'YES' })}
                    >
                      <option value="NO">No — Ready for immediate catalog listing</option>
                      <option value="YES">Yes — Requires workshop cleaning or minor core repair</option>
                    </select>
                  </div>

                  <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                    <label className="form-label">Bench Test Readings & Observations</label>
                    <textarea
                      className="form-textarea"
                      rows={2}
                      value={inspectionForm.benchTestNotes}
                      onChange={(e) => setInspectionForm({ ...inspectionForm, benchTestNotes: e.target.value })}
                      placeholder="e.g. Checked solenoid engagement at 12.4V, motor draws 85A no-load, no bearing noise."
                    />
                  </div>
                </div>
              </div>

              {/* SECTION 4: Ratings (1 to 5 scale) */}
              <div style={{ border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', padding: '1.25rem', background: 'var(--color-bg-surface)' }}>
                <h3 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--color-primary)' }}>
                  <span>4.</span> Multi-Point Technical Ratings (1–5 Scale)
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                  {[
                    { key: 'physicalConditionRating', label: 'Physical Condition', desc: 'Cosmetic & structural tabs' },
                    { key: 'functionalTestRating', label: 'Functional Test', desc: 'Operational performance' },
                    { key: 'wearLevelRating', label: 'Wear Level (5=Mint)', desc: 'Remaining component life' },
                    { key: 'safetyConfidenceRating', label: 'Safety Confidence', desc: 'Road-safety reliability' },
                  ].map((field) => (
                    <div key={field.key} className="form-group">
                      <label className="form-label" style={{ fontWeight: 700 }}>
                        {field.label}: <span style={{ color: 'var(--color-primary)' }}>{inspectionForm[field.key]} / 5</span>
                      </label>
                      <p style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)', marginBottom: '0.4rem' }}>{field.desc}</p>
                      <div style={{ display: 'flex', gap: '0.35rem' }}>
                        {[1, 2, 3, 4, 5].map((val) => (
                          <button
                            type="button"
                            key={val}
                            onClick={() => setInspectionForm({ ...inspectionForm, [field.key]: val })}
                            style={{
                              flex: 1,
                              padding: '0.4rem 0',
                              fontSize: '0.85rem',
                              fontWeight: 700,
                              borderRadius: 'var(--radius-sm)',
                              border: inspectionForm[field.key] === val ? '2px solid var(--color-primary)' : '1px solid var(--color-border)',
                              background: inspectionForm[field.key] === val ? 'var(--color-primary)' : 'var(--color-bg-elevated)',
                              color: inspectionForm[field.key] === val ? '#fff' : 'var(--color-text-primary)',
                              cursor: 'pointer',
                            }}
                          >
                            {val}★
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* SECTION 5: Technical Verdict */}
              <div style={{ border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', padding: '1.25rem', background: 'var(--color-bg-surface)' }}>
                <h3 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--color-primary)' }}>
                  <span>5.</span> Overall Technical Verdict
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
                  {[
                    { id: 'PASSED', label: '✅ PASSED', desc: 'Meets PartNexa verified safety standards' },
                    { id: 'REPAIR_REQUIRED', label: '⚠️ REPAIR REQUIRED', desc: 'Acceptable with minor workshop refurb' },
                    { id: 'FAILED', label: '❌ FAILED', desc: 'Unsafe or defective component — reject listing' },
                  ].map((verdict) => (
                    <button
                      type="button"
                      key={verdict.id}
                      onClick={() => setInspectionForm({ ...inspectionForm, technicalResult: verdict.id })}
                      style={{
                        padding: '1rem',
                        textAlign: 'left',
                        borderRadius: 'var(--radius-md)',
                        border: inspectionForm.technicalResult === verdict.id ? '2px solid var(--color-primary)' : '1px solid var(--color-border)',
                        background: inspectionForm.technicalResult === verdict.id ? 'rgba(2, 132, 199, 0.08)' : 'var(--color-bg-elevated)',
                        cursor: 'pointer',
                      }}
                    >
                      <div style={{ fontWeight: 800, fontSize: '0.95rem', marginBottom: '0.25rem' }}>{verdict.label}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>{verdict.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* LIVE VALUATION PREVIEW BOX */}
              {preview && (
                <div
                  style={{
                    background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.1), rgba(2, 132, 199, 0.08))',
                    border: '2px solid rgba(16, 185, 129, 0.35)',
                    borderRadius: 'var(--radius-md)',
                    padding: '1.25rem',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                    <span style={{ fontSize: '0.78rem', fontWeight: 800, color: 'var(--color-success)', textTransform: 'uppercase' }}>
                      Automated Catalog Valuation Engine Result
                    </span>
                    <span className="badge badge-success" style={{ fontSize: '0.85rem', fontWeight: 800 }}>
                      Grade {preview.grade} ({preview.score}/100)
                    </span>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem' }}>
                    <div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>Reference OEM New Price</div>
                      <div style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                        ₹{preview.refNewPrice.toLocaleString('en-IN')}
                      </div>
                    </div>
                    <div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>Recommended Resale Range</div>
                      <div style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--color-primary)' }}>
                        ₹{preview.minResale.toLocaleString('en-IN')} – ₹{preview.maxResale.toLocaleString('en-IN')}
                      </div>
                    </div>
                    <div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>Recommended Listing Price</div>
                      <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                        ₹{preview.recommendedListing.toLocaleString('en-IN')}
                      </div>
                    </div>
                    <div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>Customer Seller Payout</div>
                      <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--color-success)' }}>
                        ₹{preview.recommendedPayout.toLocaleString('en-IN')}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* SECTION 6: Notes & Evidence */}
              <div style={{ border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', padding: '1.25rem', background: 'var(--color-bg-surface)' }}>
                <h3 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--color-primary)' }}>
                  <span>6.</span> Technician Evidence & Observations
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1rem' }}>
                  <div className="form-group">
                    <label className="form-label">Detailed Technician Notes *</label>
                    <textarea
                      className="form-textarea"
                      rows={3}
                      value={inspectionForm.technicianNotes}
                      onChange={(e) => setInspectionForm({ ...inspectionForm, technicianNotes: e.target.value })}
                      placeholder="Enter detailed bench test results, wear analysis, and recommendations..."
                      required
                    />
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem' }}>
                    <div className="form-group">
                      <label className="form-label">Inspected By (Technician Name)</label>
                      <input
                        type="text"
                        className="form-input"
                        value={inspectionForm.inspectorName}
                        onChange={(e) => setInspectionForm({ ...inspectionForm, inspectorName: e.target.value })}
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Inspection Evidence Photo URLs (Comma-separated)</label>
                      <input
                        type="text"
                        className="form-input"
                        value={inspectionForm.photos}
                        onChange={(e) => setInspectionForm({ ...inspectionForm, photos: e.target.value })}
                        placeholder="https://image-url-1.jpg, https://image-url-2.jpg"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Form Buttons */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
                <button
                  type="button"
                  onClick={() => setActiveInspectionItem(null)}
                  className="btn btn-secondary"
                  disabled={submitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={submitting}
                  style={{ minWidth: '240px' }}
                >
                  {submitting ? 'Generating Valuation...' : 'Submit Inspection & Generate Offer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default UsedPartIntakePage;
