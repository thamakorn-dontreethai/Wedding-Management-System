import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import api from '../../services/api';

const MOCK_VENUES = [
  {
    _id: 'mock-venue-001',
    name: 'Grand Blossom Hall',
    description: 'Luxury banquet hall with stage, full lighting and sound system, ideal for large weddings',
    guestCount: 350,
    province: 'Chonburi',
    pricePerSession: 180000,
    images: ['https://picsum.photos/seed/wedding-grand-ballroom/1200/800'],
  },
  {
    _id: 'mock-venue-002',
    name: 'Garden Romance Venue',
    description: 'Outdoor garden venue with a warm atmosphere, perfect for evening ceremonies and small-to-medium receptions',
    guestCount: 180,
    province: 'Bangkok',
    pricePerSession: 95000,
    images: ['https://picsum.photos/seed/wedding-garden-venue/1200/800'],
  },
  {
    _id: 'mock-venue-003',
    name: 'Sea Breeze Wedding Space',
    description: 'Beachfront location with sunset views, perfect for modern weddings and after-parties',
    guestCount: 250,
    province: 'Rayong',
    pricePerSession: 140000,
    images: ['https://picsum.photos/seed/wedding-seaside-venue/1200/800'],
  },
  {
    _id: 'mock-venue-004',
    name: 'Classic Ivory Ballroom',
    description: 'High-ceiling classic ivory ballroom, fully equipped for photography teams and formal ceremonies',
    guestCount: 420,
    province: 'Nonthaburi',
    pricePerSession: 220000,
    images: ['https://picsum.photos/seed/wedding-classic-hall/1200/800'],
  },
];

const SearchPage = () => {
  const navigate = useNavigate();
  const [filter, setFilter] = useState({ guest: '', budget: '' });
  const [venues, setVenues] = useState([]);
  const [loading, setLoading] = useState(true);

  const sanitizeIntegerInput = (value) => {
    const digitsOnly = String(value).replace(/\D/g, '');
    if (!digitsOnly) return '';
    return String(Number.parseInt(digitsOnly, 10));
  };

  useEffect(() => {
    const fetchVenues = async () => {
      try {
        const { data } = await api.get('/venues');
        if (Array.isArray(data) && data.length > 0) {
          setVenues(data);
        } else {
          setVenues(MOCK_VENUES);
        }
      } catch (err) {
        console.error('Failed to load venues:', err);
        setVenues(MOCK_VENUES);
      } finally {
        setLoading(false);
      }
    };
    fetchVenues();
  }, []);

  const toNumber = (value) => {
    const n = Number(value);
    return Number.isFinite(n) ? n : 0;
  };

  const getVenueGuestCount = (venue) => {
    const fallbackCapacity = Math.max(toNumber(venue.capacityBuffet), toNumber(venue.capacityChinese));
    return toNumber(venue.guestCount) || toNumber(venue.capacity) || fallbackCapacity;
  };

  const isFiltering = Boolean(filter.guest || filter.budget);

  const displayVenues = useMemo(() => {
    if (!isFiltering) return venues;

    const guestRequired = filter.guest ? Number(filter.guest) : 0;
    const budgetLimit = filter.budget ? Number(filter.budget) : 0;

    return venues.filter((venue) => {
      const venueGuestCount = getVenueGuestCount(venue);
      const price = toNumber(venue.pricePerSession);

      const guestMatch = guestRequired ? venueGuestCount >= guestRequired : true;
      const budgetMatch = budgetLimit ? price <= budgetLimit : true;

      return guestMatch && budgetMatch;
    });
  }, [venues, filter.guest, filter.budget, isFiltering]);

  const handleSearch = () => {
    if (!isFiltering) {
      setFilter({ guest: '', budget: '' });
    }
  };

  return (
    <div className="search-page">

      {/* Hero */}
      <section className="im-hero">
        <div className="im-hero__grain" aria-hidden="true" />
        <div className="im-hero__content">
          <p className="im-hero__eyebrow">✨ Wedding Discovery</p>
          <h1 className="im-hero__title">Find the perfect venue for your budget and guest count</h1>
          <p className="im-hero__desc">
            Enter your guest count and budget to find the best venue for your special day.
          </p>

          <div className="im-hero__search">
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16 }}>
              <Input label="Guest Count" type="text" inputMode="numeric"
                value={filter.guest} placeholder="e.g. 300"
                onChange={(e) => setFilter({ ...filter, guest: sanitizeIntegerInput(e.target.value) })} />
              <Input label="Max Budget (THB)" type="text" inputMode="numeric"
                value={filter.budget} placeholder="e.g. 150000"
                onChange={(e) => setFilter({ ...filter, budget: sanitizeIntegerInput(e.target.value) })} />
              <div className="mb-4">
                <label className="block text-sm font-semibold mb-1.5">&nbsp;</label>
                <Button variant="primary" onClick={handleSearch} className="w-full h-[46px]">
                  🔍 Search
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Result badge */}
      {isFiltering && (
        <div className="search-result-badge">
          Found <strong>{displayVenues.length} venue{displayVenues.length !== 1 ? 's' : ''}</strong>
          {filter.guest && ` · min ${filter.guest} guests`}
          {filter.budget && ` · budget ≤ ฿${Number(filter.budget).toLocaleString()}`}
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="loading-state">
          <div className="loading-dots">
            <span /><span /><span />
          </div>
          <p style={{ color: '#9ca3af', marginTop: 16 }}>Loading venues...</p>
        </div>
      )}

      {/* Venue grid */}
      {!loading && (
        <div className="search-venue-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 24 }}>
          {displayVenues.map((venue) => (
            <div key={venue._id} className="venue-card" onClick={() => navigate(`/booking?venueId=${venue._id}`)}>
              {(() => {
                const venueGuestCount = getVenueGuestCount(venue);

                return (
                  <>

                    <div className="venue-card__image">
                      {venue.images?.[0]
                        ? <img src={venue.images[0]} alt={venue.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        : '🏛️'}
                    </div>

                    <div className="venue-card__body">
                      <h3 className="venue-card__title">{venue.name}</h3>
                      {venue.description && (
                        <p className="venue-card__desc">{venue.description}</p>
                      )}
                      <div className="venue-card__meta">
                        <div className="venue-card__meta-item">
                          <span>👥</span>
                          <span> Up to {venueGuestCount || '-'} guests</span>
                        </div>
                        <div className="venue-card__meta-item">
                          <span>📍</span>
                          <span>{venue.province}</span>
                        </div>
                      </div>
                      <div className="venue-card__price">
                        ฿{venue.pricePerSession?.toLocaleString() ?? '-'}
                      </div>
                    </div>
                  </>
                );
              })()}
            </div>
          ))}
        </div>
      )}

      {/* Empty states */}
      {!loading && isFiltering && displayVenues.length === 0 && (
        <div className="empty-state">
          <div className="empty-state__icon">🔍</div>
          <p className="empty-state__title">No venues match your criteria</p>
          <p className="empty-state__desc">Try increasing the guest count or budget</p>
        </div>
      )}

      {!loading && !isFiltering && venues.length === 0 && (
        <div className="empty-state">
          <div className="empty-state__icon">🏛️</div>
          <p className="empty-state__title">No venues available</p>
          <p className="empty-state__desc">Please contact the admin to add venues</p>
        </div>
      )}

    </div>
  );
};

export default SearchPage;