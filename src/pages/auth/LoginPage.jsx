import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { useAuthStore } from '../../store/authStore';

const LoginPage = () => {
  const navigate = useNavigate();
  const { setAuth } = useAuthStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('customer');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const { data } = await api.post('/auth/login', {
        email: email.trim(), password: password.trim(), role,
      });
      setAuth(data.user, data.token, role);
      if (role === 'admin') navigate('/admin/report');
      else if (role === 'customer') navigate('/search');
      else if (role === 'provider') navigate('/orders');
      else navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'อีเมลหรือรหัสผ่านไม่ถูกต้อง');
    } finally {
      setLoading(false);
    }
  };

  const roles = [
    { value: 'customer', label: '👫 Customer' },
    { value: 'provider', label: '🎵 Provider' },
    { value: 'admin', label: '⚙️ Admin' },
  ];

  return (
    <div className="auth-bg">
      <div className="auth-card">
        <div className="auth-header">
          <div className="auth-icon">💍</div>
          <h1>Wedding Planner</h1>
          <p>เข้าสู่ระบบเพื่อจัดการงานแต่งงานของคุณ</p>
        </div>

        <div className="auth-body">
          <form onSubmit={handleLogin}>
            <div className="role-selector">
              {roles.map((r) => (
                <button key={r.value} type="button"
                  className={`role-btn ${role === r.value ? 'active' : ''}`}
                  onClick={() => setRole(r.value)}>
                  {r.label}
                </button>
              ))}
            </div>

            <div className="input-group">
              <label className="input-label">อีเมล</label>
              <div className="input-wrapper">
                <span className="input-icon">✉️</span>
                <input className="auth-input" type="email" placeholder="example@ku.th"
                  value={email} onChange={(e) => setEmail(e.target.value)} required />
              </div>
            </div>

            <div className="input-group">
              <label className="input-label">รหัสผ่าน</label>
              <div className="input-wrapper">
                <span className="input-icon">🔒</span>
                <input className="auth-input" type="password" placeholder="••••••••"
                  value={password} onChange={(e) => setPassword(e.target.value)} required />
              </div>
            </div>

            {error && <div className="auth-error">⚠️ {error}</div>}

            <button className="auth-btn auth-btn-primary" type="submit" disabled={loading}>
              {loading ? 'กำลังเข้าสู่ระบบ...' : 'เข้าสู่ระบบ'}
            </button>
          </form>

          <div className="auth-divider">หรือ</div>

          <button className="auth-btn auth-btn-secondary" onClick={() => navigate('/register')}>
            สมัครสมาชิกใหม่
          </button>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;