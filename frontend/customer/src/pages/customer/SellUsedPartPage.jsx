import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Recycle,
  FileEdit,
  ClipboardList,
  ShoppingCart,
  Car,
  Wrench,
  MapPin,
  Check,
  Star,
  Phone,
  Store,
  Truck,
  Zap,
  Camera,
  AlertTriangle,
  X,
  Lock,
  ShieldCheck,
  Leaf,
  RefreshCw,
  Package,
  Hash,
  CheckCircle2,
  XCircle,
  Search,
} from 'lucide-react';
import { useVehicle } from '../../contexts/VehicleContext';
import { usedPartsService } from '../../services';
import { Button, Modal } from '../../components/ui';
import toast from 'react-hot-toast';
import './SellUsedPartPage.css';

const SAMPLE_PART_PHOTOS = [
  'https://images.unsplash.com/photo-1517524008697-84bbe3c3fd98?w=600&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1486006920555-c77dce18193b?w=600&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?w=600&auto=format&fit=crop&q=80',
];

const CONDITION_OPTIONS = [
  { value: 'LIKE_NEW', label: 'Like New / Unused (0-500 km or open-box)' },
  { value: 'EXCELLENT', label: 'Excellent (Minor cosmetic wear, 100% functional)' },
  { value: 'GOOD', label: 'Good (Standard operational wear, fully tested)' },
  { value: 'FAIR', label: 'Fair (Minor cosmetic blemishes, working)' },
  { value: 'FOR_PARTS', label: 'Core / Needs Refurbishment' },
];

const CATEGORY_OPTIONS = [
  { value: 'LIGHTING', label: 'Lighting & Headlamps' },
  { value: 'BRAKES', label: 'Brakes & Rotors' },
  { value: 'ELECTRICAL', label: 'Electricals & Alternators' },
  { value: 'ENGINE', label: 'Engine Components & Sensors' },
  { value: 'SUSPENSION', label: 'Suspension & Steering' },
  { value: 'BODY', label: 'Body Panels & Mirrors' },
  { value: 'ACCESSORIES', label: 'Infotainment & Interior' },
  { value: 'OTHER', label: 'Other Spares' },
];

const AGE_OPTIONS = [
  { value: 'Under 6 Months', label: 'Under 6 Months' },
  { value: '6-12 Months', label: '6 - 12 Months' },
  { value: '1-2 Years', label: '1 - 2 Years' },
  { value: '2-3 Years', label: '2 - 3 Years' },
  { value: '3+ Years', label: '3+ Years' },
  { value: 'Unknown', label: 'Age Unknown' },
];

const STATUS_CONFIG = {
  DRAFT: { label: 'Draft', color: 'gray', bg: 'var(--color-gray-100)', text: 'var(--color-gray-700)' },
  SUBMITTED: { label: 'Submitted for Verification', color: 'blue', bg: 'rgba(2, 132, 199, 0.12)', text: '#0284c7' },
  GARAGE_ASSIGNED: { label: 'Assigned to Partner Garage', color: 'purple', bg: 'rgba(147, 51, 234, 0.12)', text: '#9333ea' },
  PART_RECEIVED: { label: 'Part Received at Garage', color: 'blue', bg: 'rgba(2, 132, 199, 0.12)', text: '#0284c7' },
  INSPECTION_PENDING: { label: 'Technical Inspection Ongoing', color: 'amber', bg: 'rgba(245, 158, 11, 0.12)', text: '#f59e0b' },
  OFFER_READY: { label: 'Inspection Complete - Offer Ready', color: 'emerald', bg: 'rgba(16, 185, 129, 0.15)', text: '#059669' },
  VERIFICATION_PENDING: { label: 'Pickup Scheduled', color: 'purple', bg: 'rgba(147, 51, 234, 0.12)', text: '#9333ea' },
  VERIFIED: { label: 'Physical Inspection Passed', color: 'green', bg: 'rgba(16, 185, 129, 0.12)', text: '#10b981' },
  REJECTED: { label: 'Inspection Rejected', color: 'red', bg: 'rgba(239, 68, 68, 0.12)', text: '#ef4444' },
  VALUED: { label: 'Resale Valuation Complete', color: 'cyan', bg: 'rgba(6, 182, 212, 0.12)', text: '#06b6d4' },
  PAYOUT_PENDING: { label: 'Payout Processing', color: 'amber', bg: 'rgba(245, 158, 11, 0.12)', text: '#f59e0b' },
  PAID: { label: 'Seller Paid Out', color: 'emerald', bg: 'rgba(5, 150, 105, 0.12)', text: '#059669' },
  LISTED: { label: 'Listed as USED_VERIFIED', color: 'indigo', bg: 'rgba(99, 102, 241, 0.12)', text: '#6366f1' },
  SOLD: { label: 'Sold to Buyer', color: 'teal', bg: 'rgba(13, 148, 136, 0.12)', text: '#0d9488' },
  CANCELLED: { label: 'Listing Cancelled', color: 'gray', bg: 'rgba(156, 163, 175, 0.15)', text: '#9ca3af' },
};

const calculateEstimatedValuation = (price, condition) => {
  const p = Number(price) || 0;
  if (p <= 0) return 0;
  let mult = 0.75;
  if (condition === 'LIKE_NEW' || condition === 'EXCELLENT') mult = 0.85;
  else if (condition === 'GOOD' || condition === 'VERY_GOOD') mult = 0.78;
  else if (condition === 'FAIR') mult = 0.65;
  else if (condition === 'FOR_PARTS') mult = 0.5;
  return Math.round(p * mult);
};

