import { useEffect, useState } from 'react';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../firebase.js';
import { LoadingState } from '../../components/DataState.jsx';

const DOC_REF = ['settings', 'general'];
const EMPTY = {
  siteName: 'Vivre pour les Autres',
  slogan: 'Votre amour fait éclairer leur espoir',
  phone: '',
  whatsapp: '',
  email: '',
  address: '',
  facebook: '',
  instagram: '',
  tiktok: '',
  youtube: '',
};

export default function SettingsPage() {
  const [form, setForm] = useState(EMPTY);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    (async () => {
      try {
        const snap = await getDoc(doc(db, ...DOC_REF));
        if (snap.exists()) setForm({ ...EMPTY, ...snap.data() });
      } catch (err) {
        console.error(err);
        setError('Impossible de charger les paramètres.');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const updateField = (field) => (event) => setForm((prev) => ({ ...prev, [field]: event.target.value }));

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError('');
    setSaved(false);
    try {
      await setDoc(doc(db, ...DOC_REF), { ...form, updatedAt: serverTimestamp() }, { merge: true });
      setSaved(true);
    } catch (err) {
      console.error(err);
      setError('Impossible d\u2019enregistrer. ' + (err.code || ''));
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <LoadingState label="Chargement..." />;

  return (
    <div className="card form-card">
      <h2>Paramètres du site</h2>
      {error ? <p className="form-error">{error}</p> : null}
      {saved ? <p style={{ color: 'var(--green, #0B6B3A)' }}>Enregistré.</p> : null}
      <form onSubmit={handleSubmit}>
        <div className="form-grid">
          <label className="form-field"><span>Nom du groupe</span><input value={form.siteName} onChange={updateField('siteName')} /></label>
          <label className="form-field form-field-full"><span>Slogan</span><input value={form.slogan} onChange={updateField('slogan')} /></label>
          <label className="form-field"><span>Téléphone</span><input value={form.phone} onChange={updateField('phone')} /></label>
          <label className="form-field"><span>WhatsApp</span><input value={form.whatsapp} onChange={updateField('whatsapp')} /></label>
          <label className="form-field"><span>Email</span><input value={form.email} onChange={updateField('email')} /></label>
          <label className="form-field"><span>Adresse</span><input value={form.address} onChange={updateField('address')} /></label>
          <label className="form-field"><span>Facebook</span><input value={form.facebook} onChange={updateField('facebook')} placeholder="https://..." /></label>
          <label className="form-field"><span>Instagram</span><input value={form.instagram} onChange={updateField('instagram')} placeholder="https://..." /></label>
          <label className="form-field"><span>TikTok</span><input value={form.tiktok} onChange={updateField('tiktok')} placeholder="https://..." /></label>
          <label className="form-field"><span>YouTube</span><input value={form.youtube} onChange={updateField('youtube')} placeholder="https://..." /></label>
        </div>
        <div className="form-actions">
          <button type="submit" className="btn btn-primary" disabled={saving}>
            {saving ? 'Enregistrement...' : 'Enregistrer'}
          </button>
        </div>
      </form>
    </div>
  );
}
