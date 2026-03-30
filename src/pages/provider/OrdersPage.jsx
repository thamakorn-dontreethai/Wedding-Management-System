import { useState, useEffect } from 'react';
import api from '../../services/api';
import { useAuthStore } from '../../store/authStore';

const SERVICE_META = {
  food:  { icon: '🍽️', label: 'ครัว / อาหาร' },
  music: { icon: '🎵', label: 'วงดนตรี' },
  photo: { icon: '📷', label: 'ช่างภาพ' },
};

const ORDER_STATUS_LABEL = {
  pending:      { label: 'รอรับทราบ',       color: '#d97706', bg: '#fffbeb' },
  acknowledged: { label: 'รับทราบแล้ว',     color: '#2563eb', bg: '#eff6ff' },
  ready:        { label: 'เตรียมการเสร็จ',  color: '#16a34a', bg: '#f0fdf4' },
};

const BOOKING_STATUS_LABEL = {
  pending:        'รอชำระ',
  deposit1_paid:  'ชำระงวด 1',
  deposit2_pending: 'รอชำระงวด 2',
  deposit2_paid:  'ชำระงวด 2',
  confirmed:      '✅ ยืนยันแล้ว',
  completed:      '🎉 เสร็จสิ้น',
  overdue:        '⛔ เกินกำหนด',
};

