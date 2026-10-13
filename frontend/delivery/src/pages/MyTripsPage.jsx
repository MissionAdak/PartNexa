import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import deliveryService from '../services/deliveryService';
import toast from 'react-hot-toast';
import { Bike, Package, ArrowRight, MapPin, Navigation, CheckCircle2, Search } from 'lucide-react';

export const MyTripsPage = () => {
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('ALL');

  const fetchTrips = async () => {
    try {
      setLoading(true);
      const data = await deliveryService.getMyJobs();
      setTrips(data);
    } catch (err) {
      toast.error('Failed to load rider trips.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTrips();
  }, []);

  const handleUpdateStatus = async (jobId, newStatus) => {
    try {
      await deliveryService.updateJobStatus(jobId, newStatus);
      toast.success(`Trip status updated to ${newStatus.replace('_', ' ')}!`);
      await fetchTrips();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Status update failed.');
    }
  };

  const filteredTrips = trips.filter((t) => {
    if (statusFilter === 'ALL') return true;
    if (statusFilter === 'ACTIVE') return ['ACCEPTED', 'PICKED_UP', 'IN_TRANSIT'].includes(t.status);
    return t.status === statusFilter;
  });

  if (loading) {
    return (
      <div className="delivery-container" style={{ textAlign: 'center', padding: '4rem 1rem' }}>
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1rem' }}>
          <Bike size={44} strokeWidth={1.75} style={{ color: 'var(--color-primary)' }} />
        </div>
        <div>Loading your delivery trips...</div>
      </div>
    );
  }

  return (
    <div className="delivery-container">
      {/* Title */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.75rem' }}>
        <div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '1.75rem', fontWeight: 800, marginBottom: '0.25rem' }}>
            My Delivery Trips ({filteredTrips.length})
          </h1>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem' }}>
            Trips claimed and assigned exclusively to your delivery partner account.
          </p>
        </div>

        {/* Filter Tabs */}
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          {[
            { key: 'ALL', label: 'All Trips' },
            { key: 'ACTIVE', label: 'Active (In-Transit)' },
            { key: 'DELIVERED', label: 'Delivered' },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setStatusFilter(tab.key)}
              className={`btn btn-sm ${statusFilter === tab.key ? 'btn-primary' : 'btn-secondary'}`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {filteredTrips.length === 0 ? (
        <div className="delivery-card" style={{ textAlign: 'center', padding: '3rem' }}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '0.75rem' }}>
            <Package size={44} strokeWidth={1.75} style={{ color: 'var(--color-text-muted)' }} />
          </div>
          <div style={{ fontWeight: 700, fontSize: '1.1rem', marginBottom: '0.25rem' }}>No Trips Found</div>
          <div style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', marginBottom: '1.25rem' }}>
            You do not have any trips matching this filter.
          </div>
          <Link to="/jobs/available" className="btn btn-primary btn-sm" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
            Browse Available Jobs Feed <ArrowRight size={14} strokeWidth={1.75} />
          </Link>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {filteredTrips.map((trip) => (
            <div key={trip.id} className="delivery-card">
              {/* Header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem', marginBottom: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                  <span style={{ fontWeight: 800, fontSize: '1.1rem' }}>
                    {trip.orderNumber || trip.id}
                  </span>
                  <span className={`delivery-badge ${trip.type === 'USED_PART_PICKUP' ? 'badge-usedpart' : 'badge-transit'}`}>
                    {trip.type}
                  </span>
                  <span
                    className={`delivery-badge ${
                      trip.status === 'DELIVERED' ? 'badge-delivered' : 'badge-transit'
                    }`}
                  >
                    {trip.status}
                  </span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <span style={{ fontWeight: 800, fontSize: '1.05rem', color: 'var(--color-emerald)' }}>
                    ₹{trip.deliveryFee}
                  </span>
                  <Link to={`/jobs/${trip.id}`} className="btn btn-secondary btn-sm">
                    Open Navigation Map →
                  </Link>
                </div>
              </div>

              {/* Locations */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem', marginBottom: '1rem' }}>
                <div style={{ padding: '0.75rem', background: 'var(--color-surface)', borderRadius: 'var(--radius-sm)' }}>
                  <div style={{ fontSize: '0.725rem', fontWeight: 700, color: 'var(--color-primary)', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                    <MapPin size={13} strokeWidth={1.75} /> Pickup Location
                  </div>
                  <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>{trip.pickupLocation?.name}</div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>{trip.pickupLocation?.address}</div>
                </div>

                <div style={{ padding: '0.75rem', background: 'var(--color-surface)', borderRadius: 'var(--radius-sm)' }}>
                  <div style={{ fontSize: '0.725rem', fontWeight: 700, color: 'var(--color-emerald)', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                    <Navigation size={13} strokeWidth={1.75} /> Drop Destination
                  </div>
                  <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>{trip.dropLocation?.name}</div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>{trip.dropLocation?.address}</div>
                </div>
              </div>

              {/* Progression Controls */}
              {trip.status !== 'DELIVERED' && (
                <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', borderTop: '1px solid var(--color-border)', paddingTop: '0.85rem' }}>
                  {trip.status === 'ACCEPTED' && (
                    <button
                      onClick={() => handleUpdateStatus(trip.id, 'PICKED_UP')}
                      className="btn btn-primary btn-sm"
                      style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}
                    >
                      <Package size={14} strokeWidth={1.75} /> Confirm Picked Up
                    </button>
                  )}

                  {trip.status === 'PICKED_UP' && (
                    <button
                      onClick={() => handleUpdateStatus(trip.id, 'IN_TRANSIT')}
                      className="btn btn-amber btn-sm"
                      style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}
                    >
                      <Bike size={14} strokeWidth={1.75} /> Start Transit
                    </button>
                  )}

                  {trip.status === 'IN_TRANSIT' && trip.type !== 'USED_PART_PICKUP' && (
                    <button
                      onClick={() => handleUpdateStatus(trip.id, 'DELIVERED')}
                      className="btn btn-emerald btn-sm"
                      style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}
                    >
                      <CheckCircle2 size={14} strokeWidth={1.75} /> Confirm Delivered
                    </button>
                  )}

                  {trip.type === 'USED_PART_PICKUP' && (
                    <Link
                      to={`/jobs/${trip.id}/inspect`}
                      className="btn btn-primary btn-sm"
                      style={{ background: '#9333EA', display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}
                    >
                      <Search size={14} strokeWidth={1.75} /> Conduct Doorstep Inspection Checklist <ArrowRight size={14} strokeWidth={1.75} />
                    </Link>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyTripsPage;
