import { useEffect, useState } from 'react';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../firebase.js';
import { LoadingState } from '../../components/DataState.jsx';

const DOC_REF = ['statistics', 'homepage'];
const EMPTY = { peopleHelped: '', projectsDone: '', volunteers: '', years: '' };

export default function StatisticsPage() {
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
        setError('Impossible de charger les statistiques.');
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
      <h2>Statistiques de la page d'accueil</h2>
      <p className="progress-text">Ces chiffres s'affichent tels quels sur le site et l'app.</p>
      {error ? <p className="form-error">{error}</p> : null}
      {saved ? <p style={{ color: 'var(--green, #0B6B3A)' }}>Enregistré.</p> : null}
      <form onSubmit={handleSubmit}>
        <div className="form-grid">
          <label className="form-field">
            <span>Personnes aidées</span>
            <input value={form.peopleHelped} onChange={updateField('peopleHelped')} placeholder="520+" />
          </label>
          <label className="form-field">
            <span>Projets réalisés</span>
            <input value={form.projectsDone} onChange={updateField('projectsDone')} placeholder="12" />
          </label>
          <label className="form-field">
            <span>Bénévoles</span>
            <input value={form.volunteers} onChange={updateField('volunteers')} placeholder="45+" />
          </label>
          <label className="form-field">
            <span>Années d'engagement</span>
            <input value={form.years} onChange={updateField('years')} placeholder="3" />
          </label>
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
