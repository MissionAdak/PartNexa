import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDeliveryAuth } from '../../contexts/DeliveryAuthContext';
import toast from 'react-hot-toast';
import PartNexaLogo from '../../components/common/PartNexaLogo';
import { Sun, Moon } from 'lucide-react';

export const DeliveryRegisterPage = () => {
  const [formData, setFormData] = useState({
    // Personal Information
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',

    // Address Information
    address: '',
    city: '',
    state: '',
    postalCode: '',

    // Delivery Information
    vehicleType: 'Bike',
    vehicleMake: '',
    vehicleModel: '',
    vehicleNum: '',

    // Operational Details
    preferredCity: '',
    emergencyContact: '',
  });

  const [fieldErrors, setFieldErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const { register, theme, toggleTheme } = useDeliveryAuth();
  const navigate = useNavigate();

  const handleFillSample = () => {
    const randomId = Math.floor(100 + Math.random() * 900);
    setFormData({
      firstName: 'Karan',
      lastName: 'Verma',
      email: `rider.karan${randomId}@partsphare.test`,
      phone: '+91 98765 ' + Math.floor(10000 + Math.random() * 90000),
      password: 'Password@123',
      confirmPassword: 'Password@123',

      address: 'Shop 14, 2nd Main, Indiranagar',
      city: 'Bengaluru',
      state: 'Karnataka',
      postalCode: '560038',

      vehicleType: 'Bike',
      vehicleMake: 'Hero',
      vehicleModel: 'Splendor Plus',
      vehicleNum: `KA-04-AB-${Math.floor(1000 + Math.random() * 9000)}`,

      preferredCity: 'Indiranagar / East Bengaluru',
      emergencyContact: '+91 91234 56789',
    });
    setFieldErrors({});
    toast.success('Sample rider information populated!');
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (fieldErrors[name]) {
      setFieldErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const validate = () => {
    const errors = {};
    if (!formData.firstName.trim()) errors.firstName = 'First name is required.';
    if (!formData.lastName.trim()) errors.lastName = 'Last name is required.';
    if (!formData.email.trim()) {
      errors.email = 'Email address is required.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      errors.email = 'Please enter a valid email address.';
    }
    if (!formData.phone.trim()) {
      errors.phone = 'Phone number is required.';
    } else if (formData.phone.trim().replace(/\D/g, '').length < 10) {
      errors.phone = 'Please enter a valid 10-digit phone number.';
    }
    if (!formData.password) {
      errors.password = 'Password is required.';
    } else if (formData.password.length < 6) {
      errors.password = 'Password must be at least 6 characters.';
    }
    if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match.';
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) {
      toast.error('Please correct the highlighted errors before submitting.');
      return;
    }

    try {
      setSubmitting(true);
      const submitPayload = {
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        email: formData.email.trim().toLowerCase(),
        phone: formData.phone.trim(),
        password: formData.password,
        address: formData.address.trim(),
        city: formData.city.trim(),
        state: formData.state.trim(),
        postalCode: formData.postalCode.trim(),
        vehicleType: formData.vehicleType,
        vehicleMake: formData.vehicleMake.trim(),
        vehicleModel: formData.vehicleModel.trim(),
        vehicleNum: formData.vehicleNum.trim().toUpperCase(),
        preferredCity: formData.preferredCity.trim(),
        emergencyContact: formData.emergencyContact.trim(),
      };

      await register(submitPayload);
      toast.success('Registration completed. Complete KYC to activate your Delivery Partner account.', {
        duration: 6000,
        id: 'delivery-reg-success',
      });
      navigate('/delivery/kyc', { state: { registered: true } });
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Registration failed. Please check form details.';
      toast.error(msg);
      if (msg.toLowerCase().includes('email')) {
        setFieldErrors((prev) => ({ ...prev, email: msg }));
      } else if (msg.toLowerCase().includes('phone')) {
        setFieldErrors((prev) => ({ ...prev, phone: msg }));
      } else if (msg.toLowerCase().includes('vehicle')) {
        setFieldErrors((prev) => ({ ...prev, vehicleNum: msg }));
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'var(--color-bg, #0b1120)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        padding: '2.5rem 1rem',
        position: 'relative',
      }}
    >
      {/* Top right theme switch */}
      <div style={{ position: 'absolute', top: '1.5rem', right: '1.5rem' }}>
        <button
          onClick={toggleTheme}
          style={{
            background: 'var(--color-bg-card, #1e293b)',
            border: '1px solid var(--color-border, rgba(255,255,255,0.1))',
            borderRadius: '9999px',
            width: '42px',
            height: '42px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            fontSize: '1.2rem',
            color: 'var(--color-text-primary, #ffffff)',
          }}
          title="Toggle Theme"
        >
          {theme === 'dark' ? <Sun size={18} strokeWidth={1.75} /> : <Moon size={18} strokeWidth={1.75} />}
        </button>
      </div>

      <div
        className="delivery-card"
        style={{
          width: '100%',
          maxWidth: '680px',
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.4), 0 10px 10px -5px rgba(0, 0, 0, 0.3)',
          padding: '2.25rem',
          backgroundColor: 'var(--color-bg-card, #1e293b)',
          border: '1px solid var(--color-border, rgba(255,255,255,0.1))',
          borderRadius: '16px',
        }}
      >
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '1.75rem' }}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1rem' }}>
            <PartNexaLogo
              variant="stacked"
              portal="delivery"
              size="lg"
              linkTo="/delivery"
            />
          </div>
          <h1
            style={{
              fontFamily: 'var(--font-display, inherit)',
              fontSize: '1.75rem',
              fontWeight: 800,
              color: 'var(--color-text-primary, #ffffff)',
              marginBottom: '0.4rem',
              letterSpacing: '-0.02em',
            }}
          >
            Register as Delivery Partner
          </h1>
          <p style={{ color: 'var(--color-text-secondary, #94a3b8)', fontSize: '0.88rem' }}>
            Earn competitive per-trip payouts with PartNexa doorstep delivery fleet
          </p>
        </div>

        {/* Quick Autofill Action for rapid testing */}
        <div
          style={{
            background: 'rgba(255,255,255,0.03)',
            border: '1px solid var(--color-border, rgba(255,255,255,0.1))',
            borderRadius: '10px',
            padding: '0.75rem 1rem',
            marginBottom: '1.75rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '1rem',
          }}
        >
          <span style={{ fontSize: '0.82rem', color: 'var(--color-text-secondary, #94a3b8)' }}>
            Need test data? Pre-fill with sample partner information:
          </span>
          <button
            type="button"
            id="fill-sample-rider-btn"
            onClick={handleFillSample}
            style={{
              padding: '0.45rem 0.85rem',
              borderRadius: '6px',
              backgroundColor: 'rgba(16, 185, 129, 0.15)',
              border: '1px solid rgba(16, 185, 129, 0.4)',
              color: '#10b981',
              fontSize: '0.78rem',
              fontWeight: 700,
              cursor: 'pointer',
              whiteSpace: 'nowrap',
            }}
          >
            Autofill Sample Rider
          </button>
        </div>

        {/* Registration Form */}
        <form onSubmit={handleSubmit} id="delivery-partner-register-form">
          {/* SECTION 1: Personal Information */}
          <div
            style={{
              fontSize: '0.88rem',
              fontWeight: 700,
              color: '#10b981',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              marginBottom: '0.85rem',
              borderBottom: '1px solid var(--color-border, rgba(255,255,255,0.1))',
              paddingBottom: '0.35rem',
            }}
          >
            1. Personal Information
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
            <div className="form-group">
              <label className="form-label" style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--color-text-primary, #fff)', display: 'block', marginBottom: '0.3rem' }}>
                First Name *
              </label>
              <input
                type="text"
                name="firstName"
                id="firstName"
                className="form-input"
                value={formData.firstName}
                onChange={handleChange}
                placeholder="e.g. Vikram"
                required
                style={{
                  width: '100%',
                  padding: '0.65rem 0.85rem',
                  borderRadius: '8px',
                  border: fieldErrors.firstName ? '1px solid #ef4444' : '1px solid var(--color-border, rgba(255,255,255,0.15))',
                  backgroundColor: 'rgba(0,0,0,0.2)',
                  color: 'var(--color-text-primary, #fff)',
                  fontSize: '0.88rem',
                  boxSizing: 'border-box',
                }}
              />
              {fieldErrors.firstName && <span style={{ color: '#ef4444', fontSize: '0.75rem', marginTop: '0.2rem', display: 'block' }}>{fieldErrors.firstName}</span>}
            </div>

            <div className="form-group">
              <label className="form-label" style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--color-text-primary, #fff)', display: 'block', marginBottom: '0.3rem' }}>
                Last Name *
              </label>
              <input
                type="text"
                name="lastName"
                id="lastName"
                className="form-input"
                value={formData.lastName}
                onChange={handleChange}
                placeholder="e.g. Singh"
                required
                style={{
                  width: '100%',
                  padding: '0.65rem 0.85rem',
                  borderRadius: '8px',
                  border: fieldErrors.lastName ? '1px solid #ef4444' : '1px solid var(--color-border, rgba(255,255,255,0.15))',
                  backgroundColor: 'rgba(0,0,0,0.2)',
                  color: 'var(--color-text-primary, #fff)',
                  fontSize: '0.88rem',
                  boxSizing: 'border-box',
                }}
              />
              {fieldErrors.lastName && <span style={{ color: '#ef4444', fontSize: '0.75rem', marginTop: '0.2rem', display: 'block' }}>{fieldErrors.lastName}</span>}
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
            <div className="form-group">
              <label className="form-label" style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--color-text-primary, #fff)', display: 'block', marginBottom: '0.3rem' }}>
                Email Address *
              </label>
              <input
                type="email"
                name="email"
                id="email"
                className="form-input"
                value={formData.email}
                onChange={handleChange}
                placeholder="rider@example.com"
                required
                style={{
                  width: '100%',
                  padding: '0.65rem 0.85rem',
                  borderRadius: '8px',
                  border: fieldErrors.email ? '1px solid #ef4444' : '1px solid var(--color-border, rgba(255,255,255,0.15))',
                  backgroundColor: 'rgba(0,0,0,0.2)',
                  color: 'var(--color-text-primary, #fff)',
                  fontSize: '0.88rem',
                  boxSizing: 'border-box',
                }}
              />
              {fieldErrors.email && <span style={{ color: '#ef4444', fontSize: '0.75rem', marginTop: '0.2rem', display: 'block' }}>{fieldErrors.email}</span>}
            </div>

            <div className="form-group">
              <label className="form-label" style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--color-text-primary, #fff)', display: 'block', marginBottom: '0.3rem' }}>
                Phone Number *
              </label>
              <input
                type="text"
                name="phone"
                id="phone"
                className="form-input"
                value={formData.phone}
                onChange={handleChange}
                placeholder="+91 98451 00000"
                required
                style={{
                  width: '100%',
                  padding: '0.65rem 0.85rem',
                  borderRadius: '8px',
                  border: fieldErrors.phone ? '1px solid #ef4444' : '1px solid var(--color-border, rgba(255,255,255,0.15))',
                  backgroundColor: 'rgba(0,0,0,0.2)',
                  color: 'var(--color-text-primary, #fff)',
                  fontSize: '0.88rem',
                  boxSizing: 'border-box',
                }}
              />
              {fieldErrors.phone && <span style={{ color: '#ef4444', fontSize: '0.75rem', marginTop: '0.2rem', display: 'block' }}>{fieldErrors.phone}</span>}
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
            <div className="form-group">
              <label className="form-label" style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--color-text-primary, #fff)', display: 'block', marginBottom: '0.3rem' }}>
                Password *
              </label>
              <input
                type="password"
                name="password"
                id="password"
                className="form-input"
                value={formData.password}
                onChange={handleChange}
                placeholder="Min. 6 characters"
                required
                style={{
                  width: '100%',
                  padding: '0.65rem 0.85rem',
                  borderRadius: '8px',
                  border: fieldErrors.password ? '1px solid #ef4444' : '1px solid var(--color-border, rgba(255,255,255,0.15))',
                  backgroundColor: 'rgba(0,0,0,0.2)',
                  color: 'var(--color-text-primary, #fff)',
                  fontSize: '0.88rem',
                  boxSizing: 'border-box',
                }}
              />
              {fieldErrors.password && <span style={{ color: '#ef4444', fontSize: '0.75rem', marginTop: '0.2rem', display: 'block' }}>{fieldErrors.password}</span>}
            </div>

            <div className="form-group">
              <label className="form-label" style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--color-text-primary, #fff)', display: 'block', marginBottom: '0.3rem' }}>
                Confirm Password *
              </label>
              <input
                type="password"
                name="confirmPassword"
                id="confirmPassword"
                className="form-input"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="Re-enter password"
                required
                style={{
                  width: '100%',
                  padding: '0.65rem 0.85rem',
                  borderRadius: '8px',
                  border: fieldErrors.confirmPassword ? '1px solid #ef4444' : '1px solid var(--color-border, rgba(255,255,255,0.15))',
                  backgroundColor: 'rgba(0,0,0,0.2)',
                  color: 'var(--color-text-primary, #fff)',
                  fontSize: '0.88rem',
                  boxSizing: 'border-box',
                }}
              />
              {fieldErrors.confirmPassword && <span style={{ color: '#ef4444', fontSize: '0.75rem', marginTop: '0.2rem', display: 'block' }}>{fieldErrors.confirmPassword}</span>}
            </div>
          </div>

          {/* SECTION 2: Address Information */}
          <div
            style={{
              fontSize: '0.88rem',
              fontWeight: 700,
              color: '#0284c7',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              marginBottom: '0.85rem',
              borderBottom: '1px solid var(--color-border, rgba(255,255,255,0.1))',
              paddingBottom: '0.35rem',
            }}
          >
            2. Address Details
          </div>

          <div className="form-group" style={{ marginBottom: '1rem' }}>
            <label className="form-label" style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--color-text-primary, #fff)', display: 'block', marginBottom: '0.3rem' }}>
              Street Address / Base Location
            </label>
            <input
              type="text"
              name="address"
              id="address"
              className="form-input"
              value={formData.address}
              onChange={handleChange}
              placeholder="e.g. Flat 204, Royal Palms, Outer Ring Road"
              style={{
                width: '100%',
                padding: '0.65rem 0.85rem',
                borderRadius: '8px',
                border: '1px solid var(--color-border, rgba(255,255,255,0.15))',
                backgroundColor: 'rgba(0,0,0,0.2)',
                color: 'var(--color-text-primary, #fff)',
                fontSize: '0.88rem',
                boxSizing: 'border-box',
              }}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1.5fr 1.5fr', gap: '0.85rem', marginBottom: '1.5rem' }}>
            <div className="form-group">
              <label className="form-label" style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--color-text-primary, #fff)', display: 'block', marginBottom: '0.3rem' }}>
                City
              </label>
              <input
                type="text"
                name="city"
                id="city"
                className="form-input"
                value={formData.city}
                onChange={handleChange}
                placeholder="e.g. Bengaluru"
                style={{
                  width: '100%',
                  padding: '0.65rem 0.85rem',
                  borderRadius: '8px',
                  border: '1px solid var(--color-border, rgba(255,255,255,0.15))',
                  backgroundColor: 'rgba(0,0,0,0.2)',
                  color: 'var(--color-text-primary, #fff)',
                  fontSize: '0.88rem',
                  boxSizing: 'border-box',
                }}
              />
            </div>

            <div className="form-group">
              <label className="form-label" style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--color-text-primary, #fff)', display: 'block', marginBottom: '0.3rem' }}>
                State
              </label>
              <input
                type="text"
                name="state"
                id="state"
                className="form-input"
                value={formData.state}
                onChange={handleChange}
                placeholder="e.g. Karnataka"
                style={{
                  width: '100%',
                  padding: '0.65rem 0.85rem',
                  borderRadius: '8px',
                  border: '1px solid var(--color-border, rgba(255,255,255,0.15))',
                  backgroundColor: 'rgba(0,0,0,0.2)',
                  color: 'var(--color-text-primary, #fff)',
                  fontSize: '0.88rem',
                  boxSizing: 'border-box',
                }}
              />
            </div>

            <div className="form-group">
              <label className="form-label" style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--color-text-primary, #fff)', display: 'block', marginBottom: '0.3rem' }}>
                Postal Code
              </label>
              <input
                type="text"
                name="postalCode"
                id="postalCode"
                className="form-input"
                value={formData.postalCode}
                onChange={handleChange}
                placeholder="560038"
                style={{
                  width: '100%',
                  padding: '0.65rem 0.85rem',
                  borderRadius: '8px',
                  border: '1px solid var(--color-border, rgba(255,255,255,0.15))',
                  backgroundColor: 'rgba(0,0,0,0.2)',
                  color: 'var(--color-text-primary, #fff)',
                  fontSize: '0.88rem',
                  boxSizing: 'border-box',
                }}
              />
            </div>
          </div>

          {/* SECTION 3: Delivery Information */}
          <div
            style={{
              fontSize: '0.88rem',
              fontWeight: 700,
              color: '#f59e0b',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              marginBottom: '0.85rem',
              borderBottom: '1px solid var(--color-border, rgba(255,255,255,0.1))',
              paddingBottom: '0.35rem',
            }}
          >
            3. Vehicle & Delivery Details
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1.4fr', gap: '1rem', marginBottom: '1rem' }}>
            <div className="form-group">
              <label className="form-label" style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--color-text-primary, #fff)', display: 'block', marginBottom: '0.3rem' }}>
                Vehicle Type
              </label>
              <select
                name="vehicleType"
                id="vehicleType"
                className="form-select"
                value={formData.vehicleType}
                onChange={handleChange}
                style={{
                  width: '100%',
                  padding: '0.65rem 0.85rem',
                  borderRadius: '8px',
                  border: '1px solid var(--color-border, rgba(255,255,255,0.15))',
                  backgroundColor: 'rgba(0,0,0,0.3)',
                  color: 'var(--color-text-primary, #fff)',
                  fontSize: '0.88rem',
                  boxSizing: 'border-box',
                }}
              >
                <option value="Bike">Bike</option>
                <option value="Scooter">Scooter</option>
                <option value="Car">Car</option>
                <option value="Mini Van">Mini Van</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label" style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--color-text-primary, #fff)', display: 'block', marginBottom: '0.3rem' }}>
                Vehicle Reg. Number (Plate)
              </label>
              <input
                type="text"
                name="vehicleNum"
                id="vehicleNum"
                className="form-input"
                value={formData.vehicleNum}
                onChange={handleChange}
                placeholder="KA-04-AB-1234"
                style={{
                  width: '100%',
                  padding: '0.65rem 0.85rem',
                  borderRadius: '8px',
                  border: fieldErrors.vehicleNum ? '1px solid #ef4444' : '1px solid var(--color-border, rgba(255,255,255,0.15))',
                  backgroundColor: 'rgba(0,0,0,0.2)',
                  color: 'var(--color-text-primary, #fff)',
                  fontSize: '0.88rem',
                  boxSizing: 'border-box',
                }}
              />
              {fieldErrors.vehicleNum && <span style={{ color: '#ef4444', fontSize: '0.75rem', marginTop: '0.2rem', display: 'block' }}>{fieldErrors.vehicleNum}</span>}
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
            <div className="form-group">
              <label className="form-label" style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--color-text-primary, #fff)', display: 'block', marginBottom: '0.3rem' }}>
                Vehicle Make
              </label>
              <input
                type="text"
                name="vehicleMake"
                id="vehicleMake"
                className="form-input"
                value={formData.vehicleMake}
                onChange={handleChange}
                placeholder="e.g. Hero / Honda / Tata"
                style={{
                  width: '100%',
                  padding: '0.65rem 0.85rem',
                  borderRadius: '8px',
                  border: '1px solid var(--color-border, rgba(255,255,255,0.15))',
                  backgroundColor: 'rgba(0,0,0,0.2)',
                  color: 'var(--color-text-primary, #fff)',
                  fontSize: '0.88rem',
                  boxSizing: 'border-box',
                }}
              />
            </div>

            <div className="form-group">
              <label className="form-label" style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--color-text-primary, #fff)', display: 'block', marginBottom: '0.3rem' }}>
                Vehicle Model
              </label>
              <input
                type="text"
                name="vehicleModel"
                id="vehicleModel"
                className="form-input"
                value={formData.vehicleModel}
                onChange={handleChange}
                placeholder="e.g. Splendor / Activa"
                style={{
                  width: '100%',
                  padding: '0.65rem 0.85rem',
                  borderRadius: '8px',
                  border: '1px solid var(--color-border, rgba(255,255,255,0.15))',
                  backgroundColor: 'rgba(0,0,0,0.2)',
                  color: 'var(--color-text-primary, #fff)',
                  fontSize: '0.88rem',
                  boxSizing: 'border-box',
                }}
              />
            </div>
          </div>

          {/* SECTION 4: Operational Details */}
          <div
            style={{
              fontSize: '0.88rem',
              fontWeight: 700,
              color: '#8b5cf6',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              marginBottom: '0.85rem',
              borderBottom: '1px solid var(--color-border, rgba(255,255,255,0.1))',
              paddingBottom: '0.35rem',
            }}
          >
            4. Operational Preferences
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.75rem' }}>
            <div className="form-group">
              <label className="form-label" style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--color-text-primary, #fff)', display: 'block', marginBottom: '0.3rem' }}>
                Preferred Delivery Area / City
              </label>
              <input
                type="text"
                name="preferredCity"
                id="preferredCity"
                className="form-input"
                value={formData.preferredCity}
                onChange={handleChange}
                placeholder="e.g. South Bengaluru / Koramangala"
                style={{
                  width: '100%',
                  padding: '0.65rem 0.85rem',
                  borderRadius: '8px',
                  border: '1px solid var(--color-border, rgba(255,255,255,0.15))',
                  backgroundColor: 'rgba(0,0,0,0.2)',
                  color: 'var(--color-text-primary, #fff)',
                  fontSize: '0.88rem',
                  boxSizing: 'border-box',
                }}
              />
            </div>

            <div className="form-group">
              <label className="form-label" style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--color-text-primary, #fff)', display: 'block', marginBottom: '0.3rem' }}>
                Emergency Contact
              </label>
              <input
                type="text"
                name="emergencyContact"
                id="emergencyContact"
                className="form-input"
                value={formData.emergencyContact}
                onChange={handleChange}
                placeholder="+91 91234 56789"
                style={{
                  width: '100%',
                  padding: '0.65rem 0.85rem',
                  borderRadius: '8px',
                  border: '1px solid var(--color-border, rgba(255,255,255,0.15))',
                  backgroundColor: 'rgba(0,0,0,0.2)',
                  color: 'var(--color-text-primary, #fff)',
                  fontSize: '0.88rem',
                  boxSizing: 'border-box',
                }}
              />
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            id="delivery-register-submit-btn"
            disabled={submitting}
            style={{
              width: '100%',
              padding: '0.9rem',
              borderRadius: '10px',
              border: 'none',
              background: 'linear-gradient(135deg, #10b981, #059669)',
              color: '#ffffff',
              fontSize: '1rem',
              fontWeight: 700,
              cursor: submitting ? 'not-allowed' : 'pointer',
              opacity: submitting ? 0.7 : 1,
              boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)',
              transition: 'all 0.2s ease',
            }}
          >
            {submitting ? 'Registering Delivery Partner Account...' : 'Complete Registration & Proceed to KYC →'}
          </button>
        </form>

        {/* Existing Rider Sign-in prompt */}
        <div
          style={{
            marginTop: '1.75rem',
            paddingTop: '1.25rem',
            borderTop: '1px solid var(--color-border, rgba(255,255,255,0.1))',
            textAlign: 'center',
            fontSize: '0.875rem',
            color: 'var(--color-text-secondary, #94a3b8)',
          }}
        >
          Already registered as Delivery Partner?{' '}
          <Link to="/delivery/login" style={{ color: '#10b981', fontWeight: 700, textDecoration: 'none' }}>
            Sign In here
          </Link>
        </div>
      </div>
    </div>
  );
};

export default DeliveryRegisterPage;
