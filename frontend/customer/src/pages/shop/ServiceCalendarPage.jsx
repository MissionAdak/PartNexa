import React, { useState, useEffect } from 'react';
import shopService from '../../services/shopService';
import toast from 'react-hot-toast';
import { Lightbulb, Calendar, User, Car, Home, Building2, Check, Lock } from 'lucide-react';

export const ServiceCalendarPage = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('ALL');
  const [selectedDate, setSelectedDate] = useState('');
  const [actionLoading, setActionLoading] = useState(null);

  // Completion modal state
  const [completingJob, setCompletingJob] = useState(null);
  const [technicianNotes, setTechnicianNotes] = useState('');
  const [confirmationCode, setConfirmationCode] = useState('');

  const fetchJobs = async () => {
    setLoading(true);
    try {
      const params = {};
      if (activeFilter !== 'ALL') params.status = activeFilter;
      if (selectedDate) params.date = selectedDate;

      const res = await shopService.getCalendar(params);
      setJobs(res.data || []);
    } catch (err) {
      toast.error('Failed to load service schedule.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, [activeFilter, selectedDate]);

  const handleUpdateStatus = async (jobId, newStatus, notes = '') => {
    setActionLoading(jobId);
    try {
      const res = await shopService.updateJobStatus(jobId, newStatus, notes);
      toast.success(`Job updated to ${newStatus}`);
      setCompletingJob(null);
      setTechnicianNotes('');
      setConfirmationCode('');
      fetchJobs();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update job.');
    } finally {
      setActionLoading(null);
    }
  };

  const handleVerifyAndComplete = async (e) => {
    if (e) e.preventDefault();
    if (!completingJob) return;

    const codeClean = (confirmationCode || '').trim();
    if (!codeClean || codeClean.length !== 6) {
      toast.error('Please enter the 6-digit confirmation code provided by the customer.');
      return;
    }

    setActionLoading(completingJob.id);
    try {
      const res = await shopService.verifyJobCompletion(completingJob.id, codeClean, technicianNotes);
      toast.success('Installation completion verified successfully!');
      if (res.data?.commission?.isReleased || res.data?.commission?.releaseStatus === 'RELEASED') {
        toast.success('Commission RELEASED! Both service completion and payment conditions cleared.');
      } else {
        toast('Service verified. Commission will be RELEASED once customer payment clears.');
      }
      setCompletingJob(null);
      setConfirmationCode('');
      setTechnicianNotes('');
      fetchJobs();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Verification failed. Please check the code.');
    } finally {
      setActionLoading(null);
    }
  };

  const openCompletionModal = (job) => {
    setCompletingJob(job);
    setConfirmationCode('');
    setTechnicianNotes('All replacement parts installed, torqued, and verified functional. Road test completed.');
  };

  const filters = [
    { id: 'ALL', label: 'All Jobs' },
    { id: 'SCHEDULED', label: 'Scheduled' },
    { id: 'ACCEPTED', label: 'Accepted' },
    { id: 'IN_PROGRESS', label: 'In Progress' },
    { id: 'COMPLETED', label: 'Completed' },
    { id: 'CANCELLED', label: 'Cancelled' },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Header & Controls */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', marginBottom: '0.25rem' }}>Service Calendar & Jobs</h1>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem' }}>
            Track, accept, and complete DIFM installations and customer vehicle visits.
          </p>
        </div>

        {/* Date Filter */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <label style={{ fontSize: '0.825rem', fontWeight: 600, color: 'var(--color-text-secondary)' }}>
            Filter Date:
          </label>
          <input
            type="date"
            className="form-input"
            style={{ padding: '0.4rem 0.75rem', width: 'auto' }}
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
          />
          {selectedDate && (
            <button
              onClick={() => setSelectedDate('')}
              className="btn btn-secondary btn-sm"
              style={{ fontSize: '0.75rem' }}
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Filter Tabs */}
      <div
        style={{
          display: 'flex',
          gap: '0.5rem',
          flexWrap: 'wrap',
          borderBottom: '1px solid var(--color-border)',
          paddingBottom: '0.75rem',
        }}
      >
        {filters.map((f) => {
          const isActive = activeFilter === f.id;
          return (
            <button
              key={f.id}
              onClick={() => setActiveFilter(f.id)}
              className="btn"
              style={{
                background: isActive ? 'var(--color-primary)' : 'var(--color-bg-card)',
                color: isActive ? '#FFFFFF' : 'var(--color-text-secondary)',
                border: '1px solid',
                borderColor: isActive ? 'var(--color-primary)' : 'var(--color-border)',
                padding: '0.45rem 1rem',
                fontSize: '0.825rem',
                borderRadius: 'var(--radius-full)',
                fontWeight: isActive ? 600 : 500,
              }}
            >
              {f.label}
            </button>
          );
        })}
      </div>

      {/* Strict Rule Callout */}
      <div
        style={{
          background: 'var(--color-info-bg)',
          border: '1px solid rgba(2, 132, 199, 0.2)',
          borderRadius: 'var(--radius-md)',
          padding: '0.75rem 1rem',
          fontSize: '0.8rem',
          color: 'var(--color-primary-dark)',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
        }}
      >
        <Lightbulb size={18} strokeWidth={1.75} style={{ flexShrink: 0, color: 'var(--color-primary)' }} />
        <span>
          <strong>Automated Commission Release Rule:</strong> Service fee commission is released to your ledger balance
          immediately once you mark the service <strong>COMPLETED</strong> and customer payment has cleared.
        </span>
      </div>

      {/* Jobs Grid / List */}
      {loading ? (
        <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--color-text-muted)' }}>
          Loading service appointments...
        </div>
      ) : jobs.length === 0 ? (
        <div className="card" style={{ padding: '3rem', textAlign: 'center' }}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '0.75rem' }}>
            <Calendar size={40} strokeWidth={1.75} style={{ color: 'var(--color-text-muted)' }} />
          </div>
          <h3 style={{ fontSize: '1.2rem', marginBottom: '0.25rem' }}>No Jobs Found</h3>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem' }}>
            No appointments match the selected status or date filter.
          </p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '1.25rem' }}>
          {jobs.map((job) => {
            const scheduledDateStr = job.scheduledDate
              ? new Date(job.scheduledDate).toLocaleDateString('en-IN', {
                  weekday: 'short',
                  day: 'numeric',
                  month: 'short',
                })
              : 'Date TBD';

            return (
              <div
                key={job.id}
                className="card"
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  borderTop: `4px solid ${
                    job.status === 'COMPLETED'
                      ? '#10B981'
                      : job.status === 'IN_PROGRESS'
                      ? '#F59E0B'
                      : job.status === 'ACCEPTED'
                      ? '#0284C7'
                      : job.status === 'CANCELLED'
                      ? '#EF4444'
                      : 'var(--color-border-strong)'
                  }`,
                }}
              >
                <div>
                  {/* Top Meta */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                    <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-text-muted)' }}>
                      {job.id} • {job.orderNumber}
                    </span>
                    <span
                      className={`badge ${
                        job.status === 'COMPLETED'
                          ? 'badge-success'
                          : job.status === 'IN_PROGRESS'
                          ? 'badge-warning'
                          : job.status === 'ACCEPTED'
                          ? 'badge-info'
                          : job.status === 'CANCELLED'
                          ? 'badge-error'
                          : 'badge-neutral'
                      }`}
                    >
                      {job.status}
                    </span>
                  </div>

                  {/* Service Title */}
                  <h3 style={{ fontSize: '1.05rem', marginBottom: '0.5rem', lineHeight: 1.3 }}>
                    {job.serviceName}
                  </h3>

                  {/* Customer & Vehicle */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', marginBottom: '0.85rem' }}>
                    <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-text-primary)', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                      <User size={15} strokeWidth={1.75} /> {job.customerName} ({job.customerPhone})
                    </div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                      <Car size={15} strokeWidth={1.75} /> {job.vehicleInfo} • Reg: <strong>{job.vehicleNumber}</strong>
                    </div>
                  </div>

                  {/* Schedule & Location */}
                  <div
                    style={{
                      background: 'var(--color-bg-elevated)',
                      border: '1px solid var(--color-border)',
                      borderRadius: 'var(--radius-md)',
                      padding: '0.65rem 0.85rem',
                      fontSize: '0.78rem',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '0.25rem',
                      marginBottom: '0.85rem',
                    }}
                  >
                    <div>
                      <strong>Slot:</strong> {scheduledDateStr} ({job.scheduledSlot || 'Slot TBD'})
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                      <strong>Location:</strong>{' '}
                      {job.locationType === 'DOORSTEP' ? (
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
                          <Home size={13} strokeWidth={1.75} /> Customer Home Doorstep
                        </span>
                      ) : (
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
                          <Building2 size={13} strokeWidth={1.75} /> Workshop Service Bay
                        </span>
                      )}
                    </div>
                    <div style={{ color: 'var(--color-text-muted)', fontSize: '0.72rem' }}>
                      {job.serviceAddress}
                    </div>
                    {job.notes && (
                      <div style={{ color: 'var(--color-text-secondary)', fontStyle: 'italic', borderTop: '1px solid var(--color-border)', paddingTop: '0.25rem' }}>
                        Note: {job.notes}
                      </div>
                    )}
                  </div>
                </div>

                {/* Price & Actions Bottom Bar */}
                <div style={{ borderTop: '1px solid var(--color-border)', paddingTop: '0.85rem', marginTop: '0.5rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                    <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>Service Value</span>
                    <span style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--color-text-primary)' }}>
                      ₹{Number(job.totalServiceAmount || job.serviceFee || 0).toLocaleString('en-IN')}
                    </span>
                  </div>

                  <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                    {job.status === 'SCHEDULED' && (
                      <>
                        <button
                          onClick={() => handleUpdateStatus(job.id, 'ACCEPTED')}
                          disabled={actionLoading === job.id}
                          className="btn btn-secondary btn-sm"
                          style={{ flex: 1 }}
                        >
                          Accept
                        </button>
                        <button
                          onClick={() => handleUpdateStatus(job.id, 'CANCELLED', 'Shop capacity reached')}
                          disabled={actionLoading === job.id}
                          className="btn btn-danger btn-sm"
                        >
                          Decline
                        </button>
                      </>
                    )}

                    {job.status === 'ACCEPTED' && (
                      <button
                        onClick={() => handleUpdateStatus(job.id, 'IN_PROGRESS')}
                        disabled={actionLoading === job.id}
                        className="btn btn-primary btn-sm"
                        style={{ width: '100%' }}
                      >
                        Start Service
                      </button>
                    )}

                    {job.status === 'IN_PROGRESS' && (
                      <button
                        onClick={() => openCompletionModal(job)}
                        disabled={actionLoading === job.id}
                        className="btn btn-success btn-sm"
                        style={{ width: '100%', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '0.35rem' }}
                      >
                        <Check size={16} strokeWidth={2} /> Complete Service
                      </button>
                    )}

                    {job.status === 'COMPLETED' && (
                      <div style={{ width: '100%', textAlign: 'center', fontSize: '0.8rem', color: '#10B981', fontWeight: 600, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '0.35rem' }}>
                        <Check size={14} strokeWidth={2} /> Completed ({job.completedAt ? new Date(job.completedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Verified'})
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Completion Modal with Customer Confirmation Code */}
      {completingJob && (
        <div className="modal-overlay">
          <div className="modal-card">
            <h2 style={{ fontSize: '1.35rem', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Lock size={20} strokeWidth={1.75} style={{ color: 'var(--color-primary)' }} /> Enter Customer Confirmation Code
            </h2>
            <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', marginBottom: '1.25rem' }}>
              Confirm installation completion for <strong>{completingJob.serviceName}</strong> (Job #{completingJob.id?.substring(0, 8)}).
            </p>

            <form onSubmit={handleVerifyAndComplete}>
              <div className="form-group" style={{ marginBottom: '1.25rem' }}>
                <label className="form-label" style={{ fontWeight: 700, color: 'var(--color-text-primary)' }}>
                  6-Digit Customer Confirmation Code <span style={{ color: '#EF4444' }}>*</span>
                </label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. 482193"
                  value={confirmationCode}
                  onChange={(e) => setConfirmationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  maxLength={6}
                  required
                  autoFocus
                  style={{
                    fontSize: '1.5rem',
                    letterSpacing: '0.3em',
                    fontFamily: 'monospace',
                    textAlign: 'center',
                    fontWeight: 700,
                    padding: '0.65rem',
                  }}
                  id="verify-completion-code-input"
                />
                <p style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)', marginTop: '0.4rem', marginBottom: 0 }}>
                  Ask the customer for the 6-digit code displayed in their PartNexa order details.
                </p>
              </div>

              <div className="form-group" style={{ marginBottom: '1.25rem' }}>
                <label className="form-label">Technician Inspection & Service Notes</label>
                <textarea
                  className="form-textarea"
                  rows={2}
                  value={technicianNotes}
                  onChange={(e) => setTechnicianNotes(e.target.value)}
                  placeholder="Details of fitment, torquing, road test result..."
                />
              </div>

              <div
                style={{
                  background: 'var(--color-bg-elevated)',
                  border: '1px solid var(--color-border)',
                  borderRadius: 'var(--radius-md)',
                  padding: '0.85rem',
                  marginBottom: '1.5rem',
                  fontSize: '0.8rem',
                }}
              >
                <div style={{ fontWeight: 600, marginBottom: '0.25rem' }}>Commission Release Trigger:</div>
                <div style={{ color: 'var(--color-text-secondary)' }}>
                  Upon customer verification, PartNexa checks whether customer payment has cleared. If cleared, ₹
                  {Math.round((completingJob.totalServiceAmount || 0) * 0.88).toLocaleString('en-IN')} net earnings will be
                  immediately released to your ledger balance.
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
                <button
                  type="button"
                  onClick={() => setCompletingJob(null)}
                  className="btn btn-secondary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading === completingJob.id || confirmationCode.length !== 6}
                  className="btn btn-success"
                  id="confirm-verify-completion-btn"
                >
                  {actionLoading === completingJob.id ? 'Verifying...' : 'Verify & Complete'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ServiceCalendarPage;
