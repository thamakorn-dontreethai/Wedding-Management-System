import { Outlet } from 'react-router-dom';
import Sidebar from './sidebar';
import { useAuthStore } from '../../store/authStore';
import '../../index.css';

const MainLayout = () => {
  const user = useAuthStore((state) => state.user);

  const displayName = user?.username || `${user?.firstName || ''} ${user?.lastName || ''}`.trim() || 'User';
  const displayRole = user?.role || 'guest';
  const avatarText = displayName.trim().charAt(0).toUpperCase() || 'U';

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#fafafa' }}>
      <Sidebar />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <header style={{
          height: 64,
          borderBottom: '1px solid #e5e7eb',
          background: 'rgba(255,255,255,0.85)',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          alignItems: 'center',
          padding: '0 32px',
          justifyContent: 'flex-end'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{
              width: 36, height: 36, borderRadius: '50%',
              background: 'linear-gradient(135deg, #f8a5c2, #f06292)',
              color: 'white', display: 'flex', alignItems: 'center',
              justifyContent: 'center', fontWeight: 700, fontSize: 14
            }}>
              {avatarText}
            </div>
            <div>
              <div style={{ fontSize: 14, fontWeight: 600, color: '#374151' }}>{displayName}</div>
              <div style={{ fontSize: 12, color: '#9ca3af', textTransform: 'capitalize' }}>{displayRole}</div>
            </div>
          </div>
        </header>
        <main style={{ flex: 1, padding: 32 }}>
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default MainLayout;