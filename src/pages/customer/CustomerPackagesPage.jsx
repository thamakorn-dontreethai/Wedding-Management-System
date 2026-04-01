import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';

const STORAGE_KEY = 'selectedPackage';

const getIncludedServices = (pkg) => {
  const services = [];
  if (pkg?.includeFood) {
    const foodLabel = pkg?.includeFoodType === 'chinese'
      ? 'Catering (Chinese Banquet)'
      : pkg?.includeFoodType === 'buffet'
        ? 'Catering (Buffet)'
        : 'Catering (Chinese / Buffet)';
    services.push(foodLabel);
  }
  if (pkg?.includePhoto) services.push('Photographer');
  if (pkg?.includeMusic) services.push('Music Band');
  return services;
};

const CustomerPackagesPage = () => {
  const navigate = useNavigate();
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPackageId, setSelectedPackageId] = useState(() => {
    try {
      const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null');
      return stored?._id || null;
    } catch {
      return null;
    }
  });

  useEffect(() => {
    api.get('/packages')
      .then(({ data }) => setPackages(Array.isArray(data) ? data : []))
      .catch(() => setPackages([]))
      .finally(() => setLoading(false));
  }, []);

  const selectedPackage = useMemo(
    () => packages.find((pkg) => pkg._id === selectedPackageId) || null,
    [packages, selectedPackageId],
  );

  const handleSelectPackage = (pkg) => {
    setSelectedPackageId(pkg._id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(pkg));
  };

  const handleClear = () => {
    setSelectedPackageId(null);
    localStorage.removeItem(STORAGE_KEY);
  };

  return (
    <div style={{ maxWidth: 980, margin: '0 auto' }}>
      <div className="page-header">
        <h1 className="page-header__title">📦 Wedding Packages</h1>
        <p className="page-header__sub">Choose a package first, then search for a venue and book</p>
      </div>

      {selectedPackage ? (
        <div style={{ background: '#fff7fb', border: '1px solid #fbcfe8', borderRadius: 14, padding: 14, marginBottom: 20, display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12 }}>
          <div>
            <div style={{ fontSize: 12, color: '#9d174d', fontWeight: 700 }}>Selected Package</div>
            <div style={{ fontSize: 15, color: '#be185d', fontWeight: 800 }}>{selectedPackage.name}</div>
          </div>
          <button type="button" onClick={handleClear}
            style={{ border: '1px solid #f9a8d4', color: '#be185d', background: 'white', borderRadius: 10, padding: '8px 12px', fontWeight: 700, cursor: 'pointer' }}>
            Remove Package
          </button>
        </div>
      ) : null}

      {loading ? (
        <div className="loading-state"><div className="loading-dots"><span /><span /><span /></div></div>
      ) : packages.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state__icon">📦</div>
          <p className="empty-state__title">No packages available</p>
          <p className="empty-state__desc">Check back later when the admin adds packages</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16 }}>
          {packages.map((pkg) => {
            const isSelected = selectedPackageId === pkg._id;
            return (
              <div key={pkg._id} style={{ border: `2px solid ${isSelected ? 'var(--pink)' : 'var(--gray-100)'}`, background: isSelected ? 'var(--pink-bg)' : 'white', borderRadius: 16, padding: 18, boxShadow: isSelected ? '0 8px 20px rgba(236,72,153,0.14)' : 'none' }}>
                <div style={{ fontSize: 17, fontWeight: 800, color: isSelected ? 'var(--pink)' : 'var(--gray-900)' }}>
                  {pkg.name}
                </div>
                {pkg.description && (
                  <div style={{ marginTop: 6, fontSize: 13, color: 'var(--gray-500)' }}>{pkg.description}</div>
                )}
                <div style={{ marginTop: 8, fontSize: 12, color: 'var(--gray-600)', fontWeight: 600 }}>
                  Includes: {getIncludedServices(pkg).length > 0 ? getIncludedServices(pkg).join(', ') : 'Not specified'}
                </div>
                <div style={{ marginTop: 12, display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                  <span style={{ color: 'var(--gray-500)' }}>
                    {pkg.maxGuests > 0 ? `Up to ${pkg.maxGuests} guests` : 'Unlimited guests'}
                  </span>
                  <span style={{ color: 'var(--pink)', fontWeight: 800 }}>฿{(pkg.basePrice || 0).toLocaleString()}</span>
                </div>
                <button type="button" onClick={() => handleSelectPackage(pkg)}
                  style={{ width: '100%', marginTop: 14, border: 'none', borderRadius: 10, padding: '10px 12px', fontWeight: 800, cursor: 'pointer', color: 'white', background: isSelected ? '#db2777' : 'linear-gradient(135deg, #f9a8c9, #ec4899)' }}>
                  {isSelected ? 'Selected ✓' : 'Select Package'}
                </button>
              </div>
            );
          })}
        </div>
      )}

      <div style={{ marginTop: 24 }}>
        <button type="button" onClick={() => navigate('/search')}
          style={{ border: 'none', borderRadius: 12, padding: '12px 18px', fontWeight: 800, cursor: 'pointer', color: 'white', background: 'linear-gradient(135deg, #f9a8c9, #ec4899)' }}>
          🔍 Search Venues
        </button>
      </div>
    </div>
  );
};

export default CustomerPackagesPage;
