import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
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

const MEAL_OPTIONS = [
  { id: 'buffet', icon: '🍽️', title: 'Buffet', desc: 'Variety of buffet dishes, eat as you like', pricePerHead: 450 },
  { id: 'chinese', icon: '🥢', title: 'Chinese Banquet', desc: 'Auspicious Chinese cuisine, served in 10 courses', pricePerHead: 600 },
];

const FIXED_ADDONS = [
  { id: 'mc', icon: '🎤', title: 'MC / Emcee', desc: 'Professional emcee for the entire event', price: 8000 },
  { id: 'flower', icon: '💐', title: 'Floral Decoration', desc: 'Fresh flower arrangements throughout the venue', price: 20000 },
  { id: 'cake', icon: '🎂', title: 'Wedding Cake', desc: '5-tier custom wedding cake', price: 5000 },
  { id: 'makeup', icon: '💄', title: 'Makeup Artist', desc: 'Bride + 4 bridesmaids makeup', price: 10000 },
  { id: 'invite', icon: '💌', title: 'Invitation Cards', desc: 'Premium invitation cards, 200 prints', price: 3000 },
  { id: 'dj', icon: '🎧', title: 'DJ', desc: 'DJ music between live performances', price: 6000 },
  { id: 'screen', icon: '📽️', title: 'LED Screen + Slideshow', desc: 'Large screen showing couple slideshow', price: 8000 },
  { id: 'photo_booth', icon: '🤳', title: 'Photo Booth', desc: 'Photo booth with props and accessories', price: 5000 },
];

// Component เลือก Provider
const SERVICE_ROLE_LABELS = {
  food: 'Catering',
  photo: 'Photographer',
  music: 'Music Band',
};

const MEAL_TYPE_LABEL = { buffet: '🍽️ Buffet', chinese: '🥢 Chinese Banquet', both: '🍽️🥢 Both' };

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

const ProviderSelector = ({ title, icon, providers, selected, onSelect, serviceType, hasDate, mealTypeLabel }) => (
  <div className="form-section">
    <h2 className="form-section__title">{icon} {title}</h2>

    {providers.length === 0 ? (
      <div style={{
        padding: 20, textAlign: 'center',
        background: hasDate ? '#fffbeb' : 'var(--gray-50)', borderRadius: 12,
        color: hasDate ? '#d97706' : 'var(--gray-400)', fontSize: 14, fontWeight: hasDate ? 600 : 400,
        border: hasDate ? '1px solid #fde68a' : 'none',
      }}>
        {hasDate ? `⛔ No available ${title} on the selected date` : `No ${title} available in the system`}
      </div>
    ) : (
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>

        {/* ไม่เลือก */}
        <div onClick={() => onSelect(null)}
          style={{
            padding: 20, borderRadius: 16, cursor: 'pointer', transition: 'all 0.2s',
            border: `2px solid ${!selected ? 'var(--pink)' : 'var(--gray-100)'}`,
            background: !selected ? 'var(--pink-bg)' : 'white',
            display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 6,
          }}>
          <div style={{ fontSize: 32, marginBottom: 4 }}>🚫</div>
          <div style={{ fontWeight: 700, fontSize: 15, color: !selected ? 'var(--pink)' : 'var(--gray-900)' }}>
            Skip {title}
          </div>
          <div style={{ fontSize: 12, color: 'var(--gray-400)', lineHeight: 1.4 }}>
            Do not add this service provider
          </div>
          <div style={{ fontWeight: 700, color: 'var(--pink)', fontSize: 14, marginTop: 2 }}>
            +฿0
          </div>
        </div>

        {/* Provider cards */}
        {providers.map(p => (
          <div key={p._id} onClick={() => onSelect(p)}
            style={{
              padding: 20, borderRadius: 16, cursor: 'pointer', transition: 'all 0.2s',
              border: `2px solid ${selected?._id === p._id ? 'var(--pink)' : 'var(--gray-100)'}`,
              background: selected?._id === p._id ? 'var(--pink-bg)' : 'white',
              position: 'relative',
            }}>

            {/* Checkmark */}
            {selected?._id === p._id && (
              <div style={{
                position: 'absolute', top: 10, right: 10,
                background: 'var(--pink)', color: 'white',
                width: 22, height: 22, borderRadius: '50%',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 12, fontWeight: 700,
              }}>✓</div>
            )}

            {/* Avatar */}
            <div style={{
              width: 48, height: 48, borderRadius: '50%',
              background: 'linear-gradient(135deg, var(--pink-light), var(--pink))',
              color: 'white', display: 'flex', alignItems: 'center',
              justifyContent: 'center', fontWeight: 800, fontSize: 18,
              marginBottom: 8,
            }}>
              {p.firstName?.charAt(0).toUpperCase()}
            </div>

            <div style={{ fontWeight: 700, fontSize: 15, color: selected?._id === p._id ? 'var(--pink)' : 'var(--gray-900)', marginBottom: 3 }}>
              {p.firstName} {p.lastName}
            </div>
            <div style={{ fontSize: 11, color: 'var(--pink)', marginBottom: 4, fontWeight: 700 }}>
              🏷️ {SERVICE_ROLE_LABELS[p.serviceType] || SERVICE_ROLE_LABELS[serviceType] || 'Service Provider'}
            </div>
            {p.serviceType === 'food' && p.supportsMealType && (
              <div style={{ fontSize: 11, color: '#d97706', fontWeight: 700, marginBottom: 4 }}>
                {MEAL_TYPE_LABEL[p.supportsMealType] || ''}
              </div>
            )}
            <div style={{ fontSize: 12, color: 'var(--gray-400)', marginBottom: 6 }}>
              📞 {p.phone || '-'}
            </div>
            {p.maxGuests > 0 && (
              <div style={{ fontSize: 12, color: 'var(--gray-500)', marginBottom: 8, fontWeight: 600 }}>
                👥 Max {p.maxGuests} guests
              </div>
            )}
            <div style={{ fontWeight: 700, color: 'var(--pink)', fontSize: 14 }}>
              Service Fee
            </div>
            <div style={{ fontWeight: 800, color: 'var(--pink)', fontSize: 15, marginTop: 2 }}>
              +฿{(p.price || 0).toLocaleString()}
            </div>
          </div>
        ))}
      </div>
    )}
  </div>
);

const BookingPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const venueId = searchParams.get('venueId');
  const packageIdParam = searchParams.get('packageId');

  const [venue, setVenue] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [foodProviders, setFoodProviders] = useState([]);
  const [photoProviders, setPhotoProviders] = useState([]);
  const [musicProviders, setMusicProviders] = useState([]);

  const [mealType, setMealType] = useState(null);
  const [guestCount, setGuestCount] = useState(1);
  const [eventDate, setEventDate] = useState('');
  const [addons, setAddons] = useState([]);
  const [notes, setNotes] = useState('');
  const [selectedFood, setSelectedFood] = useState(null);
  const [selectedPhoto, setSelectedPhoto] = useState(null);
  const [selectedMusic, setSelectedMusic] = useState(null);
  const [selectedPackage, setSelectedPackage] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('selectedPackage') || 'null');
    } catch {
      return null;
    }
  });

  const toNumber = (value) => {
    const n = Number(value);
    return Number.isFinite(n) ? n : 0;
  };

  const getVenueGuestCount = (venueData) => {
    const fallbackCapacity = Math.max(toNumber(venueData?.capacityBuffet), toNumber(venueData?.capacityChinese));
    return toNumber(venueData?.guestCount) || toNumber(venueData?.capacity) || fallbackCapacity;
  };

  // โหลด venue ครั้งเดียว
  useEffect(() => {
    if (!venueId) return;
    api.get(`/venues/${venueId}`)
      .then(({ data }) => {
        setVenue(data);
        const defaultGuestCount = getVenueGuestCount(data);
        setGuestCount(defaultGuestCount > 0 ? defaultGuestCount : 1);
      })
      .catch(() => {
        const mockVenue = MOCK_VENUES.find((item) => item._id === venueId);
        if (mockVenue) {
          setVenue(mockVenue);
          const defaultGuestCount = getVenueGuestCount(mockVenue);
          setGuestCount(defaultGuestCount > 0 ? defaultGuestCount : 1);
        }
      })
      .finally(() => setLoading(false));
  }, [venueId]);

  useEffect(() => {
    const targetPackageId = packageIdParam || selectedPackage?._id;
    if (!targetPackageId) return;

    api.get('/packages')
      .then(({ data }) => {
        const list = Array.isArray(data) ? data : [];
        const foundPackage = list.find((pkg) => pkg._id === targetPackageId) || null;
        setSelectedPackage(foundPackage);
        if (foundPackage) {
          localStorage.setItem('selectedPackage', JSON.stringify(foundPackage));
        }
      })
      .catch(() => setSelectedPackage(null));
  }, [packageIdParam]);

  // โหลด provider ใหม่ทุกครั้งที่เปลี่ยนวัน (กรองเฉพาะที่ว่าง)
  useEffect(() => {
    const dateParam = eventDate ? `&date=${eventDate}` : '';
    Promise.allSettled([
      api.get(`/providers?serviceType=food${dateParam}`),
      api.get(`/providers?serviceType=photo${dateParam}`),
      api.get(`/providers?serviceType=music${dateParam}`),
    ]).then(([foodRes, photoRes, musicRes]) => {
      if (foodRes.status === 'fulfilled') {
        const list = Array.isArray(foodRes.value?.data) ? foodRes.value.data : [];
        setFoodProviders(list);
        if (selectedFood && !list.find(p => p._id === selectedFood._id)) setSelectedFood(null);
      }
      if (photoRes.status === 'fulfilled') {
        const list = Array.isArray(photoRes.value?.data) ? photoRes.value.data : [];
        setPhotoProviders(list);
        if (selectedPhoto && !list.find(p => p._id === selectedPhoto._id)) setSelectedPhoto(null);
      }
      if (musicRes.status === 'fulfilled') {
        const list = Array.isArray(musicRes.value?.data) ? musicRes.value.data : [];
        setMusicProviders(list);
        if (selectedMusic && !list.find(p => p._id === selectedMusic._id)) setSelectedMusic(null);
      }
    }).catch(console.error);
  }, [eventDate]);

  const handleMealTypeChange = (id) => {
    if (selectedPackage) return;
    setMealType(id);
    // clear food selection ถ้า provider ไม่รองรับ meal type ใหม่
    if (selectedFood && selectedFood.supportsMealType !== 'both' && selectedFood.supportsMealType !== id) {
      setSelectedFood(null);
    }
  };

  const toggleAddon = (id) => {
    if (selectedPackage) return;
    setAddons(prev => prev.includes(id) ? prev.filter(a => a !== id) : [...prev, id]);
  };

  useEffect(() => {
    if (!selectedPackage) return;

    // เมื่อเลือกแพ็กเกจ ให้ล็อกตัวเลือกเสริมทั้งหมด
    setMealType(null);
    setSelectedFood(null);
    setSelectedPhoto(null);
    setSelectedMusic(null);
    setAddons([]);
  }, [selectedPackage]);

  const selectedMeal = MEAL_OPTIONS.find(m => m.id === mealType);
  const packagePrice = selectedPackage?.basePrice || 0;
  const mealPrice = (selectedMeal?.pricePerHead || 0) * guestCount;
  const venuePrice = venue?.pricePerSession || 0;
  const addonPrice = FIXED_ADDONS.filter(a => addons.includes(a.id)).reduce((s, a) => s + a.price, 0);
  const foodPrice = selectedFood?.price || 0;
  const photoPrice = selectedPhoto?.price || 0;
  const musicPrice = selectedMusic?.price || 0;
  const totalPrice = venuePrice + packagePrice + mealPrice + addonPrice + foodPrice + photoPrice + musicPrice;
  const depositAmount = Math.round(totalPrice * 0.3);
  const venueGuestCount = getVenueGuestCount(venue);

  const handleSubmit = async () => {
    if (!eventDate) return alert('Please select an event date');
    if (guestCount < 1) return alert('Guest count must be at least 1');
    if (venueGuestCount > 0 && guestCount > venueGuestCount) {
      return alert(`Guest count exceeds venue capacity (max ${venueGuestCount} guests)`);
    }
    if (selectedPackage?.maxGuests > 0 && guestCount > selectedPackage.maxGuests) {
      return alert(`The selected package supports a maximum of ${selectedPackage.maxGuests} guests`);
    }
    setSubmitting(true);
    try {
      const resolvedVenueName = venue?.name || venue?.venueName || '';
      if (resolvedVenueName) {
        localStorage.setItem('lastBookedVenueName', resolvedVenueName);
      }

      const { data: createdBooking } = await api.post('/bookings', {
        venueId,
        venueName: resolvedVenueName || null,
        packageId: selectedPackage?._id || null,
        eventDate,
        guestCount,
        mealType: selectedPackage?.includeFoodType === 'chinese' ? 'chinese' : (mealType || 'buffet'),
        addFood: !!selectedFood,
        addPhoto: !!selectedPhoto,
        addMusic: !!selectedMusic,
        foodProviderId: selectedFood?._id || null,
        photoProviderId: selectedPhoto?._id || null,
        musicProviderId: selectedMusic?._id || null,
        totalPrice,
        depositAmount,
        remainingAmount: totalPrice - depositAmount,
        notes,
      });

      if (createdBooking?._id && resolvedVenueName) {
        const mapKey = 'bookingVenueNameMap';
        const currentMap = JSON.parse(localStorage.getItem(mapKey) || '{}');
        currentMap[createdBooking._id] = resolvedVenueName;
        localStorage.setItem(mapKey, JSON.stringify(currentMap));
      }

      alert('Booking confirmed! Please proceed with the deposit payment.');
      navigate('/my-bookings');
    } catch (err) {
      alert(err.response?.data?.message || 'An error occurred');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return (
    <div className="loading-state">
      <div className="loading-dots"><span /><span /><span /></div>
      <p style={{ color: 'var(--gray-400)', marginTop: 16 }}>Loading...</p>
    </div>
  );

  return (
    <div style={{ maxWidth: 800, margin: '0 auto' }}>

      {/* Header */}
      <div className="booking-header">
        <div className="booking-header__icon">💍</div>
        <div>
          <h1 className="booking-header__title">{venue?.name || venue?.venueName || 'Wedding Venue'}</h1>
          <p className="booking-header__sub">
            📍 {venue?.province} · Up to {venueGuestCount || '-'} guests
          </p>
        </div>
      </div>

      <div className="form-section" style={{ background: '#fff7fb', border: '1px solid #fbcfe8' }}>
        <h2 className="form-section__title">📦 Wedding Package</h2>
        {selectedPackage ? (
          <div>
            <div style={{ fontWeight: 800, color: '#be185d', marginBottom: 6 }}>{selectedPackage.name}</div>
            <div style={{ fontSize: 13, color: 'var(--gray-600)' }}>
              {selectedPackage.maxGuests > 0 ? `Up to ${selectedPackage.maxGuests} guests` : 'Unlimited guests'}
            </div>
            <div style={{ fontSize: 13, color: 'var(--gray-600)', marginTop: 4 }}>
              Includes: {getIncludedServices(selectedPackage).length > 0 ? getIncludedServices(selectedPackage).join(', ') : 'Not specified'}
            </div>
            <div style={{ marginTop: 6, fontWeight: 700, color: 'var(--pink)' }}>
              Package Price ฿{(selectedPackage.basePrice || 0).toLocaleString()}
            </div>
          </div>
        ) : (
          <div style={{ fontSize: 13, color: 'var(--gray-500)' }}>
            No package selected. You can choose one from "📦 Wedding Packages".
          </div>
        )}
      </div>

      {/* Step 1 - วันและแขก */}
      <div className="form-section">
        <h2 className="form-section__title">📅 Event Date & Guest Count</h2>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          <div>
            <label className="form-label">Event Date</label>
            <input type="date" className="form-input"
              value={eventDate}
              min={new Date().toISOString().split('T')[0]}
              onChange={e => setEventDate(e.target.value)} />
          </div>
          <div>
            <label className="form-label">Guest Count</label>
            <input type="number" className="form-input"
              value={guestCount} min={1} max={venueGuestCount || undefined} step={1} inputMode="numeric"
              onChange={e => {
                const rawValue = e.target.value;
                if (rawValue === '') {
                  setGuestCount(1);
                  return;
                }

                const digitsOnly = rawValue.replace(/\D/g, '');
                if (!digitsOnly) {
                  setGuestCount(1);
                  return;
                }

                const nextValue = Number.parseInt(digitsOnly, 10);
                if (nextValue < 1) {
                  setGuestCount(1);
                  return;
                }
                if (venueGuestCount > 0 && nextValue > venueGuestCount) {
                  setGuestCount(venueGuestCount);
                  return;
                }
                setGuestCount(nextValue);
              }} />
          </div>
        </div>
      </div>

      {selectedPackage ? (
        <div className="form-section" style={{ background: '#fffbeb', border: '1px solid #fde68a' }}>
          <h2 className="form-section__title">🔒 Locked by Package</h2>
          <p style={{ color: '#92400e', fontWeight: 600, fontSize: 13, margin: 0 }}>
            When a wedding package is selected, meal type, photographer, music band, and add-ons cannot be customized.
          </p>
        </div>
      ) : (
        <>
          {/* Step 2 - อาหาร */}
          <div className="form-section">
            <h2 className="form-section__title">🍽️ Meal Type</h2>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
              {/* ไม่เลือกอาหาร */}
              <div onClick={() => handleMealTypeChange(null)}
                style={{
                  padding: 20, borderRadius: 16, cursor: 'pointer', transition: 'all 0.2s',
                  border: `2px solid ${mealType === null ? 'var(--pink)' : 'var(--gray-100)'}`,
                  background: mealType === null ? 'var(--pink-bg)' : 'white',
                }}>
                <div style={{ fontSize: 32, marginBottom: 8 }}>🚫</div>
                <div style={{ fontWeight: 700, fontSize: 15, color: mealType === null ? 'var(--pink)' : 'var(--gray-900)', marginBottom: 4 }}>
                  No Meal
                </div>
                <div style={{ fontSize: 12, color: 'var(--gray-400)', marginBottom: 8 }}>Self-catered or not required</div>
                <div style={{ fontWeight: 700, color: 'var(--pink)', fontSize: 14 }}>+฿0</div>
              </div>

              {MEAL_OPTIONS.map(meal => (
                <div key={meal.id} onClick={() => handleMealTypeChange(meal.id)}
                  style={{
                    padding: 20, borderRadius: 16, cursor: 'pointer', transition: 'all 0.2s',
                    border: `2px solid ${mealType === meal.id ? 'var(--pink)' : 'var(--gray-100)'}`,
                    background: mealType === meal.id ? 'var(--pink-bg)' : 'white',
                  }}>
                  <div style={{ fontSize: 32, marginBottom: 8 }}>{meal.icon}</div>
                  <div style={{ fontWeight: 700, fontSize: 15, color: mealType === meal.id ? 'var(--pink)' : 'var(--gray-900)', marginBottom: 4 }}>
                    {meal.title}
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--gray-400)', marginBottom: 8 }}>{meal.desc}</div>
                  <div style={{ fontWeight: 700, color: 'var(--pink)', fontSize: 14 }}>
                    ฿{meal.pricePerHead.toLocaleString()} / person
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--gray-500)', marginTop: 4, fontWeight: 600 }}>
                    {guestCount} guests = ฿{(meal.pricePerHead * guestCount).toLocaleString()}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Step 3 - ครัว/อาหารจาก DB (แสดงเฉพาะเมื่อเลือกรูปแบบอาหาร) */}
          {mealType && (
            <ProviderSelector
              title="Catering"
              icon="🍳"
              providers={foodProviders.filter(p =>
                !p.supportsMealType || p.supportsMealType === 'both' || p.supportsMealType === mealType
              )}
              selected={selectedFood}
              onSelect={setSelectedFood}
              serviceType="food"
              hasDate={!!eventDate}
              mealTypeLabel={mealType === 'buffet' ? 'Buffet' : 'Chinese Banquet'}
            />
          )}

          {/* Step 4 - ช่างภาพจาก DB */}
          <ProviderSelector
            title="Photographer"
            icon="📸"
            providers={photoProviders}
            selected={selectedPhoto}
            onSelect={setSelectedPhoto}
            serviceType="photo"
            hasDate={!!eventDate}
          />

          {/* Step 5 - วงดนตรีจาก DB */}
          <ProviderSelector
            title="Music Band"
            icon="🎵"
            providers={musicProviders}
            selected={selectedMusic}
            onSelect={setSelectedMusic}
            serviceType="music"
            hasDate={!!eventDate}
          />

          {/* Step 6 - บริการเสริม */}
          <div className="form-section">
            <h2 className="form-section__title">✨ Add-on Services</h2>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              {FIXED_ADDONS.map(service => {
                const selected = addons.includes(service.id);
                return (
                  <div key={service.id} onClick={() => toggleAddon(service.id)}
                    style={{
                      padding: 16, borderRadius: 14, cursor: 'pointer', transition: 'all 0.2s',
                      border: `2px solid ${selected ? 'var(--pink)' : 'var(--gray-100)'}`,
                      background: selected ? 'var(--pink-bg)' : 'white',
                      position: 'relative',
                    }}>
                    {selected && (
                      <div style={{
                        position: 'absolute', top: 10, right: 10,
                        background: 'var(--pink)', color: 'white',
                        width: 22, height: 22, borderRadius: '50%',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 12, fontWeight: 700,
                      }}>✓</div>
                    )}
                    <div style={{ fontSize: 28, marginBottom: 6 }}>{service.icon}</div>
                    <div style={{ fontWeight: 700, fontSize: 14, color: selected ? 'var(--pink)' : 'var(--gray-900)', marginBottom: 4 }}>
                      {service.title}
                    </div>
                    <div style={{ fontSize: 12, color: 'var(--gray-400)', marginBottom: 8, lineHeight: 1.4 }}>
                      {service.desc}
                    </div>
                    <div style={{ fontWeight: 800, color: 'var(--pink)', fontSize: 15 }}>
                      +฿{service.price.toLocaleString()}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </>
      )}

      {/* Step 7 - หมายเหตุ */}
      <div className="form-section">
        <h2 className="form-section__title">📝 Additional Notes</h2>
        <textarea className="form-input" rows={3}
          placeholder="Special requests, e.g. color theme, dietary requirements, etc."
          value={notes} onChange={e => setNotes(e.target.value)}
          style={{ resize: 'vertical' }} />
      </div>

      {/* Price Summary */}
      <div className="price-summary" style={{ marginBottom: 24 }}>
        <h2 style={{ fontWeight: 800, fontSize: 16, color: 'var(--gray-900)', marginBottom: 16 }}>
          💰 Cost Summary
        </h2>
        <div className="price-summary__row">
          <span>🏛️ Venue</span>
          <span>฿{venuePrice.toLocaleString()}</span>
        </div>
        <div className="price-summary__row">
          <span>📦 {selectedPackage ? `Package: ${selectedPackage.name}` : 'No package'}</span>
          <span>฿{packagePrice.toLocaleString()}</span>
        </div>
        {!selectedPackage && (
          <>
            <div className="price-summary__row">
              <span>🍽️ {selectedMeal ? `${selectedMeal.title} × ${guestCount} guests` : 'No meal'}</span>
              <span>฿{mealPrice.toLocaleString()}</span>
            </div>
            {selectedFood && (
              <div className="price-summary__row">
                <span>🍽️ {selectedFood.firstName} {selectedFood.lastName}</span>
                <span>฿{(selectedFood.price || 0).toLocaleString()}</span>
              </div>
            )}
            {selectedPhoto && (
              <div className="price-summary__row">
                <span>📸 {selectedPhoto.firstName} {selectedPhoto.lastName}</span>
                <span>฿{(selectedPhoto.price || 0).toLocaleString()}</span>
              </div>
            )}
            {selectedMusic && (
              <div className="price-summary__row">
                <span>🎵 {selectedMusic.firstName} {selectedMusic.lastName}</span>
                <span>฿{(selectedMusic.price || 0).toLocaleString()}</span>
              </div>
            )}
            {FIXED_ADDONS.filter(a => addons.includes(a.id)).map(a => (
              <div key={a.id} className="price-summary__row">
                <span>{a.icon} {a.title}</span>
                <span>฿{a.price.toLocaleString()}</span>
              </div>
            ))}
          </>
        )}
        <div className="price-summary__total">
          <span>Total</span>
          <span>฿{totalPrice.toLocaleString()}</span>
        </div>
        <div style={{ marginTop: 12, padding: '12px 0', borderTop: '1px dashed var(--pink-border)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: 'var(--gray-500)' }}>
            <span>💳 Deposit Installment 1 (30%)</span>
            <span style={{ fontWeight: 700, color: 'var(--pink)' }}>฿{depositAmount.toLocaleString()}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: 'var(--gray-500)', marginTop: 4 }}>
            <span>💳 Remaining Balance (70%)</span>
            <span>฿{(totalPrice - depositAmount).toLocaleString()}</span>
          </div>
        </div>
      </div>

      {/* Submit */}
      <button onClick={handleSubmit} disabled={submitting || !eventDate}
        style={{
          width: '100%', padding: 18,
          background: submitting || !eventDate
            ? 'var(--gray-100)'
            : 'linear-gradient(135deg, #f9a8c9, #ec4899)',
          color: submitting || !eventDate ? 'var(--gray-400)' : 'white',
          border: 'none', borderRadius: 16,
          fontSize: 16, fontWeight: 800,
          cursor: submitting || !eventDate ? 'not-allowed' : 'pointer',
          boxShadow: submitting || !eventDate ? 'none' : '0 6px 20px rgba(236,72,153,0.35)',
          transition: 'all 0.2s', marginBottom: 32,
        }}>
        {submitting ? '⏳ Booking...' : !eventDate ? 'Please select an event date first' : '💍 Confirm Booking'}
      </button>

    </div>
  );
};

export default BookingPage;