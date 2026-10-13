import React, { useState, useEffect } from 'react';
import { servicesService, usersService } from '../services';
import { useAuth } from '../contexts/AuthContext';
import { useVehicles } from '../contexts/VehicleContext';
import { Button, Modal, Input } from '../components/ui';
import { BrandLogo } from '../components/vehicle/BrandLogos';
import toast from 'react-hot-toast';
import './ServicesPage.css';

const SERVICES_CATALOG = [
  {
    id: 'brakes',
    title: 'Brake Pad & Rotor Replacement',
    icon: '🛑',
    eta: '45 - 60 mins',
    price: 499,
    description: 'Precision caliper cleaning, high-temp lubricant application, and OE brake pad installation.',
    features: ['OE-spec pad fitment', 'Disc rotor resurfacing check', 'Road test validation'],
  },
  {
    id: 'battery',
    title: 'Battery Health Scan & Fitting',
    icon: '🔋',
    eta: '20 - 30 mins',
    price: 199,
    description: 'Complete alternator load test, terminal de-oxidation, and zero-downtime battery installation.',
    features: ['CCA diagnostic report', 'Terminal grease application', 'Old battery disposal credit'],
  },
  {
    id: 'obd',
    title: 'Engine Diagnostics & OBD2 Scan',
    icon: '💻',
    eta: '30 mins',
    price: 399,
    description: 'Comprehensive digital ECU scan for error trouble codes (DTC), sensor calibration, and clear check-engine.',
    features: ['32-point electronic sweep', 'PDF diagnostic report', 'Error code reset'],
  },
  {
    id: 'suspension',
    title: 'Suspension & Shock Absorber Service',
    icon: '🚗',
    eta: '90 - 120 mins',
    price: 699,
    description: 'Strut mounting, bushing inspection, hydraulic damping tests, and steering alignment check.',
    features: ['Hydraulic shock testing', 'Ball joint grease packing', 'Ride height inspection'],
  },
  {
    id: 'oil',
    title: 'Periodic Maintenance & Oil Change',
    icon: '🛢️',
    eta: '60 mins',
    price: 349,
    description: 'Fully synthetic oil drain and flush, genuine OEM oil filter swap, and 24-point vehicle inspection.',
    features: ['OEM filter included', 'Sump plug washer replacement', 'Fluid top-ups (coolant, washer)'],
  },
  {
    id: 'ac',
    title: 'AC Gas Charge & Cabin Filtration',
    icon: '❄️',
    eta: '45 mins',
    price: 599,
    description: 'R134a refrigerant leak testing, vacuum leak detection, compressor oil top-up, and PM2.5 filter swap.',
    features: ['High/low pressure gauge test', 'Anti-bacterial duct steam', 'OEM cabin filter install'],
  },
];

const getTomorrowDate = () => {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  return d.toISOString().split('T')[0];
};

const getTodayDate = () => {
  return new Date().toISOString().split('T')[0];
};

