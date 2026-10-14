import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import deliveryService from '../../services/deliveryService';
import toast from 'react-hot-toast';
import { Search, CheckCircle2, Check, X, Camera, Image as ImageIcon, ArrowLeft } from 'lucide-react';

export const UsedPartInspectionPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Inspection Checklist
  const [checklist, setChecklist] = useState({
    structureIntegrity: true,
    mountingTabsIntact: true,
    partNumberMatches: true,
    connectorPinsNormal: true,
    cleanlinessAcceptable: true,
  });

  // Condition Grading (A+, A, B, C, D)
  const [conditionGrade, setConditionGrade] = useState('A');
  const [notes, setNotes] = useState('');
  const [photos, setPhotos] = useState([]);

  const [inspectionCompleted, setInspectionCompleted] = useState(false);
  const [inspectionResultData, setInspectionResultData] = useState(null);

  const fetchJob = async () => {
    try {
      setLoading(true);
      const data = await deliveryService.getJobById(id);
      setJob(data);
      if (data?.verificationResult) {
        setInspectionCompleted(true);
        setInspectionResultData({
          result: data.verificationResult,
          conditionGrade: data.conditionGrade,
        });
      }
    } catch (err) {
      toast.error('Failed to load job for used-part verification.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJob();
  }, [id]);

  const handleChecklistToggle = (key) => {
    setChecklist((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handlePhotoUpload = (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    files.forEach((file) => {
      if (!file.type.startsWith('image/')) {
        toast.error(`${file.name} is not a valid image file.`);
        return;
      }
      const reader = new FileReader();
      reader.onload = (event) => {
        setPhotos((prev) => [...prev, event.target.result]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removePhoto = (index) => {
    setPhotos((prev) => prev.filter((_, i) => i !== index));
  };

  const handleCompleteVerification = async (result) => {
    try {
      setSubmitting(true);
      const res = await deliveryService.verifyUsedPart(id, {
        conditionGrade,
        inspectionChecklist: checklist,
        photos,
        result,
        notes: notes || (result === 'APPROVED' ? `Doorstep intake verified Grade ${conditionGrade}. Custody transferred for partner garage bench testing.` : 'Doorstep intake rejected due to physical defects.'),
      });

      setInspectionCompleted(true);
      setInspectionResultData(res);
      if (result === 'APPROVED') {
        toast.success('Doorstep intake verified! Component custody transferred for partner garage bench testing.');
      } else {
        toast.error('Part rejected at doorstep pickup.');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Verification recording failed.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="delivery-container" style={{ textAlign: 'center', padding: '4rem 1rem' }}>
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1rem' }}>
          <Search size={44} strokeWidth={1.75} style={{ color: 'var(--color-primary)' }} />
        </div>
        <div>Loading doorstep intake checklist...</div>
      </div>
    );
  }

  return (
    <div className="delivery-container">
      <div style={{ marginBottom: '1.25rem' }}>
        <Link to={`/delivery/jobs/${id}`} style={{ color: 'var(--color-primary)', fontWeight: 600, fontSize: '0.85rem', display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
          <ArrowLeft size={14} /> Back to Trip Navigation
        </Link>
      </div>

      {/* Page Title */}
      <div style={{ marginBottom: '1.75rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '0.25rem' }}>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '1.75rem', fontWeight: 800 }}>
            Used-Part Doorstep Physical Intake & Chain of Custody
          </h1>
          <span className="delivery-badge badge-usedpart">DOORSTEP INTAKE</span>
        </div>
        <p style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem' }}>
          Perform visual intake checklist, capture condition photos, and confirm custody handover for Partner Garage bench testing.
        </p>
      </div>

      {/* Item Summary Card */}
      <div className="delivery-card" style={{ marginBottom: '1.75rem', borderLeft: '5px solid #9333EA' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>
              Component Under Verification
            </div>
            <div style={{ fontSize: '1.2rem', fontWeight: 800 }}>
              {job?.items?.[0]?.title || 'Used Vehicle Component'}
            </div>
            <div style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)' }}>
              Seller: <strong>{job?.pickupLocation?.name}</strong> • Pickup Hub: <strong>{job?.dropLocation?.name || 'Partner Garage Hub'}</strong>
            </div>
          </div>

          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-text-muted)' }}>
              Destination Protocol
            </div>
            <div style={{ fontSize: '1rem', fontWeight: 800, color: '#9333EA' }}>
              Partner Garage Bench Inspection
            </div>
          </div>
        </div>
      </div>

      {/* If Completed Banner */}
      {inspectionCompleted && (
        <div
          className="delivery-card"
          style={{
            marginBottom: '1.75rem',
            background: 'var(--color-success-bg)',
            border: '1px solid rgba(16, 185, 129, 0.3)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <CheckCircle2 size={32} strokeWidth={1.75} style={{ color: 'var(--color-emerald)', flexShrink: 0 }} />
            <div>
              <div style={{ fontWeight: 800, fontSize: '1.1rem', color: 'var(--color-emerald)' }}>
                Doorstep Custody Handover: {inspectionResultData?.verificationResult || 'APPROVED'}
              </div>
              <div style={{ fontSize: '0.85rem' }}>
                Visual Grade: <strong>Grade {inspectionResultData?.conditionGrade || conditionGrade}</strong> • Chain of Custody Confirmed
              </div>
              <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', marginTop: '0.25rem' }}>
                Component ready for transport to partner garage for bench testing & final valuation.
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Step 1: Inspection Checklist */}
      <div className="delivery-card" style={{ marginBottom: '1.75rem' }}>
        <h2 style={{ fontSize: '1.15rem', fontWeight: 800, marginBottom: '1rem' }}>
          1. Physical Inspection Checklist
        </h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
          {[
            { key: 'structureIntegrity', label: 'Structural Integrity', desc: 'No cracks, deep fractures, bent mounting flanges, or collision deformities.' },
            { key: 'mountingTabsIntact', label: 'Mounting Tabs & Clips', desc: 'Factory clips, fastener holes, and alignment tabs are completely intact.' },
            { key: 'partNumberMatches', label: 'OEM Serial Number & Part ID', desc: 'Stamped OEM part number and model designation match listing description.' },
            { key: 'connectorPinsNormal', label: 'Connectors & Electrical Pins', desc: 'Harness plugs, pins, and wiring connectors are clean with no burns or pin bends.' },
            { key: 'cleanlinessAcceptable', label: 'Cleanliness & Leak Check', desc: 'Part is drained of corrosive residue and wiped clean of heavy road grease.' },
          ].map((item) => (
            <label
              key={item.key}
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: '0.85rem',
                padding: '0.85rem',
                borderRadius: 'var(--radius-md)',
                background: checklist[item.key] ? 'var(--color-surface)' : 'transparent',
                border: `1px solid ${checklist[item.key] ? 'var(--color-primary)' : 'var(--color-border)'}`,
                cursor: 'pointer',
              }}
            >
              <input
                type="checkbox"
                checked={checklist[item.key]}
                onChange={() => handleChecklistToggle(item.key)}
                style={{ width: '18px', height: '18px', marginTop: '0.2rem' }}
              />
              <div>
                <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>{item.label}</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>{item.desc}</div>
              </div>
            </label>
          ))}
        </div>
      </div>

      {/* Step 2: Condition Grading */}
      <div className="delivery-card" style={{ marginBottom: '1.75rem' }}>
        <h2 style={{ fontSize: '1.15rem', fontWeight: 800, marginBottom: '0.35rem' }}>
          2. Doorstep Visual Condition Assessment
        </h2>
        <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', marginBottom: '1.25rem' }}>
          Select the initial visual condition grade (bench testing will be performed at the partner garage):
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '0.85rem', marginBottom: '1.25rem' }}>
          {[
            { grade: 'A+', label: 'Grade A+ (Mint)' },
            { grade: 'A', label: 'Grade A (Very Good)' },
            { grade: 'B', label: 'Grade B (Good)' },
            { grade: 'C', label: 'Grade C (Fair)' },
            { grade: 'D', label: 'Grade D (Defective)' },
          ].map((item) => (
            <button
              key={item.grade}
              type="button"
              onClick={() => setConditionGrade(item.grade)}
              className={`grade-pill ${conditionGrade === item.grade ? 'selected' : ''}`}
            >
              <div style={{ fontSize: '1.1rem' }}>{item.grade}</div>
              <div style={{ fontSize: '0.7rem', opacity: 0.85 }}>{item.label}</div>
            </button>
          ))}
        </div>

        <div style={{ padding: '0.85rem 1rem', background: 'var(--color-bg-elevated)', borderRadius: 'var(--radius-md)', fontSize: '0.85rem' }}>
          Assessed: <strong>Grade {conditionGrade}</strong> • Protocol: <strong>Doorstep Intake Custody Recorded</strong>
        </div>
      </div>

      {/* Step 3: Photographic Proof Audit */}
      <div className="delivery-card" style={{ marginBottom: '1.75rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem', flexWrap: 'wrap', gap: '0.5rem' }}>
          <div>
            <h2 style={{ fontSize: '1.15rem', fontWeight: 800 }}>
              3. Doorstep Photographic Evidence
            </h2>
            <p style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>
              Capture clear photos of the part, serial number tag, and any pre-existing blemishes.
            </p>
          </div>
          <label className="btn btn-secondary btn-sm" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', cursor: 'pointer' }}>
            <Camera size={14} /> Add Photos
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={handlePhotoUpload}
              style={{ display: 'none' }}
            />
          </label>
        </div>

        {photos.length === 0 ? (
          <div style={{ padding: '2rem', textAlign: 'center', border: '2px dashed var(--color-border)', borderRadius: 'var(--radius-md)' }}>
            <ImageIcon size={32} style={{ color: 'var(--color-text-muted)', margin: '0 auto 0.5rem' }} />
            <div style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>
              No photos attached yet. Click "Add Photos" to capture part photos before pickup.
            </div>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem' }}>
            {photos.map((url, i) => (
              <div key={i} style={{ borderRadius: 'var(--radius-md)', overflow: 'hidden', border: '1px solid var(--color-border)', position: 'relative' }}>
                <img
                  src={url}
                  alt={`Proof ${i + 1}`}
                  style={{ width: '100%', height: '140px', objectFit: 'cover' }}
                />
                <button
                  type="button"
                  onClick={() => removePhoto(i)}
                  style={{
                    position: 'absolute',
                    top: '6px',
                    right: '6px',
                    background: 'rgba(0,0,0,0.6)',
                    border: 'none',
                    borderRadius: '50%',
                    width: '24px',
                    height: '24px',
                    color: '#fff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                  }}
                  title="Remove photo"
                >
                  <X size={14} />
                </button>
                <div style={{ padding: '0.4rem', textAlign: 'center', fontSize: '0.75rem', fontWeight: 600, background: 'var(--color-surface)' }}>
                  Intake Photo #{i + 1}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Verification Notes */}
      <div className="delivery-card" style={{ marginBottom: '2rem' }}>
        <label className="form-label">Intake Remarks & Condition Observations</label>
        <textarea
          className="form-textarea"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="e.g. Part collected from seller in good physical condition. Serial tag intact. Transporting to partner garage."
        />
      </div>

      {/* Submit Decision Actions */}
      {!inspectionCompleted ? (
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          <button
            onClick={() => handleCompleteVerification('APPROVED')}
            disabled={submitting}
            className="btn btn-primary"
            style={{ background: '#9333EA', padding: '0.85rem 1.75rem', display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}
          >
            {submitting ? (
              'Recording Intake...'
            ) : (
              <>
                <Check size={16} strokeWidth={2} /> Confirm Physical Intake & Transfer Custody
              </>
            )}
          </button>
          <button
            onClick={() => handleCompleteVerification('REJECTED')}
            disabled={submitting}
            className="btn btn-danger"
            style={{ padding: '0.85rem 1.5rem', display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}
          >
            <X size={16} strokeWidth={2} /> Reject Part at Doorstep
          </button>
        </div>
      ) : (
        <Link to={`/delivery/jobs/${id}`} className="btn btn-primary" style={{ padding: '0.85rem 1.75rem' }}>
          Return to Navigation & Transport to Hub →
        </Link>
      )}
    </div>
  );
};

export default UsedPartInspectionPage;
