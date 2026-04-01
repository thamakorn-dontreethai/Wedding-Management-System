import { useEffect, useMemo, useState } from 'react';
import api from '../../services/api';

const toDateInputValue = (date) => {
  const localDate = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
  return localDate.toISOString().split('T')[0];
};

const getDefaultRange = () => {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), 1);
  const end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
  return {
    startDate: toDateInputValue(start),
    endDate: toDateInputValue(end),
  };
};

const AdminReportPage = () => {
  const [payments, setPayments] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [range, setRange] = useState(getDefaultRange());

  useEffect(() => {
    Promise.all([
      api.get('/payments'),
      api.get('/bookings/all'),
    ])
      .then(([payRes, bookRes]) => {
        setPayments(Array.isArray(payRes.data) ? payRes.data : []);
        setBookings(Array.isArray(bookRes.data) ? bookRes.data : []);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const report = useMemo(() => {
    const start = range.startDate ? new Date(`${range.startDate}T00:00:00`) : null;
    const end = range.endDate ? new Date(`${range.endDate}T23:59:59.999`) : null;

    const inRange = (value) => {
      const d = new Date(value);
      if (Number.isNaN(d.getTime())) return false;
      if (start && d < start) return false;
      if (end && d > end) return false;
      return true;
    };

    const filteredPayments = payments.filter((p) => inRange(p.transferDate || p.createdAt));
    const filteredBookings = bookings.filter((b) => inRange(b.createdAt));
    const approvedPayments = filteredPayments.filter((p) => p.status === 'approved');
    const pendingPayments = filteredPayments.filter((p) => p.status === 'pending');

    const revenue = approvedPayments.reduce((sum, p) => sum + (Number(p.amount) || 0), 0);

    const dailyMap = {};
    filteredBookings.forEach((booking) => {
      const key = new Date(booking.createdAt).toLocaleDateString('en-US');
      if (!dailyMap[key]) {
        dailyMap[key] = { dateLabel: key, bookings: 0, revenue: 0 };
      }
      dailyMap[key].bookings += 1;
    });

    approvedPayments.forEach((payment) => {
      const key = new Date(payment.transferDate || payment.createdAt).toLocaleDateString('en-US');
      if (!dailyMap[key]) {
        dailyMap[key] = { dateLabel: key, bookings: 0, revenue: 0 };
      }
      dailyMap[key].revenue += Number(payment.amount) || 0;
    });

    const dailyRows = Object.values(dailyMap).sort((a, b) =>
      new Date(a.dateLabel) - new Date(b.dateLabel)
    );

    return {
      filteredPayments,
      filteredBookings,
      approvedPayments,
      pendingPayments,
      revenue,
      dailyRows,
    };
  }, [payments, bookings, range.startDate, range.endDate]);

  return (
    <div>
      <div className="page-header">
        <h1 className="page-header__title">📈 Admin Report</h1>
        <p className="page-header__sub">Revenue and booking summary by date range</p>
      </div>

      <div className="chart-card" style={{ marginBottom: 20 }}>
        <h2 className="chart-card__title" style={{ marginBottom: 12 }}>Date Range</h2>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <div>
            <label className="form-label">Start Date</label>
            <input
              type="date"
              className="form-input"
              value={range.startDate}
              onChange={(e) => setRange((prev) => ({ ...prev, startDate: e.target.value }))}
            />
          </div>
          <div>
            <label className="form-label">End Date</label>
            <input
              type="date"
              className="form-input"
              value={range.endDate}
              onChange={(e) => setRange((prev) => ({ ...prev, endDate: e.target.value }))}
            />
          </div>
        </div>
      </div>

      {loading ? (
        <div className="loading-state"><div className="loading-dots"><span /><span /><span /></div></div>
      ) : (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 20 }}>
            {[
              { label: 'Approved Revenue', value: `฿${report.revenue.toLocaleString()}`, color: '#16a34a', bg: '#f0fdf4' },
              { label: 'Total Bookings', value: `${report.filteredBookings.length} events`, color: 'var(--pink)', bg: 'var(--pink-bg)' },
              { label: 'Approved Payments', value: `${report.approvedPayments.length} items`, color: '#2563eb', bg: '#eff6ff' },
              { label: 'Pending Verification', value: `${report.pendingPayments.length} items`, color: '#d97706', bg: '#fffbeb' },
            ].map((item) => (
              <div key={item.label} style={{ borderRadius: 14, padding: '14px 16px', background: item.bg }}>
                <div style={{ fontSize: 24, fontWeight: 800, color: item.color }}>{item.value}</div>
                <div style={{ marginTop: 4, color: 'var(--gray-500)', fontSize: 12 }}>{item.label}</div>
              </div>
            ))}
          </div>

          <div className="chart-card">
            <h2 className="chart-card__title" style={{ marginBottom: 12 }}>Daily Summary (Revenue + Bookings)</h2>
            {report.dailyRows.length === 0 ? (
              <div className="empty-state">
                <div className="empty-state__icon">📊</div>
                <p className="empty-state__title">No data found for the selected date range</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {report.dailyRows.map((row) => (
                  <div
                    key={row.dateLabel}
                    style={{
                      display: 'grid',
                      gridTemplateColumns: '1fr 1fr 1fr',
                      gap: 12,
                      padding: '10px 12px',
                      borderRadius: 10,
                      background: 'var(--gray-50)',
                      alignItems: 'center',
                    }}
                  >
                    <div style={{ fontWeight: 700 }}>{row.dateLabel}</div>
                    <div style={{ color: 'var(--gray-600)' }}>Bookings: {row.bookings}</div>
                    <div style={{ color: '#16a34a', fontWeight: 700, textAlign: 'right' }}>
                      Revenue: ฿{row.revenue.toLocaleString()}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default AdminReportPage;