const OrdersPage = () => {
  const { user } = useAuthStore();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);   // booking for detail modal
  const [updating, setUpdating] = useState(false);
  const [statusMsg, setStatusMsg] = useState('');

  const serviceType = user?.serviceType;
  const service = SERVICE_META[serviceType] || { icon: '🧩', label: 'ผู้ให้บริการ' };

  const fetchOrders = () => {
    setLoading(true);
    api.get('/providers/me/orders')
      .then(({ data }) => setOrders(data))
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchOrders(); }, []);

  const myStatus = (booking) => booking.orderStatuses?.[serviceType] || 'pending';

  const handleUpdateStatus = async (bookingId, status) => {
    setUpdating(true);
    setStatusMsg('');
    try {
      await api.put(`/providers/orders/${bookingId}/status`, { status });
      setOrders(prev => prev.map(o =>
        o._id === bookingId
          ? { ...o, orderStatuses: { ...o.orderStatuses, [serviceType]: status } }
          : o
      ));
      if (selected?._id === bookingId) {
        setSelected(prev => ({ ...prev, orderStatuses: { ...prev.orderStatuses, [serviceType]: status } }));
      }
      setStatusMsg('อัปเดตสถานะสำเร็จ');
    } catch (err) {
      setStatusMsg(err.response?.data?.message || 'อัปเดตไม่สำเร็จ');
    } finally {
      setUpdating(false);
    }
  };

  const pendingCount = orders.filter(o => myStatus(o) === 'pending').length;
  const acknowledgedCount = orders.filter(o => myStatus(o) === 'acknowledged').length;
  const readyCount = orders.filter(o => myStatus(o) === 'ready').length;

  if (loading) return (
    <div className="loading-state">
      <div className="loading-dots"><span /><span /><span /></div>
      <p style={{ color: 'var(--gray-400)', marginTop: 16 }}>กำลังโหลด...</p>
    </div>
  );

  return (
    <div style={{ maxWidth: 900, margin: '0 auto' }}>
      <div className="page-header">
        <h1 className="page-header__title">{service.icon} ใบสั่งงาน ({service.label})</h1>
        <p className="page-header__sub">รายการงานที่ระบบจัดสรรให้ พร้อมบันทึกสถานะการทำงาน</p>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 12, marginBottom: 24 }}>
        {[
          { label: 'ทั้งหมด', value: orders.length, color: 'var(--pink)' },
          { label: 'รอรับทราบ', value: pendingCount, color: '#d97706' },
          { label: 'รับทราบแล้ว', value: acknowledgedCount, color: '#2563eb' },
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
          <p className="empty-state__title">ยังไม่มีใบสั่งงาน</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {orders.map(order => {
            const st = myStatus(order);
            const statusInfo = ORDER_STATUS_LABEL[st];
            return (
              <div key={order._id} style={{ background: 'white', borderRadius: 16, border: '1px solid var(--gray-100)', padding: '16px 20px', boxShadow: '0 2px 8px rgba(249,168,201,0.08)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 700, fontSize: 15, color: 'var(--gray-900)', marginBottom: 4 }}>
                      {order.venueName || 'สถานที่จัดงาน'}
                    </div>
                    <div style={{ fontSize: 13, color: 'var(--gray-400)' }}>
                      👤 {order.customerId?.username || '-'} &nbsp;·&nbsp;
                      📅 {new Date(order.eventDate).toLocaleDateString('th-TH', { year: 'numeric', month: 'long', day: 'numeric' })} &nbsp;·&nbsp;
                      👥 {order.guestCount?.toLocaleString()} คน
                    </div>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 8 }}>
                    <span style={{ padding: '4px 12px', borderRadius: 999, fontSize: 12, fontWeight: 700, background: statusInfo.bg, color: statusInfo.color }}>
                      {statusInfo.label}
                    </span>
                    <button onClick={() => { setSelected(order); setStatusMsg(''); }}
                      style={{ fontSize: 12, color: 'var(--pink)', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600 }}>
                      ดูรายละเอียด →
                    </button>
                  </div>
                </div>

                {/* Quick action buttons */}
                {st === 'pending' && (
                  <div style={{ marginTop: 12, display: 'flex', gap: 8 }}>
                    <button onClick={() => handleUpdateStatus(order._id, 'acknowledged')} disabled={updating}
                      style={{ padding: '8px 16px', borderRadius: 10, background: '#eff6ff', color: '#2563eb', border: 'none', fontWeight: 700, fontSize: 13, cursor: 'pointer' }}>
                      ✓ รับทราบออเดอร์
                    </button>
                  </div>
                )}
                {st === 'acknowledged' && (
                  <div style={{ marginTop: 12 }}>
                    <button onClick={() => handleUpdateStatus(order._id, 'ready')} disabled={updating}
                      style={{ padding: '8px 16px', borderRadius: 10, background: '#f0fdf4', color: '#16a34a', border: 'none', fontWeight: 700, fontSize: 13, cursor: 'pointer' }}>
                      ✅ เตรียมการเสร็จสิ้น
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Detail Modal */}
      {selected && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}
          onClick={() => setSelected(null)}>
          <div style={{ background: 'white', borderRadius: 20, padding: 28, maxWidth: 480, width: '100%', maxHeight: '80vh', overflowY: 'auto' }}
            onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <h2 style={{ fontSize: 18, fontWeight: 800, color: 'var(--gray-900)' }}>📋 รายละเอียดใบสั่งงาน</h2>
              <button onClick={() => setSelected(null)} style={{ background: 'none', border: 'none', fontSize: 20, cursor: 'pointer', color: 'var(--gray-400)' }}>✕</button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {[
                ['สถานที่', selected.venueName || '-'],
                ['ลูกค้า', selected.customerId?.username || '-'],
                ['วันจัดงาน', new Date(selected.eventDate).toLocaleDateString('th-TH', { year: 'numeric', month: 'long', day: 'numeric' })],
                ['จำนวนแขก', `${selected.guestCount?.toLocaleString()} คน`],
                ['รูปแบบอาหาร', selected.mealType === 'buffet' ? 'บุฟเฟต์' : 'โต๊ะจีน'],
                ['หมายเหตุ', selected.notes || '-'],
                ['สถานะการจอง', BOOKING_STATUS_LABEL[selected.status] || selected.status],
              ].map(([k, v]) => (
                <div key={k} style={{ display: 'flex', gap: 12 }}>
                  <span style={{ minWidth: 110, fontSize: 13, color: 'var(--gray-400)', fontWeight: 600 }}>{k}</span>
                  <span style={{ fontSize: 13, color: 'var(--gray-900)', fontWeight: 600 }}>{v}</span>
                </div>
              ))}
            </div>

            <div style={{ marginTop: 20, paddingTop: 16, borderTop: '1px solid var(--gray-100)' }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--gray-700)', marginBottom: 12 }}>สถานะงานของฉัน</div>
              {(() => {
                const st = myStatus(selected);
                return (
                  <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                    <button disabled={st !== 'pending' || updating} onClick={() => handleUpdateStatus(selected._id, 'acknowledged')}
                      style={{ padding: '10px 18px', borderRadius: 10, fontWeight: 700, fontSize: 13, cursor: st === 'pending' ? 'pointer' : 'default',
                        background: st === 'acknowledged' || st === 'ready' ? '#eff6ff' : st === 'pending' ? '#2563eb' : '#f3f4f6',
                        color: st === 'pending' ? 'white' : '#2563eb', border: 'none', opacity: st !== 'pending' ? 0.6 : 1 }}>
                      ✓ รับทราบออเดอร์
                    </button>
                    <button disabled={st !== 'acknowledged' || updating} onClick={() => handleUpdateStatus(selected._id, 'ready')}
                      style={{ padding: '10px 18px', borderRadius: 10, fontWeight: 700, fontSize: 13, cursor: st === 'acknowledged' ? 'pointer' : 'default',
                        background: st === 'ready' ? '#f0fdf4' : st === 'acknowledged' ? '#16a34a' : '#f3f4f6',
                        color: st === 'acknowledged' ? 'white' : '#16a34a', border: 'none', opacity: st !== 'acknowledged' ? 0.6 : 1 }}>
                      ✅ เตรียมการเสร็จสิ้น
                    </button>
                  </div>
                );
              })()}
              {statusMsg && (
                <p style={{ marginTop: 10, fontSize: 13, color: statusMsg.includes('สำเร็จ') ? '#16a34a' : '#dc2626', fontWeight: 600 }}>
                  {statusMsg}
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrdersPage;
