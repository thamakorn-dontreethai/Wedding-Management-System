import { useState, useEffect } from 'react';
import api from '../../services/api';

const BANK_OPTIONS = ['กสิกรไทย', 'กรุงเทพ', 'ไทยพาณิชย์', 'กรุงไทย', 'ทหารไทยธนชาต', 'ออมสิน'];

const ProviderProfilePage = () => {
  const [profile, setProfile] = useState(null);
  const [form, setForm] = useState({ firstName: '', lastName: '', phone: '', bankName: '', bankAccount: '' });
  const [maxGuests, setMaxGuests] = useState('');
  const [supportsMealType, setSupportsMealType] = useState('both');
  const [saving, setSaving] = useState(false);
  const [savingCondition, setSavingCondition] = useState(false);
  const [msg, setMsg] = useState({ text: '', type: '' });
  const [msgCondition, setMsgCondition] = useState({ text: '', type: '' });

  useEffect(() => {
    api.get('/providers/me').then(({ data }) => {
      setProfile(data);
      setForm({
        firstName: data.firstName || '',
        lastName: data.lastName || '',
        phone: data.phone || '',
        bankName: data.bankName || '',
        bankAccount: data.bankAccount || '',
      });
      setMaxGuests(String(data.maxGuests || ''));
      setSupportsMealType(data.supportsMealType || 'both');
    }).catch(() => setMsg({ text: 'โหลดข้อมูลไม่สำเร็จ', type: 'error' }));
  }, []);

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMsg({ text: '', type: '' });
    try {
      await api.put('/providers/me/profile', form);
      setMsg({ text: 'บันทึกข้อมูลสำเร็จ', type: 'success' });
    } catch (err) {
      setMsg({ text: err.response?.data?.message || 'บันทึกไม่สำเร็จ', type: 'error' });
    } finally {
      setSaving(false);
    }
  };

  const handleSaveCondition = async (e) => {
    e.preventDefault();
    setSavingCondition(true);
    setMsgCondition({ text: '', type: '' });
    try {
      await api.put('/providers/me/availability', { maxGuests: Number(maxGuests), supportsMealType });
      setMsgCondition({ text: 'บันทึกเงื่อนไขสำเร็จ', type: 'success' });
    } catch (err) {
      setMsgCondition({ text: err.response?.data?.message || 'บันทึกไม่สำเร็จ', type: 'error' });
    } finally {
      setSavingCondition(false);
    }
  };

  if (!profile) return (
    <div className="loading-state">
      <div className="loading-dots"><span /><span /><span /></div>
      <p style={{ color: 'var(--gray-400)', marginTop: 16 }}>กำลังโหลด...</p>
    </div>
  );

  const serviceLabel = { food: '🍽️ ครัว / อาหาร', music: '🎵 วงดนตรี', photo: '📷 ช่างภาพ' }[profile.serviceType] || profile.serviceType;

  return (
    <div style={{ maxWidth: 600, margin: '0 auto' }}>
      <div className="page-header">
        <h1 className="page-header__title">👤 ข้อมูลของฉัน</h1>
        <p className="page-header__sub">จัดการข้อมูลส่วนตัวและบัญชีธนาคาร</p>
      </div>

      {/* Service badge */}
      <div style={{ marginBottom: 24, display: 'flex', alignItems: 'center', gap: 10 }}>
        <span style={{ padding: '6px 16px', borderRadius: 999, background: '#fdf2f8', color: 'var(--pink)', fontWeight: 700, fontSize: 14 }}>
          {serviceLabel}
        </span>
        <span style={{ fontSize: 13, color: 'var(--gray-400)' }}>{profile.email}</span>
      </div>

      {/* Profile & Bank form */}
      <form onSubmit={handleSaveProfile} style={{ background: 'white', borderRadius: 20, border: '1px solid var(--gray-100)', padding: 24, marginBottom: 20, boxShadow: '0 2px 12px rgba(249,168,201,0.08)' }}>
        <h2 style={{ fontSize: 16, fontWeight: 700, marginBottom: 20, color: 'var(--gray-900)' }}>📝 ข้อมูลส่วนตัว</h2>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
          <div>
            <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--gray-600)', display: 'block', marginBottom: 6 }}>ชื่อ</label>
            <input className="payment-input" value={form.firstName} onChange={e => setForm(f => ({ ...f, firstName: e.target.value }))} required />
          </div>
          <div>
            <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--gray-600)', display: 'block', marginBottom: 6 }}>นามสกุล</label>
            <input className="payment-input" value={form.lastName} onChange={e => setForm(f => ({ ...f, lastName: e.target.value }))} required />
          </div>
        </div>

        <div style={{ marginBottom: 16 }}>
          <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--gray-600)', display: 'block', marginBottom: 6 }}>เบอร์โทรศัพท์</label>
          <input className="payment-input" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} placeholder="0xx-xxx-xxxx" />
        </div>

        <h2 style={{ fontSize: 16, fontWeight: 700, margin: '20px 0 16px', color: 'var(--gray-900)' }}>🏦 บัญชีธนาคาร</h2>

        <div style={{ marginBottom: 16 }}>
          <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--gray-600)', display: 'block', marginBottom: 6 }}>ธนาคาร</label>
          <select className="payment-input" value={form.bankName} onChange={e => setForm(f => ({ ...f, bankName: e.target.value }))}>
            <option value="">-- เลือกธนาคาร --</option>
            {BANK_OPTIONS.map(b => <option key={b} value={b}>{b}</option>)}
          </select>
        </div>

        <div style={{ marginBottom: 20 }}>
          <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--gray-600)', display: 'block', marginBottom: 6 }}>เลขบัญชี</label>
          <input className="payment-input" value={form.bankAccount} onChange={e => setForm(f => ({ ...f, bankAccount: e.target.value }))} placeholder="xxx-x-xxxxx-x" />
        </div>

        {msg.text && (
          <div style={{ padding: '10px 14px', borderRadius: 10, marginBottom: 16, fontSize: 13, fontWeight: 600,
            background: msg.type === 'success' ? '#f0fdf4' : '#fff5f5',
            border: `1px solid ${msg.type === 'success' ? '#86efac' : '#fca5a5'}`,
            color: msg.type === 'success' ? '#16a34a' : '#dc2626' }}>
            {msg.type === 'success' ? '✅' : '⚠️'} {msg.text}
          </div>
        )}

        <button type="submit" className="payment-submit-btn" disabled={saving}>
          {saving ? '⏳ กำลังบันทึก...' : '💾 บันทึกข้อมูล'}
        </button>
      </form>

      {/* Conditions form */}
      <form onSubmit={handleSaveCondition} style={{ background: 'white', borderRadius: 20, border: '1px solid var(--gray-100)', padding: 24, boxShadow: '0 2px 12px rgba(249,168,201,0.08)' }}>
        <h2 style={{ fontSize: 16, fontWeight: 700, marginBottom: 8, color: 'var(--gray-900)' }}>⚙️ เงื่อนไขการรับงาน</h2>
        <p style={{ fontSize: 13, color: 'var(--gray-400)', marginBottom: 16 }}>จำนวนแขกสูงสุดที่รองรับได้ต่องาน (0 = ไม่จำกัด)</p>

        <div style={{ marginBottom: 16 }}>
          <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--gray-600)', display: 'block', marginBottom: 6 }}>จำนวนแขกสูงสุด (คน)</label>
          <input className="payment-input" type="number" min="0" value={maxGuests}
            onChange={e => setMaxGuests(e.target.value)} placeholder="เช่น 500" />
        </div>

        {profile.serviceType === 'food' && (
          <div style={{ marginBottom: 20 }}>
            <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--gray-600)', display: 'block', marginBottom: 10 }}>รูปแบบอาหารที่รองรับ</label>
            <div style={{ display: 'flex', gap: 10 }}>
              {[
                { value: 'buffet', label: '🍽️ บุฟเฟต์' },
                { value: 'chinese', label: '🥢 โต๊ะจีน' },
                { value: 'both', label: '✅ ทั้งสองรูปแบบ' },
              ].map(opt => (
                <div key={opt.value} onClick={() => setSupportsMealType(opt.value)}
                  style={{ flex: 1, padding: '10px 8px', borderRadius: 12, cursor: 'pointer', textAlign: 'center',
                    border: `2px solid ${supportsMealType === opt.value ? 'var(--pink)' : 'var(--gray-100)'}`,
                    background: supportsMealType === opt.value ? 'var(--pink-bg)' : 'white',
                    fontSize: 13, fontWeight: 700,
                    color: supportsMealType === opt.value ? 'var(--pink)' : 'var(--gray-600)' }}>
                  {opt.label}
                </div>
              ))}
            </div>
          </div>
        )}

        {msgCondition.text && (
          <div style={{ padding: '10px 14px', borderRadius: 10, marginBottom: 16, fontSize: 13, fontWeight: 600,
            background: msgCondition.type === 'success' ? '#f0fdf4' : '#fff5f5',
            border: `1px solid ${msgCondition.type === 'success' ? '#86efac' : '#fca5a5'}`,
            color: msgCondition.type === 'success' ? '#16a34a' : '#dc2626' }}>
            {msgCondition.type === 'success' ? '✅' : '⚠️'} {msgCondition.text}
          </div>
        )}

        <button type="submit" className="payment-submit-btn" disabled={savingCondition}>
          {savingCondition ? '⏳ กำลังบันทึก...' : '💾 บันทึกเงื่อนไข'}
        </button>
      </form>
    </div>
  );
};

export default ProviderProfilePage;
