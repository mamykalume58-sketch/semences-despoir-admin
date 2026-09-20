import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { addDoc, collection, doc, getDoc, serverTimestamp, updateDoc } from 'firebase/firestore';
import { db } from '../../firebase.js';
import { LoadingState } from '../../components/DataState.jsx';
import { compressImageToBase64, MAX_IMAGE_KB } from '../../lib/image.js';

const CATEGORIES = ['Nos actions', 'Projets', 'Événements'];

const EMPTY_FORM = {
  title: '',
  category: CATEGORIES[0],
  summary: '',
  content: '',
  imageUrl: '',
  status: 'brouillon',
};

export default function NewsForm() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const [form, setForm] = useState(EMPTY_FORM);
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [compressing, setCompressing] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isEdit) return;
    (async () => {
      try {
        const snap = await getDoc(doc(db, 'news', id));
        if (snap.exists()) setForm({ ...EMPTY_FORM, ...snap.data() });
        else setError('Cette actualité est introuvable.');
      } catch (err) {
        console.error(err);
        setError('Impossible de charger cette actualité.');
      } finally {
        setLoading(false);
      }
    })();
  }, [id, isEdit]);

  const updateField = (field) => (event) => setForm((prev) => ({ ...prev, [field]: event.target.value }));

  const handleImageChange = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setCompressing(true);
    setError('');
    try {
      const dataUrl = await compressImageToBase64(file);
      const approxKb = Math.round((dataUrl.length * 0.75) / 1024);
      if (approxKb > MAX_IMAGE_KB) {
        setError(`Image encore trop lourde une fois compressée (~${approxKb} Ko).`);
      } else {
        setForm((prev) => ({ ...prev, imageUrl: dataUrl }));
      }
    } catch (err) {
      console.error(err);
      setError('Impossible de traiter cette image.');
    } finally {
      setCompressing(false);
    }
  };

  const persist = async (nextStatus) => {
    setSaving(true);
    setError('');
    try {
      const status = nextStatus || form.status;
      const payload = { ...form, status, published: status === 'publie', updatedAt: serverTimestamp() };
      if (isEdit) {
        await updateDoc(doc(db, 'news', id), payload);
      } else {
        payload.createdAt = serverTimestamp();
        await addDoc(collection(db, 'news'), payload);
      }
      navigate('/actualites');
    } catch (err) {
      console.error(err);
      setError("Impossible d'enregistrer cette actualité. " + (err.code || ''));
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <LoadingState label="Chargement..." />;

  return (
    <div className="card form-card">
      <h2>{isEdit ? "Modifier l'actualité" : 'Nouvelle actualité'}</h2>
      {error ? <p className="form-error">{error}</p> : null}
      <form onSubmit={(e) => { e.preventDefault(); persist(); }}>
        <div className="form-grid">
          <label className="form-field">
            <span>Titre</span>
            <input value={form.title} onChange={updateField('title')} required />
          </label>
          <label className="form-field">
            <span>Catégorie</span>
            <select value={form.category} onChange={updateField('category')}>
              {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </label>
          <label className="form-field">
            <span>Photo</span>
            <input type="file" accept="image/*" onChange={handleImageChange} />
            {compressing ? <small>Compression de l'image en cours...</small> : null}
          </label>
          {form.imageUrl ? <img src={form.imageUrl} alt="Aperçu" className="form-image-preview" /> : null}
          <label className="form-field form-field-full">
            <span>Résumé (affiché dans la liste)</span>
            <input value={form.summary} onChange={updateField('summary')} />
          </label>
          <label className="form-field form-field-full">
            <span>Contenu complet</span>
            <textarea rows={6} value={form.content} onChange={updateField('content')} />
          </label>
        </div>
        <div className="form-actions">
          <Link to="/actualites" className="btn btn-ghost">Annuler</Link>
          <button type="submit" className="btn btn-ghost" disabled={saving || compressing}>Enregistrer en brouillon</button>
          <button type="button" className="btn btn-primary" disabled={saving || compressing} onClick={() => persist('publie')}>
            {saving ? 'Enregistrement...' : 'Publier'}
          </button>
        </div>
      </form>
    </div>
  );
}