const ServicesPage = () => {
  const { user } = useAuth();
  const { vehicles, activeVehicle, primaryVehicle } = useVehicles();

  const [shops, setShops] = useState([]);
  const [loadingShops, setLoadingShops] = useState(false);
  const [selectedCity, setSelectedCity] = useState('Bengaluru');
  const [addresses, setAddresses] = useState([]);

  // Existing Appointments
  const [myAppointments, setMyAppointments] = useState([]);
  const [loadingAppointments, setLoadingAppointments] = useState(false);

  // Modal & Form State
  const [bookingModalOpen, setBookingModalOpen] = useState(false);
  const [selectedService, setSelectedService] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [bookingData, setBookingData] = useState({
    name: '',
    phone: '',
    customerVehicleId: '',
    vehicleModel: '',
    vehicleNumber: '',
    preferredDate: getTomorrowDate(),
    serviceMode: 'DOORSTEP',
    shopId: '',
    addressId: '',
    customAddress: '',
    notes: '',
  });

  const cities = ['Bengaluru', 'Mumbai', 'Delhi NCR', 'Pune', 'Hyderabad'];

  const applyFallbackShops = () => {
    setShops([
      {
        id: 'shop_1',
        name: 'PartNexa SuperCenter Koramangala',
        city: 'Bengaluru',
        address: '80 Feet Road, 4th Block, Koramangala',
        rating: 4.8,
        reviewsCount: 142,
        distanceKm: '2.4 km',
        isOpen: true,
        timings: '08:30 AM - 08:00 PM',
        phone: '+91 98450 12345',
        badges: ['Authorized Partner', 'Certified Techs'],
        slots: ['10:00 AM', '11:30 AM', '02:00 PM', '04:30 PM', '06:00 PM'],
      },
      {
        id: 'shop_2',
        name: 'SpeedySpares Autoworks Whitefield',
        city: 'Bengaluru',
        address: 'ITPL Main Road, Near Hope Farm Junction',
        rating: 4.9,
        reviewsCount: 98,
        distanceKm: '5.1 km',
        isOpen: true,
        timings: '09:00 AM - 08:30 PM',
        phone: '+91 98450 67890',
        badges: ['Express Bay', 'OE Fitment Specialist'],
        slots: ['09:30 AM', '11:00 AM', '01:30 PM', '03:30 PM', '05:00 PM'],
      },
      {
        id: 'shop_3',
        name: 'Precision Motors HSR Layout',
        city: 'Bengaluru',
        address: '27th Main, Sector 1, HSR Layout',
        rating: 4.7,
        reviewsCount: 84,
        distanceKm: '3.8 km',
        isOpen: true,
        timings: '09:00 AM - 07:30 PM',
        phone: '+91 98450 11223',
        badges: ['Multi-brand OE Tools'],
        slots: ['10:30 AM', '12:00 PM', '02:30 PM', '04:00 PM'],
      },
    ]);
  };

  const fetchShops = async (city) => {
    setLoadingShops(true);
    try {
      const res = await servicesService.getShops(city);
      const list = res.data?.data || res.data || [];
      if (list.length > 0) {
        setShops(list);
      } else {
        applyFallbackShops();
      }
    } catch {
      applyFallbackShops();
    } finally {
      setLoadingShops(false);
    }
  };

  const loadAppointments = async () => {
    setLoadingAppointments(true);
    try {
      const res = await servicesService.getMyAppointments();
      const list = Array.isArray(res.data?.data)
        ? res.data.data
        : Array.isArray(res.data)
        ? res.data
        : [];
      setMyAppointments(list);
    } catch {
      // Ignore initial error if route not available
    } finally {
      setLoadingAppointments(false);
    }
  };

  useEffect(() => {
    document.title = 'Installation & Repair Services | PartNexa';
    fetchShops(selectedCity);
  }, [selectedCity]);

  useEffect(() => {
    if (user) {
      // Load user addresses for Doorstep mode
      usersService
        .getAddresses()
        .then((res) => {
          const list = Array.isArray(res.data?.data)
            ? res.data.data
            : Array.isArray(res.data)
            ? res.data
            : [];
          setAddresses(list);
        })
        .catch(() => setAddresses([]));

      // Load customer appointments from real backend
      loadAppointments();
    }
  }, [user]);

  // Open Booking with AUTO-FILL
  const handleOpenBooking = (service) => {
    setSelectedService(service);

    // 1. Auto-fill Customer Full Name & Phone
    const fullName = user
      ? `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.email || ''
      : '';
    const phone = user?.phone || '';

    // 2. Auto-fill Active Vehicle from VehicleContext
    const currentActive = activeVehicle || primaryVehicle || (vehicles && vehicles[0]) || null;
    let initialVehicleId = '';
    let initialVehicleDesc = '';
    let initialRegNumber = '';

    if (currentActive) {
      initialVehicleId = currentActive.id;
      const v = currentActive.variant;
      initialVehicleDesc = `${v?.model?.make?.name || ''} ${v?.model?.name || ''} ${v?.year || ''} (${v?.name || ''})`.trim();
      initialRegNumber = currentActive.regNumber || '';
    }

    // 3. Auto-fill default address if available
    const defaultAddr = addresses.find((a) => a.isDefault) || addresses[0] || null;

    setBookingData({
      name: fullName,
      phone: phone,
      customerVehicleId: initialVehicleId,
      vehicleModel: initialVehicleDesc,
      vehicleNumber: initialRegNumber,
      preferredDate: getTomorrowDate(),
      serviceMode: 'DOORSTEP',
      shopId: shops[0]?.id || '',
      addressId: defaultAddr?.id || '',
      customAddress: '',
      notes: '',
    });

    setBookingModalOpen(true);
  };

  const handleVehicleChange = (e) => {
    const selectedId = e.target.value;
    if (selectedId === 'CUSTOM' || !selectedId) {
      setBookingData({
        ...bookingData,
        customerVehicleId: 'CUSTOM',
        vehicleModel: '',
        vehicleNumber: '',
      });
      return;
    }

    const found = vehicles.find((v) => v.id === selectedId);
    if (found) {
      const v = found.variant;
      const desc = `${v?.model?.make?.name || ''} ${v?.model?.name || ''} ${v?.year || ''} (${v?.name || ''})`.trim();
      setBookingData({
        ...bookingData,
        customerVehicleId: found.id,
        vehicleModel: desc,
        vehicleNumber: found.regNumber || '',
      });
    }
  };

  const handleConfirmBooking = async (e) => {
    e.preventDefault();

    if (!bookingData.name.trim()) {
      toast.error('Please enter your full name');
      return;
    }
    if (!bookingData.phone.trim()) {
      toast.error('Please enter a contact phone number');
      return;
    }
    if (!bookingData.preferredDate) {
      toast.error('Please select a preferred service date');
      return;
    }
    if (!bookingData.vehicleModel.trim() && bookingData.customerVehicleId === 'CUSTOM') {
      toast.error('Please specify your vehicle make & model');
      return;
    }
    if (bookingData.serviceMode === 'WORKSHOP' && !bookingData.shopId && shops.length > 0) {
      toast.error('Please select a partner workshop');
      return;
    }

    setSubmitting(true);

    try {
      const payload = {
        serviceCode: selectedService?.id || 'service',
        serviceName: selectedService?.title || 'Vehicle Service',
        serviceMode: bookingData.serviceMode,
        mode: bookingData.serviceMode,
        preferredDate: bookingData.preferredDate,
        customerVehicleId:
          bookingData.customerVehicleId && bookingData.customerVehicleId !== 'CUSTOM'
            ? bookingData.customerVehicleId
            : null,
        vehicleInfo: bookingData.vehicleModel || 'Customer Vehicle',
        vehicleNumber: bookingData.vehicleNumber || null,
        contactName: bookingData.name.trim(),
        contactPhone: bookingData.phone.trim(),
        shopId:
          bookingData.serviceMode === 'WORKSHOP'
            ? bookingData.shopId
            : bookingData.shopId || shops[0]?.id || null,
        addressId:
          bookingData.serviceMode === 'DOORSTEP' &&
          bookingData.addressId &&
          bookingData.addressId !== 'CUSTOM'
            ? bookingData.addressId
            : null,
        notes:
          bookingData.customAddress && bookingData.addressId === 'CUSTOM'
            ? `Doorstep Address: ${bookingData.customAddress}. ${bookingData.notes || ''}`.trim()
            : bookingData.notes || null,
        quotedLaborPrice: selectedService?.price || 0,
      };

      const res = await servicesService.bookAppointment(payload);
      const appointment = res.data?.data?.appointment || res.data?.data;

      const apptId = appointment?.id ? `#${appointment.id.substring(0, 8)}` : '';
      toast.success(
        `Appointment booked successfully! Reference ${apptId}. Our technician will contact you.`
      );

      setBookingModalOpen(false);
      loadAppointments();
    } catch (err) {
      console.error('Booking failed:', err);
      const msg =
        err.response?.data?.message ||
        err.response?.data?.error ||
        'Failed to confirm booking. Please try again.';
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const selectedVehicleObj = vehicles.find((v) => v.id === bookingData.customerVehicleId);

  return (
    <div className="services-page">
      {/* Hero Banner */}
      <section className="services-hero">
        <div className="container">
          <div className="services-hero-content animate-fade-in-up">
            <div className="services-hero-badge">
              <span>🔧</span> Do-It-For-Me (DIFM) Certified Repair Network
            </div>
            <h1 className="services-hero-title">
              Professional Vehicle Fitment & Mechanical Services
            </h1>
            <p className="services-hero-desc">
              Don’t want to install parts yourself? Book certified PartNexa mechanics for
              doorstep installation or visit our verified partner workshops with dedicated service bays.
            </p>
            <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
              <Button
                variant="teal"
                size="lg"
                onClick={() => handleOpenBooking(SERVICES_CATALOG[0])}
                id="hero-book-doorstep-btn"
              >
                📅 Book Doorstep Mechanic
              </Button>
              <a href="#partner-workshops" style={{ textDecoration: 'none' }}>
                <Button variant="outline" size="lg" id="hero-find-workshop-btn">
                  🏬 Find Partner Workshop
                </Button>
              </a>
            </div>
          </div>
        </div>
      </section>

      <div className="container">
        {/* Confirmed Appointments Section (If any) */}
        {myAppointments.length > 0 && (
          <section className="my-appointments-section animate-fade-in" style={{ marginBottom: '48px' }}>
            <div className="section-title-wrap">
              <h2 className="section-main-title" style={{ fontSize: '1.4rem' }}>
                📋 My Active Service Bookings ({myAppointments.length})
              </h2>
              <p className="section-subtitle">
                Your confirmed appointments with certified mechanics and partner workshops
              </p>
            </div>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
                gap: '16px',
              }}
            >
              {myAppointments.map((appt) => (
                <div
                  key={appt.id}
                  className="card"
                  style={{
                    padding: '16px 20px',
                    borderLeft: '4px solid #10b981',
                    background: 'var(--bg-surface)',
                  }}
                  id={`appointment-${appt.id}`}
                >
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      marginBottom: '8px',
                    }}
                  >
                    <span
                      style={{
                        fontWeight: 700,
                        fontSize: '0.85rem',
                        color: 'var(--text-primary)',
                      }}
                    >
                      {appt.mode === 'DOORSTEP' ? '🏡 Doorstep Service' : '🏬 Workshop Visit'}
                    </span>
                    <span
                      className="badge"
                      style={{
                        background: '#dcfce7',
                        color: '#15803d',
                        fontWeight: 700,
                        fontSize: '0.75rem',
                        padding: '2px 8px',
                        borderRadius: '6px',
                      }}
                    >
                      {appt.status}
                    </span>
                  </div>
                  <h4 style={{ margin: '0 0 6px 0', fontSize: '1.05rem', color: 'var(--text-primary)' }}>
                    {appt.serviceName}
                  </h4>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '4px' }}>
                    🚗 {appt.vehicleInfo} {appt.vehicleNumber ? `[${appt.vehicleNumber}]` : ''}
                  </div>
                  <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                    📅 Date: {new Date(appt.preferredDate).toLocaleDateString('en-IN', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                    })}
                    {' · '}
                    💰 Quoted: ₹{appt.quotedLaborPrice}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Services Catalog */}
        <section className="services-catalog-section">
          <div className="section-title-wrap">
            <h2 className="section-main-title">Available Mechanical & Fitting Services</h2>
            <p className="section-subtitle">
              Standardized upfront labor pricing with 100% genuine parts installation warranty
            </p>
          </div>

          <div className="services-catalog-grid">
            {SERVICES_CATALOG.map((service) => (
              <div key={service.id} className="service-card" id={`service-card-${service.id}`}>
                <div className="service-card-top">
                  <div className="service-icon-wrap">{service.icon}</div>
                  <div>
                    <h3 className="service-title">{service.title}</h3>
                    <div className="service-meta-row">
                      <span className="service-eta">⏱️ {service.eta}</span>
                      <span className="service-price">₹{service.price}</span>
                    </div>
                  </div>
                </div>

                <p className="service-desc">{service.description}</p>

                <ul className="service-features-list">
                  {service.features.map((feat, i) => (
                    <li key={i}>
                      <span className="check-bullet">✓</span> {feat}
                    </li>
                  ))}
                </ul>

                <Button
                  variant="teal"
                  fullWidth
                  onClick={() => handleOpenBooking(service)}
                  id={`book-service-${service.id}-btn`}
                >
                  Book Service
                </Button>
              </div>
            ))}
          </div>
        </section>

        {/* Partner Workshops Section */}
        <section id="partner-workshops" className="partner-workshops-section">
          <div className="section-title-wrap">
            <h2 className="section-main-title">Verified Partner Workshops & Service Bays</h2>
            <p className="section-subtitle">
              Locate authorized PartNexa diagnostic bays for complex mechanical repairs & warranty claims
            </p>
          </div>

          {/* City Filter Pills */}
          <div className="city-filter-bar">
            {cities.map((city) => (
              <button
                key={city}
                className={`city-pill ${selectedCity === city ? 'active' : ''}`}
                onClick={() => setSelectedCity(city)}
                id={`city-filter-${city.toLowerCase().replace(/\s+/g, '-')}`}
              >
                📍 {city}
              </button>
            ))}
          </div>

          {loadingShops ? (
            <div className="shops-grid">
              {[1, 2, 3].map((i) => (
                <div key={i} className="skeleton" style={{ height: 180, borderRadius: 16 }} />
              ))}
            </div>
          ) : (
            <div className="shops-grid">
              {shops.map((shop) => (
                <div key={shop.id} className="shop-card" id={`shop-${shop.id}`}>
                  <div>
                    <div className="shop-card-header">
                      <div>
                        <h3 className="shop-name">{shop.name}</h3>
                        <div className="shop-location">
                          <span>📍</span> {shop.address}
                        </div>
                      </div>
                      <div className="shop-rating-pill">★ {shop.rating || '4.8'}</div>
                    </div>

                    <div className="shop-card-stats">
                      <div className="shop-stat">
                        <span>Active Bays</span>
                        <strong>{shop.activeBays || 4} Hydraulic Bays</strong>
                      </div>
                      <div className="shop-stat">
                        <span>Technicians</span>
                        <strong>{shop.technicians || 6} Certified Mechs</strong>
                      </div>
                    </div>
                  </div>

                  <Button
                    variant="outline"
                    fullWidth
                    onClick={() => {
                      const initialService = SERVICES_CATALOG[0];
                      handleOpenBooking(initialService);
                      setBookingData((prev) => ({
                        ...prev,
                        serviceMode: 'WORKSHOP',
                        shopId: shop.id,
                      }));
                    }}
                    id={`book-at-shop-${shop.id}-btn`}
                  >
                    Select This Workshop
                  </Button>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>

      {/* Standalone Service Booking Modal */}
      {bookingModalOpen && selectedService && (
        <Modal
          isOpen={bookingModalOpen}
          onClose={() => setBookingModalOpen(false)}
          title={`Book ${selectedService.title}`}
          size="md"
        >
          <form onSubmit={handleConfirmBooking} id="service-booking-form">
            {/* Service & Price Summary Banner */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '12px 16px',
                background: 'var(--bg-tertiary)',
                borderRadius: 'var(--radius-lg)',
                marginBottom: '18px',
                border: '1px solid var(--border-color)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ fontSize: '1.6rem' }}>{selectedService.icon}</span>
                <div>
                  <div style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '0.95rem' }}>
                    {selectedService.title}
                  </div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                    ⏱️ ETA: {selectedService.eta}
                  </div>
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--color-teal-500)' }}>
                  ₹{selectedService.price}
                </div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Fixed Labor Price</div>
              </div>
            </div>

            {/* Service Mode Selector */}
            <div style={{ marginBottom: '16px' }}>
              <label
                style={{
                  display: 'block',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  marginBottom: '8px',
                  color: 'var(--text-primary)',
                }}
              >
                Service Delivery Mode
              </label>
              <div style={{ display: 'flex', gap: '10px' }}>
                <button
                  type="button"
                  id="mode-doorstep-btn"
                  className={`btn ${
                    bookingData.serviceMode === 'DOORSTEP' ? 'btn-teal' : 'btn-outline'
                  } btn-sm`}
                  style={{ flex: 1 }}
                  onClick={() => setBookingData({ ...bookingData, serviceMode: 'DOORSTEP' })}
                >
                  🏡 Doorstep Service
                </button>
                <button
                  type="button"
                  id="mode-workshop-btn"
                  className={`btn ${
                    bookingData.serviceMode === 'WORKSHOP' ? 'btn-teal' : 'btn-outline'
                  } btn-sm`}
                  style={{ flex: 1 }}
                  onClick={() => setBookingData({ ...bookingData, serviceMode: 'WORKSHOP' })}
                >
                  🏬 Partner Workshop
                </button>
              </div>
            </div>

            {/* Customer Details: Full Name & Phone Number (Auto-filled from Authenticated Customer) */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '12px',
                marginBottom: '14px',
              }}
            >
              <div>
                <Input
                  label="Full Name"
                  id="booking-name-input"
                  placeholder="e.g. Aarav Sharma"
                  value={bookingData.name}
                  onChange={(e) => setBookingData({ ...bookingData, name: e.target.value })}
                  required
                />
              </div>
              <div>
                <Input
                  label="Contact Phone"
                  id="booking-phone-input"
                  placeholder="9876543210"
                  value={bookingData.phone}
                  onChange={(e) => setBookingData({ ...bookingData, phone: e.target.value })}
                  required
                />
              </div>
            </div>

            {/* Vehicle Selection: My Garage Dropdown with Active Vehicle Default */}
            <div style={{ marginBottom: '14px' }}>
              <label
                htmlFor="booking-vehicle-select"
                style={{
                  display: 'block',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  marginBottom: '6px',
                  color: 'var(--text-primary)',
                }}
              >
                Vehicle for Service
              </label>

              {vehicles && vehicles.length > 0 ? (
                <>
                  <select
                    id="booking-vehicle-select"
                    className="form-select input"
                    value={bookingData.customerVehicleId}
                    onChange={handleVehicleChange}
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      borderRadius: 'var(--radius-md)',
                      border: '1px solid var(--border-color)',
                      background: 'var(--bg-surface)',
                      color: 'var(--text-primary)',
                      fontSize: '0.9rem',
                    }}
                  >
                    {vehicles.map((v) => {
                      const make = v.variant?.model?.make?.name || '';
                      const model = v.variant?.model?.name || '';
                      const year = v.variant?.year || '';
                      const variantName = v.variant?.name || '';
                      const isActive = activeVehicle?.id === v.id;
                      const isPrimary = v.isPrimary;

                      return (
                        <option key={v.id} value={v.id}>
                          {v.nickname ? `"${v.nickname}" — ` : ''}
                          {make} {model} {year} ({variantName})
                          {v.regNumber ? ` [${v.regNumber}]` : ''}
                          {isActive ? ' [✓ ACTIVE]' : isPrimary ? ' [⭐ PRIMARY]' : ''}
                        </option>
                      );
                    })}
                    <option value="CUSTOM">+ Enter Different Vehicle Manually</option>
                  </select>

                  {/* Vehicle Preview Chip when a garage vehicle is selected */}
                  {selectedVehicleObj && bookingData.customerVehicleId !== 'CUSTOM' && (
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px',
                        marginTop: '8px',
                        padding: '8px 12px',
                        background: 'var(--bg-tertiary)',
                        borderRadius: 'var(--radius-md)',
                        border: '1px solid var(--border-color)',
                      }}
                    >
                      {selectedVehicleObj.variant?.model?.make?.name && (
                        <BrandLogo
                          brandName={selectedVehicleObj.variant.model.make.name}
                          size={24}
                        />
                      )}
                      <div style={{ flex: 1, fontSize: '0.85rem', color: 'var(--text-primary)' }}>
                        <strong>
                          {selectedVehicleObj.variant?.model?.make?.name}{' '}
                          {selectedVehicleObj.variant?.model?.name}
                        </strong>{' '}
                        <span style={{ color: 'var(--text-secondary)' }}>
                          {selectedVehicleObj.variant?.year} ({selectedVehicleObj.variant?.name})
                        </span>
                      </div>
                      {selectedVehicleObj.regNumber && (
                        <span
                          style={{
                            fontFamily: 'monospace',
                            fontWeight: 700,
                            fontSize: '0.75rem',
                            background: '#fbbf24',
                            color: '#1e293b',
                            padding: '2px 6px',
                            borderRadius: '4px',
                            border: '1px solid #f59e0b',
                          }}
                        >
                          {selectedVehicleObj.regNumber}
                        </span>
                      )}
                    </div>
                  )}
                </>
              ) : null}

              {/* Manual Vehicle Entry if CUSTOM or garage is empty */}
              {(bookingData.customerVehicleId === 'CUSTOM' || (!vehicles || vehicles.length === 0)) && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginTop: '8px' }}>
                  <Input
                    placeholder="e.g. Maruti Suzuki Swift 2021"
                    id="manual-vehicle-input"
                    value={bookingData.vehicleModel}
                    onChange={(e) => setBookingData({ ...bookingData, vehicleModel: e.target.value })}
                    required
                  />
                  <Input
                    placeholder="Reg No (e.g. KA-01-AB-1234)"
                    id="manual-reg-input"
                    value={bookingData.vehicleNumber}
                    onChange={(e) => setBookingData({ ...bookingData, vehicleNumber: e.target.value.toUpperCase() })}
                  />
                </div>
              )}
            </div>

            {/* WORKSHOP MODE: Select Partner Workshop */}
            {bookingData.serviceMode === 'WORKSHOP' && (
              <div style={{ marginBottom: '14px' }}>
                <label
                  htmlFor="booking-workshop-select"
                  style={{
                    display: 'block',
                    fontSize: '0.85rem',
                    fontWeight: 600,
                    marginBottom: '6px',
                    color: 'var(--text-primary)',
                  }}
                >
                  Select Partner Workshop
                </label>
                <select
                  id="booking-workshop-select"
                  className="form-select input"
                  value={bookingData.shopId}
                  onChange={(e) => setBookingData({ ...bookingData, shopId: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border-color)',
                    background: 'var(--bg-surface)',
                    color: 'var(--text-primary)',
                    fontSize: '0.9rem',
                  }}
                >
                  {shops.map((shop) => (
                    <option key={shop.id} value={shop.id}>
                      🏬 {shop.name} ({shop.city || selectedCity}) — {shop.address}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* DOORSTEP MODE: Select Saved Address or Input Custom */}
            {bookingData.serviceMode === 'DOORSTEP' && (
              <div style={{ marginBottom: '14px' }}>
                <label
                  htmlFor="booking-address-select"
                  style={{
                    display: 'block',
                    fontSize: '0.85rem',
                    fontWeight: 600,
                    marginBottom: '6px',
                    color: 'var(--text-primary)',
                  }}
                >
                  Doorstep Service Address
                </label>

                {addresses && addresses.length > 0 ? (
                  <select
                    id="booking-address-select"
                    className="form-select input"
                    value={bookingData.addressId}
                    onChange={(e) => setBookingData({ ...bookingData, addressId: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      borderRadius: 'var(--radius-md)',
                      border: '1px solid var(--border-color)',
                      background: 'var(--bg-surface)',
                      color: 'var(--text-primary)',
                      fontSize: '0.9rem',
                    }}
                  >
                    {addresses.map((addr) => (
                      <option key={addr.id} value={addr.id}>
                        🏡 {addr.label || 'Home'}: {addr.line1}, {addr.city} {addr.pincode}
                        {addr.isDefault ? ' (Default)' : ''}
                      </option>
                    ))}
                    <option value="CUSTOM">+ Use Another Address</option>
                  </select>
                ) : (
                  <Input
                    placeholder="Enter street, landmark, city & pincode"
                    id="doorstep-custom-address-input"
                    value={bookingData.customAddress}
                    onChange={(e) => setBookingData({ ...bookingData, customAddress: e.target.value })}
                    required
                  />
                )}

                {addresses.length > 0 && bookingData.addressId === 'CUSTOM' && (
                  <Input
                    placeholder="Enter door/street, landmark & pincode"
                    id="doorstep-custom-address-input"
                    value={bookingData.customAddress}
                    onChange={(e) => setBookingData({ ...bookingData, customAddress: e.target.value })}
                    style={{ marginTop: '8px' }}
                    required
                  />
                )}
              </div>
            )}

            {/* Preferred Date */}
            <div style={{ marginBottom: '14px' }}>
              <Input
                type="date"
                id="booking-date-input"
                label="Preferred Service Date"
                min={getTodayDate()}
                value={bookingData.preferredDate}
                onChange={(e) => setBookingData({ ...bookingData, preferredDate: e.target.value })}
                required
              />
            </div>

            {/* Special Instructions / Notes */}
            <div style={{ marginBottom: '20px' }}>
              <label
                htmlFor="booking-notes-input"
                style={{
                  display: 'block',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  marginBottom: '6px',
                  color: 'var(--text-primary)',
                }}
              >
                Special Instructions (Optional)
              </label>
              <textarea
                id="booking-notes-input"
                placeholder="Mention any symptoms, specific parking instructions, or gate pass requirements..."
                value={bookingData.notes}
                onChange={(e) => setBookingData({ ...bookingData, notes: e.target.value })}
                rows={2}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border-color)',
                  background: 'var(--bg-surface)',
                  color: 'var(--text-primary)',
                  fontSize: '0.9rem',
                  fontFamily: 'inherit',
                  resize: 'vertical',
                }}
              />
            </div>

            {/* Actions */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
              <Button
                type="button"
                variant="ghost"
                onClick={() => setBookingModalOpen(false)}
                id="booking-cancel-btn"
                disabled={submitting}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="teal"
                id="booking-confirm-btn"
                disabled={submitting}
              >
                {submitting ? 'Confirming...' : `Confirm Booking (₹${selectedService.price})`}
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};

export default ServicesPage;
