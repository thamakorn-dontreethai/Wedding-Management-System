import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import api from '../../services/api';

const PaymentPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const bookingId = searchParams.get('bookingId');
  const installment = searchParams.get('installment') || '1';
  const amount = searchParams.get('amount') || '';

  const [transferDate, setTransferDate] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');

  useEffect(() => () => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
  }, [previewUrl]);

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setMessage('กรุณาเลือกไฟล์รูปภาพเท่านั้น');
      setMessageType('error');
      return;
    }
    setSelectedFile(file);
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(URL.createObjectURL(file));
    setMessage('');
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!bookingId) return setMessage('ไม่พบข้อมูลการจอง'), setMessageType('error');
    if (!transferDate) return setMessage('กรุณาเลือกวันที่ชำระ'), setMessageType('error');
    if (!selectedFile) return setMessage('กรุณาแนบสลิปการโอน'), setMessageType('error');

    setSubmitting(true);

    const reader = new FileReader();
    reader.readAsDataURL(selectedFile);
    reader.onload = async () => {
      try {
        await api.post('/payments', {
          bookingId,
          installment: Number(installment),
          amount: Number(amount),
          transferDate, // ✅ ส่งไปด้วย
          slipUrl: reader.result, // ✅ base64 string
          bankName: 'กสิกรไทย',
        });
        setMessage('ส่งหลักฐานสำเร็จ! รอ Admin ตรวจสอบ');
        setMessageType('success');
        setTimeout(() => navigate('/my-bookings'), 2000);
      } catch (err) {
        setMessage(err.response?.data?.message || 'ส่งหลักฐานไม่สำเร็จ');
        setMessageType('error');
      } finally {
        setSubmitting(false);
      }
    };

    reader.onerror = () => {
      setMessage('อ่านไฟล์ไม่สำเร็จ');
      setMessageType('error');
      setSubmitting(false);
    };
  };
  return (
    <div style={{ maxWidth: 600, margin: '0 auto' }}>

      {/* Header */}
      <div className="payment-page__header">
        <div className="payment-page__header-icon">💳</div>
        <div>
          <div className="payment-page__header-title">แจ้งชำระเงินมัดจำ</div>
          <div className="payment-page__header-sub">งวดที่ {installment} · ยอด ฿{Number(amount).toLocaleString()}</div>
        </div>
      </div>

      {/* Bank info */}
      <div className="bank-info-box">
        <div className="bank-info-box__icon">🏦</div>
        <div>
          <div className="bank-info-box__label">โอนเงินเข้าบัญชี</div>
          <div className="bank-info-box__value">123-4-56789-0</div>
          <div className="bank-info-box__bank">ธนาคารกสิกรไทย · ชื่อบัญชี Wedding Planner</div>
        </div>
      </div>

      <form onSubmit={handleSubmit}>

        {/* Amount display */}
        <div className="payment-form-section">
          <h2 className="payment-form-section__title">💰 ยอดที่ต้องชำระ</h2>
          <div style={{
            fontSize: 32, fontWeight: 800, color: 'var(--pink)',
            textAlign: 'center', padding: '16px 0',
          }}>
            ฿{Number(amount).toLocaleString()}
          </div>
          <div style={{ fontSize: 13, color: 'var(--gray-400)', textAlign: 'center' }}>
            มัดจำงวดที่ {installment}
          </div>
        </div>

        {/* Transfer date */}
        <div className="payment-form-section">
          <h2 className="payment-form-section__title">📅 วันที่โอนเงิน</h2>
          <label className="payment-label">วันที่ชำระ</label>
          <input type="date" className="payment-input"
            value={transferDate}
            max={new Date().toISOString().split('T')[0]}
            onChange={e => setTransferDate(e.target.value)}
            required />
        </div>

        {/* Upload slip */}
        <div className="payment-form-section">
          <h2 className="payment-form-section__title">📸 แนบสลิปการโอน</h2>

          {!previewUrl ? (
            <label style={{ cursor: 'pointer' }}>
              <div className="slip-upload">
                <div className="slip-upload__icon">📎</div>
                <div className="slip-upload__title">คลิกเพื่อเลือกรูปสลิป</div>
                <div className="slip-upload__desc">รองรับ JPG, PNG ขนาดไม่เกิน 5MB</div>
              </div>
              <input type="file" accept="image/*" onChange={handleFileChange} style={{ display: 'none' }} />
            </label>
          ) : (
            <div className="upload-preview">
              <img src={previewUrl} alt="สลิป" />
              <button type="button" className="upload-preview__remove"
                onClick={() => { setSelectedFile(null); setPreviewUrl(''); }}>
                ✕
              </button>
            </div>
          )}
        </div>

        {/* Message */}
        {message && (
          <div style={{
            padding: '12px 16px', borderRadius: 12, marginBottom: 16,
            background: messageType === 'success' ? '#f0fdf4' : '#fff5f5',
            border: `1px solid ${messageType === 'success' ? '#86efac' : '#fca5a5'}`,
            color: messageType === 'success' ? '#16a34a' : '#dc2626',
            fontSize: 14, fontWeight: 600,
          }}>
            {messageType === 'success' ? '✅' : '⚠️'} {message}
          </div>
        )}

        <button type="submit" className="payment-submit-btn" disabled={submitting}>
          {submitting ? '⏳ กำลังส่ง...' : '📤 ส่งหลักฐานการชำระ'}
        </button>

      </form>
    </div>
  );
};

export default PaymentPage;