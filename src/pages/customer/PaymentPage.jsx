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
      setMessage('Please select an image file only');
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
    if (!bookingId) return setMessage('Booking not found'), setMessageType('error');
    if (!transferDate) return setMessage('Please select a transfer date'), setMessageType('error');
    if (!selectedFile) return setMessage('Please attach a transfer slip'), setMessageType('error');

    setSubmitting(true);

    const reader = new FileReader();
    reader.readAsDataURL(selectedFile);
    reader.onload = async () => {
      try {
        await api.post('/payments', {
          bookingId,
          installment: Number(installment),
          amount: Number(amount),
          transferDate,
          slipUrl: reader.result,
          bankName: 'กสิกรไทย',
        });
        setMessage('Slip submitted! Waiting for admin verification.');
        setMessageType('success');
        setTimeout(() => navigate('/my-bookings'), 2000);
      } catch (err) {
        setMessage(err.response?.data?.message || 'Failed to submit slip');
        setMessageType('error');
      } finally {
        setSubmitting(false);
      }
    };

    reader.onerror = () => {
      setMessage('Failed to read file');
      setMessageType('error');
      setSubmitting(false);
    };
  };
  return (
    <div style={{ maxWidth: 600, margin: '0 auto' }}>

      <div className="payment-page__header">
        <div className="payment-page__header-icon">💳</div>
        <div>
          <div className="payment-page__header-title">Deposit Payment</div>
          <div className="payment-page__header-sub">Installment {installment} · Amount ฿{Number(amount).toLocaleString()}</div>
        </div>
      </div>

      <div className="bank-info-box">
        <div className="bank-info-box__icon">🏦</div>
        <div>
          <div className="bank-info-box__label">Transfer to Account</div>
          <div className="bank-info-box__value">123-4-56789-0</div>
          <div className="bank-info-box__bank">Kasikorn Bank · Account Name: Wedding Planner</div>
        </div>
      </div>

      <form onSubmit={handleSubmit}>

        <div className="payment-form-section">
          <h2 className="payment-form-section__title">💰 Amount Due</h2>
          <div style={{
            fontSize: 32, fontWeight: 800, color: 'var(--pink)',
            textAlign: 'center', padding: '16px 0',
          }}>
            ฿{Number(amount).toLocaleString()}
          </div>
          <div style={{ fontSize: 13, color: 'var(--gray-400)', textAlign: 'center' }}>
            Deposit installment {installment}
          </div>
        </div>

        <div className="payment-form-section">
          <h2 className="payment-form-section__title">📅 Transfer Date</h2>
          <label className="payment-label">Date of Transfer</label>
          <input type="date" className="payment-input"
            value={transferDate}
            max={new Date().toISOString().split('T')[0]}
            onChange={e => setTransferDate(e.target.value)}
            required />
        </div>

        <div className="payment-form-section">
          <h2 className="payment-form-section__title">📸 Attach Transfer Slip</h2>

          {!previewUrl ? (
            <label style={{ cursor: 'pointer' }}>
              <div className="slip-upload">
                <div className="slip-upload__icon">📎</div>
                <div className="slip-upload__title">Click to select slip image</div>
                <div className="slip-upload__desc">Supports JPG, PNG up to 5MB</div>
              </div>
              <input type="file" accept="image/*" onChange={handleFileChange} style={{ display: 'none' }} />
            </label>
          ) : (
            <div className="upload-preview">
              <img src={previewUrl} alt="Slip" />
              <button type="button" className="upload-preview__remove"
                onClick={() => { setSelectedFile(null); setPreviewUrl(''); }}>
                ✕
              </button>
            </div>
          )}
        </div>

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
          {submitting ? '⏳ Submitting...' : '📤 Submit Payment Proof'}
        </button>

      </form>
    </div>
  );
};

export default PaymentPage;