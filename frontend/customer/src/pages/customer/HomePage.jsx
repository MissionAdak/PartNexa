import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Car,
  Bike,
  Zap,
  Search,
  Cog,
  Disc,
  Lightbulb,
  BatteryCharging,
  CircleDot,
  Sparkles,
  Snowflake,
  ShieldCheck,
  CheckCircle2,
  RotateCcw,
  Lock,
  Wrench,
  Warehouse,
  RefreshCw,
  ArrowRight,
  Percent,
  Check,
} from 'lucide-react';
import { catalogService, vehiclesService } from '../../services';
import ProductCard, { ProductCardSkeleton } from '../../components/product/ProductCard';
import './HomePage.css';

// ---- 1. Compact Vehicle Search Widget ----
const VehicleSearchWidget = () => {
  const navigate = useNavigate();
  const [makes, setMakes] = useState([]);
  const [models, setModels] = useState([]);
  const [variants, setVariants] = useState([]);
  const [selectedMake, setSelectedMake] = useState('');
  const [selectedModel, setSelectedModel] = useState('');
  const [selectedVariant, setSelectedVariant] = useState('');
  const [vehicleType, setVehicleType] = useState('CAR');
  const [loadingModels, setLoadingModels] = useState(false);
  const [loadingVariants, setLoadingVariants] = useState(false);

  useEffect(() => {
    vehiclesService.getMakes(vehicleType)
      .then(({ data }) => {
        const list = Array.isArray(data?.data) ? data.data : (Array.isArray(data) ? data : []);
        setMakes(list);
      })
      .catch((err) => {
        console.error('Failed to fetch vehicle makes:', err);
        setMakes([]);
      });
    setSelectedMake('');
    setSelectedModel('');
    setSelectedVariant('');
    setModels([]);
    setVariants([]);
  }, [vehicleType]);

  const handleMakeChange = async (makeId) => {
    setSelectedMake(makeId);
    setSelectedModel('');
    setSelectedVariant('');
    setVariants([]);
    if (!makeId) {
      setModels([]);
      return;
    }
    setLoadingModels(true);
    try {
      const { data } = await vehiclesService.getModels(makeId);
      const list = Array.isArray(data?.data) ? data.data : (Array.isArray(data) ? data : []);
      setModels(list);
    } catch (err) {
      console.error('Failed to fetch vehicle models:', err);
      setModels([]);
    } finally {
      setLoadingModels(false);
    }
  };

  const handleModelChange = async (modelId) => {
    setSelectedModel(modelId);
    setSelectedVariant('');
    if (!modelId) {
      setVariants([]);
      return;
    }
    setLoadingVariants(true);
    try {
      const { data } = await vehiclesService.getVariants(modelId);
      const list = Array.isArray(data?.data) ? data.data : (Array.isArray(data) ? data : []);
      setVariants(list);
    } catch (err) {
      console.error('Failed to fetch vehicle variants:', err);
      setVariants([]);
    } finally {
      setLoadingVariants(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (selectedVariant) {
      navigate(`/customer/products?vehicleVariantId=${selectedVariant}`);
    } else if (selectedModel) {
      navigate(`/customer/products?modelId=${selectedModel}`);
    } else if (selectedMake) {
      navigate(`/customer/products?makeId=${selectedMake}`);
    } else {
      navigate('/customer/products');
    }
  };

  const vehicleTypes = [
    { id: 'CAR', label: 'Car', icon: Car },
    { id: 'BIKE', label: 'Bike', icon: Bike },
    { id: 'SCOOTER', label: 'Scooter', icon: Zap },
  ];

  return (
    <div className="home-vehicle-widget" id="home-vehicle-selector">
      <div className="widget-header">
        <span className="widget-badge">Guaranteed Fitment</span>
        <h3 className="widget-title">Select Your Vehicle</h3>
        <p className="widget-desc">View direct-fit spare parts verified for your exact model</p>
      </div>

      <div className="vehicle-type-tabs" role="tablist" aria-label="Vehicle Type">
        {vehicleTypes.map((vt) => {
          const IconComp = vt.icon;
          return (
            <button
              key={vt.id}
              type="button"
              className={`vehicle-type-tab ${vehicleType === vt.id ? 'active' : ''}`}
              onClick={() => setVehicleType(vt.id)}
              id={`vehicle-type-${vt.id.toLowerCase()}`}
              role="tab"
              aria-selected={vehicleType === vt.id}
            >
              <IconComp size={16} strokeWidth={2} />
              <span>{vt.label}</span>
            </button>
          );
        })}
      </div>

      <form className="vehicle-selector-form" onSubmit={handleSearch}>
        <div className="selector-field">
          <label htmlFor="hero-make-select" className="field-label">Make / Brand</label>
          <select
            id="hero-make-select"
            className="form-select"
            value={selectedMake}
            onChange={(e) => handleMakeChange(e.target.value)}
          >
            <option value="">Select Vehicle Make</option>
            {makes.map((m) => (
              <option key={m.id} value={m.id}>{m.name}</option>
            ))}
          </select>
        </div>

        <div className="selector-field">
          <label htmlFor="hero-model-select" className="field-label">Model</label>
          <select
            id="hero-model-select"
            className="form-select"
            value={selectedModel}
            onChange={(e) => handleModelChange(e.target.value)}
            disabled={!selectedMake || loadingModels}
          >
            <option value="">
              {loadingModels ? 'Loading models...' : 'Select Model'}
            </option>
            {models.map((m) => (
              <option key={m.id} value={m.id}>{m.name}</option>
            ))}
          </select>
        </div>

        <div className="selector-field">
          <label htmlFor="hero-variant-select" className="field-label">Variant & Year</label>
          <select
            id="hero-variant-select"
            className="form-select"
            value={selectedVariant}
            onChange={(e) => setSelectedVariant(e.target.value)}
            disabled={!selectedModel || loadingVariants}
          >
            <option value="">
              {loadingVariants ? 'Loading variants...' : 'Select Variant / Fuel'}
            </option>
            {variants.map((v) => (
              <option key={v.id} value={v.id}>
                {v.year ? `${v.year} · ` : ''}{v.name} ({v.fuelType || 'Petrol'})
              </option>
            ))}
          </select>
        </div>

        <button
          type="submit"
          className="btn btn-primary btn-block vehicle-search-btn"
          id="hero-find-parts-btn"
        >
          <Search size={18} strokeWidth={2} />
          <span>Find Compatible Parts</span>
        </button>
      </form>
    </div>
  );
};

// ---- 2. Trust Strip Component (Strictly SVG icons, no emojis) ----
const TrustStrip = () => {
  const trustPoints = [
    {
      icon: ShieldCheck,
      title: 'Verified Parts',
      detail: '100% Genuine OEM & OES certified',
    },
    {
      icon: CheckCircle2,
      title: 'Vehicle Compatibility',
      detail: 'Guaranteed direct fitment match',
    },
    {
      icon: Wrench,
      title: 'Doorstep Installation',
      detail: 'Certified DIFM mechanic network',
    },
    {
      icon: RotateCcw,
      title: 'Easy Returns',
      detail: '7-day hassle-free return policy',
    },
    {
      icon: Lock,
      title: 'Secure Payments',
      detail: 'Encrypted Razorpay & COD support',
    },
  ];

  return (
    <section className="trust-strip" aria-label="Customer Trust & Guarantees">
      <div className="container">
        <div className="trust-grid">
          {trustPoints.map((item, idx) => {
            const IconComponent = item.icon;
            return (
              <div key={idx} className="trust-col">
                <div className="trust-icon-box">
                  <IconComponent size={20} strokeWidth={2} />
                </div>
                <div className="trust-info">
                  <span className="trust-title">{item.title}</span>
                  <span className="trust-detail">{item.detail}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

// ---- 8 Useful Canonical Categories (4 columns × 2 rows on desktop) ----
const CANONICAL_CATEGORIES = [
  {
    id: 'cat-braking',
    slug: 'braking-system',
    name: 'Braking System',
    desc: 'Brake pads, rotors, drums & master cylinders',
    icon: Disc,
  },
  {
    id: 'cat-engine',
    slug: 'engine-parts',
    name: 'Engine & Ignition',
    desc: 'Pistons, spark plugs, timing belts & pumps',
    icon: Cog,
  },
  {
    id: 'cat-electrical',
    slug: 'electrical-lighting',
    name: 'Electrical & Lighting',
    desc: 'Headlamps, alternators, sensors & wiring',
    icon: Lightbulb,
  },
  {
    id: 'cat-batteries',
    slug: 'batteries-power',
    name: 'Batteries & Power',
    desc: 'High-crank maintenance-free 12V batteries',
    icon: BatteryCharging,
  },
  {
    id: 'cat-suspension',
    slug: 'suspension-steering',
    name: 'Suspension & Steering',
    desc: 'Shock absorbers, strut mounts & tie rods',
    icon: CircleDot,
  },
  {
    id: 'cat-filters',
    slug: 'filters-maintenance',
    name: 'Filters & Servicing',
    desc: 'Engine oil filters, air filters & cabin filters',
    icon: Sparkles,
  },
  {
    id: 'cat-oils',
    slug: 'oils-lubricants',
    name: 'Oils & Lubricants',
    desc: 'Fully synthetic engine oils & brake fluids',
    icon: Snowflake,
  },
  {
    id: 'cat-body',
    slug: 'body-parts',
    name: 'Body & Mirrors',
    desc: 'ORVMs, bumpers, door handles & wipers',
    icon: Car,
  },
];

// ---- Main HomePage Component ----
export default function HomePage() {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(true);

  useEffect(() => {
    document.title = 'PartNexa — Automotive Spare Parts & Doorstep Installation';

    catalogService.listProducts({ limit: 8, sortBy: 'createdAt', sortOrder: 'desc' })
      .then((res) => {
        const prodList = Array.isArray(res?.data?.data) ? res.data.data : (Array.isArray(res?.data) ? res.data : []);
        setFeaturedProducts(prodList);
      })
      .catch((err) => {
        console.error('Failed to load featured products:', err);
        setFeaturedProducts([]);
      })
      .finally(() => setLoadingProducts(false));
  }, []);

  return (
    <div className="home-page-container">
      {/* 1. CLEAN HERO SECTION */}
      <section className="home-hero-section">
        <div className="container">
          <div className="hero-split-grid">
            <div className="hero-copy-column">
              <span className="hero-eyebrow">
                Automotive E-Commerce & Doorstep Fitment
              </span>
              <h1 className="hero-headline">
                Find Compatible Spare Parts for Your Vehicle
              </h1>
              <p className="hero-subhead">
                Access certified OEM and OES replacement components engineered for your exact make and model.
                Optionally bundle certified mechanic installation right at your doorstep.
              </p>
              <div className="hero-cta-group">
                <Link to="/customer/products" className="btn btn-primary btn-lg" id="hero-browse-parts-btn">
                  <span>Browse All Parts</span>
                  <ArrowRight size={18} strokeWidth={2} />
                </Link>
                <Link to="/customer/services" className="btn btn-outline btn-lg" id="hero-book-service-btn">
                  <span>Book Service</span>
                </Link>
              </div>
            </div>

            {/* Vehicle Selector Card */}
            <div className="hero-widget-column">
              <VehicleSearchWidget />
            </div>
          </div>
        </div>
      </section>

      {/* 2. TRUST STRIP */}
      <TrustStrip />

      {/* 3. SHOP BY CATEGORY (Desktop: exactly 4 columns × 2 rows = 8 useful categories) */}
      <section className="home-section categories-section">
        <div className="container">
          <div className="section-head-row">
            <div>
              <h2 className="section-heading">Shop by Category</h2>
              <p className="section-subheading">Explore top automotive systems and replacement parts</p>
            </div>
            <Link to="/customer/products" className="section-link-action" id="view-all-categories-link">
              <span>View All Catalog</span>
              <ArrowRight size={16} strokeWidth={2} />
            </Link>
          </div>

          <div className="categories-grid-8" role="region" aria-label="Part Categories">
            {CANONICAL_CATEGORIES.map((cat) => {
              const IconComp = cat.icon;
              return (
                <Link
                  key={cat.id}
                  to={`/customer/products?categorySlug=${cat.slug}`}
                  className="cat-card"
                  id={`cat-card-${cat.slug}`}
                >
                  <div className="cat-icon-wrapper">
                    <IconComp size={24} strokeWidth={1.8} />
                  </div>
                  <div className="cat-text-wrapper">
                    <h3 className="cat-name">{cat.name}</h3>
                    <p className="cat-desc">{cat.desc}</p>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* 4. FEATURED PARTS */}
      <section className="home-section featured-parts-section">
        <div className="container">
          <div className="section-head-row">
            <div>
              <h2 className="section-heading">Featured Spare Parts</h2>
              <p className="section-subheading">In-stock genuine OEM and verified replacement components</p>
            </div>
            <Link to="/customer/products" className="section-link-action" id="view-all-parts-link">
              <span>Browse All Spares</span>
              <ArrowRight size={16} strokeWidth={2} />
            </Link>
          </div>

          <div className="products-showcase-grid">
            {loadingProducts
              ? Array.from({ length: 4 }).map((_, i) => <ProductCardSkeleton key={i} />)
              : featuredProducts.slice(0, 8).map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))
            }
          </div>

          {!loadingProducts && featuredProducts.length === 0 && (
            <div className="empty-catalog-fallback">
              <p>No products listed yet.</p>
              <Link to="/customer/products" className="btn btn-primary btn-sm">Browse Products</Link>
            </div>
          )}
        </div>
      </section>

      {/* 5. WHY PARTNEXA */}
      <section className="home-section why-partnexa-section">
        <div className="container">
          <div className="section-head-row text-center-row">
            <h2 className="section-heading">Why Vehicle Owners Choose PartNexa</h2>
            <p className="section-subheading">Built specifically to solve automotive repair uncertainty with transparent parts and verified fitment.</p>
          </div>

          <div className="why-grid">
            <div className="why-card">
              <div className="why-icon-box">
                <ShieldCheck size={26} strokeWidth={2} />
              </div>
              <h3 className="why-card-title">Genuine & Verified Parts</h3>
              <p className="why-card-desc">
                Every OEM and aftermarket component undergoes strict specification compliance checks, ensuring guaranteed durability and performance.
              </p>
            </div>

            <div className="why-card">
              <div className="why-icon-box">
                <Wrench size={26} strokeWidth={2} />
              </div>
              <h3 className="why-card-title">DIFM Installation</h3>
              <p className="why-card-desc">
                Bundle certified technician installation right during checkout. Mechanics arrive at your home equipped with specialized tools.
              </p>
            </div>

            <div className="why-card">
              <div className="why-icon-box">
                <Warehouse size={26} strokeWidth={2} />
              </div>
              <h3 className="why-card-title">Workshop Network</h3>
              <p className="why-card-desc">
                Access a vetted network of multi-brand partner garages for complex mechanical overhauls, electronic calibrations, and inspections.
              </p>
            </div>

            <div className="why-card">
              <div className="why-icon-box">
                <RefreshCw size={26} strokeWidth={2} />
              </div>
              <h3 className="why-card-title">Used-Part Circular Marketplace</h3>
              <p className="why-card-desc">
                Buy inspected pre-owned OEM components at up to 60% savings, or sell usable old parts to earn credits and reduce automotive scrap.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 6. SUBSCRIPTION SECTION — PartNexa Care Plans */}
      <section className="home-section subscription-section">
        <div className="container">
          <div className="care-plans-card">
            <div className="care-plans-content">
              <div className="care-plans-badge">
                <Percent size={14} strokeWidth={2.2} />
                <span>PartNexa Care Plans</span>
              </div>
              <h2 className="care-plans-title">Annual Vehicle Care & Maintenance Plans</h2>
              <p className="care-plans-subtitle">
                Scheduled service coverage, discounts on spare parts, and dedicated breakdown support packaged into convenient subscription plans.
              </p>

              <div className="care-plans-pillars">
                <div className="pillar-item">
                  <div className="pillar-bullet">
                    <Check size={16} strokeWidth={2.5} />
                  </div>
                  <div>
                    <h4 className="pillar-title">Maintenance Benefits</h4>
                    <p className="pillar-desc">Scheduled periodic oil changes, multi-point digital inspections, and fluid top-ups.</p>
                  </div>
                </div>

                <div className="pillar-item">
                  <div className="pillar-bullet">
                    <Check size={16} strokeWidth={2.5} />
                  </div>
                  <div>
                    <h4 className="pillar-title">Service Savings</h4>
                    <p className="pillar-desc">Up to 20% discount on all spare parts and subsidized workshop labor charges.</p>
                  </div>
                </div>

                <div className="pillar-item">
                  <div className="pillar-bullet">
                    <Check size={16} strokeWidth={2.5} />
                  </div>
                  <div>
                    <h4 className="pillar-title">Priority Support & Dispatch</h4>
                    <p className="pillar-desc">Dedicated service advisor, expedited courier dispatches, and emergency assistance.</p>
                  </div>
                </div>
              </div>

              <div className="care-plans-cta-row">
                <Link to="/customer/subscriptions" className="btn btn-primary" id="home-view-plans-btn">
                  <span>View Plans</span>
                  <ArrowRight size={16} strokeWidth={2} />
                </Link>
                <Link to="/customer/my-subscriptions" className="btn btn-outline" id="home-my-subscriptions-btn">
                  <span>My Subscription</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 7. DIFM (Do It For Me) SECTION — Simplified, clean, no stacked fake cards */}
      <section className="home-section difm-service-section">
        <div className="container">
          <div className="difm-split-layout">
            <div className="difm-info-col">
              <span className="difm-label-tag">Hassle-Free Fitment</span>
              <h2 className="difm-main-heading">Do-It-For-Me (DIFM) Doorstep Service</h2>
              <p className="difm-description">
                Don't have the tools or time to install replacement parts yourself?
                Select "Doorstep Installation" during checkout, and a certified technician will handle the entire procedure.
              </p>

              <div className="difm-process-steps">
                <div className="difm-step">
                  <div className="step-num">1</div>
                  <div>
                    <span className="step-title">Order Compatible Spares</span>
                    <span className="step-desc">Pick guaranteed direct-fit parts for your vehicle model.</span>
                  </div>
                </div>

                <div className="difm-step">
                  <div className="step-num">2</div>
                  <div>
                    <span className="step-title">Select Installation Slot</span>
                    <span className="step-desc">Choose convenient doorstep fitment or a partner workshop.</span>
                  </div>
                </div>

                <div className="difm-step">
                  <div className="step-num">3</div>
                  <div>
                    <span className="step-title">Certified Mechanic Arrives</span>
                    <span className="step-desc">Trained technician performs professional torque-spec installation.</span>
                  </div>
                </div>

                <div className="difm-step">
                  <div className="step-num">4</div>
                  <div>
                    <span className="step-title">Inspection & Warranty Signoff</span>
                    <span className="step-desc">Digital inspection checklist with full workmanship warranty.</span>
                  </div>
                </div>
              </div>

              <div className="difm-cta-wrap">
                <Link to="/customer/services" className="btn btn-primary" id="home-difm-explore-btn">
                  <span>Explore DIFM Services</span>
                  <ArrowRight size={16} strokeWidth={2} />
                </Link>
              </div>
            </div>

            <div className="difm-services-preview-col">
              <div className="service-offer-card">
                <div className="service-offer-header">
                  <Wrench size={20} strokeWidth={2} />
                  <span>Popular Doorstep Services</span>
                </div>
                <div className="service-items-list">
                  <div className="service-quick-item">
                    <div>
                      <div className="service-item-name">Brake Pad & Rotor Replacement</div>
                      <div className="service-item-detail">Front / rear disc pads fitment + brake bleed</div>
                    </div>
                    <span className="badge badge-success">Available</span>
                  </div>

                  <div className="service-quick-item">
                    <div>
                      <div className="service-item-name">Battery Replacement & Testing</div>
                      <div className="service-item-detail">12V battery installation + alternator check</div>
                    </div>
                    <span className="badge badge-success">Available</span>
                  </div>

                  <div className="service-quick-item">
                    <div>
                      <div className="service-item-name">Periodic Filter & Fluid Service</div>
                      <div className="service-item-detail">Oil filter, air filter + fluid top-ups</div>
                    </div>
                    <span className="badge badge-success">Available</span>
                  </div>

                  <div className="service-quick-item">
                    <div>
                      <div className="service-item-name">Headlamp & Electrical Fitment</div>
                      <div className="service-item-detail">Bulbs, relay harness & headlight assembly</div>
                    </div>
                    <span className="badge badge-success">Available</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 8. USED PARTS / CIRCULAR ECONOMY */}
      <section className="home-section circular-marketplace-section">
        <div className="container">
          <div className="circular-card">
            <div className="circular-header">
              <span className="circular-badge">
                <RefreshCw size={14} strokeWidth={2} />
                <span>Circular Automotive Marketplace</span>
              </span>
              <h2 className="circular-title">Sell Old Usable Spare Parts</h2>
              <p className="circular-subhead">
                Replaced working parts during an upgrade? Sell them to fellow vehicle owners through our verified garage inspection workflow.
              </p>
            </div>

            <div className="circular-flow-row">
              <div className="circular-flow-step">
                <div className="flow-step-index">01</div>
                <h4 className="flow-step-title">List Usable Spare Parts</h4>
                <p className="flow-step-desc">Upload clear photos, vehicle details, and OEM part number from your garage profile.</p>
              </div>

              <div className="circular-flow-arrow" aria-hidden="true">
                <ArrowRight size={20} strokeWidth={2} />
              </div>

              <div className="circular-flow-step">
                <div className="flow-step-index">02</div>
                <h4 className="flow-step-title">Partner Garage Inspection</h4>
                <p className="flow-step-desc">Drop off at any certified partner garage for thorough testing and quality grading.</p>
              </div>

              <div className="circular-flow-arrow" aria-hidden="true">
                <ArrowRight size={20} strokeWidth={2} />
              </div>

              <div className="circular-flow-step">
                <div className="flow-step-index">03</div>
                <h4 className="flow-step-title">Verified Resale & Payout</h4>
                <p className="flow-step-desc">Part is listed with the PartNexa Verified seal, and proceeds are credited directly to you.</p>
              </div>
            </div>

            <div className="circular-actions">
              <Link to="/customer/sell-used-parts" className="btn btn-primary" id="home-sell-part-btn">
                <span>Sell a Used Part</span>
                <ArrowRight size={16} strokeWidth={2} />
              </Link>
              <Link to="/customer/products?condition=USED_VERIFIED" className="btn btn-outline" id="home-browse-used-btn">
                <span>Browse Verified Used Parts</span>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
