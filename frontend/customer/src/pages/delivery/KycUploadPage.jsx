import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useDeliveryAuth } from '../../contexts/DeliveryAuthContext';
import deliveryService from '../../services/deliveryService';
import toast from 'react-hot-toast';
import {
  User,
  FileText,
  CreditCard,
  FileCheck,
  Bike,
  ShieldCheck,
  ClipboardList,
  CheckCircle2,
  AlertTriangle,
  AlertCircle,
  Check,
  Lock,
  X,
  Search,
  Upload,
  RefreshCw,
} from 'lucide-react';

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
  const [uploadState, setUploadState] = useState({}); // docType -> { status: 'UPLOADING' | 'FAILED' | 'SUCCESS', error?: string }
  const [previewModalUrl, setPreviewModalUrl] = useState(null);

  // Form Fields
  const [fullName, setFullName] = useState('');
  const [idDocType, setIdDocType] = useState('AADHAAR_CARD');
  const [idNumber, setIdNumber] = useState('');
  const [dlNumber, setDlNumber] = useState('');
  const [vehicleType, setVehicleType] = useState('BIKE');
  const [vehicleNum, setVehicleNum] = useState('');

  const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB

  const fetchKyc = async () => {
    try {
      setLoading(true);
      const data = await deliveryService.getKyc();
      setKycData(data);
      if (data?.panNumber) {
        setIdNumber(data.panNumber);
        setIdDocType('PAN_CARD');
      } else if (data?.aadharNumber) {
        setIdNumber(data.aadharNumber);
        setIdDocType('AADHAAR_CARD');
      }
      if (partner) {
        setFullName(`${user?.firstName || ''} ${user?.lastName || ''}`.trim() || partner?.user?.firstName || '');
        if (partner?.vehicleType) setVehicleType(partner.vehicleType);
        if (partner?.vehicleNum) setVehicleNum(partner.vehicleNum);
        if (partner?.licenseNumber) setDlNumber(partner.licenseNumber);
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

  // Helper to mask identifier numbers for privacy
  const maskIdentifier = (val) => {
    if (!val) return '';
    const clean = val.replace(/\s+/g, '');
    if (clean.length <= 4) return clean;
    return '•••• •••• ' + clean.slice(-4);
  };

  // Required 5 Document Categories Validation
  const identityTypes = ['AADHAAR_CARD', 'PAN_CARD', 'PASSPORT', 'VOTER_ID', 'OTHER'];
  const hasIdentityDoc = serverDocs.some((d) => identityTypes.includes(d.documentType));
  const hasDrivingLicenseDoc = serverDocs.some((d) => d.documentType === 'DRIVING_LICENSE');
  const hasVehicleRcDoc = serverDocs.some((d) => d.documentType === 'VEHICLE_RC');
  const hasProfilePhotoDoc = serverDocs.some(
    (d) => d.documentType === 'PROFILE_PHOTO' || d.objectKey?.toUpperCase().includes('PROFILE_PHOTO')
  );
  const hasVehiclePhotoDoc = serverDocs.some(
    (d) => d.documentType === 'VEHICLE_PHOTO' || d.objectKey?.toUpperCase().includes('VEHICLE_PHOTO')
  );

  const requiredAuditList = [
    { key: 'IDENTITY', label: 'Identity Proof (Aadhaar / PAN / Passport / Voter ID)', completed: hasIdentityDoc, step: 2, icon: FileText },
    { key: 'DL', label: 'Driving Licence (DL)', completed: hasDrivingLicenseDoc, step: 3, icon: CreditCard },
    { key: 'RC', label: 'Vehicle Registration Certificate (RC)', completed: hasVehicleRcDoc, step: 4, icon: FileCheck },
    { key: 'PROFILE', label: 'Profile Photograph (Face)', completed: hasProfilePhotoDoc, step: 5, icon: User },
    { key: 'VEHICLE_PHOTO', label: 'Vehicle Photograph (Plate)', completed: hasVehiclePhotoDoc, step: 5, icon: Bike },
  ];

  const completedRequiredCount = requiredAuditList.filter((r) => r.completed).length;
  const isAllRequiredCompleted = completedRequiredCount === 5;

  const docDefinitions = [
    {
      type: 'PROFILE_PHOTO',
      step: 5,
      label: 'Profile Photograph',
      icon: User,
      required: true,
      description: 'Clear frontal photograph of your face without sunglasses or helmet.',
      accept: 'image/jpeg,image/png,image/webp',
    },
    {
      type: idDocType,
      step: 2,
      label: `Identity Proof (${idDocType === 'PAN_CARD' ? 'PAN Card' : idDocType === 'PASSPORT' ? 'Passport' : idDocType === 'VOTER_ID' ? 'Voter ID' : 'Aadhaar Card'})`,
      icon: FileText,
      required: true,
      description: 'Official Government ID proof (Aadhaar, PAN, Passport, or Voter ID).',
      accept: 'image/jpeg,image/png,image/webp,application/pdf',
    },
    {
      type: 'DRIVING_LICENSE',
      step: 3,
      label: 'Driving Licence (DL)',
      icon: CreditCard,
      required: true,
      description: 'Valid, unexpired commercial or transport two-wheeler / LMV driving licence.',
      accept: 'image/jpeg,image/png,image/webp,application/pdf',
    },
    {
      type: 'VEHICLE_RC',
      step: 4,
      label: 'Vehicle Registration Certificate (RC)',
      icon: FileCheck,
      required: true,
      description: 'Vehicle Registration Certificate matching your delivery vehicle.',
      accept: 'image/jpeg,image/png,image/webp,application/pdf',
    },
    {
      type: 'VEHICLE_PHOTO',
      step: 5,
      label: 'Vehicle Photograph',
      icon: Bike,
      required: true,
      description: 'Photograph of the vehicle showing the registration number plate clearly.',
      accept: 'image/jpeg,image/png,image/webp',
    },
    {
      type: 'INSURANCE',
      step: 5,
      label: 'Vehicle Insurance (Optional)',
      icon: ShieldCheck,
      required: false,
      description: 'Valid third-party or comprehensive motor insurance policy document.',
      accept: 'image/jpeg,image/png,image/webp,application/pdf',
    },
  ];

  // Handle local file selection & backend upload
  const handleFileSelect = async (docType, e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > MAX_FILE_SIZE) {
      toast.error('File must be less than 10 MB');
      e.target.value = '';
      return;
    }

    setUploadState((prev) => ({
      ...prev,
      [docType]: { status: 'UPLOADING' },
    }));

    setUploadingDocType(docType);
    const formData = new FormData();
    formData.append('file', file);
    formData.append('documentType', docType);
    if (idNumber) formData.append('idNumber', idNumber);
    if (dlNumber) formData.append('licenseNumber', dlNumber);
    if (vehicleType) formData.append('vehicleType', vehicleType);
    if (vehicleNum) formData.append('vehicleNum', vehicleNum);

    try {
      await deliveryService.uploadKycFile(formData);
      toast.success(`${docType.replace('_', ' ')} uploaded successfully!`);
      setUploadState((prev) => {
        const copy = { ...prev };
        delete copy[docType];
        return copy;
      });
      await fetchKyc();
      await refreshProfile();
    } catch (err) {
      setUploadState((prev) => ({
        ...prev,
        [docType]: {
          status: 'FAILED',
          error: err.response?.data?.message || 'Upload failed. Please retry.',
        },
      }));
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
      (d) =>
        d.documentType === docType ||
        (identityTypes.includes(docType) && identityTypes.includes(d.documentType)) ||
        d.objectKey?.toUpperCase().includes(docType.toUpperCase())
    );

    if (serverDoc) {
      try {
        await deliveryService.removeKycDoc(serverDoc.id);
        toast.success('Document removed.');
        await fetchKyc();
      } catch (err) {
        toast.error('Failed to remove document from storage.');
      }
    }

    setUploadState((prev) => {
      const copy = { ...prev };
      delete copy[docType];
      return copy;
    });
  };

  const handleSubmitForReview = async () => {
    if (!isAllRequiredCompleted) {
      const missing = requiredAuditList.filter((r) => !r.completed).map((r) => r.label);
      toast.error(`Missing required documents (${5 - completedRequiredCount}/5): ${missing.join(', ')}`);
      return;
    }

    try {
      setSubmitting(true);
      await deliveryService.submitKyc({
        licenseNumber: dlNumber,
        vehicleNum: vehicleNum,
      });
      toast.success('All 5 KYC documents submitted for compliance review!');
      await fetchKyc();
      await refreshProfile();
      setCurrentStep(6);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not submit KYC documents.');
    } finally {
      setSubmitting(false);
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
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1rem' }}>
          <ClipboardList size={44} strokeWidth={1.75} style={{ color: 'var(--color-primary)' }} />
        </div>
        <div style={{ fontWeight: 700, fontSize: '1.1rem' }}>Loading KYC Verification portal...</div>
      </div>
    );
  }

  const showRegistrationNotice = location.state?.registered;

  return (
    <div className="delivery-container" style={{ maxWidth: '1000px', margin: '0 auto', padding: '1.5rem 1rem 4rem' }}>
      {/* Registration Banner */}
      {showRegistrationNotice && (
        <div
          id="kyc-registration-success-banner"
          style={{
            padding: '1.25rem 1.5rem',
            borderRadius: '12px',
            backgroundColor: 'rgba(16, 185, 129, 0.12)',
            border: '1px solid rgba(16, 185, 129, 0.4)',
            color: '#10b981',
            marginBottom: '1.75rem',
            display: 'flex',
            alignItems: 'center',
            gap: '1rem',
          }}
        >
          <CheckCircle2 size={32} strokeWidth={1.75} style={{ color: '#10b981' }} />
          <div>
            <div style={{ fontWeight: 800, fontSize: '1.05rem' }}>
              Registration Completed! Welcome to PartNexa Fleet.
            </div>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary, #94a3b8)', marginTop: '0.2rem' }}>
              Complete the verification steps below to submit your 5 required compliance documents for admin review and unlock active delivery orders.
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '1.85rem', fontWeight: 800, marginBottom: '0.35rem', letterSpacing: '-0.02em' }}>
          Delivery Partner KYC Verification
        </h1>
        <p style={{ color: 'var(--color-text-muted, #94a3b8)', fontSize: '0.9rem' }}>
          Submit identity and vehicle registration records for administrative compliance review. Stored securely in private storage.
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
            status === 'APPROVED'
              ? '#10b981'
              : status === 'PENDING'
              ? '#f59e0b'
              : status === 'REJECTED'
              ? '#ef4444'
              : '#0284c7'
          }`,
          backgroundColor: 'var(--bg-secondary, #1e293b)',
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '1rem',
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '0.35rem' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)' }}>
              KYC Status:
            </span>
            <span
              style={{
                fontSize: '0.82rem',
                fontWeight: 800,
                padding: '0.25rem 0.65rem',
                borderRadius: '6px',
                backgroundColor:
                  status === 'APPROVED'
                    ? 'rgba(16, 185, 129, 0.2)'
                    : status === 'PENDING'
                    ? 'rgba(245, 158, 11, 0.2)'
                    : status === 'REJECTED'
                    ? 'rgba(239, 68, 68, 0.2)'
                    : 'rgba(2, 132, 199, 0.2)',
                color:
                  status === 'APPROVED'
                    ? '#10b981'
                    : status === 'PENDING'
                    ? '#f59e0b'
                    : status === 'REJECTED'
                    ? '#ef4444'
                    : '#0284c7',
              }}
            >
              {status === 'NOT_SUBMITTED' ? 'Documents Required' : status.replace('_', ' ')}
            </span>
          </div>

          <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary, #cbd5e1)' }}>
            {status === 'APPROVED' &&
              'Your profile is fully verified and active. You are eligible to go online and claim available delivery jobs.'}
            {status === 'PENDING' &&
              'Your documents are under review by the PartNexa compliance desk. Verification typically completes within 24 hours.'}
            {status === 'REJECTED' &&
              `Verification was rejected: "${kycData?.rejectionReason || 'Please replace unreadable or expired documents.'}". Replace rejected files and resubmit.`}
            {status === 'NOT_SUBMITTED' &&
              'Please complete all steps below and upload the 5 required documents to submit your KYC for compliance approval.'}
          </div>
        </div>

        {/* Progress Pill: X / 5 Required Documents Completed */}
        <div
          style={{
            padding: '0.65rem 1rem',
            borderRadius: '8px',
            backgroundColor: isAllRequiredCompleted ? 'rgba(16, 185, 129, 0.15)' : 'var(--bg-tertiary, #334155)',
            border: `1px solid ${isAllRequiredCompleted ? 'rgba(16, 185, 129, 0.4)' : 'var(--border-color)'}`,
            display: 'flex',
            alignItems: 'center',
            gap: '0.65rem',
          }}
        >
          {isAllRequiredCompleted ? (
            <CheckCircle2 size={20} strokeWidth={2} style={{ color: '#10b981' }} />
          ) : (
            <AlertCircle size={20} strokeWidth={2} style={{ color: '#f59e0b' }} />
          )}
          <div>
            <div style={{ fontSize: '0.82rem', fontWeight: 800, color: isAllRequiredCompleted ? '#10b981' : 'var(--text-primary)' }}>
              {completedRequiredCount} / 5 required documents completed
            </div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
              {isAllRequiredCompleted ? 'Ready for compliance submission' : `${5 - completedRequiredCount} document(s) pending`}
            </div>
          </div>
        </div>
      </div>

      {/* Stepper Tabs */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '2.5rem',
          position: 'relative',
          overflowX: 'auto',
          paddingBottom: '0.5rem',
        }}
      >
        {steps.map((st) => {
          const isActive = currentStep === st.number;
          const isDone = currentStep > st.number || status === 'PENDING' || status === 'APPROVED';

          return (
            <div
              key={st.number}
              onClick={() => setCurrentStep(st.number)}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                cursor: 'pointer',
                minWidth: '70px',
                zIndex: 2,
              }}
            >
              <div
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 800,
                  fontSize: '0.85rem',
                  marginBottom: '0.4rem',
                  transition: 'all 0.2s ease',
                  backgroundColor: isDone ? '#10b981' : isActive ? 'var(--color-primary, #0284c7)' : 'var(--bg-tertiary, #334155)',
                  color: isDone || isActive ? '#fff' : 'var(--text-muted, #94a3b8)',
                  boxShadow: isActive ? '0 0 0 4px rgba(2, 132, 199, 0.25)' : 'none',
                }}
              >
                {isDone && currentStep !== st.number ? <Check size={14} strokeWidth={2.5} /> : st.number}
              </div>
              <span
                style={{
                  fontSize: '0.75rem',
                  fontWeight: isActive ? 800 : 600,
                  color: isActive ? 'var(--text-primary)' : 'var(--text-muted)',
                  textAlign: 'center',
                  whiteSpace: 'nowrap',
                }}
              >
                {st.title}
              </span>
            </div>
          );
        })}
      </div>

      {/* Stepper Content Panels */}
      <div className="delivery-card" style={{ padding: '2rem', borderRadius: '16px', marginBottom: '2rem' }}>
        {/* STEP 1: Personal Details */}
        {currentStep === 1 && (
          <div>
            <div style={{ marginBottom: '1.5rem' }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '0.25rem' }}>
                Step 1: Personal Details
              </h2>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                Verify your basic personal information as registered with PartNexa.
              </p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.25rem' }}>
              <div className="form-group">
                <label style={{ fontSize: '0.85rem', fontWeight: 700, marginBottom: '0.4rem', display: 'block' }}>
                  Full Name
                </label>
                <input
                  type="text"
                  value={fullName}
                  disabled
                  style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-tertiary)', color: 'var(--text-primary)' }}
                />
              </div>

              <div className="form-group">
                <label style={{ fontSize: '0.85rem', fontWeight: 700, marginBottom: '0.4rem', display: 'block' }}>
                  Registered Phone
                </label>
                <input
                  type="text"
                  value={user?.phone || 'Phone number'}
                  disabled
                  style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-tertiary)', color: 'var(--text-primary)' }}
                />
              </div>

              <div className="form-group">
                <label style={{ fontSize: '0.85rem', fontWeight: 700, marginBottom: '0.4rem', display: 'block' }}>
                  Registered Email
                </label>
                <input
                  type="text"
                  value={user?.email || 'Email address'}
                  disabled
                  style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-tertiary)', color: 'var(--text-primary)' }}
                />
              </div>
            </div>

            <div style={{ marginTop: '2rem', display: 'flex', justifyContent: 'flex-end' }}>
              <button
                type="button"
                onClick={() => setCurrentStep(2)}
                className="btn btn-primary"
              >
                Proceed to Identity Proof →
              </button>
            </div>
          </div>
        )}

        {/* STEP 2: Identity Proof (Dynamic Selector) */}
        {currentStep === 2 && (
          <div>
            <div style={{ marginBottom: '1.5rem' }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '0.25rem' }}>
                Step 2: Identity Proof
              </h2>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                Select your Government ID type and upload a clear document image or PDF.
              </p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.25rem', marginBottom: '1.5rem' }}>
              <div className="form-group">
                <label style={{ fontSize: '0.85rem', fontWeight: 700, marginBottom: '0.4rem', display: 'block' }}>
                  Identity Document Type
                </label>
                <select
                  value={idDocType}
                  onChange={(e) => setIdDocType(e.target.value)}
                  disabled={isLocked}
                  style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-primary)', color: 'var(--text-primary)' }}
                >
                  <option value="AADHAAR_CARD">Aadhaar Card</option>
                  <option value="PAN_CARD">PAN Card</option>
                  <option value="PASSPORT">Passport</option>
                  <option value="VOTER_ID">Voter ID</option>
                  <option value="OTHER">Other Govt Photo ID</option>
                </select>
              </div>

              <div className="form-group">
                <label style={{ fontSize: '0.85rem', fontWeight: 700, marginBottom: '0.4rem', display: 'block' }}>
                  Document Number (Masked in UI)
                </label>
                <input
                  type="text"
                  placeholder="e.g. 5432 9876 1234"
                  value={idNumber}
                  onChange={(e) => setIdNumber(e.target.value)}
                  disabled={isLocked}
                  style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-primary)', color: 'var(--text-primary)' }}
                />
                {idNumber && (
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem', display: 'block' }}>
                    Preview: {maskIdentifier(idNumber)}
                  </span>
                )}
              </div>
            </div>

            {/* Document Upload Card dynamically for the selected idDocType */}
            {renderUploadBox(idDocType, `Identity Proof Document (${idDocType.replace('_', ' ')})`, 'image/jpeg,image/png,image/webp,application/pdf')}

            <div style={{ marginTop: '2rem', display: 'flex', justifyContent: 'space-between' }}>
              <button type="button" onClick={() => setCurrentStep(1)} className="btn btn-secondary">
                ← Back
              </button>
              <button type="button" onClick={() => setCurrentStep(3)} className="btn btn-primary">
                Proceed to Driving Licence →
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: Driving Licence */}
        {currentStep === 3 && (
          <div>
            <div style={{ marginBottom: '1.5rem' }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '0.25rem' }}>
                Step 3: Driving Licence (DL)
              </h2>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                Upload a clear copy of your valid commercial/transport driving licence.
              </p>
            </div>

            <div className="form-group" style={{ maxWidth: '400px', marginBottom: '1.5rem' }}>
              <label style={{ fontSize: '0.85rem', fontWeight: 700, marginBottom: '0.4rem', display: 'block' }}>
                Driving Licence Number
              </label>
              <input
                type="text"
                placeholder="e.g. DL-04-20220005432"
                value={dlNumber}
                onChange={(e) => setDlNumber(e.target.value)}
                disabled={isLocked}
                style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-primary)', color: 'var(--text-primary)' }}
              />
            </div>

            {renderUploadBox('DRIVING_LICENSE', 'Driving Licence Document', 'image/jpeg,image/png,image/webp,application/pdf')}

            <div style={{ marginTop: '2rem', display: 'flex', justifyContent: 'space-between' }}>
              <button type="button" onClick={() => setCurrentStep(2)} className="btn btn-secondary">
                ← Back
              </button>
              <button type="button" onClick={() => setCurrentStep(4)} className="btn btn-primary">
                Proceed to Vehicle RC →
              </button>
            </div>
          </div>
        )}

        {/* STEP 4: Vehicle Registration Certificate (RC) */}
        {currentStep === 4 && (
          <div>
            <div style={{ marginBottom: '1.5rem' }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '0.25rem' }}>
                Step 4: Vehicle Registration Certificate (RC)
              </h2>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                Provide vehicle registration details and upload your RC book or smart card copy.
              </p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.25rem', marginBottom: '1.5rem' }}>
              <div className="form-group">
                <label style={{ fontSize: '0.85rem', fontWeight: 700, marginBottom: '0.4rem', display: 'block' }}>
                  Vehicle Type
                </label>
                <select
                  value={vehicleType}
                  onChange={(e) => setVehicleType(e.target.value)}
                  disabled={isLocked}
                  style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-primary)', color: 'var(--text-primary)' }}
                >
                  <option value="BIKE">Motorcycle / Bike</option>
                  <option value="SCOOTER">Scooter</option>
                  <option value="ELECTRIC_SCOOTER">Electric Scooter (EV)</option>
                  <option value="CAR">Car / Hatchback</option>
                  <option value="VAN">Delivery Van / Small Commercial</option>
                </select>
              </div>

              <div className="form-group">
                <label style={{ fontSize: '0.85rem', fontWeight: 700, marginBottom: '0.4rem', display: 'block' }}>
                  Vehicle Registration Number
                </label>
                <input
                  type="text"
                  placeholder="e.g. KA-05-EV-4321"
                  value={vehicleNum}
                  onChange={(e) => setVehicleNum(e.target.value)}
                  disabled={isLocked}
                  style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-primary)', color: 'var(--text-primary)' }}
                />
              </div>
            </div>

            {renderUploadBox('VEHICLE_RC', 'Vehicle RC Document', 'image/jpeg,image/png,image/webp,application/pdf')}

            <div style={{ marginTop: '2rem', display: 'flex', justifyContent: 'space-between' }}>
              <button type="button" onClick={() => setCurrentStep(3)} className="btn btn-secondary">
                ← Back
              </button>
              <button type="button" onClick={() => setCurrentStep(5)} className="btn btn-primary">
                Proceed to Photographs →
              </button>
            </div>
          </div>
        )}

        {/* STEP 5: Photographs */}
        {currentStep === 5 && (
          <div>
            <div style={{ marginBottom: '1.5rem' }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '0.25rem' }}>
                Step 5: Photographs & Insurance
              </h2>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                Upload your profile photograph, vehicle photograph, and optional insurance document.
              </p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
              {renderUploadBox('PROFILE_PHOTO', 'Profile Photo (Selfie / Headshot)', 'image/jpeg,image/png,image/webp')}
              {renderUploadBox('VEHICLE_PHOTO', 'Vehicle Photo (Showing Number Plate)', 'image/jpeg,image/png,image/webp')}
              {renderUploadBox('INSURANCE', 'Vehicle Insurance Policy (Optional)', 'image/jpeg,image/png,image/webp,application/pdf')}
            </div>

            <div style={{ marginTop: '2rem', display: 'flex', justifyContent: 'space-between' }}>
              <button type="button" onClick={() => setCurrentStep(4)} className="btn btn-secondary">
                ← Back
              </button>
              <button type="button" onClick={() => setCurrentStep(6)} className="btn btn-primary">
                Review & Submit KYC →
              </button>
            </div>
          </div>
        )}

        {/* STEP 6: Review & Submit */}
        {currentStep === 6 && (
          <div>
            <div style={{ marginBottom: '1.5rem' }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '0.25rem' }}>
                Step 6: Review KYC & Submit
              </h2>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                Inspect your uploaded documents before final submission to the PartNexa compliance desk.
              </p>
            </div>

            {/* Checklist of uploaded files */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
              {docDefinitions.map((d) => {
                const uploaded = serverDocs.find(
                  (s) =>
                    s.documentType === d.type ||
                    (identityTypes.includes(d.type) && identityTypes.includes(s.documentType)) ||
                    s.objectKey?.toUpperCase().includes(d.type.toUpperCase())
                );
                const hasDoc = Boolean(uploaded);

                // Language requirement: Do not say "Uploaded & Verified" before Admin verifies it
                let statusLabel = 'Missing (Required)';
                let statusColor = 'var(--text-muted)';
                if (hasDoc) {
                  if (uploaded.verificationStatus === 'APPROVED') {
                    statusLabel = 'Approved';
                    statusColor = '#10b981';
                  } else if (uploaded.verificationStatus === 'REJECTED') {
                    statusLabel = 'Rejected';
                    statusColor = '#ef4444';
                  } else if (status === 'PENDING') {
                    statusLabel = 'Pending Review';
                    statusColor = '#f59e0b';
                  } else {
                    statusLabel = 'Uploaded';
                    statusColor = '#0284c7';
                  }
                } else if (!d.required) {
                  statusLabel = 'Optional';
                }

                return (
                  <div
                    key={d.type}
                    style={{
                      padding: '1rem',
                      borderRadius: '10px',
                      backgroundColor: 'var(--bg-tertiary, #1e293b)',
                      border: `1px solid ${hasDoc ? 'rgba(16, 185, 129, 0.4)' : 'var(--border-color)'}`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <span style={{ display: 'inline-flex', alignItems: 'center' }}>
                        <d.icon size={22} strokeWidth={1.75} style={{ color: 'var(--color-primary)' }} />
                      </span>
                      <div>
                        <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>{d.label}</div>
                        <div style={{ fontSize: '0.75rem', fontWeight: 600, color: statusColor }}>
                          {statusLabel}
                        </div>
                      </div>
                    </div>
                    <div>
                      {hasDoc ? (
                        <CheckCircle2 size={18} strokeWidth={2} style={{ color: '#10b981' }} />
                      ) : (
                        <button
                          type="button"
                          onClick={() => setCurrentStep(d.step)}
                          className="btn btn-secondary btn-sm"
                          style={{ fontSize: '0.75rem', padding: '0.25rem 0.5rem' }}
                        >
                          Upload
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Summary Details Box */}
            <div
              style={{
                padding: '1.25rem',
                borderRadius: '12px',
                backgroundColor: 'var(--bg-primary)',
                border: '1px solid var(--border-color)',
                marginBottom: '2rem',
              }}
            >
              <h3 style={{ fontSize: '0.95rem', fontWeight: 800, marginBottom: '0.75rem' }}>
                Summary Verification Details
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', fontSize: '0.85rem' }}>
                <div><strong>Rider:</strong> {fullName || user?.firstName}</div>
                <div><strong>Vehicle Type:</strong> {vehicleType}</div>
                <div><strong>Vehicle Plate:</strong> {vehicleNum || 'Not specified'}</div>
                <div><strong>Licence Number:</strong> {dlNumber || 'Not specified'}</div>
                <div><strong>ID Number:</strong> {maskIdentifier(idNumber) || 'Document attached'}</div>
              </div>
            </div>

            {/* Action Bar */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
              <button type="button" onClick={() => setCurrentStep(5)} className="btn btn-secondary">
                ← Back to Photos
              </button>

              {status === 'NOT_SUBMITTED' || status === 'REJECTED' ? (
                <button
                  type="button"
                  onClick={handleSubmitForReview}
                  disabled={submitting || !isAllRequiredCompleted}
                  className="btn btn-primary"
                  style={{ minWidth: '240px', padding: '0.75rem 1.5rem', fontWeight: 800 }}
                >
                  {submitting
                    ? 'Submitting...'
                    : !isAllRequiredCompleted
                    ? `Complete 5 required documents (${completedRequiredCount}/5)`
                    : 'Submit KYC for Admin Review →'}
                </button>
              ) : status === 'PENDING' ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#f59e0b', fontWeight: 700 }}>
                  <Lock size={16} strokeWidth={1.75} /> Documents Locked Under Admin Review
                </div>
              ) : (
                <div style={{ color: '#10b981', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <CheckCircle2 size={18} strokeWidth={2} /> KYC Approved & Active
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Lightbox / Preview Modal for Images or Documents */}
      {previewModalUrl && (
        <div
          className="modal-overlay"
          onClick={() => setPreviewModalUrl(null)}
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
              maxWidth: '800px',
              width: '100%',
              backgroundColor: 'var(--bg-secondary, #1e293b)',
              borderRadius: '16px',
              overflow: 'hidden',
              boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)',
            }}
          >
            <div style={{ padding: '1rem 1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-color)' }}>
              <div style={{ fontWeight: 800, fontSize: '1rem' }}>Document Secure Viewer</div>
              <button
                onClick={() => setPreviewModalUrl(null)}
                style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
              >
                <X size={20} strokeWidth={1.75} />
              </button>
            </div>
            <div style={{ padding: '1.5rem', textAlign: 'center', maxHeight: '75vh', overflow: 'auto' }}>
              {previewModalUrl.includes('.pdf') ? (
                <iframe
                  src={previewModalUrl}
                  title="PDF Preview"
                  style={{ width: '100%', height: '550px', border: 'none', borderRadius: '8px' }}
                />
              ) : (
                <img
                  src={previewModalUrl}
                  alt="KYC Preview"
                  style={{ maxWidth: '100%', maxHeight: '65vh', objectFit: 'contain', borderRadius: '8px' }}
                />
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );

  // Render individual upload card helper
  function renderUploadBox(docType, label, acceptTypes) {
    const serverDoc = serverDocs.find(
      (d) =>
        d.documentType === docType ||
        (identityTypes.includes(docType) && identityTypes.includes(d.documentType)) ||
        d.objectKey?.toUpperCase().includes(docType.toUpperCase())
    );

    const state = uploadState[docType];
    const isUploading = uploadingDocType === docType || state?.status === 'UPLOADING';
    const isFailed = state?.status === 'FAILED';
    const isPdf = serverDoc?.mimeType === 'application/pdf' || serverDoc?.objectKey?.toLowerCase().endsWith('.pdf');
    const viewUrl = serverDoc?.fileUrl;

    let badgeText = 'Pending Upload';
    let badgeBg = 'rgba(148, 163, 184, 0.15)';
    let badgeColor = 'var(--text-muted)';

    if (serverDoc) {
      if (serverDoc.verificationStatus === 'APPROVED') {
        badgeText = 'Approved';
        badgeBg = 'rgba(16, 185, 129, 0.15)';
        badgeColor = '#10b981';
      } else if (serverDoc.verificationStatus === 'REJECTED') {
        badgeText = 'Rejected';
        badgeBg = 'rgba(239, 68, 68, 0.15)';
        badgeColor = '#ef4444';
      } else if (status === 'PENDING') {
        badgeText = 'Pending Review';
        badgeBg = 'rgba(245, 158, 11, 0.15)';
        badgeColor = '#f59e0b';
      } else {
        badgeText = 'Uploaded';
        badgeBg = 'rgba(2, 132, 199, 0.15)';
        badgeColor = '#0284c7';
      }
    } else if (isFailed) {
      badgeText = 'Upload Failed';
      badgeBg = 'rgba(239, 68, 68, 0.15)';
      badgeColor = '#ef4444';
    }

    return (
      <div
        key={docType}
        style={{
          border: `1px dashed ${isFailed ? '#ef4444' : 'var(--border-color)'}`,
          borderRadius: '12px',
          padding: '1.25rem',
          backgroundColor: 'var(--bg-primary)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          transition: 'all 0.2s ease',
        }}
      >
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
            <span style={{ fontWeight: 800, fontSize: '0.92rem', color: 'var(--text-primary)' }}>
              {label}
            </span>
            <span
              style={{
                fontSize: '0.72rem',
                fontWeight: 800,
                padding: '0.15rem 0.5rem',
                borderRadius: '4px',
                backgroundColor: badgeBg,
                color: badgeColor,
              }}
            >
              {badgeText}
            </span>
          </div>

          {/* Failure message if upload failed */}
          {isFailed && (
            <div style={{ color: '#ef4444', fontSize: '0.78rem', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <AlertTriangle size={14} />
              {state?.error || 'Upload failed. Please check format and retry.'}
            </div>
          )}

          {/* Preview Container — Only shown if authoritative server document exists */}
          {viewUrl ? (
            <div
              style={{
                borderRadius: '8px',
                overflow: 'hidden',
                backgroundColor: 'var(--bg-tertiary)',
                marginBottom: '1rem',
                border: '1px solid var(--border-color)',
                height: '140px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                position: 'relative',
              }}
            >
              {isPdf ? (
                <div style={{ textAlign: 'center', padding: '1rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '0.5rem' }}>
                    <FileText size={40} strokeWidth={1.75} style={{ color: 'var(--text-muted)' }} />
                  </div>
                  <div style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                    PDF Document
                  </div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                    {serverDoc?.objectKey?.split('/').pop() || 'document.pdf'}
                  </div>
                </div>
              ) : (
                <img
                  src={viewUrl}
                  alt={label}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              )}

              {/* View Overlay Button */}
              <button
                type="button"
                onClick={() => setPreviewModalUrl(viewUrl)}
                style={{
                  position: 'absolute',
                  bottom: '8px',
                  right: '8px',
                  backgroundColor: 'rgba(0,0,0,0.7)',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '6px',
                  padding: '0.35rem 0.65rem',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  backdropFilter: 'blur(4px)',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.35rem',
                }}
              >
                <Search size={13} strokeWidth={1.75} /> Inspect
              </button>
            </div>
          ) : (
            <div
              style={{
                height: '120px',
                borderRadius: '8px',
                backgroundColor: 'var(--bg-tertiary)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '1rem',
                color: 'var(--text-muted)',
              }}
            >
              <Upload size={32} strokeWidth={1.75} style={{ marginBottom: '0.5rem' }} />
              <span style={{ fontSize: '0.78rem' }}>Upload JPG, PNG, WebP or PDF (Max 10 MB)</span>
            </div>
          )}
        </div>

        {/* Buttons / Actions */}
        <div>
          {isLocked ? (
            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', textAlign: 'center', padding: '0.4rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.35rem' }}>
              <Lock size={13} strokeWidth={1.75} /> Document locked during review
            </div>
          ) : (
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <label
                style={{
                  flex: 1,
                  display: 'inline-block',
                  textAlign: 'center',
                  padding: '0.55rem',
                  borderRadius: '8px',
                  backgroundColor: viewUrl ? 'var(--bg-tertiary)' : isFailed ? '#ef4444' : 'var(--color-primary, #0284c7)',
                  color: viewUrl ? 'var(--text-primary)' : '#fff',
                  border: '1px solid var(--border-color)',
                  fontWeight: 700,
                  fontSize: '0.82rem',
                  cursor: isUploading ? 'not-allowed' : 'pointer',
                }}
              >
                {isUploading ? 'Uploading...' : isFailed ? 'Retry Upload' : viewUrl ? 'Replace File' : 'Upload File'}
                <input
                  type="file"
                  accept={acceptTypes}
                  disabled={isUploading || isLocked}
                  onChange={(e) => handleFileSelect(docType, e)}
                  style={{ display: 'none' }}
                />
              </label>

              {viewUrl && (
                <button
                  type="button"
                  onClick={() => handleRemoveDocument(docType)}
                  className="btn btn-secondary btn-sm"
                  style={{ color: '#ef4444', borderColor: 'rgba(239, 68, 68, 0.4)' }}
                >
                  Remove
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    );
  }
};

export default KycUploadPage;
