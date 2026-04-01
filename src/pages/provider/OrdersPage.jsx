import { useState, useEffect } from 'react';
import api from '../../services/api';
import { useAuthStore } from '../../store/authStore';

const SERVICE_META = {
  food:  { icon: '🍽️', label: 'Catering' },
  music: { icon: '🎵', label: 'Music Band' },
  photo: { icon: '📷', label: 'Photographer' },
};

const ORDER_STATUS_LABEL = {
  pending:      { label: 'Pending',      color: '#d97706', bg: '#fffbeb' },
  acknowledged: { label: 'Acknowledged', color: '#2563eb', bg: '#eff6ff' },
  ready:        { label: 'Ready',        color: '#16a34a', bg: '#f0fdf4' },
  rejected:     { label: 'Rejected',     color: '#dc2626', bg: '#fff5f5' },
};

const BOOKING_STATUS_LABEL = {
  pending:          'Awaiting Payment',
  deposit1_paid:    'Installment 1 Paid',
  deposit2_pending: 'Awaiting Installment 2',
  deposit2_paid:    'Installment 2 Paid',
  confirmed:        '✅ Confirmed',
  completed:        '🎉 Completed',
  overdue:          '⛔ Overdue',
};

const OrdersPage = () => {
  const { user } = useAuthStore();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [updating, setUpdating] = useState(false);
  const [statusMsg, setStatusMsg] = useState('');
  const [rejectModal, setRejectModal] = useState(null);
  const [rejectNote, setRejectNote] = useState('');

  const serviceType = user?.serviceType;
  const service = SERVICE_META[serviceType] || { icon: '🧩', label: 'Provider' };

  const fetchOrders = () => {
    setLoading(true);
    api.get('/providers/me/orders')
      .then(({ data }) => setOrders(data))
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchOrders(); }, []);

  const myStatus = (booking) => booking.orderStatuses?.[serviceType] || 'pending';

  const handleUpdateStatus = async (bookingId, status, rejectionNote) => {
    setUpdating(true);
    setStatusMsg('');
    try {
      await api.put(`/providers/orders/${bookingId}/status`, { status, rejectionNote });
      setOrders(prev => prev.map(o =>
        o._id === bookingId
          ? { ...o, orderStatuses: { ...o.orderStatuses, [serviceType]: status } }
          : o
      ));
      if (selected?._id === bookingId) {
        setSelected(prev => ({ ...prev, orderStatuses: { ...prev.orderStatuses, [serviceType]: status } }));
      }
      setStatusMsg('Status updated successfully');
    } catch (err) {
      setStatusMsg(err.response?.data?.message || 'Failed to update status');
    } finally {
      setUpdating(false);
    }
  };

  const pendingCount = orders.filter(o => myStatus(o) === 'pending').length;
  const acknowledgedCount = orders.filter(o => myStatus(o) === 'acknowledged').length;
  const rejectedCount = orders.filter(o => myStatus(o) === 'rejected').length;

  if (loading) return (
    <div className="loading-state">
      <div className="loading-dots"><span /><span /><span /></div>
      <p style={{ color: 'var(--gray-400)', marginTop: 16 }}>Loading...</p>
    </div>
  );

  return (
    <div style={{ maxWidth: 900, margin: '0 auto' }}>
      <div className="page-header">
        <h1 className="page-header__title">{service.icon} Work Orders ({service.label})</h1>
        <p className="page-header__sub">Jobs assigned to you — accept, track progress, or decline.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 12, marginBottom: 24 }}>
        {[
          { label: 'Total', value: orders.length, color: 'var(--pink)' },
          { label: 'Pending', value: pendingCount, color: '#d97706' },
          { label: 'Acknowledged', value: acknowledgedCount, color: '#2563eb' },
          { label: 'Rejected', value: rejectedCount, color: '#dc2626' },
        ].map(s => (
          <div key={s.label} style={{ background: 'white', borderRadius: 16, padding: '16px 20px', border: '1px solid var(--gray-100)', boxShadow: '0 2px 8px rgba(249,168,201,0.08)' }}>
            <div style={{ fontSize: 12, color: 'var(--gray-400)', fontWeight: 600 }}>{s.label}</div>
            <div style={{ fontSize: 28, fontWeight: 800, color: s.color }}>{s.value}</div>
          </div>
        ))}
      </div>

      {orders.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state__icon">📋</div>
          <p className="empty-state__title">No work orders yet</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {orders.map(order => {
            const st = myStatus(order);
            const statusInfo = ORDER_STATUS_LABEL[st] || ORDER_STATUS_LABEL.pending;
            return (
              <div key={order._id} style={{ background: 'white', borderRadius: 16, border: '1px solid var(--gray-100)', padding: '16px 20px', boxShadow: '0 2px 8px rgba(249,168,201,0.08)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 700, fontSize: 15, color: 'var(--gray-900)', marginBottom: 4 }}>
                      {order.venueName || 'Wedding Venue'}
                    </div>
                    <div style={{ fontSize: 13, color: 'var(--gray-400)' }}>
                      👤 {order.customerId?.username || '-'} &nbsp;·&nbsp;
                      📅 {new Date(order.eventDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })} &nbsp;·&nbsp;
                      👥 {order.guestCount?.toLocaleString()} guests
                    </div>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 8 }}>
                    <span style={{ padding: '4px 12px', borderRadius: 999, fontSize: 12, fontWeight: 700, background: statusInfo.bg, color: statusInfo.color }}>
                      {statusInfo.label}
                    </span>
                    <button onClick={() => { setSelected(order); setStatusMsg(''); }}
                      style={{ fontSize: 12, color: 'var(--pink)', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600 }}>
                      View details →
                    </button>
                  </div>
                </div>

                {st === 'pending' && (
                  <div style={{ marginTop: 12, display: 'flex', gap: 8 }}>
                    <button onClick={() => handleUpdateStatus(order._id, 'acknowledged')} disabled={updating}
                      style={{ padding: '8px 16px', borderRadius: 10, background: '#eff6ff', color: '#2563eb', border: 'none', fontWeight: 700, fontSize: 13, cursor: 'pointer' }}>
                      ✓ Accept Order
                    </button>
                    <button onClick={() => { setRejectModal(order._id); setRejectNote(''); }} disabled={updating}
                      style={{ padding: '8px 16px', borderRadius: 10, background: '#fff5f5', color: '#dc2626', border: 'none', fontWeight: 700, fontSize: 13, cursor: 'pointer' }}>
                      ✕ Decline
                    </button>
                  </div>
                )}
                {st === 'acknowledged' && (
                  <div style={{ marginTop: 12 }}>
                    <button onClick={() => handleUpdateStatus(order._id, 'ready')} disabled={updating}
                      style={{ padding: '8px 16px', borderRadius: 10, background: '#f0fdf4', color: '#16a34a', border: 'none', fontWeight: 700, fontSize: 13, cursor: 'pointer' }}>
                      ✅ Mark as Ready
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {selected && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}
          onClick={() => setSelected(null)}>
          <div style={{ background: 'white', borderRadius: 20, padding: 28, maxWidth: 480, width: '100%', maxHeight: '80vh', overflowY: 'auto' }}
            onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <h2 style={{ fontSize: 18, fontWeight: 800, color: 'var(--gray-900)' }}>📋 Order Details</h2>
              <button onClick={() => setSelected(null)} style={{ background: 'none', border: 'none', fontSize: 20, cursor: 'pointer', color: 'var(--gray-400)' }}>✕</button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {[
                ['Venue', selected.venueName || '-'],
                ['Customer', selected.customerId?.username || '-'],
                ['Event Date', new Date(selected.eventDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })],
                ['Guest Count', `${selected.guestCount?.toLocaleString()} guests`],
                ['Meal Type', selected.mealType === 'buffet' ? 'Buffet' : 'Chinese Banquet'],
                ['Notes', selected.notes || '-'],
                ['Booking Status', BOOKING_STATUS_LABEL[selected.status] || selected.status],
              ].map(([k, v]) => (
                <div key={k} style={{ display: 'flex', gap: 12 }}>
                  <span style={{ minWidth: 110, fontSize: 13, color: 'var(--gray-400)', fontWeight: 600 }}>{k}</span>
                  <span style={{ fontSize: 13, color: 'var(--gray-900)', fontWeight: 600 }}>{v}</span>
                </div>
              ))}
            </div>

            <div style={{ marginTop: 20, paddingTop: 16, borderTop: '1px solid var(--gray-100)' }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--gray-700)', marginBottom: 12 }}>My Job Status</div>
              {(() => {
                const st = myStatus(selected);
                return (
                  <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                    <button disabled={st !== 'pending' || updating} onClick={() => handleUpdateStatus(selected._id, 'acknowledged')}
                      style={{ padding: '10px 18px', borderRadius: 10, fontWeight: 700, fontSize: 13, cursor: st === 'pending' ? 'pointer' : 'default',
                        background: st === 'acknowledged' || st === 'ready' ? '#eff6ff' : st === 'pending' ? '#2563eb' : '#f3f4f6',
                        color: st === 'pending' ? 'white' : '#2563eb', border: 'none', opacity: st !== 'pending' ? 0.6 : 1 }}>
                      ✓ Accept Order
                    </button>
                    <button disabled={st !== 'acknowledged' || updating} onClick={() => handleUpdateStatus(selected._id, 'ready')}
                      style={{ padding: '10px 18px', borderRadius: 10, fontWeight: 700, fontSize: 13, cursor: st === 'acknowledged' ? 'pointer' : 'default',
                        background: st === 'ready' ? '#f0fdf4' : st === 'acknowledged' ? '#16a34a' : '#f3f4f6',
                        color: st === 'acknowledged' ? 'white' : '#16a34a', border: 'none', opacity: st !== 'acknowledged' ? 0.6 : 1 }}>
                      ✅ Mark as Ready
                    </button>
                    {st === 'pending' && (
                      <button onClick={() => { setRejectModal(selected._id); setRejectNote(''); }}
                        style={{ padding: '10px 18px', borderRadius: 10, fontWeight: 700, fontSize: 13, cursor: 'pointer',
                          background: '#fff5f5', color: '#dc2626', border: 'none' }}>
                        ✕ Decline
                      </button>
                    )}
                  </div>
                );
              })()}
              {statusMsg && (
                <p style={{ marginTop: 10, fontSize: 13, color: statusMsg.includes('successfully') ? '#16a34a' : '#dc2626', fontWeight: 600 }}>
                  {statusMsg}
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {rejectModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', zIndex: 1100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}
          onClick={() => setRejectModal(null)}>
          <div style={{ background: 'white', borderRadius: 20, padding: 28, maxWidth: 420, width: '100%' }}
            onClick={e => e.stopPropagation()}>
            <h2 style={{ fontSize: 17, fontWeight: 800, color: '#dc2626', marginBottom: 12 }}>✕ Decline Order</h2>
            <p style={{ fontSize: 13, color: 'var(--gray-500)', marginBottom: 16 }}>Please provide a reason for declining this order.</p>
            <textarea
              value={rejectNote}
              onChange={e => setRejectNote(e.target.value)}
              placeholder="e.g. Already booked on this date"
              rows={3}
              style={{ width: '100%', borderRadius: 10, border: '1px solid var(--gray-200)', padding: '10px 12px', fontSize: 13, resize: 'vertical', boxSizing: 'border-box' }}
            />
            <div style={{ display: 'flex', gap: 10, marginTop: 16 }}>
              <button onClick={() => setRejectModal(null)}
                style={{ flex: 1, padding: '10px', borderRadius: 10, border: '1px solid var(--gray-200)', background: 'white', fontWeight: 700, cursor: 'pointer' }}>
                Cancel
              </button>
              <button onClick={() => {
                handleUpdateStatus(rejectModal, 'rejected', rejectNote);
                setRejectModal(null);
                setSelected(null);
              }} disabled={updating}
                style={{ flex: 1, padding: '10px', borderRadius: 10, border: 'none', background: '#dc2626', color: 'white', fontWeight: 700, cursor: 'pointer' }}>
                Confirm Decline
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrdersPage;
