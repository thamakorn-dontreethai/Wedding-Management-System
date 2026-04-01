import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../../services/api';
import { useAuthStore } from '../../store/authStore';

const SERVICE_TYPE_OPTIONS = [
    { value: 'food', label: '🍽️ Catering' },
    { value: 'photo', label: '📷 Photographer' },
    { value: 'music', label: '🎵 Music Band' },
];

const RegisterPage = () => {
    const navigate = useNavigate();
    const { setAuth } = useAuthStore();
    const [role, setRole] = useState('customer');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        firstName: '', lastName: '', phone: '', email: '', password: '',
        serviceType: '',
    });

    const getFriendlyError = (err) => {
        const rawMessage = err.response?.data?.message || '';

        if (rawMessage.includes('E11000') || rawMessage.includes('duplicate key')) {
            return 'This email is already in use';
        }

        if (rawMessage.includes('ValidationError')) {
            return 'Invalid data. Please check your information.';
        }

        return rawMessage || 'Registration failed';
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        if (name === 'firstName' || name === 'lastName')
            setFormData(prev => ({ ...prev, [name]: value.replace(/[0-9]/g, '') }));
        else if (name === 'phone')
            setFormData(prev => ({ ...prev, phone: value.replace(/\D/g, '').slice(0, 10) }));
        else
            setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (role === 'provider' && !formData.serviceType) {
            setError('Please select a service type (Catering / Photographer / Music Band)');
            return;
        }

        setLoading(true);
        try {
            const endpoint = role === 'customer'
                ? '/auth/register/customer'
                : '/auth/register/provider';

            const payload = role === 'customer'
                ? {
                    username: `${formData.firstName} ${formData.lastName}`,
                    email: formData.email, password: formData.password, phone: formData.phone
                }
                : {
                    firstName: formData.firstName, lastName: formData.lastName,
                    email: formData.email, password: formData.password,
                    phone: formData.phone, serviceType: formData.serviceType
                };

            const { data } = await api.post(endpoint, payload);
            setAuth(data.user, data.token, role);
            if (role === 'customer') navigate('/search');
            else navigate('/orders');
        } catch (err) {
            setError(getFriendlyError(err));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-bg">
            <div className="auth-card" style={{ maxWidth: '520px' }}>

                <div className="auth-header">
                    <div className="auth-icon">🌸</div>
                    <h1>Create Account</h1>
                    <p>Select your account type to get started</p>
                </div>

                <div className="auth-body">
                    <form onSubmit={handleSubmit}>

                        <div className="role-selector" style={{ gridTemplateColumns: '1fr 1fr', marginBottom: '20px' }}>
                            {[
                                { value: 'customer', label: '👫 Customer (Couple)' },
                                { value: 'provider', label: '🎵 Service Provider' },
                            ].map((r) => (
                                <button key={r.value} type="button"
                                    className={`role-btn ${role === r.value ? 'active' : ''}`}
                                    onClick={() => setRole(r.value)}>
                                    {r.label}
                                </button>
                            ))}
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                            <div className="input-group">
                                <label className="input-label">First Name</label>
                                <div className="input-wrapper">
                                    <span className="input-icon">👤</span>
                                    <input className="auth-input" name="firstName" placeholder="First name"
                                        value={formData.firstName} onChange={handleChange} required />
                                </div>
                            </div>
                            <div className="input-group">
                                <label className="input-label">Last Name</label>
                                <div className="input-wrapper">
                                    <span className="input-icon">👤</span>
                                    <input className="auth-input" name="lastName" placeholder="Last name"
                                        value={formData.lastName} onChange={handleChange} required />
                                </div>
                            </div>
                        </div>

                        <div className="input-group">
                            <label className="input-label">Phone Number</label>
                            <div className="input-wrapper">
                                <span className="input-icon">📱</span>
                                <input className="auth-input" name="phone" placeholder="0812345678"
                                    value={formData.phone} onChange={handleChange} inputMode="numeric" />
                            </div>
                        </div>

                        <div className="input-group">
                            <label className="input-label">Email</label>
                            <div className="input-wrapper">
                                <span className="input-icon">✉️</span>
                                <input className="auth-input" type="email" name="email" placeholder="example@ku.th"
                                    value={formData.email} onChange={handleChange} required />
                            </div>
                        </div>

                        <div className="input-group">
                            <label className="input-label">Password</label>
                            <div className="input-wrapper">
                                <span className="input-icon">🔒</span>
                                <input className="auth-input" type="password" name="password" placeholder="••••••••"
                                    value={formData.password} onChange={handleChange} required />
                            </div>
                        </div>

                        {role === 'provider' && (
                            <div className="input-group">
                                <label className="input-label">Service Type</label>
                                <p style={{ fontSize: 12, color: 'var(--gray-500)', marginBottom: 8 }}>
                                    Please select your service type before registering
                                </p>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }}>
                                    {SERVICE_TYPE_OPTIONS.map((service) => {
                                        const selected = formData.serviceType === service.value;
                                        return (
                                            <button key={service.value} type="button"
                                                onClick={() => setFormData(prev => ({ ...prev, serviceType: service.value }))}
                                                style={{ border: `2px solid ${selected ? 'var(--pink)' : 'var(--gray-100)'}`, background: selected ? 'var(--pink-bg)' : 'white', color: selected ? 'var(--pink)' : 'var(--gray-600)', borderRadius: 12, padding: '10px 8px', fontSize: 13, fontWeight: 700, cursor: 'pointer', transition: 'all 0.2s ease' }}>
                                                {service.label}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        )}

                        {error && <div className="auth-error">⚠️ {error}</div>}

                        <button className="auth-btn auth-btn-primary" type="submit"
                            disabled={loading || (role === 'provider' && !formData.serviceType)}>
                            {loading ? 'Registering...' : 'Create Account'}
                        </button>

                    </form>

                    <Link to="/login" className="auth-link">← Back to Login</Link>
                </div>
            </div>
        </div>
    );
};

export default RegisterPage;
