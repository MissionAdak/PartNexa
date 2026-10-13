import React, { useState, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { Link } from 'react-router-dom';
import { Car, Bike, Star, Zap, Search, ArrowRight, Check, X, Plus } from 'lucide-react';
import { vehiclesService } from '../../services';
import { useVehicles } from '../../contexts/VehicleContext';
import { BrandLogo } from './BrandLogos';
import toast from 'react-hot-toast';
import './VehicleSelectorModal.css';

const STEPS = [
  { id: 1, label: 'Type', title: 'Vehicle Category' },
  { id: 2, label: 'Brand', title: 'Manufacturer / Make' },
  { id: 3, label: 'Model', title: 'Vehicle Model' },
  { id: 4, label: 'Variant', title: 'Year & Variant' },
  { id: 5, label: 'Details', title: 'Fitment & Details' },
];

export const VehicleSelectorModal = ({
  isOpen,
  onClose,
  onSelect,
  initialType = '4_WHEELER',
  initialVariantId = null,
  title = 'Select Vehicle for Part Fitment',
}) => {
  const {
    vehicles,
    activeVehicle,
    addVehicle,
    switchActiveVehicle,
    setPrimaryVehicle,
  } = useVehicles();

  // Mode: 'garage' (switch existing saved vehicles) or 'wizard' (add/select vehicle)
  const [viewMode, setViewMode] = useState(() => (vehicles && vehicles.length > 0 ? 'garage' : 'wizard'));

  const [step, setStep] = useState(1);
  const [vehicleType, setVehicleType] = useState(initialType);
  const [makes, setMakes] = useState([]);
  const [models, setModels] = useState([]);
  const [variants, setVariants] = useState([]);

  const [selectedMake, setSelectedMake] = useState(null);
  const [selectedModel, setSelectedModel] = useState(null);
  const [selectedVariant, setSelectedVariant] = useState(null);

  const [brandSearch, setBrandSearch] = useState('');
  const [modelSearch, setModelSearch] = useState('');

  const [nickname, setNickname] = useState('');
  const [regNumber, setRegNumber] = useState('');
  const [saveToGarage, setSaveToGarage] = useState(true);

  const [loadingMakes, setLoadingMakes] = useState(false);
  const [loadingModels, setLoadingModels] = useState(false);
  const [loadingVariants, setLoadingVariants] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Recently selected vehicles from localStorage
  const [recentVehicles, setRecentVehicles] = useState(() => {
    try {
      const saved = localStorage.getItem('partnexa_recent_vehicles');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Reset or initialize when modal opens, lock background scroll, handle Escape key
  useEffect(() => {
    if (isOpen) {
      const prevOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';

      const handleKeyDown = (e) => {
        if (e.key === 'Escape') onClose();
      };
      window.addEventListener('keydown', handleKeyDown);

      // Default to garage view if customer has saved vehicles, otherwise wizard
      if (vehicles && vehicles.length > 0) {
        setViewMode('garage');
      } else {
        setViewMode('wizard');
      }

      setBrandSearch('');
      setModelSearch('');
      setStep(1);

      return () => {
        document.body.style.overflow = prevOverflow;
        window.removeEventListener('keydown', handleKeyDown);
      };
    }
  }, [isOpen, vehicles, onClose]);

  // Fetch makes whenever vehicleType changes or step 2 is active in wizard
  useEffect(() => {
    if (isOpen && viewMode === 'wizard' && (step === 1 || step === 2)) {
      setLoadingMakes(true);
      vehiclesService
        .getMakes(vehicleType)
        .then(({ data }) => {
          const list = Array.isArray(data?.data) ? data.data : (Array.isArray(data) ? data : []);
          setMakes(list);
        })
        .catch((err) => {
          console.error('Failed to load vehicle makes:', err);
          setMakes([]);
          toast.error('Unable to fetch vehicle makes.');
        })
        .finally(() => setLoadingMakes(false));
    }
  }, [vehicleType, isOpen, step, viewMode]);

  // Switch active vehicle from garage
  const handleSwitchVehicle = (vehicle) => {
    if (switchActiveVehicle) {
      switchActiveVehicle(vehicle);
    }
    if (onSelect) {
      onSelect({
        variantId: vehicle.variantId || vehicle.variant?.id,
        variant: vehicle.variant,
        model: vehicle.variant?.model,
        make: vehicle.variant?.model?.make,
        nickname: vehicle.nickname,
        regNumber: vehicle.regNumber,
      });
    }
    onClose();
  };

  // Set database primary vehicle (keeps active vehicle selection intact)
  const handleMakePrimary = async (vehicleId) => {
    try {
      if (setPrimaryVehicle) {
        await setPrimaryVehicle(vehicleId);
      }
    } catch {
      // toast is handled in context
    }
  };

  // Load models when make is selected
  const handleSelectMake = async (make) => {
    setSelectedMake(make);
    setSelectedModel(null);
    setSelectedVariant(null);
    setModelSearch('');
    setLoadingModels(true);
    setStep(3);
    try {
      const { data } = await vehiclesService.getModels(make.id);
      const list = Array.isArray(data?.data) ? data.data : (Array.isArray(data) ? data : []);
      setModels(list);
    } catch (err) {
      console.error('Failed to load models:', err);
      setModels([]);
      toast.error('Unable to load models for ' + make.name);
    } finally {
      setLoadingModels(false);
    }
  };

  // Load variants when model is selected
  const handleSelectModel = async (model) => {
    setSelectedModel(model);
    setSelectedVariant(null);
    setLoadingVariants(true);
    setStep(4);
    try {
      const { data } = await vehiclesService.getVariants(model.id);
      const list = Array.isArray(data?.data) ? data.data : (Array.isArray(data) ? data : []);
      setVariants(list);
    } catch (err) {
      console.error('Failed to load variants:', err);
      setVariants([]);
      toast.error('Unable to load variants for ' + model.name);
    } finally {
      setLoadingVariants(false);
    }
  };

  // Select variant and advance to details
  const handleSelectVariant = (variant) => {
    setSelectedVariant(variant);
    setNickname(`${selectedMake?.name || ''} ${selectedModel?.name || ''}`.trim());
    setStep(5);
  };

  // Save selected vehicle to recents
  const saveVehicleToRecents = (vehiclePayload) => {
    try {
      const existing = [...recentVehicles];
      const filtered = existing.filter(
        (v) => (v.variantId || v.variant?.id) !== vehiclePayload.variant.id
      );
      const updated = [
        {
          id: `recent_${Date.now()}`,
          makeName: vehiclePayload.make.name,
          modelName: vehiclePayload.model.name,
          variantName: vehiclePayload.variant.name,
          year: vehiclePayload.variant.year,
          fuelType: vehiclePayload.variant.fuelType,
          variantId: vehiclePayload.variant.id,
          type: vehiclePayload.make.type,
          variant: vehiclePayload.variant,
        },
        ...filtered,
      ].slice(0, 4);

      setRecentVehicles(updated);
      localStorage.setItem('partnexa_recent_vehicles', JSON.stringify(updated));
    } catch (e) {
      console.warn('Failed to save recent vehicle:', e);
    }
  };

  // Quick select a recently selected vehicle
  const handleQuickSelectRecent = (recent) => {
    const varId = recent.variantId || recent.variant?.id;
    const makeObj = { name: recent.makeName || recent.variant?.model?.make?.name, type: recent.type };
    const modelObj = { name: recent.modelName || recent.variant?.model?.name };
    const variantObj = recent.variant || { id: varId, name: recent.variantName, year: recent.year, fuelType: recent.fuelType };

    setSelectedMake(makeObj);
    setSelectedModel(modelObj);
    setSelectedVariant(variantObj);

    const payload = {
      variantId: varId,
      variant: variantObj,
      model: modelObj,
      make: makeObj,
    };

    if (onSelect) {
      onSelect(payload);
    }

    if (switchActiveVehicle) {
      switchActiveVehicle({
        id: `fitment_${varId}`,
        variantId: varId,
        variant: {
          ...variantObj,
          model: {
            ...modelObj,
            make: makeObj,
          },
        },
      });
    }

    toast.success(`Active vehicle set to ${makeObj.name} ${modelObj.name}!`);
    onClose();
  };

  // Complete selection on Details step
  const handleConfirmVehicle = async (e) => {
    if (e) e.preventDefault();
    if (!selectedVariant || !selectedModel || !selectedMake) return;

    setSubmitting(true);
    try {
      const payload = {
        variantId: selectedVariant.id,
        nickname: nickname.trim() || `${selectedMake.name} ${selectedModel.name}`,
        regNumber: regNumber.trim().toUpperCase(),
        isPrimary: false, // New vehicle is set active without forcing primary
        variant: {
          ...selectedVariant,
          model: {
            ...selectedModel,
            make: selectedMake,
          },
        },
        model: selectedModel,
        make: selectedMake,
      };

      // Save to recents
      saveVehicleToRecents(payload);

      let createdVehicle = null;
      // Save to user garage if requested
      if (saveToGarage && addVehicle) {
        try {
          createdVehicle = await addVehicle({
            variantId: selectedVariant.id,
            nickname: payload.nickname,
            regNumber: payload.regNumber,
            isPrimary: vehicles && vehicles.length === 0, // First vehicle is primary by default
          });
        } catch {
          // Handled inside context
        }
      }

      // Apply active fitment filter
      const activeTarget = createdVehicle || {
        id: `fitment_${selectedVariant.id}`,
        variantId: selectedVariant.id,
        nickname: payload.nickname,
        regNumber: payload.regNumber,
        variant: payload.variant,
      };

      if (switchActiveVehicle) {
        switchActiveVehicle(activeTarget);
      }

      if (onSelect) {
        onSelect(payload);
      }

      toast.success(`Fitment active for ${selectedMake.name} ${selectedModel.name}!`);
      onClose();
    } catch (err) {
      console.error('Error confirming vehicle:', err);
      toast.error('Failed to set vehicle.');
    } finally {
      setSubmitting(false);
    }
  };

  // Filter makes by search
  const filteredMakes = useMemo(() => {
    const list = Array.isArray(makes) ? makes : [];
    if (!brandSearch.trim()) return list;
    const q = brandSearch.toLowerCase().trim();
    return list.filter((m) => m.name.toLowerCase().includes(q));
  }, [makes, brandSearch]);

  // Filter models by search
  const filteredModels = useMemo(() => {
    const list = Array.isArray(models) ? models : [];
    if (!modelSearch.trim()) return list;
    const q = modelSearch.toLowerCase().trim();
    return list.filter((m) => m.name.toLowerCase().includes(q));
  }, [models, modelSearch]);

  if (!isOpen) return null;

  const modalNode = (
    <div className="vsm-overlay" onClick={onClose} role="dialog" aria-modal="true" aria-labelledby="vsm-modal-title">
      <div className="vsm-modal" onClick={(e) => e.stopPropagation()}>
        {/* ================================================================= */}
        {/* 1. MY GARAGE VIEW (When Customer Has Saved Vehicles)               */}
        {/* ================================================================= */}
        {viewMode === 'garage' && (
          <>
            <div className="vsm-header">
              <div className="vsm-header-text">
                <h2 id="vsm-modal-title" className="vsm-title">My Garage</h2>
                <p className="vsm-subtitle">
                  Select which vehicle to use for catalog compatibility checks. Your primary vehicle remains your persistent account default.
                </p>
              </div>
              <button
                type="button"
                className="vsm-close-btn"
                onClick={onClose}
                aria-label="Close vehicle selector"
                id="vsm-close-btn"
              >
                <X size={20} strokeWidth={1.75} />
              </button>
            </div>

            <div className="vsm-body">
              <div className="vsm-garage-pane">
                <div className="vsm-garage-list">
                  {(vehicles || []).map((v) => {
                    const isAct =
                      (activeVehicle?.id && activeVehicle.id === v.id) ||
                      (activeVehicle?.variantId && (activeVehicle.variantId === v.variantId || activeVehicle.variantId === v.variant?.id)) ||
                      (activeVehicle?.variant?.id && v.variant?.id && activeVehicle.variant.id === v.variant.id);
                    const isPrim = Boolean(v.isPrimary);
                    const make = v.variant?.model?.make;
                    const model = v.variant?.model;
                    const variant = v.variant;
                    const makeName = make?.name || '';
                    const modelName = model?.name || '';
                    const displayName = v.nickname || `${makeName} ${modelName}`.trim() || 'My Vehicle';
                    const is2W = make?.type === 'BIKE' || make?.type === 'SCOOTER';

                    return (
                      <div
                        key={v.id}
                        className={`vsm-garage-card ${isAct ? 'is-active' : ''}`}
                        id={`vsm-garage-card-${v.id}`}
                      >
                        <div className="vsm-garage-card-main">
                          {/* Brand Logo / Vehicle Icon */}
                          <div className="vsm-garage-logo-col">
                            {makeName ? (
                              <BrandLogo brandName={makeName} size={40} />
                            ) : (
                              <span className="vsm-garage-type-icon" style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
                                {is2W ? <Bike size={24} strokeWidth={1.75} /> : <Car size={24} strokeWidth={1.75} />}
                              </span>
                            )}
                          </div>

                          {/* Vehicle Details */}
                          <div className="vsm-garage-info-col">
                            <div className="vsm-garage-title-row">
                              <h4 className="vsm-garage-title">{displayName}</h4>
                              <div className="vsm-garage-badges">
                                {isAct && (
                                  <span className="vsm-badge-active" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.2rem' }}>
                                    <Check size={11} strokeWidth={2.5} /> ACTIVE
                                  </span>
                                )}
                                {isPrim && (
                                  <span className="vsm-badge-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
                                    <Star size={11} strokeWidth={2.5} fill="currentColor" /> PRIMARY
                                  </span>
                                )}
                              </div>
                            </div>

                            <div className="vsm-garage-meta-row">
                              <span className="vsm-garage-spec">
                                {makeName} {modelName} {variant?.year ? `· ${variant.year}` : ''} {variant?.name ? `· ${variant.name}` : ''}
                              </span>
                              {variant?.fuelType && (
                                <span className="vsm-garage-fuel-tag">{variant.fuelType}</span>
                              )}
                            </div>

                            {v.regNumber && (
                              <div className="vsm-garage-reg-wrap">
                                <span className="vsm-garage-reg-plate">
                                  <span className="reg-ind-flag">IND</span>
                                  <span className="reg-number-text">{v.regNumber}</span>
                                </span>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Action Controls */}
                        <div className="vsm-garage-actions-col">
                          {isAct ? (
                            <div className="vsm-active-indicator">
                              <span className="vsm-active-check" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                                <Check size={12} strokeWidth={2.0} /> Active
                              </span>
                            </div>
                          ) : (
                            <button
                              type="button"
                              className="btn btn-primary btn-sm vsm-switch-btn"
                              onClick={() => handleSwitchVehicle(v)}
                              id={`switch-vehicle-${v.id}`}
                            >
                              Switch
                            </button>
                          )}

                          {!isPrim && (
                            <button
                              type="button"
                              className="vsm-make-primary-btn"
                              onClick={() => handleMakePrimary(v.id)}
                              id={`make-primary-${v.id}`}
                              title="Set as persistent account default in database"
                            >
                              Make Primary
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="vsm-garage-divider" />

                <div className="vsm-garage-footer">
                  <button
                    type="button"
                    className="btn btn-secondary vsm-add-another-btn"
                    onClick={() => {
                      setViewMode('wizard');
                      setStep(1);
                    }}
                    id="vsm-add-another-vehicle-btn"
                    style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                  >
                    <Plus size={15} strokeWidth={1.75} /> Add Another Vehicle
                  </button>

                  <Link
                    to="/customer/vehicles"
                    onClick={onClose}
                    className="vsm-manage-garage-link"
                    id="vsm-manage-garage-link"
                  >
                    Manage My Garage →
                  </Link>
                </div>
              </div>
            </div>
          </>
        )}

        {/* ================================================================= */}
        {/* 2. VEHICLE SELECTION WIZARD (Add Another Vehicle / 5-Step Flow)    */}
        {/* ================================================================= */}
        {viewMode === 'wizard' && (
          <>
            {/* Header */}
            <div className="vsm-header">
              <div className="vsm-header-text">
                {vehicles && vehicles.length > 0 && (
                  <button
                    type="button"
                    className="btn btn-ghost btn-xs vsm-back-to-garage-btn"
                    onClick={() => setViewMode('garage')}
                    style={{ marginBottom: '6px', paddingLeft: 0 }}
                  >
                    ← Back to My Garage
                  </button>
                )}
                <h2 id="vsm-modal-title" className="vsm-title">{title}</h2>
                <p className="vsm-subtitle">Guaranteed 100% exact part fitment and maintenance compatibility</p>
              </div>
              <button
                type="button"
                className="vsm-close-btn"
                onClick={onClose}
                aria-label="Close vehicle selector"
                id="vsm-close-btn"
              >
                <X size={20} strokeWidth={1.75} />
              </button>
            </div>

            {/* Breadcrumb / Step Progress Indicator */}
            <div className="vsm-progress-bar" role="navigation" aria-label="Selection progress">
              {STEPS.map((s, idx) => {
                const stepNum = s.id;
                const isCompleted = step > stepNum;
                const isActive = step === stepNum;
                return (
                  <div
                    key={s.id}
                    className={`vsm-step-node ${isActive ? 'active' : ''} ${isCompleted ? 'completed' : ''}`}
                    onClick={() => {
                      if (isCompleted) setStep(stepNum);
                    }}
                    role="button"
                    tabIndex={isCompleted ? 0 : -1}
                    title={isCompleted ? `Go back to ${s.label}` : s.label}
                  >
                    <div className="vsm-step-icon">
                      {isCompleted ? <Check size={14} strokeWidth={2.0} /> : stepNum}
                    </div>
                    <div className="vsm-step-info">
                      <span className="vsm-step-tag">Step {stepNum}</span>
                      <span className="vsm-step-name">{s.label}</span>
                    </div>
                    {idx < STEPS.length - 1 && <div className="vsm-step-connector" />}
                  </div>
                );
              })}
            </div>

            {/* Wizard Body */}
            <div className="vsm-body">
              {/* STEP 1: VEHICLE TYPE */}
              {step === 1 && (
                <div className="vsm-step-pane animate-fade-in" id="vsm-step-1">
                  <div className="vsm-pane-header">
                    <h3>Select Vehicle Category</h3>
                    <p>Choose whether you are shopping for a four-wheeler car/SUV or a two-wheeler motorcycle/scooter</p>
                  </div>

                  <div className="vsm-type-grid">
                    <div
                      className={`vsm-type-card ${vehicleType === '4_WHEELER' ? 'selected' : ''}`}
                      onClick={() => {
                        setVehicleType('4_WHEELER');
                        setStep(2);
                      }}
                      id="vsm-type-4w-card"
                      role="button"
                      tabIndex={0}
                    >
                      <div className="vsm-type-icon-wrapper" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Car size={32} strokeWidth={1.75} className="text-primary" />
                      </div>
                      <div className="vsm-type-content">
                        <h4>4 Wheeler (Cars & SUVs)</h4>
                        <p>Sedans, Hatchbacks, SUVs, MUVs, Compacts & EVs</p>
                        <div className="vsm-type-badge">
                          <span>20 Manufacturers Available</span>
                        </div>
                      </div>
                      <div className="vsm-type-arrow" style={{ display: 'flex', alignItems: 'center' }}>
                        <ArrowRight size={18} strokeWidth={1.75} />
                      </div>
                    </div>

                    <div
                      className={`vsm-type-card ${vehicleType === '2_WHEELER' ? 'selected' : ''}`}
                      onClick={() => {
                        setVehicleType('2_WHEELER');
                        setStep(2);
                      }}
                      id="vsm-type-2w-card"
                      role="button"
                      tabIndex={0}
                    >
                      <div className="vsm-type-icon-wrapper" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Bike size={32} strokeWidth={1.75} className="text-teal" />
                      </div>
                      <div className="vsm-type-content">
                        <h4>2 Wheeler (Bikes & Scooters)</h4>
                        <p>Motorcycles, Scooters, Cruisers & Electric 2-Wheelers</p>
                        <div className="vsm-type-badge">
                          <span>9 Major Brands Available</span>
                        </div>
                      </div>
                      <div className="vsm-type-arrow" style={{ display: 'flex', alignItems: 'center' }}>
                        <ArrowRight size={18} strokeWidth={1.75} />
                      </div>
                    </div>
                  </div>

                  {/* Quick Select from Recently Selected */}
                  {recentVehicles.length > 0 && (
                    <div className="vsm-recents-section">
                      <div className="vsm-recents-title" style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                        <Zap size={14} strokeWidth={2} />
                        <span>Recently Selected Vehicles:</span>
                      </div>
                      <div className="vsm-recents-chips">
                        {(recentVehicles || []).map((rv) => (
                          <button
                            key={rv.id}
                            type="button"
                            className="vsm-recent-chip"
                            onClick={() => handleQuickSelectRecent(rv)}
                            id={`recent-chip-${rv.variantId}`}
                          >
                            <span className="recent-chip-icon" style={{ display: 'inline-flex', alignItems: 'center' }}>
                              {rv.type === 'CAR' ? <Car size={14} strokeWidth={1.75} /> : <Bike size={14} strokeWidth={1.75} />}
                            </span>
                            <span className="recent-chip-text">
                              {rv.year} {rv.makeName} {rv.modelName} ({rv.variantName})
                            </span>
                            <span className="recent-chip-action">Use Fitment ↵</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* STEP 2: BRAND / MANUFACTURER */}
              {step === 2 && (
                <div className="vsm-step-pane animate-fade-in" id="vsm-step-2">
                  <div className="vsm-pane-header flex-header">
                    <div>
                      <h3>Select {vehicleType === '4_WHEELER' ? 'Car' : '2-Wheeler'} Manufacturer</h3>
                      <p>Displaying authentic database-verified brands with live model catalogs</p>
                    </div>
                    <div className="vsm-active-tag" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
                      {vehicleType === '4_WHEELER' ? (
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}>
                          <Car size={14} strokeWidth={1.75} /> 4-Wheeler
                        </span>
                      ) : (
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}>
                          <Bike size={14} strokeWidth={1.75} /> 2-Wheeler
                        </span>
                      )}
                      <button type="button" className="vsm-tag-change" onClick={() => setStep(1)}>
                        Change
                      </button>
                    </div>
                  </div>

                  {/* Brand Search Bar */}
                  <div className="vsm-search-bar">
                    <Search size={16} strokeWidth={1.75} className="vsm-search-icon" />
                    <input
                      type="text"
                      placeholder="Search brand (e.g. Maruti, Hyundai, Tata, BMW, Mercedes)..."
                      value={brandSearch}
                      onChange={(e) => setBrandSearch(e.target.value)}
                      id="vsm-brand-search-input"
                      autoFocus
                    />
                    {brandSearch && (
                      <button type="button" className="vsm-search-clear" onClick={() => setBrandSearch('')} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <X size={14} strokeWidth={1.75} />
                      </button>
                    )}
                  </div>

                  {/* Brand Grid */}
                  {loadingMakes ? (
                    <div className="vsm-loading-grid">
                      {Array.from({ length: 12 }).map((_, i) => (
                        <div key={i} className="vsm-skeleton-card" />
                      ))}
                    </div>
                  ) : filteredMakes.length > 0 ? (
                    <div className="vsm-brand-grid">
                      {filteredMakes.map((make) => (
                        <div
                          key={make.id}
                          className={`vsm-brand-card ${selectedMake?.id === make.id ? 'selected' : ''}`}
                          onClick={() => handleSelectMake(make)}
                          id={`make-card-${make.id}`}
                          role="button"
                          tabIndex={0}
                        >
                          <div className="vsm-brand-emblem-wrap">
                            <BrandLogo brandName={make.name} size={48} />
                          </div>
                          <span className="vsm-brand-name">{make.name}</span>
                          {make._count?.models > 0 && (
                            <span className="vsm-brand-model-count">{make._count.models} Models</span>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="vsm-empty-state">
                      <p>No manufacturers found matching "{brandSearch}"</p>
                      <button type="button" className="btn btn-secondary btn-sm" onClick={() => setBrandSearch('')}>
                        Clear Search
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* STEP 3: MODEL */}
              {step === 3 && (
                <div className="vsm-step-pane animate-fade-in" id="vsm-step-3">
                  <div className="vsm-pane-header flex-header">
                    <div>
                      <h3>Select Model</h3>
                      <p>Pick the precise model line for {selectedMake?.name}</p>
                    </div>
                    <div className="vsm-crumbs">
                      <span className="vsm-selected-crumb" onClick={() => setStep(2)}>
                        {selectedMake?.name}
                      </span>
                    </div>
                  </div>

                  {/* Model Search */}
                  <div className="vsm-search-bar">
                    <Search size={16} strokeWidth={1.75} className="vsm-search-icon" />
                    <input
                      type="text"
                      placeholder={`Search ${selectedMake?.name || ''} models (e.g. Swift, Nexon, Creta)...`}
                      value={modelSearch}
                      onChange={(e) => setModelSearch(e.target.value)}
                      id="vsm-model-search-input"
                      autoFocus
                    />
                    {modelSearch && (
                      <button type="button" className="vsm-search-clear" onClick={() => setModelSearch('')} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <X size={14} strokeWidth={1.75} />
                      </button>
                    )}
                  </div>

                  {/* Model Grid */}
                  {loadingModels ? (
                    <div className="vsm-loading-grid">
                      {Array.from({ length: 6 }).map((_, i) => (
                        <div key={i} className="vsm-skeleton-card" />
                      ))}
                    </div>
                  ) : filteredModels.length > 0 ? (
                    <div className="vsm-model-grid">
                      {filteredModels.map((model) => (
                        <div
                          key={model.id}
                          className={`vsm-model-card ${selectedModel?.id === model.id ? 'selected' : ''}`}
                          onClick={() => handleSelectModel(model)}
                          id={`model-card-${model.id}`}
                          role="button"
                          tabIndex={0}
                        >
                          <div className="vsm-model-icon" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            {model.type === 'BIKE' || model.type === 'SCOOTER' ? (
                              <Bike size={20} strokeWidth={1.75} />
                            ) : (
                              <Car size={20} strokeWidth={1.75} />
                            )}
                          </div>
                          <div className="vsm-model-details">
                            <span className="vsm-model-name">{model.name}</span>
                            <span className="vsm-model-sub">
                              {model._count?.variants ? `${model._count.variants} Variants Available` : 'Available in Catalog'}
                            </span>
                          </div>
                          <span className="vsm-model-arrow" style={{ display: 'flex', alignItems: 'center' }}>
                            <ArrowRight size={16} strokeWidth={1.75} />
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="vsm-empty-state">
                      <p>No models found matching "{modelSearch}"</p>
                      <button type="button" className="btn btn-secondary btn-sm" onClick={() => setModelSearch('')}>
                        Clear Search
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* STEP 4: VARIANT & YEAR */}
              {step === 4 && (
                <div className="vsm-step-pane animate-fade-in" id="vsm-step-4">
                  <div className="vsm-pane-header flex-header">
                    <div>
                      <h3>Select Year & Variant</h3>
                      <p>Engine, fuel type, and year specify exact part compatibility</p>
                    </div>
                    <div className="vsm-crumbs">
                      <span className="vsm-selected-crumb" onClick={() => setStep(2)}>
                        {selectedMake?.name}
                      </span>
                      <span className="vsm-crumb-sep">/</span>
                      <span className="vsm-selected-crumb" onClick={() => setStep(3)}>
                        {selectedModel?.name}
                      </span>
                    </div>
                  </div>

                  {loadingVariants ? (
                    <div className="vsm-loading-grid">
                      {Array.from({ length: 6 }).map((_, i) => (
                        <div key={i} className="vsm-skeleton-card" />
                      ))}
                    </div>
                  ) : variants.length > 0 ? (
                    <div className="vsm-variant-grid">
                      {variants.map((v) => (
                        <div
                          key={v.id}
                          className={`vsm-variant-card ${selectedVariant?.id === v.id ? 'selected' : ''}`}
                          onClick={() => handleSelectVariant(v)}
                          id={`variant-card-${v.id}`}
                          role="button"
                          tabIndex={0}
                        >
                          <div className="vsm-variant-header">
                            <span className="vsm-variant-year-badge">{v.year}</span>
                            {v.fuelType && <span className="vsm-fuel-pill">{v.fuelType}</span>}
                          </div>
                          <span className="vsm-variant-title">{v.name}</span>
                          <span className="vsm-variant-specs">
                            {v.fuelType ? `${v.fuelType} engine` : 'Standard Engine'} · {v.year} Model
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="vsm-empty-state">
                      <p>No variants registered for {selectedModel?.name} yet.</p>
                      <button type="button" className="btn btn-secondary btn-sm" onClick={() => setStep(3)}>
                        ← Back to Models
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* STEP 5: DETAILS & CONFIRMATION */}
              {step === 5 && (
                <div className="vsm-step-pane animate-fade-in" id="vsm-step-5">
                  <div className="vsm-pane-header">
                    <h3>Confirm Vehicle Configuration</h3>
                    <p>Review vehicle details and save to your garage for instant fitment verification across the store</p>
                  </div>

                  <form onSubmit={handleConfirmVehicle} className="vsm-details-form">
                    {/* Vehicle Hero Summary Card */}
                    <div className="vsm-summary-hero">
                      <div className="vsm-hero-top">
                        <div className="vsm-hero-emblem">
                          <BrandLogo brandName={selectedMake?.name} size={64} />
                        </div>
                        <div className="vsm-hero-headings">
                          <span className="vsm-hero-brand">{selectedMake?.name}</span>
                          <h2 className="vsm-hero-model">{selectedModel?.name}</h2>
                          <div className="vsm-hero-tags">
                            <span className="vsm-hero-tag">{selectedVariant?.year}</span>
                            <span className="vsm-hero-tag">{selectedVariant?.name}</span>
                            {selectedVariant?.fuelType && (
                              <span className="vsm-hero-tag tag-fuel">{selectedVariant?.fuelType}</span>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="vsm-hero-perks">
                        <div className="vsm-perk-item">
                          <Check size={14} strokeWidth={2.0} className="vsm-perk-icon" />
                          <span>Guaranteed 100% Fitment Match</span>
                        </div>
                        <div className="vsm-perk-item">
                          <Check size={14} strokeWidth={2.0} className="vsm-perk-icon" />
                          <span>Zero-Risk Return Protection</span>
                        </div>
                        <div className="vsm-perk-item">
                          <Check size={14} strokeWidth={2.0} className="vsm-perk-icon" />
                          <span>DIFM Service Scheduling Enabled</span>
                        </div>
                      </div>
                    </div>

                    {/* Inputs */}
                    <div className="vsm-inputs-row">
                      <div className="vsm-form-group">
                        <label htmlFor="vsm-nickname-input" className="vsm-label">
                          Vehicle Nickname (Optional)
                        </label>
                        <input
                          type="text"
                          id="vsm-nickname-input"
                          className="vsm-input"
                          placeholder={`e.g. My ${selectedModel?.name || 'Car'}`}
                          value={nickname}
                          onChange={(e) => setNickname(e.target.value)}
                        />
                      </div>

                      <div className="vsm-form-group">
                        <label htmlFor="vsm-reg-input" className="vsm-label">
                          Registration / License Plate (Optional)
                        </label>
                        <div className="vsm-ind-plate-wrap">
                          <div className="vsm-ind-tag">
                            <span className="ind-blue-dot">●</span>
                            <span className="ind-text">IND</span>
                          </div>
                          <input
                            type="text"
                            id="vsm-reg-input"
                            className="vsm-input vsm-plate-input"
                            placeholder="MH 12 AB 1234"
                            value={regNumber}
                            onChange={(e) => setRegNumber(e.target.value.toUpperCase())}
                            maxLength={13}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Save to Garage checkbox */}
                    <label className="vsm-checkbox-label">
                      <input
                        type="checkbox"
                        checked={saveToGarage}
                        onChange={(e) => setSaveToGarage(e.target.checked)}
                        id="vsm-save-to-garage-chk"
                      />
                      <span>Save vehicle to My Garage for future quick access</span>
                    </label>

                    {/* Action buttons */}
                    <div className="vsm-actions-bar">
                      <button
                        type="button"
                        className="btn btn-secondary vsm-back-btn"
                        onClick={() => setStep(4)}
                      >
                        ← Back
                      </button>
                      <button
                        type="submit"
                        className="btn btn-primary vsm-confirm-btn"
                        disabled={submitting}
                        id="vsm-confirm-vehicle-btn"
                      >
                        {submitting ? 'Setting Vehicle...' : 'Set Active Vehicle & Browse Parts →'}
                      </button>
                    </div>
                  </form>
                </div>
              )}
            </div>

            {/* Global Step Footer (Steps 1-4) */}
            {step < 5 && (
              <div className="vsm-modal-footer">
                <div className="vsm-footer-left">
                  {step > 1 && (
                    <button
                      type="button"
                      className="btn btn-ghost vsm-back-btn"
                      onClick={() => setStep(step - 1)}
                      id="vsm-global-back-btn"
                    >
                      ← Back
                    </button>
                  )}
                </div>

                <div className="vsm-footer-right">
                  <button
                    type="button"
                    className="btn btn-ghost"
                    onClick={onClose}
                    id="vsm-cancel-btn"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );

  return typeof document !== 'undefined' ? createPortal(modalNode, document.body) : modalNode;
};

export default VehicleSelectorModal;
