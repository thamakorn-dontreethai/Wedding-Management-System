import { useEffect, useState } from 'react';
import api from '../../services/api';
import Modal from '../../components/ui/Modal';

const VerifyPaymentPage = () => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedSlip, setSelectedSlip] = useState(null);
  const [processing, setProcessing] = useState(null);

  useEffect(() => {
    api.get('/payments')
      .then(({ data }) => setPayments(data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleApprove = async (paymentId) => {
    setProcessing(paymentId);
    try {
      await api.put(`/payments/${paymentId}/approve`);
      setPayments(prev => prev.map(p =>
        p._id === paymentId ? { ...p, status: 'approved' } : p
      ));
    } catch (err) {
      alert(err.response?.data?.message || 'เกิดข้อผิดพลาด');
    } finally {
      setProcessing(null);
    }
  };

  const handleReject = async (paymentId) => {
    const reason = prompt('กรุณาระบุเหตุผลที่ปฏิเสธ:');
    if (!reason) return;
    setProcessing(paymentId);
    try {
      await api.put(`/payments/${paymentId}/reject`, { rejectReason: reason });
      setPayments(prev => prev.map(p =>
        p._id === paymentId ? { ...p, status: 'rejected' } : p
      ));
    } catch (err) {
      alert(err.response?.data?.message || 'เกิดข้อผิดพลาด');
    } finally {
      setProcessing(null);
    }
  };

  const pendingCount = payments.filter(p => p.status === 'pending').length;
  const approvedCount = payments.filter(p => p.status === 'approved').length;

  return (
    <div>
      <div className="page-header">
        <h1 className="page-header__title">✅ ตรวจสอบหลักฐานการชำระเงิน</h1>
        <p className="page-header__sub">อนุมัติหรือปฏิเสธการชำระเงินมัดจำของลูกค้า</p>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 12, marginBottom: 24 }}>
        {[
          { label: 'ทั้งหมด', value: payments.length, color: 'var(--gray-700)', bg: 'var(--gray-50)' },
          { label: 'รอตรวจ', value: pendingCount, color: '#d97706', bg: '#fffbeb' },
          { label: 'อนุมัติแล้ว', value: approvedCount, color: '#16a34a', bg: '#f0fdf4' },
        ].map((s, i) => (
          <div key={i} style={{
            padding: '16px 20px', borderRadius: 14,
            background: s.bg, textAlign: 'center',
          }}>
            <div style={{ fontSize: 28, fontWeight: 800, color: s.color }}>{s.value}</div>
            <div style={{ fontSize: 13, color: 'var(--gray-500)', marginTop: 4 }}>{s.label}</div>
          </div>
        ))}
      </div>

      {loading ? (
        <div className="loading-state"><div className="loading-dots"><span /><span /><span /></div></div>
      ) : payments.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state__icon">💳</div>
          <p className="empty-state__title">ยังไม่มีการชำระเงิน</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {payments.map(p => (
            <div key={p._id} className="verify-card">
              <div className="verify-card__header">
                <div>
                  <div className="verify-card__title">
                    {p.customerId?.username || p.customerId?.firstName || 'ลูกค้า'}
                    <span style={{ fontSize: 12, color: 'var(--gray-400)', marginLeft: 8 }}>
                      งวด {p.installment}
                    </span>
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--gray-400)', marginTop: 2 }}>
                    {new Date(p.createdAt).toLocaleDateString('th-TH', { year: 'numeric', month: 'long', day: 'numeric' })}
                  </div>
                </div>
                <div style={{
                  padding: '4px 12px', borderRadius: 999, fontSize: 12, fontWeight: 700,
                  background: p.status === 'approved' ? '#f0fdf4' : p.status === 'rejected' ? '#fff5f5' : '#fffbeb',
                  color: p.status === 'approved' ? '#16a34a' : p.status === 'rejected' ? '#dc2626' : '#d97706',
                }}>
                  {p.status === 'approved' ? '✅ อนุมัติแล้ว' : p.status === 'rejected' ? '❌ ปฏิเสธ' : '⏳ รอตรวจสอบ'}
                </div>
              </div>

              <div className="verify-card__body">
                {/* Slip */}
                <div className="verify-card__slip">
                  {p.slipUrl ? (
                    <img src={p.slipUrl} alt="สลิป" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : '🧾'}
                </div>

                {/* Info */}
                <div className="verify-card__info">
                  <div className="verify-card__row">
                    <span>ยอดชำระ</span>
                    <span style={{ color: 'var(--pink)', fontWeight: 800, fontSize: 16 }}>
                      ฿{p.amount?.toLocaleString()}
                    </span>
                  </div>
                  <div className="verify-card__row">
                    <span>วันที่โอน</span>
                    <span>{p.transferDate ? new Date(p.transferDate).toLocaleDateString('th-TH') : '-'}</span>
                  </div>
                  <div className="verify-card__row">
                    <span>ธนาคาร</span>
                    <span>{p.bankName || '-'}</span>
                  </div>
                  <div className="verify-card__row">
                    <span>การจอง</span>
                    <span style={{ fontSize: 12 }}>{p.bookingId?.venueId?.name || p.bookingId?.venueName || '-'}</span>
                  </div>
                </div>
              </div>

              {/* Actions */}
              {p.status === 'pending' && (
                <div className="verify-card__actions">
                  {p.slipUrl && (
                    <button onClick={() => setSelectedSlip(p)}
                      style={{
                        padding: '8px 16px', borderRadius: 10, border: '2px solid var(--pink-border)',
                        background: 'white', color: 'var(--pink)', fontWeight: 600, cursor: 'pointer', fontSize: 13,
                      }}>
                      🔍 ดูสลิป
                    </button>
                  )}
                  <button onClick={() => handleReject(p._id)} disabled={processing === p._id}
                    style={{
                      padding: '8px 16px', borderRadius: 10, border: '2px solid #fca5a5',
                      background: '#fff5f5', color: '#dc2626', fontWeight: 600, cursor: 'pointer', fontSize: 13,
                    }}>
                    ❌ ปฏิเสธ
                  </button>
                  <button onClick={() => handleApprove(p._id)} disabled={processing === p._id}
                    style={{
                      padding: '8px 16px', borderRadius: 10, border: 'none',
                      background: 'linear-gradient(135deg, #86efac, #16a34a)',
                      color: 'white', fontWeight: 700, cursor: 'pointer', fontSize: 13,
                    }}>
                    {processing === p._id ? '⏳...' : '✅ อนุมัติ'}
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Slip Modal */}
      <Modal isOpen={!!selectedSlip} onClose={() => setSelectedSlip(null)}
        title="หลักฐานการชำระเงิน">
        {selectedSlip?.slipUrl && (
          <img src={selectedSlip.slipUrl} alt="สลิป"
            style={{ width: '100%', borderRadius: 12, maxHeight: 500, objectFit: 'contain' }} />
        )}
      </Modal>
    </div>
  );
};

export default VerifyPaymentPage;