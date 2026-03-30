import { useState, useEffect } from 'react';
import api from '../../services/api';
import { useAuthStore } from '../../store/authStore';

const CustomerProfilePage = () => {
  const { user, setAuth, token } = useAuthStore();
  const [form, setForm] = useState({ username: '', phone: '', address: '' });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState({ text: '', type: '' });

  useEffect(() => {
    api.get('/auth/me')
      .then(({ data }) => {
        setForm({
          username: data.username || '',
          phone: data.phone || '',
          address: data.address || '',
        });
      })
      .catch(() => setMsg({ text: 'โหลดข้อมูลไม่สำเร็จ', type: 'error' }))
      .finally(() => setLoading(false));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.username.trim()) return setMsg({ text: 'กรุณากรอกชื่อผู้ใช้', type: 'error' });
    setSaving(true);
    setMsg({ text: '', type: '' });
    try {
      const { data } = await api.put('/auth/me', form);
      // อัปเดต authStore ด้วย
      setAuth(data, token, 'customer');
      setMsg({ text: 'บันทึกข้อมูลสำเร็จ', type: 'success' });
    } catch (err) {
      setMsg({ text: err.response?.data?.message || 'บันทึกไม่สำเร็จ', type: 'error' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) return (
    <div className="loading-state">
      <div className="loading-dots"><span /><span /><span /></div>
      <p style={{ color: 'var(--gray-400)', marginTop: 16 }}>กำลังโหลด...</p>
    </div>
  );

  return (
    <div style={{ maxWidth: 520, margin: '0 auto' }}>
      <div className="page-header">
        <h1 className="page-header__title">👤 ข้อมูลของฉัน</h1>
        <p className="page-header__sub">แก้ไขข้อมูลส่วนตัวของบัญชีผู้ใช้</p>
      </div>

      <form onSubmit={handleSubmit} style={{ background: 'white', borderRadius: 20, border: '1px solid var(--gray-100)', padding: 28, boxShadow: '0 2px 12px rgba(249,168,201,0.08)' }}>

        {/* Email (read-only) */}
        <div style={{ marginBottom: 16 }}>
          <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--gray-500)', display: 'block', marginBottom: 6 }}>อีเมล (ไม่สามารถเปลี่ยนได้)</label>
          <input className="payment-input" value={user?.email || ''} disabled
            style={{ background: 'var(--gray-50)', color: 'var(--gray-400)', cursor: 'not-allowed' }} />
        </div>

        {/* Username */}
        <div style={{ marginBottom: 16 }}>
          <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--gray-600)', display: 'block', marginBottom: 6 }}>ชื่อผู้ใช้ <span style={{ color: 'var(--pink)' }}>*</span></label>
          <input className="payment-input" value={form.username}
            onChange={e => setForm(f => ({ ...f, username: e.target.value }))}
            placeholder="ชื่อที่แสดงในระบบ" required />
        </div>

        {/* Phone */}
        <div style={{ marginBottom: 16 }}>
          <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--gray-600)', display: 'block', marginBottom: 6 }}>เบอร์โทรศัพท์</label>
          <input className="payment-input" value={form.phone}
            onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
            placeholder="0xx-xxx-xxxx" />
        </div>

        {/* Address */}
        <div style={{ marginBottom: 24 }}>
          <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--gray-600)', display: 'block', marginBottom: 6 }}>ที่อยู่</label>
          <textarea className="payment-input" value={form.address}
            onChange={e => setForm(f => ({ ...f, address: e.target.value }))}
            placeholder="ที่อยู่สำหรับติดต่อ" rows={3}
            style={{ resize: 'vertical' }} />
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
    </div>
  );
};

export default CustomerProfilePage;