const SellUsedPartPage = () => {
  const { vehicles } = useVehicle();
  const fileInputRef = useRef(null);

  // Tabs: 'sell' | 'my-listings' | 'explore'
  const [activeTab, setActiveTab] = useState('sell');

  // Form State
  const [formData, setFormData] = useState({
    title: '',
    vehicleModel: '',
    vehicleId: '',
    partNumber: '',
    category: 'LIGHTING',
    condition: 'EXCELLENT',
    purchaseAge: '1-2 Years',
    expectedPrice: '',
    description: '',
    location: '',
    pickupAddress: '',
    assignedShopId: '',
    handoverMethod: 'DROPOFF', // 'DROPOFF' | 'PICKUP'
    payoutMethod: 'UPI',
    payoutUpiId: '',
    payoutBankAccount: '',
    images: [],
  });

  // Partner Garages
  const [partnerGarages, setPartnerGarages] = useState([]);
  const [loadingGarages, setLoadingGarages] = useState(false);

  // Photo Upload State
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Customer Listings State
  const [myListings, setMyListings] = useState([]);
  const [loadingMyListings, setLoadingMyListings] = useState(false);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [respondingOfferId, setRespondingOfferId] = useState(null);

  // Public Marketplace State
  const [exploreListings, setExploreListings] = useState([]);
  const [loadingExplore, setLoadingExplore] = useState(false);
  const [exploreSearch, setExploreSearch] = useState('');
  const [exploreCategory, setExploreCategory] = useState('ALL');

  // Modal State for Lifecycle Tracking
  const [selectedListing, setSelectedListing] = useState(null);
  const [isTrackerOpen, setIsTrackerOpen] = useState(false);

  // Cancellation Modal State
  const [listingToCancel, setListingToCancel] = useState(null);
  const [cancelReason, setCancelReason] = useState('');
  const [isCancelling, setIsCancelling] = useState(false);

  // Fetch partner garages
  const fetchPartnerGarages = useCallback(async () => {
    setLoadingGarages(true);
    try {
      const res = await usedPartsService.getPartnerGarages();
      if (res.data?.data) {
        setPartnerGarages(res.data.data);
        if (res.data.data.length > 0) {
          setFormData((prev) => ({
            ...prev,
            assignedShopId: prev.assignedShopId || res.data.data[0].id,
          }));
        }
      }
    } catch (err) {
      console.warn('Could not load partner garages:', err);
    } finally {
      setLoadingGarages(false);
    }
  }, []);

  // Fetch customer's own listings
  const fetchMyListings = useCallback(async () => {
    setLoadingMyListings(true);
    try {
      const res = await usedPartsService.getMyListings();
      if (res.data?.data) {
        setMyListings(res.data.data);
      }
    } catch (err) {
      console.warn('Could not fetch user listings:', err);
    } finally {
      setLoadingMyListings(false);
    }
  }, []);

  // Fetch verified marketplace listings
  const fetchExploreListings = useCallback(async () => {
    setLoadingExplore(true);
    try {
      const res = await usedPartsService.listUsedParts({
        search: exploreSearch || undefined,
        category: exploreCategory !== 'ALL' ? exploreCategory : undefined,
      });
      if (res.data?.data?.listings) {
        setExploreListings(res.data.data.listings);
      } else if (Array.isArray(res.data?.data)) {
        setExploreListings(res.data.data);
      }
    } catch (err) {
      console.warn('Could not fetch explore listings:', err);
    } finally {
      setLoadingExplore(false);
    }
  }, [exploreSearch, exploreCategory]);

  useEffect(() => {
    document.title = 'Sell Used Parts & Salvage | PartNexa Circular Marketplace';
    fetchPartnerGarages();
    fetchMyListings();
    fetchExploreListings();
  }, [fetchPartnerGarages, fetchMyListings, fetchExploreListings]);

  // Handle Offer Decision (Accept / Decline)
  const handleOfferDecision = async (listingId, decision) => {
    setRespondingOfferId(listingId);
    try {
      await usedPartsService.respondToOffer(listingId, decision);
      if (decision === 'ACCEPTED') {
        toast.success('Inspection offer accepted! Payout initiated and part listed as USED_VERIFIED on Marketplace.');
      } else {
        toast.info('Inspection offer declined. Garage has been notified for part return.');
      }
      await fetchMyListings();
      await fetchExploreListings();
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to record decision.';
      toast.error(msg);
    } finally {
      setRespondingOfferId(null);
    }
  };

  // Pre-fill primary vehicle if available
  useEffect(() => {
    if (vehicles && vehicles.length > 0 && !formData.vehicleModel) {
      const primary = vehicles.find((v) => v.isPrimary) || vehicles[0];
      const modelStr = `${primary.make} ${primary.model} ${primary.year || ''} ${primary.variant || ''}`.trim();
      setFormData((prev) => ({
        ...prev,
        vehicleModel: modelStr,
        vehicleId: primary.id,
      }));
    }
  }, [vehicles, formData.vehicleModel]);

  // Photo Upload Handler (Multipart to backend)
  const handlePhotoUpload = async (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    if (formData.images.length + files.length > 6) {
      toast.error('Maximum 6 photos permitted per used part listing.');
      return;
    }

    // Validate size & format client-side before sending
    for (const f of files) {
      if (f.size > 5 * 1024 * 1024) {
        toast.error(`"${f.name}" exceeds maximum allowed file size of 5MB.`);
        return;
      }
      if (!['image/jpeg', 'image/png', 'image/webp'].includes(f.type)) {
        toast.error(`"${f.name}" is not a supported format (JPEG, PNG, WebP only).`);
        return;
      }
    }

    const uploadData = new FormData();
    files.forEach((file) => {
      uploadData.append('photos', file);
    });

    setIsUploading(true);
    setUploadError('');

    try {
      const res = await usedPartsService.uploadPhotos(uploadData);
      const uploadedFiles = res.data?.data?.files || [];
      const newUrls = uploadedFiles.map((item) => item.url);

      setFormData((prev) => ({
        ...prev,
        images: [...prev.images, ...newUrls],
      }));
      toast.success(`${uploadedFiles.length} photo(s) uploaded successfully!`);
    } catch (err) {
      const msg = err.response?.data?.message || 'Photo upload failed. Please try again.';
      setUploadError(msg);
      toast.error(msg);
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleRemovePhoto = (index) => {
    setFormData((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }));
  };

  const handleAddSamplePhotos = () => {
    setFormData((prev) => ({
      ...prev,
      images: Array.from(new Set([...prev.images, ...SAMPLE_PART_PHOTOS])).slice(0, 6),
    }));
    toast.success('Sample high-resolution part photos added!');
  };

  // Form Submit Handler
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.title || formData.title.trim().length < 3) {
      toast.error('Please provide a valid part name (minimum 3 characters).');
      return;
    }
    if (!formData.vehicleModel || formData.vehicleModel.trim().length < 2) {
      toast.error('Please specify vehicle compatibility (Make, Model, and Year).');
      return;
    }
    if (!formData.expectedPrice || Number(formData.expectedPrice) <= 0) {
      toast.error('Please enter a valid expected price in ₹.');
      return;
    }
    if (!formData.description || formData.description.trim().length < 10) {
      toast.error('Please write a detailed description (minimum 10 characters).');
      return;
    }
    if (!formData.location || formData.location.trim().length < 2) {
      toast.error('Please provide your pickup location/city for courier verification.');
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        title: formData.title.trim(),
        vehicleModel: formData.vehicleModel.trim(),
        vehicleId: formData.vehicleId || undefined,
        partNumber: formData.partNumber?.trim() || undefined,
        category: formData.category,
        condition: formData.condition,
        purchaseAge: formData.purchaseAge,
        expectedPrice: Number(formData.expectedPrice),
        description: formData.description.trim(),
        images: formData.images.length > 0 ? formData.images : SAMPLE_PART_PHOTOS.slice(0, 2),
        location: formData.location.trim(),
        pickupAddress: formData.pickupAddress?.trim() || formData.location.trim(),
        assignedShopId: formData.assignedShopId || (partnerGarages[0]?.id) || undefined,
        handoverMethod: formData.handoverMethod || 'DROPOFF',
        payoutMethod: formData.payoutMethod,
        payoutUpiId: formData.payoutUpiId?.trim() || undefined,
        payoutBankAccount: formData.payoutBankAccount?.trim() || undefined,
      };

      await usedPartsService.createListing(payload);
      toast.success('Used-part listing submitted! Assigned to partner garage for technical inspection.');

      // Refresh listings
      await fetchMyListings();

      // Reset form
      setFormData({
        title: '',
        vehicleModel: '',
        vehicleId: '',
        partNumber: '',
        category: 'LIGHTING',
        condition: 'EXCELLENT',
        purchaseAge: '1-2 Years',
        expectedPrice: '',
        description: '',
        location: '',
        pickupAddress: '',
        assignedShopId: partnerGarages[0]?.id || '',
        handoverMethod: 'DROPOFF',
        payoutMethod: 'UPI',
        payoutUpiId: '',
        payoutBankAccount: '',
        images: [],
      });

      // Switch to My Listings tab so user sees their new listing immediately
      setActiveTab('my-listings');
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to submit listing. Please try again.';
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Cancellation Handler
  const handleConfirmCancel = async () => {
    if (!listingToCancel) return;
    setIsCancelling(true);
    try {
      await usedPartsService.cancelListing(listingToCancel.id, { reason: cancelReason });
      toast.success('Listing cancelled successfully.');
      setListingToCancel(null);
      setCancelReason('');
      await fetchMyListings();
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to cancel listing.';
      toast.error(msg);
    } finally {
      setIsCancelling(false);
    }
  };

  // Filtered listings
  const filteredMyListings = myListings.filter((item) => {
    if (statusFilter === 'ALL') return true;
    return item.status === statusFilter;
  });

  // Calculate live estimate for current form inputs
  const currentEstimate = calculateEstimatedValuation(formData.expectedPrice, formData.condition);

  // Status Metrics
  const totalSubmissions = myListings.length;
  const inVerificationCount = myListings.filter((i) =>
    ['SUBMITTED', 'VERIFICATION_PENDING', 'VERIFIED'].includes(i.status)
  ).length;
  const totalValuation = myListings.reduce((sum, i) => sum + (i.finalValuation || i.estimatedValuation || 0), 0);
  const totalPaidOut = myListings
    .filter((i) => i.payoutStatus === 'PAID')
    .reduce((sum, i) => sum + (i.payoutAmount || i.finalValuation || 0), 0);

  // Helper for lifecycle progress in modal
  const getLifecycleStepState = (listing, stepNumber) => {
    const status = listing.status;
    if (status === 'CANCELLED') {
      if (stepNumber <= 2) return 'completed';
      return 'cancelled';
    }
    if (status === 'REJECTED') {
      if (stepNumber <= 5) return 'completed';
      if (stepNumber === 6) return 'rejected';
      return 'pending';
    }

    const stepWeights = {
      SUBMITTED: 2,
      VERIFICATION_PENDING: 3,
      VERIFIED: 5,
      VALUED: 7,
      PAYOUT_PENDING: 8,
      PAID: 8,
      LISTED: 9,
      SOLD: 10,
    };

    const currentWeight = stepWeights[status] || 2;
    if (stepNumber < currentWeight) return 'completed';
    if (stepNumber === currentWeight) return 'current';
    return 'pending';
  };

  return (
    <div className="sell-used-page">
      {/* Hero Banner */}
      <section className="sell-hero">
        <div className="container">
          <div className="sell-hero-badge" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
            <span className="badge-icon" style={{ display: 'inline-flex', alignItems: 'center' }}><Recycle size={14} strokeWidth={1.75} /></span> PartNexa Circular Marketplace
          </div>
          <h1 className="sell-hero-title">Sell Your Genuine Used Auto Parts</h1>
          <p className="sell-hero-desc">
            Turn unused genuine parts, upgrades, or salvage spares into fast bank payouts.
            We schedule doorstep courier pickup, certified garage inspection, condition grading, and guaranteed payouts.
          </p>

          {/* Navigation Tabs */}
          <div className="marketplace-nav-tabs">
            <button
              className={`nav-tab-btn ${activeTab === 'sell' ? 'active' : ''}`}
              onClick={() => setActiveTab('sell')}
              id="tab-sell-btn"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
            >
              <FileEdit size={16} strokeWidth={1.75} /> Sell a Part
            </button>
            <button
              className={`nav-tab-btn ${activeTab === 'my-listings' ? 'active' : ''}`}
              onClick={() => setActiveTab('my-listings')}
              id="tab-my-listings-btn"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
            >
              <ClipboardList size={16} strokeWidth={1.75} /> My Listings & Payouts
              {myListings.length > 0 && <span className="tab-counter-badge">{myListings.length}</span>}
            </button>
            <button
              className={`nav-tab-btn ${activeTab === 'explore' ? 'active' : ''}`}
              onClick={() => setActiveTab('explore')}
              id="tab-explore-btn"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
            >
              <ShoppingCart size={16} strokeWidth={1.75} /> Verified Parts Marketplace
            </button>
          </div>
        </div>
      </section>

      <div className="container">
        {/* ==================================================================== */}
        {/* TAB 1: SELL A USED PART FORM                                         */}
        {/* ==================================================================== */}
        {activeTab === 'sell' && (
          <div className="sell-content-grid">
            {/* Left: Form */}
            <div className="sell-form-card">
              <div className="form-card-header">
                <div>
                  <h2 className="form-title">Create Used-Part Listing</h2>
                  <p className="form-subtitle">
                    Submit accurate details and clear photos for swift doorstep pickup & verification.
                  </p>
                </div>
                <div className="step-count-badge">Phase 1: Verification Flow</div>
              </div>

              <form onSubmit={handleSubmit} className="used-parts-form">
                {/* Section 1: Part & Vehicle Identification */}
                <div className="form-section">
                  <h3 className="section-header">1. Component & Vehicle Specifications</h3>

                  <div className="form-row">
                    <div className="form-group full-width">
                      <label className="input-label required">Part Name / Component Title</label>
                      <input
                        type="text"
                        className="custom-input"
                        placeholder="e.g. OEM LED Headlight Assembly (Right), ByBre Brake Caliper Pair"
                        value={formData.title}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        required
                        id="part-title-input"
                      />
                    </div>
                  </div>

                  <div className="form-row two-cols">
                    <div className="form-group">
                      <label className="input-label required">Vehicle Compatibility</label>
                      <input
                        type="text"
                        className="custom-input"
                        placeholder="e.g. Hyundai Creta 2018-2020 1.6L Diesel"
                        value={formData.vehicleModel}
                        onChange={(e) => setFormData({ ...formData, vehicleModel: e.target.value })}
                        required
                        id="vehicle-model-input"
                      />
                      {vehicles && vehicles.length > 0 && (
                        <div className="garage-quick-picks">
                          <span className="quick-label">Garage Quick-Pick:</span>
                          {vehicles.slice(0, 2).map((v) => (
                            <button
                              type="button"
                              key={v.id}
                              className="garage-chip"
                              onClick={() =>
                                setFormData({
                                  ...formData,
                                  vehicleModel: `${v.make} ${v.model} ${v.year || ''} ${v.variant || ''}`.trim(),
                                  vehicleId: v.id,
                                })
                              }
                              style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                            >
                              <Car size={14} strokeWidth={1.75} /> {v.make} {v.model}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="form-group">
                      <label className="input-label">Part Number / OEM SKU (If known)</label>
                      <input
                        type="text"
                        className="custom-input"
                        placeholder="e.g. 92102-M6000 or Bosch 0986AB234"
                        value={formData.partNumber}
                        onChange={(e) => setFormData({ ...formData, partNumber: e.target.value })}
                        id="part-number-input"
                      />
                    </div>
                  </div>

                  <div className="form-row two-cols">
                    <div className="form-group">
                      <label className="input-label">Part Category</label>
                      <select
                        className="custom-select"
                        value={formData.category}
                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                        id="category-select"
                      >
                        {CATEGORY_OPTIONS.map((opt) => (
                          <option key={opt.value} value={opt.value}>
                            {opt.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="form-group">
                      <label className="input-label">Purchase Age / Operating Life</label>
                      <select
                        className="custom-select"
                        value={formData.purchaseAge}
                        onChange={(e) => setFormData({ ...formData, purchaseAge: e.target.value })}
                        id="purchase-age-select"
                      >
                        {AGE_OPTIONS.map((opt) => (
                          <option key={opt.value} value={opt.value}>
                            {opt.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                {/* Section 2: Condition & Description */}
                <div className="form-section">
                  <h3 className="section-header">2. Condition & History</h3>

                  <div className="form-row">
                    <div className="form-group full-width">
                      <label className="input-label required">Declared Condition</label>
                      <select
                        className="custom-select"
                        value={formData.condition}
                        onChange={(e) => setFormData({ ...formData, condition: e.target.value })}
                        id="condition-select"
                      >
                        {CONDITION_OPTIONS.map((opt) => (
                          <option key={opt.value} value={opt.value}>
                            {opt.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="form-row">
                    <div className="form-group full-width">
                      <div className="label-with-hint">
                        <label className="input-label required">Component Description & Reason for Sale</label>
                        <span className="char-hint">{formData.description.length} chars (min 10)</span>
                      </div>
                      <textarea
                        className="custom-textarea"
                        rows={4}
                        placeholder="Detail functional condition, reason for removal (e.g. upgraded to aftermarket lights, salvage vehicle recovery), known blemishes, and mounting bracket integrity..."
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        required
                        id="description-textarea"
                      />
                    </div>
                  </div>
                </div>

                {/* Section 3: Verified Partner Garage & Handover Method */}
                <div className="form-section">
                  <h3 className="section-header">3. Choose Verified Partner Garage & Handover Method</h3>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '14px' }}>
                    PartNexa operates a garage-first resale process: every component is physically received and technically tested by a certified workshop technician before an official resale offer is issued.
                  </p>

                  <div className="form-row">
                    <div className="form-group full-width">
                      <label className="input-label required">Select Partner Garage for Technical Inspection</label>
                      <div className="garages-selection-grid">
                        {loadingGarages ? (
                          <div style={{ padding: '12px', color: 'var(--text-muted)' }}>Loading verified partner garages...</div>
                        ) : partnerGarages.length === 0 ? (
                          <div style={{ padding: '12px', color: 'var(--text-muted)' }}>No garages found in local area. Hub will auto-assign.</div>
                        ) : (
                          partnerGarages.map((garage) => {
                            const isSelected = formData.assignedShopId === garage.id;
                            return (
                              <div
                                key={garage.id}
                                className={`garage-option-card ${isSelected ? 'selected' : ''}`}
                                onClick={() => setFormData({ ...formData, assignedShopId: garage.id })}
                              >
                                <div className="garage-card-top">
                                  <div className="garage-avatar"><Wrench size={18} strokeWidth={1.75} /></div>
                                  <div className="garage-meta-info">
                                    <h4 className="garage-name">{garage.shopName}</h4>
                                    <div className="garage-address" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                                      <MapPin size={13} strokeWidth={1.75} /> {garage.address}, {garage.city || 'Hub'}
                                    </div>
                                  </div>
                                  <div className="garage-radio-indicator">
                                    {isSelected ? (
                                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                                        <Check size={14} strokeWidth={2} /> Selected
                                      </span>
                                    ) : 'Choose'}
                                  </div>
                                </div>
                                <div className="garage-badges-row">
                                  <span className="garage-verified-pill" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                                    <Star size={12} strokeWidth={2} fill="currentColor" /> Verified Partner
                                  </span>
                                  {garage.rating && (
                                    <span className="garage-rating-pill" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                                      <Star size={12} strokeWidth={2} fill="currentColor" /> {garage.rating}
                                    </span>
                                  )}
                                  {garage.phone && (
                                    <span className="garage-phone-pill" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                                      <Phone size={12} strokeWidth={1.75} /> {garage.phone}
                                    </span>
                                  )}
                                </div>
                              </div>
                            );
                          })
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="form-row" style={{ marginTop: '16px' }}>
                    <div className="form-group full-width">
                      <label className="input-label required">Handover Method</label>
                      <div className="handover-toggle-group">
                        <label className={`handover-btn ${formData.handoverMethod === 'DROPOFF' ? 'active' : ''}`}>
                          <input
                            type="radio"
                            name="handoverMethod"
                            value="DROPOFF"
                            checked={formData.handoverMethod === 'DROPOFF'}
                            onChange={() => setFormData({ ...formData, handoverMethod: 'DROPOFF' })}
                            style={{ display: 'none' }}
                          />
                          <span className="handover-icon" style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Store size={22} strokeWidth={1.75} />
                          </span>
                          <div>
                            <strong>Drop Off at Garage</strong>
                            <div className="handover-sub">Deliver directly to selected workshop for same-day inspection</div>
                          </div>
                        </label>

                        <label className={`handover-btn ${formData.handoverMethod === 'PICKUP' ? 'active' : ''}`}>
                          <input
                            type="radio"
                            name="handoverMethod"
                            value="PICKUP"
                            checked={formData.handoverMethod === 'PICKUP'}
                            onChange={() => setFormData({ ...formData, handoverMethod: 'PICKUP' })}
                            style={{ display: 'none' }}
                          />
                          <span className="handover-icon" style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Truck size={22} strokeWidth={1.75} />
                          </span>
                          <div>
                            <strong>Request Pickup to Garage</strong>
                            <div className="handover-sub">PartNexa courier collects component and transfers it to the garage</div>
                          </div>
                        </label>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Section 4: Pricing & Instant Valuation Estimator */}
                <div className="form-section">
                  <h3 className="section-header">4. Expected Price & Valuation</h3>

                  <div className="form-row two-cols">
                    <div className="form-group">
                      <label className="input-label required">Your Expected Price (₹)</label>
                      <div className="input-with-icon">
                        <span className="currency-prefix">₹</span>
                        <input
                          type="number"
                          className="custom-input with-prefix"
                          placeholder="e.g. 3500"
                          min="100"
                          step="50"
                          value={formData.expectedPrice}
                          onChange={(e) => setFormData({ ...formData, expectedPrice: e.target.value })}
                          required
                          id="expected-price-input"
                        />
                      </div>
                    </div>

                    {/* Live Valuation Card */}
                    <div className="live-valuation-card">
                      <div className="valuation-card-header" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span className="val-icon" style={{ display: 'inline-flex', alignItems: 'center' }}><Zap size={16} strokeWidth={2} /></span>
                        <span className="val-title">Instant Valuation Estimate</span>
                      </div>
                      <div className="val-amount">
                        ₹{currentEstimate.toLocaleString('en-IN')}
                        <span className="val-sub">estimated payout</span>
                      </div>
                      <div className="val-note">
                        Based on {formData.condition.replace(/_/g, ' ')} condition grade formula. Final valuation
                        locked upon physical garage verification.
                      </div>
                    </div>
                  </div>
                </div>

                {/* Section 5: Secure Photo Upload Dropzone */}
                <div className="form-section">
                  <div className="section-header-flex">
                    <h3 className="section-header">5. Part Photos (Up to 6 Images)</h3>
                    <button
                      type="button"
                      className="sample-photos-btn"
                      onClick={handleAddSamplePhotos}
                      title="Quickly fill sample photos for testing"
                    >
                      + Add Demo Photos
                    </button>
                  </div>

                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handlePhotoUpload}
                    multiple
                    accept="image/jpeg,image/png,image/webp"
                    style={{ display: 'none' }}
                    id="photo-file-input"
                  />

                  <div
                    className="photo-dropzone"
                    onClick={() => fileInputRef.current && fileInputRef.current.click()}
                  >
                    <div className="dropzone-icon" style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Camera size={36} strokeWidth={1.5} />
                    </div>
                    <div className="dropzone-main-text">
                      {isUploading ? 'Uploading photos securely...' : 'Click or drop part photos here'}
                    </div>
                    <div className="dropzone-sub-text">
                      Supported: JPEG, PNG, WebP • Max 5MB per file • Up to 6 photos (Front, Back, Part Label &
                      Connectors)
                    </div>
                  </div>

                  {uploadError && (
                    <div className="upload-error-banner" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                      <AlertTriangle size={16} strokeWidth={1.75} /> {uploadError}
                    </div>
                  )}

                  {/* Thumbnail Gallery */}
                  {formData.images.length > 0 && (
                    <div className="thumbnails-grid">
                      {formData.images.map((imgUrl, idx) => (
                        <div key={idx} className="photo-thumb-card">
                          <img
                            src={imgUrl.startsWith('http') ? imgUrl : `${import.meta.env.VITE_API_URL?.replace('/api','') || (window.location.hostname === 'localhost' ? 'http://localhost:5000' : 'https://partnexa-api-wed5.onrender.com')}${imgUrl}`}
                            alt={`Part photo ${idx + 1}`}
                            className="thumb-img"
                            onError={(e) => {
                              e.target.src =
                                'https://images.unsplash.com/photo-1517524008697-84bbe3c3fd98?w=600&auto=format&fit=crop&q=80';
                            }}
                          />
                          <button
                            type="button"
                            className="thumb-remove-btn"
                            onClick={() => handleRemovePhoto(idx)}
                            title="Remove photo"
                            style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}
                          >
                            <X size={14} strokeWidth={2} />
                          </button>
                          <div className="thumb-index-tag">Photo {idx + 1}</div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Section 6: Pickup Location & Payout Method */}
                <div className="form-section">
                  <h3 className="section-header">6. Logistics Location & Payout Method</h3>

                  <div className="form-row two-cols">
                    <div className="form-group">
                      <label className="input-label required">Pickup City / Area</label>
                      <input
                        type="text"
                        className="custom-input"
                        placeholder="e.g. Bengaluru, Karnataka - 560038"
                        value={formData.location}
                        onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                        required
                        id="location-input"
                      />
                    </div>

                    <div className="form-group">
                      <label className="input-label">Detailed Pickup Address</label>
                      <input
                        type="text"
                        className="custom-input"
                        placeholder="e.g. #42, 3rd Cross, Indiranagar"
                        value={formData.pickupAddress}
                        onChange={(e) => setFormData({ ...formData, pickupAddress: e.target.value })}
                        id="pickup-address-input"
                      />
                    </div>
                  </div>

                  <div className="form-row two-cols">
                    <div className="form-group">
                      <label className="input-label">Payout Method</label>
                      <select
                        className="custom-select"
                        value={formData.payoutMethod}
                        onChange={(e) => setFormData({ ...formData, payoutMethod: e.target.value })}
                        id="payout-method-select"
                      >
                        <option value="UPI">UPI Transfer (Instant)</option>
                        <option value="BANK_TRANSFER">Direct Bank NEFT / IMPS</option>
                      </select>
                    </div>

                    <div className="form-group">
                      <label className="input-label">
                        {formData.payoutMethod === 'UPI' ? 'UPI VPA ID' : 'Bank Account / IFSC'}
                      </label>
                      <input
                        type="text"
                        className="custom-input"
                        placeholder={
                          formData.payoutMethod === 'UPI'
                            ? 'e.g. seller@okhdfcbank'
                            : 'e.g. HDFC0001234 - 5010023489123'
                        }
                        value={formData.payoutUpiId}
                        onChange={(e) => setFormData({ ...formData, payoutUpiId: e.target.value })}
                        id="payout-identifier-input"
                      />
                    </div>
                  </div>
                </div>

                {/* Submit button */}
                <div className="form-actions">
                  <Button
                    type="submit"
                    variant="teal"
                    size="lg"
                    fullWidth
                    loading={isSubmitting}
                    id="submit-used-part-btn"
                  >
                    Submit Listing for Doorstep Verification
                  </Button>
                  <p className="submission-disclaimer" style={{ display: 'flex', alignItems: 'flex-start', gap: '6px' }}>
                    <Lock size={15} strokeWidth={1.75} style={{ flexShrink: 0, marginTop: '2px' }} />
                    <span>
                      PartNexa verifies authenticity and condition grade upon physical technician inspection.
                      Payment is dispatched directly to your payout account once approved.
                    </span>
                  </p>
                </div>
              </form>
            </div>

            {/* Right: Flow & Circular Information */}
            <div className="sell-info-sidebar">
              {/* Circular Marketplace Flow Card */}
              <div className="sidebar-card flow-card">
                <h3 className="sidebar-card-title">10-Step Circular Lifecycle</h3>
                <div className="flow-steps-mini">
                  <div className="flow-step-mini active">
                    <div className="step-mini-num">1</div>
                    <div className="step-mini-body">
                      <strong>Customer Creates Listing</strong>
                      <span>Specifies vehicle, part, expected price & photos</span>
                    </div>
                  </div>
                  <div className="flow-step-mini">
                    <div className="step-mini-num">2</div>
                    <div className="step-mini-body">
                      <strong>Submitted for Verification</strong>
                      <span>Assigned to regional verification hub</span>
                    </div>
                  </div>
                  <div className="flow-step-mini">
                    <div className="step-mini-num">3</div>
                    <div className="step-mini-body">
                      <strong>Delivery Partner Pickup</strong>
                      <span>Courier collects part from your doorstep</span>
                    </div>
                  </div>
                  <div className="flow-step-mini">
                    <div className="step-mini-num">4</div>
                    <div className="step-mini-body">
                      <strong>Physical Verification</strong>
                      <span>Garage technician tests electricals & fitment</span>
                    </div>
                  </div>
                  <div className="flow-step-mini">
                    <div className="step-mini-num">5</div>
                    <div className="step-mini-body">
                      <strong>Condition Grade Awarded</strong>
                      <span>Grade A+, A, B, or C based on diagnostics</span>
                    </div>
                  </div>
                  <div className="flow-step-mini">
                    <div className="step-mini-num">6</div>
                    <div className="step-mini-body">
                      <strong>Approved or Rejected</strong>
                      <span>Clear pass/fail criteria & transparent reports</span>
                    </div>
                  </div>
                  <div className="flow-step-mini">
                    <div className="step-mini-num">7</div>
                    <div className="step-mini-body">
                      <strong>Final Valuation Locked</strong>
                      <span>Payout value confirmed with seller</span>
                    </div>
                  </div>
                  <div className="flow-step-mini">
                    <div className="step-mini-num">8</div>
                    <div className="step-mini-body">
                      <strong>Seller Payout Dispatched</strong>
                      <span>Direct transfer to UPI or Bank Account</span>
                    </div>
                  </div>
                  <div className="flow-step-mini">
                    <div className="step-mini-num">9</div>
                    <div className="step-mini-body">
                      <strong>Partner Shop Receives Part</strong>
                      <span>Stocked with certified warranty seal</span>
                    </div>
                  </div>
                  <div className="flow-step-mini">
                    <div className="step-mini-num">10</div>
                    <div className="step-mini-body">
                      <strong>Re-listed & Buyer Purchases</strong>
                      <span>Extending the lifecycle of automotive hardware</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Trust & Guarantee Card */}
              <div className="sidebar-card trust-card">
                <div className="trust-icon" style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
                  <ShieldCheck size={28} strokeWidth={1.75} />
                </div>
                <h4>Zero Hassle, Guaranteed Payout</h4>
                <p>
                  No haggling with random buyers or meeting strangers. PartNexa technicians handle testing, packaging,
                  and fulfillment while you get paid directly to your bank account.
                </p>
              </div>

              {/* Circular Sustainability Impact */}
              <div className="sidebar-card eco-card">
                <div className="eco-header" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span className="eco-icon" style={{ display: 'inline-flex', alignItems: 'center' }}><Leaf size={20} strokeWidth={1.75} /></span>
                  <h4>Environmental Footprint</h4>
                </div>
                <p>
                  Each reused OEM automotive part avoids an average of <strong>16.4 kg of CO₂ emissions</strong> and
                  reduces landfill scrap steel in our communities.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* ==================================================================== */}
        {/* TAB 2: MY LISTINGS & PAYOUTS (HISTORY & LIFECYCLE)                   */}
        {/* ==================================================================== */}
        {activeTab === 'my-listings' && (
          <div className="my-listings-view">
            {/* Metrics Ribbon */}
            <div className="metrics-ribbon">
              <div className="metric-tile">
                <span className="metric-label">Total Submissions</span>
                <span className="metric-value">{totalSubmissions}</span>
                <span className="metric-sub">Listed auto components</span>
              </div>
              <div className="metric-tile">
                <span className="metric-label">In Verification</span>
                <span className="metric-value" style={{ color: '#0284c7' }}>
                  {inVerificationCount}
                </span>
                <span className="metric-sub">Pickup & inspection queue</span>
              </div>
              <div className="metric-tile">
                <span className="metric-label">Total Valuation</span>
                <span className="metric-value" style={{ color: '#9333ea' }}>
                  ₹{totalValuation.toLocaleString('en-IN')}
                </span>
                <span className="metric-sub">Estimated & locked</span>
              </div>
              <div className="metric-tile">
                <span className="metric-label">Total Paid Out</span>
                <span className="metric-value" style={{ color: '#059669' }}>
                  ₹{totalPaidOut.toLocaleString('en-IN')}
                </span>
                <span className="metric-sub">Credited to seller</span>
              </div>
            </div>

            {/* Filter Pills */}
            <div className="listings-filter-bar">
              <div className="filter-pills-group">
                {[
                  { id: 'ALL', label: 'All Listings' },
                  { id: 'SUBMITTED', label: 'Submitted' },
                  { id: 'VERIFICATION_PENDING', label: 'In Verification' },
                  { id: 'VALUED', label: 'Valued' },
                  { id: 'PAID', label: 'Paid Out' },
                  { id: 'LISTED', label: 'Re-listed' },
                  { id: 'CANCELLED', label: 'Cancelled' },
                ].map((pill) => (
                  <button
                    key={pill.id}
                    className={`filter-pill ${statusFilter === pill.id ? 'active' : ''}`}
                    onClick={() => setStatusFilter(pill.id)}
                  >
                    {pill.label}
                  </button>
                ))}
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={fetchMyListings}
                loading={loadingMyListings}
                style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
              >
                <RefreshCw size={14} strokeWidth={1.75} /> Refresh
              </Button>
            </div>

            {/* Listings Grid / Table */}
            {loadingMyListings ? (
              <div className="loading-state-card">
                <div className="spinner"></div>
                <p>Loading your used-part listings & verification records...</p>
              </div>
            ) : filteredMyListings.length === 0 ? (
              <div className="empty-listings-box">
                <div className="empty-icon" style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Package size={40} strokeWidth={1.5} />
                </div>
                <h3>No Listings Found</h3>
                <p>
                  {statusFilter !== 'ALL'
                    ? `You don't have any listings with status "${statusFilter}".`
                    : 'You have not submitted any used parts for verification yet.'}
                </p>
                <Button variant="teal" onClick={() => setActiveTab('sell')}>
                  + Submit Your First Part
                </Button>
              </div>
            ) : (
              <div className="customer-listings-grid">
                {filteredMyListings.map((listing) => {
                  const cfg = STATUS_CONFIG[listing.status] || STATUS_CONFIG.SUBMITTED;
                  const firstImg =
                    Array.isArray(listing.images) && listing.images.length > 0
                      ? listing.images[0].startsWith('http')
                        ? listing.images[0]
                        : `${import.meta.env.VITE_API_URL?.replace('/api','') || (window.location.hostname === 'localhost' ? 'http://localhost:5000' : 'https://partnexa-api-wed5.onrender.com')}${listing.images[0]}`
                      : 'https://images.unsplash.com/photo-1517524008697-84bbe3c3fd98?w=600&auto=format&fit=crop&q=80';

                  const canCancel = ['SUBMITTED', 'VERIFICATION_PENDING', 'DRAFT'].includes(listing.status);

                  return (
                    <div key={listing.id} className="customer-listing-card">
                      {/* Top Bar with Status Badge */}
                      <div className="listing-card-top">
                        <div className="listing-badge-wrap">
                          <span
                            className="status-pill-badge"
                            style={{ backgroundColor: cfg.bg, color: cfg.text }}
                          >
                            ● {cfg.label}
                          </span>
                          {listing.conditionGrade && (
                            <span className="grade-badge">Grade {listing.conditionGrade}</span>
                          )}
                        </div>
                        <span className="listing-id-tag">ID: {listing.id}</span>
                      </div>

                      {/* Card Body */}
                      <div className="listing-card-main">
                        <div className="listing-photo-box">
                          <img
                            src={firstImg}
                            alt={listing.title}
                            className="listing-thumb"
                            onError={(e) => {
                              e.target.src =
                                'https://images.unsplash.com/photo-1517524008697-84bbe3c3fd98?w=600&auto=format&fit=crop&q=80';
                            }}
                          />
                          {listing.images && listing.images.length > 1 && (
                            <div className="photo-count-badge">+{listing.images.length - 1} photos</div>
                          )}
                        </div>

                        <div className="listing-details-box">
                          <h4 className="listing-title">{listing.title}</h4>
                          <div className="listing-meta-row">
                            <span className="meta-item" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                              <Car size={13} strokeWidth={1.75} /> {listing.vehicleModel}
                            </span>
                            {listing.partNumber && (
                              <span className="meta-item" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                                <Hash size={13} strokeWidth={1.75} /> PN: {listing.partNumber}
                              </span>
                            )}
                            <span className="meta-item" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                              <MapPin size={13} strokeWidth={1.75} /> {listing.location}
                            </span>
                          </div>

                          <div className="listing-pricing-row">
                            <div className="price-item">
                              <span className="price-label">Expected:</span>
                              <span className="price-num">
                                ₹{(listing.expectedPrice || listing.askingPrice || 0).toLocaleString('en-IN')}
                              </span>
                            </div>
                            <div className="price-item">
                              <span className="price-label">Est. Valuation:</span>
                              <span className="price-num val">
                                ₹{(listing.estimatedValuation || 0).toLocaleString('en-IN')}
                              </span>
                            </div>
                            {listing.finalValuation && (
                              <div className="price-item final">
                                <span className="price-label">Final Valuation:</span>
                                <span className="price-num highlight">
                                  ₹{listing.finalValuation.toLocaleString('en-IN')}
                                </span>
                              </div>
                            )}
                          </div>

                          {/* Payout Information */}
                          <div className="payout-banner">
                            <div className="payout-info">
                              <span className="payout-state">
                                Payout Status: <strong>{listing.payoutStatus || 'PENDING'}</strong>
                              </span>
                              {listing.payoutTransactionRef && (
                                <span className="payout-ref">Ref: {listing.payoutTransactionRef}</span>
                              )}
                            </div>
                            {listing.payoutAmount > 0 && (
                              <span className="payout-amt">
                                ₹{listing.payoutAmount.toLocaleString('en-IN')} via {listing.payoutMethod || 'UPI'}
                              </span>
                            )}
                          </div>

                          {/* Assigned Garage & Handover Info */}
                          <div style={{ marginTop: '8px', fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                              <Store size={14} strokeWidth={1.75} /> Assigned Workshop:
                            </span> <strong>{listing.assignedShop?.shopName || listing.intake?.shop?.shopName || 'Partner Garage'}</strong>
                            {listing.handoverMethod && <span> • Handover: {listing.handoverMethod === 'DROPOFF' ? 'Drop-Off at Garage' : 'Courier Pickup'}</span>}
                          </div>
                        </div>
                      </div>

                      {/* Garage Technical Inspection & Valuation Resale Offer Card */}
                      {listing.intake && (listing.status === 'OFFER_READY' || listing.intake.recommendedListingPrice > 0 || listing.intake.customerOfferStatus || listing.status === 'VALUED' || listing.status === 'PAYOUT_PENDING' || listing.status === 'LISTED') && (
                        <div className="customer-offer-card">
                          <div className="offer-card-header">
                            <div className="offer-title-wrap">
                              <h4 style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                                <Wrench size={16} strokeWidth={1.75} /> Garage Technical Inspection Complete
                              </h4>
                              <div className="offer-garage-name">
                                Inspected by: <strong>{listing.assignedShop?.shopName || listing.intake.shop?.shopName || 'PartNexa Partner Garage'}</strong>
                                {listing.intake.inspectorName && <span> • Technician: {listing.intake.inspectorName}</span>}
                              </div>
                            </div>
                            <div className="offer-badges-right">
                              <span className="offer-grade-badge">Grade {listing.intake.overallGrade || listing.conditionGrade || 'B'}</span>
                              <span className={`offer-verdict-badge ${(listing.intake.technicalResult || 'PASSED').toLowerCase()}`}>
                                Verdict: {listing.intake.technicalResult || 'PASSED'}
                              </span>
                            </div>
                          </div>

                          {/* Technical Checkpoints Breakdown */}
                          <div className="offer-scores-grid">
                            <div className="score-chip-mini">
                              <span className="score-chip-label">Physical</span>
                              <span className="score-chip-val">{listing.intake.physicalConditionRating || 4}/5</span>
                            </div>
                            <div className="score-chip-mini">
                              <span className="score-chip-label">Functional</span>
                              <span className="score-chip-val">{listing.intake.functionalTestRating || 5}/5</span>
                            </div>
                            <div className="score-chip-mini">
                              <span className="score-chip-label">Wear Level</span>
                              <span className="score-chip-val">{listing.intake.wearLevelRating || 3}/5</span>
                            </div>
                            <div className="score-chip-mini">
                              <span className="score-chip-label">Safety</span>
                              <span className="score-chip-val">{listing.intake.safetyConfidenceRating || 5}/5</span>
                            </div>
                          </div>

                          {/* Technical Notes if any */}
                          {listing.intake.technicianNotes && (
                            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '10px', fontStyle: 'italic' }}>
                              Technician Diagnostics: "{listing.intake.technicianNotes}"
                            </div>
                          )}

                          {/* Pricing Summary */}
                          <div className="offer-pricing-summary">
                            {listing.intake.referenceNewPrice > 0 && (
                              <div className="offer-price-col">
                                <span className="offer-col-lbl">Equivalent Catalog New</span>
                                <span className="offer-col-val" style={{ color: 'var(--text-muted)' }}>
                                  ₹{listing.intake.referenceNewPrice.toLocaleString('en-IN')}
                                </span>
                              </div>
                            )}
                            <div className="offer-price-col">
                              <span className="offer-col-lbl">Recommended Resale Price</span>
                              <span className="offer-col-val">
                                ₹{(listing.intake.recommendedListingPrice || listing.finalValuation || 2799).toLocaleString('en-IN')}
                              </span>
                            </div>
                            <div className="offer-price-col highlight-payout">
                              <span className="offer-col-lbl">Expected Seller Payout</span>
                              <span className="offer-col-val payout-big">
                                ₹{(listing.intake.recommendedSellerPayout || listing.payoutAmount || 2500).toLocaleString('en-IN')}
                              </span>
                            </div>
                          </div>

                          {/* Action Buttons or Decision State */}
                          {(!listing.intake.customerOfferStatus || listing.intake.customerOfferStatus === 'PENDING') && listing.status === 'OFFER_READY' ? (
                            <div className="offer-actions-bar">
                              <span style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginRight: 'auto' }}>
                                Review the garage technical inspection report above. Choose an action:
                              </span>
                              <Button
                                variant="ghost"
                                size="sm"
                                style={{ color: '#ef4444', borderColor: '#ef4444', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                                onClick={() => handleOfferDecision(listing.id, 'DECLINED')}
                                loading={respondingOfferId === listing.id}
                                id={`decline-offer-btn-${listing.id}`}
                              >
                                <X size={14} strokeWidth={2} /> Decline Offer
                              </Button>
                              <Button
                                variant="teal"
                                size="sm"
                                onClick={() => handleOfferDecision(listing.id, 'ACCEPTED')}
                                loading={respondingOfferId === listing.id}
                                id={`accept-offer-btn-${listing.id}`}
                                style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                              >
                                <Check size={14} strokeWidth={2} /> Accept Offer (₹{(listing.intake.recommendedSellerPayout || listing.payoutAmount || 2500).toLocaleString('en-IN')})
                              </Button>
                            </div>
                          ) : listing.intake.customerOfferStatus === 'ACCEPTED' || ['PAYOUT_PENDING', 'PAID', 'LISTED', 'SOLD'].includes(listing.status) ? (
                            <div className="offer-accepted-banner" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <CheckCircle2 size={16} strokeWidth={2} style={{ flexShrink: 0 }} />
                              <span>You accepted this offer of ₹{(listing.intake.recommendedSellerPayout || listing.payoutAmount || 2500).toLocaleString('en-IN')}. Payout record created & component published on Marketplace as <strong>USED_VERIFIED</strong>!</span>
                            </div>
                          ) : (
                            <div className="offer-declined-banner" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <XCircle size={16} strokeWidth={2} style={{ flexShrink: 0 }} />
                              <span>You declined this offer. The component will be prepared for collection or return handover at {listing.assignedShop?.shopName || 'the workshop'}.</span>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Card Footer Actions */}
                      <div className="listing-card-actions">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedListing(listing);
                            setIsTrackerOpen(true);
                          }}
                          id={`track-flow-btn-${listing.id}`}
                          style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                        >
                          <Search size={14} strokeWidth={1.75} /> Track Circular Flow
                        </Button>

                        {canCancel && (
                          <Button
                            variant="ghost"
                            size="sm"
                            style={{ color: '#ef4444' }}
                            onClick={() => setListingToCancel(listing)}
                            id={`cancel-btn-${listing.id}`}
                          >
                            Cancel Listing
                          </Button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ==================================================================== */}
        {/* TAB 3: EXPLORE VERIFIED PARTS MARKETPLACE                            */}
        {/* ==================================================================== */}
        {activeTab === 'explore' && (
          <div className="explore-view">
            <div className="explore-search-bar">
              <input
                type="text"
                className="custom-input explore-search-input"
                placeholder="Search verified used parts by name, vehicle model, or part number..."
                value={exploreSearch}
                onChange={(e) => setExploreSearch(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && fetchExploreListings()}
              />
              <select
                className="custom-select category-filter"
                value={exploreCategory}
                onChange={(e) => {
                  setExploreCategory(e.target.value);
                }}
              >
                <option value="ALL">All Categories</option>
                {CATEGORY_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
              <Button variant="teal" onClick={fetchExploreListings} loading={loadingExplore}>
                Search Marketplace
              </Button>
            </div>

            {loadingExplore ? (
              <div className="loading-state-card">
                <div className="spinner"></div>
                <p>Loading verified marketplace catalog...</p>
              </div>
            ) : exploreListings.length === 0 ? (
              <div className="empty-listings-box">
                <div className="empty-icon" style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Search size={40} strokeWidth={1.5} />
                </div>
                <h3>No Verified Used Parts Found</h3>
                <p>Try clearing your search query or choosing a different category filter.</p>
              </div>
            ) : (
              <div className="explore-listings-grid">
                {exploreListings.map((item) => {
                  const img =
                    Array.isArray(item.images) && item.images.length > 0
                      ? item.images[0].startsWith('http')
                        ? item.images[0]
                        : `${import.meta.env.VITE_API_URL?.replace('/api','') || (window.location.hostname === 'localhost' ? 'http://localhost:5000' : 'https://partnexa-api-wed5.onrender.com')}${item.images[0]}`
                      : 'https://images.unsplash.com/photo-1517524008697-84bbe3c3fd98?w=600&auto=format&fit=crop&q=80';

                  const price = item.finalValuation || item.intake?.recommendedListingPrice || item.expectedPrice || item.askingPrice || item.price || 2799;

                  return (
                    <div key={item.id} className="verified-catalog-card">
                      <div className="catalog-img-wrap">
                        <img
                          src={img}
                          alt={item.title}
                          className="catalog-img"
                          onError={(e) => {
                            e.target.src =
                              'https://images.unsplash.com/photo-1517524008697-84bbe3c3fd98?w=600&auto=format&fit=crop&q=80';
                          }}
                        />
                        <div className="verified-badge-tag" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                          <ShieldCheck size={12} strokeWidth={2} /> Verified by PartNexa Partner Garage
                        </div>
                        <div className="condition-grade-tag">
                          Grade {item.conditionGrade || item.intake?.overallGrade || 'A'}
                        </div>
                      </div>

                      <div className="catalog-body">
                        <span className="catalog-condition-pill">
                          USED_VERIFIED • {item.condition?.replace(/_/g, ' ') || 'EXCELLENT'}
                        </span>
                        <h4 className="catalog-title">{item.title}</h4>
                        <div className="catalog-fitment" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                          <Car size={13} strokeWidth={1.75} /> Compatible with: {item.vehicleModel || item.compatibility}
                        </div>
                        {item.partNumber && <div className="catalog-pn">PN: {item.partNumber}</div>}
                        <div className="catalog-location" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                          <MapPin size={13} strokeWidth={1.75} /> Inspected at: {item.assignedShop?.shopName || item.intake?.shop?.shopName || item.location || 'Partner Workshop Hub'}
                        </div>
                        <div style={{ fontSize: '0.78rem', color: '#0d9488', margin: '4px 0', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                          <Check size={13} strokeWidth={2.5} /> 100% Bench & Safety Tested • Mounting points intact
                        </div>

                        <div className="catalog-footer">
                          <div className="catalog-price-wrap">
                            <span className="catalog-price">₹{Number(price).toLocaleString('en-IN')}</span>
                            <span className="guarantee-text" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                              <ShieldCheck size={12} strokeWidth={1.75} /> 30-Day PartNexa Quality Warranty
                            </span>
                          </div>
                          <Button
                            variant="teal"
                            size="sm"
                            onClick={() => {
                              toast.success('Added to cart! Buyer checkout will link in Phase 2.');
                            }}
                          >
                            Buy Part
                          </Button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>

      {/* ==================================================================== */}
      {/* LIFECYCLE TRACKER MODAL (10-STEP GARAGE-FIRST CIRCULAR FLOW)         */}
      {/* ==================================================================== */}
      {isTrackerOpen && selectedListing && (
        <Modal
          isOpen={isTrackerOpen}
          onClose={() => setIsTrackerOpen(false)}
          title="Garage-First Resale & Circular Lifecycle"
        >
          <div className="lifecycle-modal-content">
            {/* Header info */}
            <div className="modal-part-header">
              <div>
                <h3 className="modal-part-title">{selectedListing.title}</h3>
                <div className="modal-part-meta">
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                    <Car size={13} strokeWidth={1.75} /> {selectedListing.vehicleModel}
                  </span>
                  <span>ID: {selectedListing.id}</span>
                  {selectedListing.partNumber && <span>PN: {selectedListing.partNumber}</span>}
                </div>
              </div>
              <div className="modal-status-badge">
                <span
                  className="status-pill-badge"
                  style={{
                    backgroundColor: (STATUS_CONFIG[selectedListing.status] || STATUS_CONFIG.SUBMITTED).bg,
                    color: (STATUS_CONFIG[selectedListing.status] || STATUS_CONFIG.SUBMITTED).text,
                  }}
                >
                  ● {(STATUS_CONFIG[selectedListing.status] || STATUS_CONFIG.SUBMITTED).label}
                </span>
              </div>
            </div>

            {/* Valuation Summary Card */}
            <div className="modal-valuation-strip">
              <div className="val-strip-item">
                <span className="strip-label">Expected Price</span>
                <span className="strip-value">
                  ₹
                  {(
                    selectedListing.expectedPrice ||
                    selectedListing.askingPrice ||
                    0
                  ).toLocaleString('en-IN')}
                </span>
              </div>
              <div className="val-strip-item">
                <span className="strip-label">Estimated Valuation</span>
                <span className="strip-value val">
                  ₹{(selectedListing.estimatedValuation || 0).toLocaleString('en-IN')}
                </span>
              </div>
              <div className="val-strip-item">
                <span className="strip-label">Resale Listing Price</span>
                <span className="strip-value highlight">
                  {selectedListing.intake?.recommendedListingPrice || selectedListing.finalValuation
                    ? `₹${(selectedListing.intake?.recommendedListingPrice || selectedListing.finalValuation).toLocaleString('en-IN')}`
                    : 'Pending Inspection'}
                </span>
              </div>
              <div className="val-strip-item">
                <span className="strip-label">Seller Payout</span>
                <span className="strip-value payout">
                  {selectedListing.intake?.recommendedSellerPayout || selectedListing.payoutAmount
                    ? `₹${(selectedListing.intake?.recommendedSellerPayout || selectedListing.payoutAmount).toLocaleString('en-IN')}`
                    : 'Awaiting Inspection'}
                </span>
              </div>
            </div>

            {/* 10-Step Timeline */}
            <div className="lifecycle-timeline">
              {[
                {
                  step: 1,
                  title: '1. Create Used-Part Listing',
                  desc: 'Customer submits component details, vehicle compatibility, and photos.',
                  time: selectedListing.createdAt ? new Date(selectedListing.createdAt).toLocaleDateString() : 'Done',
                },
                {
                  step: 2,
                  title: '2. Partner Garage Selection & Handover',
                  desc: `Assigned to ${selectedListing.assignedShop?.shopName || 'Partner Garage'} via ${selectedListing.handoverMethod === 'DROPOFF' ? 'Drop-Off' : 'Doorstep Pickup'}.`,
                  time: 'Completed',
                },
                {
                  step: 3,
                  title: '3. Workshop Receives Physical Part',
                  desc: 'Part physically received and logged into workshop intake custody.',
                  time: ['PART_RECEIVED', 'INSPECTION_PENDING', 'OFFER_READY', 'VERIFIED', 'VALUED', 'PAYOUT_PENDING', 'PAID', 'LISTED', 'SOLD'].includes(selectedListing.status)
                    ? 'Received'
                    : 'In Transit',
                },
                {
                  step: 4,
                  title: '4. Structured Technical Inspection',
                  desc: 'Technician conducts multi-point diagnostics: Physical, Functional, Wear, Safety, Bench test & verdict.',
                  time: ['OFFER_READY', 'VERIFIED', 'VALUED', 'PAYOUT_PENDING', 'PAID', 'LISTED', 'SOLD'].includes(selectedListing.status)
                    ? 'Inspected'
                    : 'Pending',
                },
                {
                  step: 5,
                  title: '5. Backend Recommended Valuation',
                  desc: 'Catalog new reference price matched, condition multiplier applied, and seller payout computed.',
                  time: selectedListing.intake?.recommendedListingPrice ? 'Calculated' : 'Pending',
                },
                {
                  step: 6,
                  title: '6. Admin Review & Exceptions',
                  desc: 'System passes trusted garage inspections directly; admin reviews price overrides with reasons.',
                  time: 'Verified',
                },
                {
                  step: 7,
                  title: '7. Customer Receives Offer',
                  desc: `Resale offer of ₹${selectedListing.intake?.recommendedListingPrice || 2799} (Payout: ₹${selectedListing.intake?.recommendedSellerPayout || 2500}) presented to seller.`,
                  time: ['OFFER_READY', 'PAYOUT_PENDING', 'PAID', 'LISTED', 'SOLD'].includes(selectedListing.status) ? 'Offer Issued' : 'Pending',
                },
                {
                  step: 8,
                  title: '8. Customer Accepts Resale Offer',
                  desc: 'Seller confirms offer; system creates payout entitlement and moves item to cataloging.',
                  time: ['PAYOUT_PENDING', 'PAID', 'LISTED', 'SOLD'].includes(selectedListing.status) ? 'Accepted' : 'Awaiting Decision',
                },
                {
                  step: 9,
                  title: '9. Payout Initiated & Released',
                  desc: `Payout of ₹${selectedListing.payoutAmount || selectedListing.intake?.recommendedSellerPayout || 0} routed via ${selectedListing.payoutMethod || 'UPI'}.`,
                  time: selectedListing.payoutStatus === 'PAID' ? 'Transferred' : 'Processing',
                },
                {
                  step: 10,
                  title: '10. Published as USED_VERIFIED on Marketplace',
                  desc: 'Re-listed with inspection grade badge, diagnostic notes, and 30-day warranty seal.',
                  time: ['LISTED', 'SOLD'].includes(selectedListing.status) ? 'Live on Store' : 'Pending',
                },
              ].map((item) => {
                const state = getLifecycleStepState(selectedListing, item.step);
                return (
                  <div key={item.step} className={`timeline-node ${state}`}>
                    <div className="node-indicator">
                      {state === 'completed' && <Check size={14} strokeWidth={2.5} />}
                      {state === 'current' && '●'}
                      {state === 'rejected' && <X size={14} strokeWidth={2.5} />}
                      {state === 'pending' && item.step}
                    </div>
                    <div className="node-body">
                      <div className="node-title-row">
                        <span className="node-title">{item.title}</span>
                        <span className="node-time">{item.time}</span>
                      </div>
                      <p className="node-desc">{item.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Crucial Note on Physical Verification Integrity */}
            <div className="modal-integrity-notice">
              <span className="notice-icon" style={{ display: 'inline-flex', alignItems: 'center' }}>
                <ShieldCheck size={20} strokeWidth={1.75} />
              </span>
              <p>
                <strong>Integrity Policy:</strong> Physical verification and condition grading are exclusively
                performed by certified PartNexa workshop technicians upon doorstep pickup. No simulated verification
                can be triggered from the customer UI.
              </p>
            </div>
          </div>
        </Modal>
      )}

      {/* ==================================================================== */}
      {/* CANCELLATION CONFIRMATION DIALOG                                    */}
      {/* ==================================================================== */}
      {listingToCancel && (
        <Modal
          isOpen={Boolean(listingToCancel)}
          onClose={() => setListingToCancel(null)}
          title="Cancel Used-Part Listing"
        >
          <div className="cancel-modal-content">
            <p>
              Are you sure you want to cancel the listing for <strong>{listingToCancel.title}</strong>?
            </p>
            <p className="text-secondary text-sm" style={{ marginTop: '8px', marginBottom: '16px' }}>
              Pickup logistics will be cancelled. You can re-list this part at any time.
            </p>

            <div className="form-group" style={{ marginBottom: '20px' }}>
              <label className="input-label">Reason for Cancellation (Optional)</label>
              <input
                type="text"
                className="custom-input"
                placeholder="e.g. Found alternate buyer, component not available..."
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
              <Button variant="outline" onClick={() => setListingToCancel(null)}>
                Keep Listing
              </Button>
              <Button
                variant="primary"
                style={{ backgroundColor: '#ef4444', borderColor: '#ef4444', color: '#fff' }}
                onClick={handleConfirmCancel}
                loading={isCancelling}
                id="confirm-cancel-listing-btn"
              >
                Confirm Cancellation
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default SellUsedPartPage;
