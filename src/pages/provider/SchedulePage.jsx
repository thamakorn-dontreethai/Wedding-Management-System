import { useMemo, useState, useEffect } from 'react';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import Input from '../../components/ui/Input';
import api from '../../services/api';
import { useAuthStore } from '../../store/authStore';

const makeDateKey = (year, monthIndex, day) => `${year}-${String(monthIndex + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

const SchedulePage = () => {
  const { token, user } = useAuthStore();
  const isFoodProvider = user?.serviceType === 'food';
  const weekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const todayDate = new Date();
  const [currentMonth, setCurrentMonth] = useState(
    () => new Date(todayDate.getFullYear(), todayDate.getMonth(), 1)
  );
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [date, setDate] = useState('');
  const [note, setNote] = useState('');
  const [laborPriceInput, setLaborPriceInput] = useState('500');
  const [pricingLoading, setPricingLoading] = useState(false);
  const [pricingSaving, setPricingSaving] = useState(false);
  const [pricingMessage, setPricingMessage] = useState('');
  const [pricingError, setPricingError] = useState('');
  const [unavailableDates, setUnavailableDates] = useState([]);
  const [availSaving, setAvailSaving] = useState(false);
  const [availMsg, setAvailMsg] = useState('');
  const [orders, setOrders] = useState([]);

  const currentYear = currentMonth.getFullYear();
  const currentMonthIndex = currentMonth.getMonth();
  const monthPrefix = `${currentYear}-${String(currentMonthIndex + 1).padStart(2, '0')}`;
  const daysInMonth = new Date(currentYear, currentMonthIndex + 1, 0).getDate();
  const monthStartWeekday = new Date(currentYear, currentMonthIndex, 1).getDay();
  const leadingEmptyCells = (monthStartWeekday + 6) % 7;

  const unavailableMap = useMemo(() => {
    const map = new Map();
    unavailableDates.forEach((item) => {
      if (!item.dateKey?.startsWith(monthPrefix)) return;
      const [, , day] = item.dateKey.split('-');
      map.set(Number(day), item.note);
    });
    return map;
  }, [unavailableDates, monthPrefix]);

  const bookedMap = useMemo(() => {
    const map = new Map();
    orders.forEach((order) => {
      const d = new Date(order.eventDate);
      const key = makeDateKey(d.getFullYear(), d.getMonth(), d.getDate());
      if (!key.startsWith(monthPrefix)) return;
      const day = d.getDate();
      if (!map.has(day)) map.set(day, []);
      map.get(day).push(order.venueName || 'Wedding');
    });
    return map;
  }, [orders, monthPrefix]);

  const calendarCells = useMemo(
    () => [
      ...Array.from({ length: leadingEmptyCells }, (_, idx) => ({ key: `blank-${idx}`, isBlank: true })),
      ...Array.from({ length: daysInMonth }, (_, idx) => ({ day: idx + 1, isBlank: false })),
    ],
    [leadingEmptyCells, daysInMonth]
  );

  const currentMonthLabel = useMemo(
    () => new Intl.DateTimeFormat('en-US', { month: 'long', year: 'numeric' }).format(currentMonth),
    [currentMonth]
  );
  const totalDays = daysInMonth;
  const unavailableCount = unavailableMap.size;
  const bookedCount = bookedMap.size;
  const availableCount = totalDays - unavailableCount - bookedCount;

  const goToPreviousMonth = () => {
    setCurrentMonth((prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  };

  const goToNextMonth = () => {
    setCurrentMonth((prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  };

  useEffect(() => {
    if (!token) return;

    const fetchProfile = async () => {
      setPricingLoading(true);
      setPricingError('');
      try {
        const [profileRes, ordersRes] = await Promise.all([
          api.get('/providers/me', { headers: { Authorization: `Bearer ${token}` } }),
          api.get('/providers/me/orders', { headers: { Authorization: `Bearer ${token}` } }),
        ]);
        const data = profileRes.data;
        if (!isFoodProvider) {
          const nextPrice = Number(data?.price);
          setLaborPriceInput(String(Number.isFinite(nextPrice) ? Math.max(0, nextPrice) : 500));
        }
        if (Array.isArray(data?.unavailableDates)) {
          setUnavailableDates(data.unavailableDates);
        }
        if (Array.isArray(ordersRes.data)) {
          setOrders(ordersRes.data);
        }
      } catch (err) {
        setPricingError(err.response?.data?.message || 'Failed to load data');
      } finally {
        setPricingLoading(false);
      }
    };

    fetchProfile();
  }, [token, isFoodProvider]);

  const handleSavePricing = async () => {
    if (!token) return;
    if (isFoodProvider) {
      setPricingError('Catering accounts cannot set a service rate');
      return;
    }

    const parsedPrice = Number.parseInt(String(laborPriceInput).replace(/\D/g, ''), 10);
    const nextPrice = Number.isFinite(parsedPrice) ? parsedPrice : 0;

    setPricingSaving(true);
    setPricingError('');
    setPricingMessage('');
    try {
      await api.put(
        '/providers/me/pricing',
        { price: nextPrice },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setLaborPriceInput(String(nextPrice));
      setPricingMessage('Service rate saved successfully');
    } catch (err) {
      setPricingError(err.response?.data?.message || 'Failed to save rate');
    } finally {
      setPricingSaving(false);
    }
  };

  const handleAddUnavailableDate = async (event) => {
    event.preventDefault();

    const selected = new Date(date);
    if (Number.isNaN(selected.getTime())) return;

    const year = selected.getFullYear();
    const monthIndex = selected.getMonth();
    const day = selected.getDate();
    const dateKey = makeDateKey(year, monthIndex, day);
    const details = note.trim() || 'Unavailable';

    const next = [
      ...unavailableDates.filter((item) => item.dateKey !== dateKey),
      { dateKey, note: details },
    ];

    setUnavailableDates(next);
    setCurrentMonth(new Date(year, monthIndex, 1));
    setDate('');
    setNote('');
    setIsModalOpen(false);

    setAvailSaving(true);
    setAvailMsg('');
    try {
      await api.put('/providers/me/availability', { unavailableDates: next }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setAvailMsg('Unavailable date saved successfully');
    } catch {
      setAvailMsg('Failed to save. Please try again.');
    } finally {
      setAvailSaving(false);
    }
  };

  return (
    <div className="provider-schedule">
      <section className="provider-orders__hero">
        <p className="provider-orders__eyebrow">Provider Schedule</p>
        <h1 className="provider-orders__title">Manage Schedule</h1>
        <p className="provider-orders__desc">{currentMonthLabel} — Mark unavailable dates and manage your work queue.</p>

        <div className="provider-schedule__toolbar">
          <div className="provider-schedule__stats">
            <div className="provider-orders__stat-card">
              <p className="provider-orders__stat-label">Total</p>
              <p className="provider-orders__stat-value">{totalDays}</p>
            </div>
            <div className="provider-orders__stat-card provider-schedule__stat-card--available">
              <p className="provider-orders__stat-label">Available</p>
              <p className="provider-orders__stat-value">{availableCount}</p>
            </div>
            <div className="provider-orders__stat-card" style={{ borderTop: '3px solid #f59e0b' }}>
              <p className="provider-orders__stat-label">Booked</p>
              <p className="provider-orders__stat-value" style={{ color: '#f59e0b' }}>{bookedCount}</p>
            </div>
            <div className="provider-orders__stat-card provider-orders__stat-card--pending">
              <p className="provider-orders__stat-label">Unavailable</p>
              <p className="provider-orders__stat-value">{unavailableCount}</p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            {availMsg && (
              <span style={{ fontSize: 12, fontWeight: 600, color: availMsg.includes('successfully') ? '#16a34a' : '#dc2626' }}>
                {availMsg}
              </span>
            )}
            {availSaving && <span style={{ fontSize: 12, color: 'var(--gray-400)' }}>Saving...</span>}
            <Button
              variant="primary"
              className="provider-schedule__add-btn"
              onClick={() => setIsModalOpen(true)}
            >
              + Add Unavailable Date
            </Button>
          </div>
        </div>
      </section>

      {!isFoodProvider && (
        <section className="form-section" style={{ marginBottom: 20 }}>
          <h2 className="form-section__title">💰 Set Service Rate — {user?.serviceType || 'provider'}</h2>
          <p style={{ marginTop: -4, marginBottom: 12, color: 'var(--gray-500)', fontSize: 14 }}>
            This rate will be shown on the Booking page when customers select a provider of your type.
          </p>
          <div className="provider-pricing__row">
            <div className="provider-pricing__field">
              <Input
                label="Service Rate (THB)"
                type="text"
                inputMode="numeric"
                value={laborPriceInput}
                onChange={(event) => setLaborPriceInput(event.target.value.replace(/\D/g, ''))}
                placeholder="e.g. 3500"
              />
            </div>
            <Button
              variant="primary"
              type="button"
              onClick={handleSavePricing}
              className="provider-pricing__save-btn"
              disabled={pricingLoading || pricingSaving}
            >
              {pricingSaving ? 'Saving...' : 'Save Rate'}
            </Button>
          </div>
          {pricingError && (
            <p style={{ marginTop: 10, color: '#ef4444', fontSize: 14 }}>{pricingError}</p>
          )}
          {pricingMessage && (
            <p style={{ marginTop: 10, color: '#16a34a', fontSize: 13 }}>{pricingMessage}</p>
          )}
        </section>
      )}

      <div className="provider-schedule__calendar-wrap">
        <div className="provider-schedule__calendar-header">
          <button type="button" className="provider-schedule__month-btn" onClick={goToPreviousMonth} aria-label="Previous month">
            ‹
          </button>
          <h2 className="provider-schedule__month-label">{currentMonthLabel}</h2>
          <button type="button" className="provider-schedule__month-btn" onClick={goToNextMonth} aria-label="Next month">
            ›
          </button>
        </div>

        <div className="provider-schedule__legend">
          <span className="provider-schedule__legend-item provider-schedule__legend-item--available">Available</span>
          <span className="provider-schedule__legend-item" style={{ background: '#fffbeb', color: '#d97706', border: '1px solid #fde68a', borderRadius: 999, padding: '2px 12px', fontSize: 12, fontWeight: 600 }}>Booked</span>
          <span className="provider-schedule__legend-item provider-schedule__legend-item--booked">Unavailable</span>
        </div>

        <div className="provider-schedule__weekday-row">
          {weekDays.map((label) => (
            <div key={label} className="provider-schedule__weekday-cell">{label}</div>
          ))}
        </div>

        <div className="schedule-grid">
          {calendarCells.map((cell) => {
            if (cell.isBlank) {
              return <div key={cell.key} className="schedule-day schedule-day--blank" aria-hidden="true" />;
            }

            const day = cell.day;
            const isUnavailable = unavailableMap.has(day);
            const isBooked = bookedMap.has(day);
            const isToday =
              day === todayDate.getDate()
              && currentMonthIndex === todayDate.getMonth()
              && currentYear === todayDate.getFullYear();

            let dayClass = 'available';
            if (isBooked) dayClass = 'has-job';
            if (isUnavailable) dayClass = 'booked';

            return (
              <div
                key={day}
                className={`schedule-day ${dayClass} ${isToday && dayClass === 'available' ? 'today' : ''}`}
                style={isBooked && !isUnavailable ? { background: '#fffbeb', borderColor: '#fde68a' } : {}}
              >
                <span className="provider-schedule__day-number" style={isBooked && !isUnavailable ? { color: '#d97706' } : {}}>
                  {day}
                </span>
                {isBooked && !isUnavailable && bookedMap.get(day).map((name, i) => (
                  <p key={i} className="provider-schedule__day-note" style={{ color: '#d97706' }}>📋 {name}</p>
                ))}
                {isUnavailable && (
                  <p className="provider-schedule__day-note">● {unavailableMap.get(day)}</p>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Add Unavailable Date"
      >
        <form className="provider-schedule__form" onSubmit={handleAddUnavailableDate}>
          <Input
            label="Select Date"
            type="date"
            value={date}
            onChange={(event) => setDate(event.target.value)}
            required
          />
          <Input
            label="Note"
            value={note}
            onChange={(event) => setNote(event.target.value)}
            placeholder="e.g. Attending another wedding (Ballroom)"
          />
          <div className="provider-schedule__form-actions">
            <Button
              variant="secondary"
              className="provider-schedule__cancel-btn"
              onClick={() => setIsModalOpen(false)}
              type="button"
            >
              <span className="provider-schedule__btn-icon" aria-hidden="true">✕</span>
              Cancel
            </Button>
            <Button variant="primary" className="provider-schedule__save-btn" type="submit">
              <span className="provider-schedule__btn-icon" aria-hidden="true">✓</span>
              Save
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default SchedulePage;
