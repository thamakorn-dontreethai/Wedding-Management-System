import { useMemo, useState, useEffect } from 'react';
import Table from '../../components/ui/Table';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Modal from '../../components/ui/Modal';
import api from '../../services/api';

const initialForm = {
  name: '',
  description: '',
  basePrice: '',
  maxGuests: '',
  includeFood: false,
  includeFoodType: 'both',
  includePhoto: false,
  includeMusic: false,
};

const getPackageServiceLabels = (pkg) => {
  const labels = [];
  if (pkg.includeFood) {
    const foodTypeLabel = pkg.includeFoodType === 'chinese'
      ? 'Chinese Banquet'
      : pkg.includeFoodType === 'buffet'
        ? 'Buffet'
        : 'Chinese / Buffet';
    labels.push(`Catering (${foodTypeLabel})`);
  }
  if (pkg.includePhoto) labels.push('Photographer');
  if (pkg.includeMusic) labels.push('Music Band');
  return labels;
};

const SERVICE_OPTIONS = [
  { key: 'includeFood',  icon: '🍽️', label: 'Catering',    hint: 'Include catering service' },
  { key: 'includePhoto', icon: '📸', label: 'Photographer', hint: 'Include photography service' },
  { key: 'includeMusic', icon: '🎵', label: 'Music Band',   hint: 'Include live music band' },
];

