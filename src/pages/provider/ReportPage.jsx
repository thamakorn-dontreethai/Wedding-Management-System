import { useState } from 'react';
import api from '../../services/api';
import { useAuthStore } from '../../store/authStore';

const SERVICE_META = {
  food:  { icon: '🍽️', label: 'ครัว / อาหาร' },
  music: { icon: '🎵', label: 'วงดนตรี' },
  photo: { icon: '📷', label: 'ช่างภาพ' },
};

const ORDER_STATUS_LABEL = {
  pending:      { label: 'รอรับทราบ',      color: '#d97706' },
  acknowledged: { label: 'รับทราบแล้ว',    color: '#2563eb' },
  ready:        { label: 'เตรียมการเสร็จ', color: '#16a34a' },
};

const ReportPage = () => {
  const { user } = useAuthStore();
  const serviceType = user?.serviceType;
  const service = SERVICE_META[serviceType] || { icon: '🧩', label: 'ผู้ให้บริการ' };

  const today = new Date();
  const firstOfMonth = new Date(today.getFullYear(), today.getMonth(), 1).toISOString().split('T')[0];
  const todayStr = today.toISOString().split('T')[0];

  const [from, setFrom] = useState(firstOfMonth);
  const [to, setTo] = useState(todayStr);
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchReport = async () => {
    setLoading(true);
    setError('');
    try {
      const { data } = await api.get('/providers/me/report', { params: { from, to } });
      setReport(data);
    } catch (err) {
      setError(err.response?.data?.message || 'โหลดรายงานไม่สำเร็จ');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 800, margin: '0 auto' }}>
      <div className="page-header">
        <h1 className="page-header__title">📊 รายงานสรุป</h1>
        <p className="page-header__sub">{service.icon} {service.label} — คิวงานและรายได้ตามช่วงเวลา</p>
      </div>

      {/* Date range filter */}
      <div style={{ background: 'white', borderRadius: 16, border: '1px solid var(--gray-100)', padding: 20, marginBottom: 24, boxShadow: '0 2px 8px rgba(249,168,201,0.08)' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr auto', gap: 12, alignItems: 'flex-end' }}>
          <div>
            <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--gray-600)', display: 'block', marginBottom: 6 }}>จากวันที่</label>
            <input type="date" className="payment-input" value={from} onChange={e => setFrom(e.target.value)} />
          </div>
          <div>
            <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--gray-600)', display: 'block', marginBottom: 6 }}>ถึงวันที่</label>
            <input type="date" className="payment-input" value={to} onChange={e => setTo(e.target.value)} />
          </div>
          <button onClick={fetchReport} disabled={loading}
            style={{ padding: '10px 20px', background: 'linear-gradient(135deg,#f9a8c9,#ec4899)', color: 'white', border: 'none', borderRadius: 12, fontWeight: 700, fontSize: 14, cursor: 'pointer', whiteSpace: 'nowrap' }}>
            {loading ? '⏳...' : '🔍 ดูรายงาน'}
          </button>
        </div>
        {error && <p style={{ marginTop: 12, color: '#dc2626', fontSize: 13, fontWeight: 600 }}>⚠️ {error}</p>}
      </div>

      {report && (
        <>
          {/* Summary cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 12, marginBottom: 24 }}>
            <div style={{ background: 'white', borderRadius: 16, padding: '20px', border: '1px solid var(--gray-100)', boxShadow: '0 2px 8px rgba(249,168,201,0.08)', textAlign: 'center' }}>
              <div style={{ fontSize: 13, color: 'var(--gray-400)', fontWeight: 600, marginBottom: 8 }}>งานทั้งหมด</div>
              <div style={{ fontSize: 32, fontWeight: 800, color: 'var(--pink)' }}>{report.count}</div>
              <div style={{ fontSize: 12, color: 'var(--gray-400)' }}>คิว</div>
            </div>
            <div style={{ background: 'white', borderRadius: 16, padding: '20px', border: '1px solid var(--gray-100)', boxShadow: '0 2px 8px rgba(249,168,201,0.08)', textAlign: 'center' }}>
              <div style={{ fontSize: 13, color: 'var(--gray-400)', fontWeight: 600, marginBottom: 8 }}>รายได้รวม (โดยประมาณ)</div>
              <div style={{ fontSize: 28, fontWeight: 800, color: '#16a34a' }}>฿{report.totalIncome?.toLocaleString()}</div>
              <div style={{ fontSize: 12, color: 'var(--gray-400)' }}>จากอัตราค่าแรงปัจจุบัน</div>
            </div>
            <div style={{ background: 'white', borderRadius: 16, padding: '20px', border: '1px solid var(--gray-100)', boxShadow: '0 2px 8px rgba(249,168,201,0.08)', textAlign: 'center' }}>
              <div style={{ fontSize: 13, color: 'var(--gray-400)', fontWeight: 600, marginBottom: 8 }}>เตรียมการเสร็จแล้ว</div>
              <div style={{ fontSize: 32, fontWeight: 800, color: '#2563eb' }}>
                {report.bookings.filter(b => b.orderStatuses?.[serviceType] === 'ready').length}
              </div>
              <div style={{ fontSize: 12, color: 'var(--gray-400)' }}>คิว</div>
            </div>
          </div>

          {/* Queue list */}
          <div style={{ background: 'white', borderRadius: 16, border: '1px solid var(--gray-100)', overflow: 'hidden', boxShadow: '0 2px 8px rgba(249,168,201,0.08)' }}>
            <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--gray-100)', fontWeight: 700, fontSize: 15, color: 'var(--gray-900)' }}>
              📅 รายการคิวงาน
            </div>
            {report.bookings.length === 0 ? (
              <div style={{ padding: 32, textAlign: 'center', color: 'var(--gray-400)' }}>ไม่มีงานในช่วงเวลานี้</div>
            ) : (
              report.bookings.map((b, i) => {
                const st = b.orderStatuses?.[serviceType] || 'pending';
                const stInfo = ORDER_STATUS_LABEL[st];
                return (
                  <div key={b._id} style={{
                    padding: '14px 20px',
                    borderBottom: i < report.bookings.length - 1 ? '1px solid var(--gray-100)' : 'none',
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  }}>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--gray-900)' }}>{b.venueName || 'สถานที่จัดงาน'}</div>
                      <div style={{ fontSize: 12, color: 'var(--gray-400)', marginTop: 2 }}>
                        👤 {b.customerId?.username || '-'} &nbsp;·&nbsp;
                        📅 {new Date(b.eventDate).toLocaleDateString('th-TH', { year: 'numeric', month: 'short', day: 'numeric' })} &nbsp;·&nbsp;
                        👥 {b.guestCount?.toLocaleString()} คน
                      </div>
                    </div>
                    <span style={{ padding: '4px 12px', borderRadius: 999, fontSize: 12, fontWeight: 700, color: stInfo.color, background: `${stInfo.color}18` }}>
                      {stInfo.label}
                    </span>
                  </div>
                );
              })
            )}
          </div>
        </>
      )}

      {!report && !loading && (
        <div className="empty-state">
          <div className="empty-state__icon">📊</div>
          <p className="empty-state__title">เลือกช่วงเวลาแล้วกด "ดูรายงาน"</p>
        </div>
      )}
    </div>
  );
};

export default ReportPage;
