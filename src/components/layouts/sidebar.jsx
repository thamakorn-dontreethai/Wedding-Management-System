import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import '../../index.css';

const Sidebar = () => {
  const { user, logout } = useAuthStore();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => { logout(); navigate('/login'); };

  const displayName = user?.username || `${user?.firstName || ''} ${user?.lastName || ''}`.trim() || 'User';
  const avatarText = displayName.trim().charAt(0).toUpperCase() || 'U';

  const menus = {
    customer: [
      { name: '👤 My Profile', path: '/profile' },
      { name: '📦 Wedding Packages', path: '/customer/packages' },
      { name: '🔍 Search Venues', path: '/search' },
      { name: '📅 My Bookings', path: '/my-bookings' },
    ],
    admin: [
      { name: '📈 Reports', path: '/admin/report' },
      { name: '📦 Manage Packages', path: '/admin/packages' },
      { name: '✅ Verify Payments', path: '/admin/verify-payment' },
      { name: '🧾 Receipts', path: '/admin/receipts' },
    ],
    provider: [
      { name: '👤 My Profile', path: '/provider/profile' },
      { name: '📋 Work Orders', path: '/orders' },
      { name: '🗓️ Schedule', path: '/schedule' },
      { name: '📊 Report', path: '/provider/report' },
    ],
  };

  const userMenu = menus[user?.role] || [];

  return (
    <aside className="sidebar">
      {/* Logo */}
      <div className="sidebar__logo">
        <div className="sidebar__logo-icon">💍</div>
        <div className="sidebar__logo-title">Wedding Planner</div>
        <div style={{ fontSize: 11, color: 'var(--gray-400)', marginTop: 2 }}>KU Sriracha</div>
      </div>

      {/* Nav */}
      <nav className="sidebar__nav">
        {userMenu.map((item) => (
          <Link key={item.path} to={item.path}
            className={`sidebar__item ${location.pathname === item.path ? 'active' : ''}`}>
            {item.name}
          </Link>
        ))}
      </nav>

      {/* Footer */}
      <div className="sidebar__footer">
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
          <div style={{
            width: 36, height: 36, borderRadius: '50%',
            background: 'linear-gradient(135deg, var(--pink-light), var(--pink))',
            color: 'white', display: 'flex', alignItems: 'center',
            justifyContent: 'center', fontWeight: 700, fontSize: 14, flexShrink: 0
          }}>
            {avatarText}
          </div>
          <div style={{ minWidth: 0 }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--gray-700)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {displayName}
            </div>
            <div style={{ fontSize: 11, color: 'var(--gray-400)', textTransform: 'capitalize' }}>
              {user?.role}
            </div>
          </div>
        </div>
        <button className="sidebar__logout" onClick={handleLogout}>
          🚪 Logout
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;