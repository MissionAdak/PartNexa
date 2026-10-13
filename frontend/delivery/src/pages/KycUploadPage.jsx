import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useDeliveryAuth } from '../contexts/DeliveryAuthContext';
import deliveryService from '../services/deliveryService';
import toast from 'react-hot-toast';

export const KycUploadPage = () => {
  const { user, partner, refreshProfile } = useDeliveryAuth();
  const location = useLocation();
  const navigate = useNavigate();

  // State
  const [kycData, setKycData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentStep, setCurrentStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [uploadingDocType, setUploadingDocType] = useState(null);
  const [previewModalUrl, setPreviewModalUrl] = useState(null);

  // Form Fields
  const [fullName, setFullName] = useState('');
  const [idDocType, setIdDocType] = useState('AADHAAR_CARD');
  const [idNumber, setIdNumber] = useState('');
  const [dlNumber, setDlNumber] = useState('');
  const [vehicleType, setVehicleType] = useState('BIKE');
  const [vehicleNum, setVehicleNum] = useState('');

  const [localFiles, setLocalFiles] = useState({});

  const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB

  const docDefinitions = [
    {
      type: 'PROFILE_PHOTO',
      step: 5,
      label: 'Profile Photograph',
      icon: '👤',
      required: true,
      description: 'Clear frontal photo of your face without sunglasses or helmet.',
      accept: 'image/jpeg,image/png,image/webp',
    },
    {
      type: 'AADHAAR_CARD',
      step: 2,
      label: 'Identity Proof (Aadhaar / Govt ID)',
      icon: '🆔',
      required: true,
      description: 'Official Government ID proof (Aadhaar, Passport, or Voter ID).',
      accept: 'image/jpeg,image/png,image/webp,application/pdf',
    },
    {
      type: 'DRIVING_LICENSE',
      step: 3,
      label: 'Driving Licence (DL)',
      icon: '🪪',
      required: true,
      description: 'Valid, unexpired commercial or transport two-wheeler / LMV driving licence.',
      accept: 'image/jpeg,image/png,image/webp,application/pdf',
    },
    {
      type: 'VEHICLE_RC',
      step: 4,
      label: 'Vehicle Registration Certificate (RC)',
      icon: '📜',
      required: true,
      description: 'Vehicle Registration Certificate matching your delivery vehicle.',
      accept: 'image/jpeg,image/png,image/webp,application/pdf',
    },
    {
      type: 'VEHICLE_PHOTO',
      step: 5,
      label: 'Vehicle Photograph',
      icon: '🛵',
      required: true,
      description: 'Photo of the vehicle showing the number plate clearly.',
      accept: 'image/jpeg,image/png,image/webp',
    },
    {
      type: 'INSURANCE',
      step: 5,
      label: 'Vehicle Insurance (Optional)',
      icon: '🛡️',
      required: false,
      description: 'Valid motor insurance policy document.',
      accept: 'image/jpeg,image/png,image/webp,application/pdf',
    },
  ];

  const fetchKyc = async () => {
    try {
      setLoading(true);
      const data = await deliveryService.getKyc();
      setKycData(data);
      if (data?.aadharNumber) setIdNumber(data.aadharNumber);
      if (partner) {
        setFullName(`${user?.firstName || ''} ${user?.lastName || ''}`.trim() || partner?.user?.firstName || '');
        if (partner?.vehicleType) setVehicleType(partner.vehicleType);
        if (partner?.vehicleNum) setVehicleNum(partner.vehicleNum);
      }
    } catch (err) {
      toast.error('Failed to load KYC verification status.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchKyc();
  }, []);

  const status = kycData?.status || 'NOT_SUBMITTED';
  const isLocked = status === 'PENDING' || status === 'APPROVED';
  const serverDocs = kycData?.documents || [];

  const maskIdentifier = (val) => {
    if (!val) return '';
    const clean = val.replace(/\s+/g, '');
    if (clean.length <= 4) return clean;
    return '•••• •••• ' + clean.slice(-4);
  };

  const handleFileSelect = async (docType, e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > MAX_FILE_SIZE) {
      toast.error('File must be less than 10 MB');
      e.target.value = '';
      return;
    }

    const isPdf = file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');
    const previewUrl = URL.createObjectURL(file);

    setLocalFiles((prev) => ({
      ...prev,
      [docType]: {
        file,
        previewUrl,
        isPdf,
        name: file.name,
        size: (file.size / (1024 * 1024)).toFixed(2) + ' MB',
      },
    }));

    setUploadingDocType(docType);
    const formData = new FormData();
    formData.append('file', file);
    formData.append('documentType', docType);
    if (idNumber) formData.append('idNumber', idNumber);
    if (vehicleType) formData.append('vehicleType', vehicleType);
    if (vehicleNum) formData.append('vehicleNum', vehicleNum);

    try {
      await deliveryService.uploadKycFile(formData);
      toast.success(`${docType.replace('_', ' ')} uploaded successfully!`);
      await fetchKyc();
      await refreshProfile();
    } catch (err) {
      toast.error(err.response?.data?.message || 'File upload failed. Please try again.');
    } finally {
      setUploadingDocType(null);
      e.target.value = '';
    }
  };

  const handleRemoveDocument = async (docType) => {
    if (isLocked) {
      toast.error('Cannot remove documents while KYC is under review or approved.');
      return;
    }

    const serverDoc = serverDocs.find(
      (d) => d.documentType === docType || d.objectKey?.toUpperCase().includes(docType.toUpperCase())
    );

    if (serverDoc) {
      try {
        await deliveryService.removeKycDoc(serverDoc.id);
        toast.success('Document removed.');
        await fetchKyc();
      } catch (err) {
        toast.error('Failed to remove document from server.');
      }
    }

    setLocalFiles((prev) => {
      const copy = { ...prev };
      delete copy[docType];
      return copy;
    });
  };

  const handleSubmitForReview = async () => {
    if (serverDocs.length < 3) {
      toast.error('Please upload at least Identity Proof, Driving Licence, and Vehicle RC before submitting.');
      return;
    }

    try {
      setSubmitting(true);
      await deliveryService.submitKyc();
      toast.success('KYC documents submitted for Admin review!');
      await fetchKyc();
      await refreshProfile();
      setCurrentStep(6);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not submit KYC documents.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleAdminVerify = async (newStatus, reason) => {
    try {
      await deliveryService.adminVerifyKyc(newStatus, reason, user?.id);
      toast.success(`Admin verification updated to: ${newStatus}!`);
      await fetchKyc();
      await refreshProfile();
    } catch (err) {
      toast.error('Admin verification update failed.');
    }
  };

  const steps = [
    { number: 1, title: 'Personal Info' },
    { number: 2, title: 'Identity Proof' },
    { number: 3, title: 'Driving Licence' },
    { number: 4, title: 'Vehicle RC' },
    { number: 5, title: 'Photos' },
    { number: 6, title: 'Review & Submit' },
  ];

  if (loading) {
    return (
      <div className="delivery-container" style={{ textAlign: 'center', padding: '5rem 1rem' }}>
        <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>📋</div>
        <div>Loading KYC Verification portal...</div>
      </div>
    );
  }

  return (
    <div className="delivery-container" style={{ maxWidth: '1000px', margin: '0 auto', padding: '1.5rem 1rem 4rem' }}>
      {/* Header */}
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.85rem', fontWeight: 800, marginBottom: '0.35rem' }}>
          Delivery Partner KYC Verification
        </h1>
        <p style={{ color: 'var(--text-muted, #94a3b8)', fontSize: '0.9rem' }}>
          Submit identity and vehicle registration records for administrative compliance review. All files are stored privately.
        </p>
      </div>

      {/* Status Alert Banner */}
      <div
        className="delivery-card"
        style={{
          marginBottom: '2rem',
          padding: '1.25rem 1.5rem',
          borderRadius: '12px',
          borderLeft: `6px solid ${
            status === 'APPROVED' ? '#10b981' : status === 'PENDING' ? '#f59e0b' : status === 'REJECTED' ? '#ef4444' : '#0284c7'
          }`,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '0.35rem' }}>
          <span style={{ fontSize: '0.8rem', fontWeight: 800, textTransform: 'uppercase' }}>KYC Status:</span>
          <span className="badge">{status === 'NOT_SUBMITTED' ? 'Not Submitted' : status === 'PENDING' ? 'Under Review' : status}</span>
        </div>

        <div style={{ fontSize: '0.95rem', fontWeight: 600 }}>
          {status === 'APPROVED' && <span style={{ color: '#10b981' }}>✅ Your KYC documents are APPROVED. Ready for deliveries!</span>}
          {status === 'PENDING' && <span style={{ color: '#f59e0b' }}>⏳ Documents submitted and Under Review by PartNexa Compliance Desk.</span>}
          {status === 'NOT_SUBMITTED' && <span>⚠️ Please complete the verification steps below and upload your documents.</span>}
          {status === 'REJECTED' && (
            <div style={{ color: '#ef4444' }}>
              <strong>❌ Your KYC was rejected.</strong> Reason: "{kycData?.rejectionReason || 'Documents rejected'}"
            </div>
          )}
        </div>
      </div>

      {/* Progress Stepper */}
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2.5rem', overflowX: 'auto', paddingBottom: '0.5rem' }}>
        {steps.map((st) => (
          <div key={st.number} onClick={() => setCurrentStep(st.number)} style={{ cursor: 'pointer', textAlign: 'center', minWidth: '70px' }}>
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '50%',
                margin: '0 auto 0.4rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 800,
                backgroundColor: currentStep === st.number ? '#0284c7' : currentStep > st.number ? '#10b981' : '#334155',
                color: '#fff',
              }}
            >
              {currentStep > st.number ? '✓' : st.number}
            </div>
            <span style={{ fontSize: '0.75rem', fontWeight: currentStep === st.number ? 800 : 500 }}>{st.title}</span>
          </div>
        ))}
      </div>

      {/* Stepper Card */}
      <div className="delivery-card" style={{ padding: '2rem', borderRadius: '16px' }}>
        {currentStep === 1 && (
          <div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '1.5rem' }}>Step 1: Personal Details</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.25rem' }}>
              <div><label>Full Name</label><input type="text" value={fullName} disabled className="input" /></div>
              <div><label>Phone</label><input type="text" value={user?.phone || ''} disabled className="input" /></div>
              <div><label>Email</label><input type="text" value={user?.email || ''} disabled className="input" /></div>
            </div>
            <div style={{ marginTop: '2rem', textAlign: 'right' }}>
              <button type="button" onClick={() => setCurrentStep(2)} className="btn btn-primary">Proceed to Identity Proof →</button>
            </div>
          </div>
        )}

        {currentStep === 2 && (
          <div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '1.5rem' }}>Step 2: Identity Proof</h2>
            <div style={{ marginBottom: '1.5rem' }}>
              <label>ID Number</label>
              <input type="text" placeholder="e.g. 5432 9876 1234" value={idNumber} onChange={(e) => setIdNumber(e.target.value)} disabled={isLocked} className="input" />
              {idNumber && <div style={{ fontSize: '0.75rem', marginTop: '0.25rem' }}>Masked: {maskIdentifier(idNumber)}</div>}
            </div>
            {renderBox('AADHAAR_CARD', 'Identity Proof Document', 'image/jpeg,image/png,image/webp,application/pdf')}
            <div style={{ marginTop: '2rem', display: 'flex', justifyContent: 'space-between' }}>
              <button type="button" onClick={() => setCurrentStep(1)} className="btn btn-secondary">← Back</button>
              <button type="button" onClick={() => setCurrentStep(3)} className="btn btn-primary">Proceed to Licence →</button>
            </div>
          </div>
        )}

        {currentStep === 3 && (
          <div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '1.5rem' }}>Step 3: Driving Licence</h2>
            <div style={{ marginBottom: '1.5rem' }}>
              <label>Licence Number</label>
              <input type="text" placeholder="KA-01-20220005432" value={dlNumber} onChange={(e) => setDlNumber(e.target.value)} disabled={isLocked} className="input" />
            </div>
            {renderBox('DRIVING_LICENSE', 'Driving Licence Document', 'image/jpeg,image/png,image/webp,application/pdf')}
            <div style={{ marginTop: '2rem', display: 'flex', justifyContent: 'space-between' }}>
              <button type="button" onClick={() => setCurrentStep(2)} className="btn btn-secondary">← Back</button>
              <button type="button" onClick={() => setCurrentStep(4)} className="btn btn-primary">Proceed to RC →</button>
            </div>
          </div>
        )}

        {currentStep === 4 && (
          <div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '1.5rem' }}>Step 4: Vehicle RC</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.25rem', marginBottom: '1.5rem' }}>
              <div>
                <label>Vehicle Type</label>
                <select value={vehicleType} onChange={(e) => setVehicleType(e.target.value)} disabled={isLocked} className="input">
                  <option value="BIKE">Bike</option>
                  <option value="SCOOTER">Scooter</option>
                  <option value="CAR">Car</option>
                </select>
              </div>
              <div>
                <label>Registration Number</label>
                <input type="text" placeholder="KA-05-EV-4321" value={vehicleNum} onChange={(e) => setVehicleNum(e.target.value)} disabled={isLocked} className="input" />
              </div>
            </div>
            {renderBox('VEHICLE_RC', 'Vehicle RC Document', 'image/jpeg,image/png,image/webp,application/pdf')}
            <div style={{ marginTop: '2rem', display: 'flex', justifyContent: 'space-between' }}>
              <button type="button" onClick={() => setCurrentStep(3)} className="btn btn-secondary">← Back</button>
              <button type="button" onClick={() => setCurrentStep(5)} className="btn btn-primary">Proceed to Photos →</button>
            </div>
          </div>
        )}

        {currentStep === 5 && (
          <div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '1.5rem' }}>Step 5: Photos & Insurance</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.25rem' }}>
              {renderBox('PROFILE_PHOTO', 'Profile Photo', 'image/jpeg,image/png,image/webp')}
              {renderBox('VEHICLE_PHOTO', 'Vehicle Photo', 'image/jpeg,image/png,image/webp')}
              {renderBox('INSURANCE', 'Insurance (Optional)', 'image/jpeg,image/png,image/webp,application/pdf')}
            </div>
            <div style={{ marginTop: '2rem', display: 'flex', justifyContent: 'space-between' }}>
              <button type="button" onClick={() => setCurrentStep(4)} className="btn btn-secondary">← Back</button>
              <button type="button" onClick={() => setCurrentStep(6)} className="btn btn-primary">Review & Submit →</button>
            </div>
          </div>
        )}

        {currentStep === 6 && (
          <div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '1.5rem' }}>Step 6: Review & Submit</h2>
            <div style={{ marginBottom: '1.5rem' }}>
              <div>Rider: {fullName || user?.firstName}</div>
              <div>Vehicle: {vehicleType} ({vehicleNum})</div>
              <div>ID Number: {maskIdentifier(idNumber)}</div>
              <div>Uploaded Documents: {serverDocs.length} / 5 required</div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <button type="button" onClick={() => setCurrentStep(5)} className="btn btn-secondary">← Back</button>
              {status === 'NOT_SUBMITTED' || status === 'REJECTED' ? (
                <button type="button" onClick={handleSubmitForReview} disabled={submitting || serverDocs.length < 3} className="btn btn-primary">
                  {submitting ? 'Submitting...' : 'Submit KYC for Review →'}
                </button>
              ) : (
                <div>🔒 Submitted Under Review</div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Simulator */}
      <div style={{ marginTop: '2rem', padding: '1rem', border: '1px dashed var(--border-color)', borderRadius: '12px' }}>
        <button onClick={() => handleAdminVerify('APPROVED')} className="btn btn-success btn-sm" style={{ marginRight: '0.5rem' }}>
          Simulate Admin Approval
        </button>
        <button onClick={() => handleAdminVerify('REJECTED', 'Driving licence image is unclear.')} className="btn btn-danger btn-sm">
          Simulate Admin Rejection
        </button>
      </div>

      {previewModalUrl && (
        <div className="modal-overlay" onClick={() => setPreviewModalUrl(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <img src={previewModalUrl} alt="Document" style={{ maxWidth: '100%', maxHeight: '70vh' }} />
          </div>
        </div>
      )}
    </div>
  );

  function renderBox(docType, label, acceptTypes) {
    const serverDoc = serverDocs.find(
      (d) => d.documentType === docType || d.objectKey?.toUpperCase().includes(docType.toUpperCase())
    );
    const viewUrl = localFiles[docType]?.previewUrl || serverDoc?.fileUrl;
    const isUploading = uploadingDocType === docType;

    return (
      <div style={{ padding: '1rem', border: '1px dashed var(--border-color)', borderRadius: '12px', marginBottom: '1rem' }}>
        <div style={{ fontWeight: 700, marginBottom: '0.5rem' }}>{label}</div>
        {viewUrl ? (
          <div style={{ height: '120px', marginBottom: '0.5rem' }}>
            <img src={viewUrl} alt={label} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
          </div>
        ) : (
          <div style={{ padding: '1.5rem', textAlign: 'center', color: 'var(--text-muted)' }}>📁 Select File</div>
        )}
        {!isLocked && (
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <label className="btn btn-sm btn-primary" style={{ cursor: 'pointer' }}>
              {isUploading ? 'Uploading...' : viewUrl ? 'Replace' : 'Upload'}
              <input type="file" accept={acceptTypes} onChange={(e) => handleFileSelect(docType, e)} style={{ display: 'none' }} />
            </label>
            {viewUrl && (
              <button type="button" onClick={() => handleRemoveDocument(docType)} className="btn btn-sm btn-secondary">
                Remove
              </button>
            )}
          </div>
        )}
      </div>
    );
  }
};

export default KycUploadPage;