const PackagesPage = () => {
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(initialForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const isEditing = useMemo(() => editingId !== null, [editingId]);

  useEffect(() => {
    api.get('/packages')
      .then(({ data }) => setPackages(data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const resetForm = () => { setForm(initialForm); setEditingId(null); setError(''); };
  const openCreateModal = () => { resetForm(); setIsModalOpen(true); };
  const openEditModal = (pkg) => {
    setEditingId(pkg._id);
    setForm({
      name: pkg.name,
      description: pkg.description || '',
      basePrice: String(pkg.basePrice),
      maxGuests: String(pkg.maxGuests || ''),
      includeFood: !!pkg.includeFood,
      includeFoodType: pkg.includeFoodType || 'both',
      includePhoto: !!pkg.includePhoto,
      includeMusic: !!pkg.includeMusic,
    });
    setError('');
    setIsModalOpen(true);
  };
  const closeModal = () => { setIsModalOpen(false); resetForm(); };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this package?')) return;
    try {
      await api.delete(`/packages/${id}`);
      setPackages(prev => prev.filter(p => p._id !== id));
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      name: form.name.trim(),
      description: form.description.trim(),
      basePrice: Number(form.basePrice),
      maxGuests: Number(form.maxGuests),
      includeFood: !!form.includeFood,
      includeFoodType: form.includeFoodType,
      includePhoto: !!form.includePhoto,
      includeMusic: !!form.includeMusic,
    };
    if (!payload.name || payload.basePrice <= 0) return setError('Please fill in all required fields');
    setSaving(true);
    setError('');
    try {
      if (isEditing) {
        const { data } = await api.put(`/packages/${editingId}`, payload);
        setPackages(prev => prev.map(p => p._id === editingId ? data : p));
      } else {
        const { data } = await api.post('/packages', payload);
        setPackages(prev => [data, ...prev]);
      }
      closeModal();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="admin-packages">
      <div className="admin-packages__header">
        <h1 className="page-header__title">📦 Manage Wedding Packages</h1>
        <Button variant="primary" className="admin-packages__add-btn" onClick={openCreateModal}>+ Add Package</Button>
      </div>

      {loading ? (
        <div className="loading-state"><div className="loading-dots"><span /><span /><span /></div></div>
      ) : (
        <Table
          variant="pink"
          headers={['Package Name', 'Description', 'Included Services', 'Base Price', 'Max Guests', 'Actions']}
          data={packages.map(pkg => [
            pkg.name,
            pkg.description || '-',
            (() => {
              const serviceLabels = getPackageServiceLabels(pkg);
              if (serviceLabels.length === 0) {
                return <span style={{ color: 'var(--gray-400)', fontWeight: 600 }}>None</span>;
              }
              return (
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                  {serviceLabels.map((label) => (
                    <span key={label} style={{ fontSize: 11, fontWeight: 700, color: 'var(--pink)', background: 'var(--pink-bg)', border: '1px solid var(--pink-border)', borderRadius: 999, padding: '4px 8px' }}>
                      {label}
                    </span>
                  ))}
                </div>
              );
            })(),
            `฿${pkg.basePrice.toLocaleString('en-US')}`,
            pkg.maxGuests > 0 ? `${pkg.maxGuests} guests` : 'Unlimited',
            <div className="admin-packages__actions">
              <Button variant="secondary" className="admin-packages__edit-btn" onClick={() => openEditModal(pkg)}>Edit</Button>
              <Button variant="danger" className="admin-packages__delete-btn" onClick={() => handleDelete(pkg._id)}>Delete</Button>
            </div>,
          ])}
        />
      )}

      <Modal isOpen={isModalOpen} onClose={closeModal} title={isEditing ? 'Edit Package' : 'Add Package'}>
        <form className="admin-packages__form" onSubmit={handleSubmit}>
          <Input label="Package Name" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required />
          <Input label="Description" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />

          <div>
            <label className="input-label" style={{ marginBottom: 12, display: 'block' }}>Included Services</label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(120px, 1fr))', gap: 10 }}>
              {SERVICE_OPTIONS.map((item) => {
                const selected = !!form[item.key];
                return (
                  <button key={item.key} type="button"
                    onClick={() => setForm((prev) => ({ ...prev, [item.key]: !prev[item.key] }))}
                    style={{ textAlign: 'left', borderRadius: 12, border: `2px solid ${selected ? 'var(--pink)' : 'var(--gray-100)'}`, background: selected ? 'var(--pink-bg)' : 'white', color: selected ? 'var(--pink)' : 'var(--gray-700)', padding: '10px 12px', cursor: 'pointer', transition: 'all 0.2s ease' }}
                    aria-pressed={selected}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
                      <span style={{ fontSize: 16 }}>{item.icon}</span>
                      <span style={{ fontSize: 12, fontWeight: 800 }}>{selected ? 'Selected' : 'Select'}</span>
                    </div>
                    <div style={{ fontSize: 13, fontWeight: 700 }}>{item.label}</div>
                    <div style={{ fontSize: 11, marginTop: 2, color: selected ? 'var(--pink)' : 'var(--gray-500)' }}>{item.hint}</div>
                  </button>
                );
              })}
            </div>

            {form.includeFood && (
              <div style={{ marginTop: 10 }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--gray-600)', marginBottom: 6 }}>Meal Type</div>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  {[
                    { value: 'buffet', label: '🍽️ Buffet' },
                    { value: 'chinese', label: '🥢 Chinese Banquet' },
                  ].map((opt) => {
                    const active = form.includeFoodType === opt.value;
                    return (
                      <button key={opt.value} type="button"
                        onClick={() => setForm((prev) => ({ ...prev, includeFoodType: opt.value }))}
                        style={{ border: `2px solid ${active ? 'var(--pink)' : 'var(--gray-100)'}`, background: active ? 'var(--pink-bg)' : 'white', color: active ? 'var(--pink)' : 'var(--gray-700)', borderRadius: 999, padding: '7px 12px', fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>
                        {opt.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          <Input label="Base Price (THB)" type="number" min={1} value={form.basePrice} onChange={e => setForm(f => ({ ...f, basePrice: e.target.value }))} required />
          <Input label="Max Guests (0 = unlimited)" type="number" min={0} value={form.maxGuests} onChange={e => setForm(f => ({ ...f, maxGuests: e.target.value }))} />
          {error && <p style={{ color: '#dc2626', fontSize: 13, fontWeight: 600 }}>⚠️ {error}</p>}
          <div className="admin-packages__form-actions">
            <Button variant="secondary" className="admin-packages__cancel-btn" onClick={closeModal} type="button">Cancel</Button>
            <Button variant="primary" className="admin-packages__save-btn" type="submit" disabled={saving}>
              {saving ? 'Saving...' : 'Save'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default PackagesPage;
