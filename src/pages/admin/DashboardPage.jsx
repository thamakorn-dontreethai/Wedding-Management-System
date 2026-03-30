import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import Badge from '../../components/ui/Badge';

const DashboardPage = () => {
  const [stats, setStats] = useState({ revenue: 0, bookings: 0, pending: 0 });
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get('/payments'),
      api.get('/bookings/all'),
    ]).then(([payRes, bookRes]) => {
      const pays = payRes.data || [];
      const books = bookRes.data || [];

      const revenue = pays.filter(p => p.status === 'approved').reduce((s, p) => s + p.amount, 0);
      const pending = pays.filter(p => p.status === 'pending').length;

      setPayments(pays.slice(0, 5));
      setStats({ revenue, bookings: books.length, pending });
    }).catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <div className="page-header">
        <h1 className="page-header__title">ภาพรวมระบบ (Admin Dashboard)</h1>
        <p className="page-header__sub">ติดตามยอดชำระเงินล่าสุดและข้อมูลการจองแบบเรียลไทม์</p>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 32 }}>
        {[
          { label: 'รายได้ทั้งหมด', value: `฿${stats.revenue.toLocaleString()}`, icon: '💰', color: '#16a34a' },
          { label: 'จำนวนการจอง', value: `${stats.bookings} งาน`, icon: '📅', color: 'var(--pink)' },
          { label: 'รอตรวจสอบยอด', value: `${stats.pending} รายการ`, icon: '⏳', color: '#d97706' },
        ].map((s, i) => (
          <div key={i} className="stat-card">
            <div className="stat-card__icon">{s.icon}</div>
            <div>
              <div className="stat-card__value" style={{ color: s.color }}>{s.value}</div>
              <div className="stat-card__label">{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Payments */}
      <div className="chart-card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <h2 className="chart-card__title">รายการชำระเงินล่าสุด</h2>
          <Link to="/admin/verify-payment" style={{ fontSize: 13, color: 'var(--pink)', fontWeight: 600 }}>
            ดูทั้งหมด →
          </Link>
        </div>
        {loading ? (
          <div className="loading-state"><div className="loading-dots"><span /><span /><span /></div></div>
        ) : payments.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state__icon">💳</div>
            <p className="empty-state__title">ยังไม่มีการชำระเงิน</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {payments.map(p => (
              <div key={p._id} style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                padding: '12px 16px', background: 'var(--gray-50)', borderRadius: 12,
              }}>
                <div>
                  <div style={{ fontWeight: 600, fontSize: 14 }}>
                    {p.customerId?.username || p.customerId?.firstName || 'ลูกค้า'}
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--gray-400)' }}>
                    งวด {p.installment} · {new Date(p.createdAt).toLocaleDateString('th-TH')}
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontWeight: 700, color: 'var(--pink)' }}>฿{p.amount?.toLocaleString()}</div>
                  <Badge status={p.status} />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default DashboardPage;