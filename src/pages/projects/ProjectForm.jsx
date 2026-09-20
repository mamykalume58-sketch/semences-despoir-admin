import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { addDoc, collection, doc, getDoc, serverTimestamp, updateDoc } from 'firebase/firestore';
import { db } from '../../firebase.js';
import { LoadingState } from '../../components/DataState.jsx';
import { compressImageToBase64, MAX_IMAGE_KB } from '../../lib/image.js';

const CATEGORIES = ['Orphelins', 'Personnes âgées', 'Veuves', 'Nourriture', 'Communautés', 'Autres'];

const EMPTY_FORM = {
  title: '',
  shortDescription: '',
  description: '',
  category: CATEGORIES[0],
  goalAmount: '',
  collectedAmount: '',
  location: '',
  beneficiaires: '',
  startDate: '',
  endDate: '',
  imageUrl: '',
  status: 'brouillon',
};

export default function ProjectForm() {
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
        const snap = await getDoc(doc(db, 'projects', id));
        if (snap.exists()) {
          setForm({ ...EMPTY_FORM, ...snap.data() });
        } else {
          setError('Ce projet est introuvable.');
        }
      } catch (err) {
        console.error(err);
        setError('Impossible de charger ce projet.');
      } finally {
        setLoading(false);
      }
    })();
  }, [id, isEdit]);

  const updateField = (field) => (event) => {
    setForm((prev) => ({ ...prev, [field]: event.target.value }));
  };

  const handleImageChange = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setCompressing(true);
    setError('');
    try {
      const dataUrl = await compressImageToBase64(file);
      const approxKb = Math.round((dataUrl.length * 0.75) / 1024);
      if (approxKb > MAX_IMAGE_KB) {
        setError(`Image encore trop lourde une fois compressée (~${approxKb} Ko). Essayez une photo plus simple ou moins grande.`);
      } else {
        setForm((prev) => ({ ...prev, imageUrl: dataUrl }));
      }
    } catch (err) {
      console.error(err);
      setError("Impossible de traiter cette image.");
    } finally {
      setCompressing(false);
    }
  };

  const persist = async (nextStatus) => {
    setSaving(true);
    setError('');
    try {
      const payload = {
        ...form,
        goalAmount: Number(form.goalAmount) || 0,
        collectedAmount: Number(form.collectedAmount) || 0,
        beneficiaires: Number(form.beneficiaires) || 0,
        status: nextStatus || form.status,
        published: ['en_cours', 'termine'].includes(nextStatus || form.status),
        updatedAt: serverTimestamp(),
      };
      if (isEdit) {
        await updateDoc(doc(db, 'projects', id), payload);
        navigate(`/projets/${id}`);
      } else {
        payload.createdAt = serverTimestamp();
        const ref = await addDoc(collection(db, 'projects'), payload);
        navigate(`/projets/${ref.id}`);
      }
    } catch (err) {
      console.error(err);
      setError("Impossible d’enregistrer ce projet. " + (err.code || ''));
    } finally {
      setSaving(false);
    }
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    persist();
  };

  if (loading) return <LoadingState label="Chargement du projet..." />;

  return (
    <div className="card form-card">
      <h2>{isEdit ? 'Modifier le projet' : 'Nouveau projet'}</h2>

      {error ? <p className="form-error">{error}</p> : null}

      <form onSubmit={handleSubmit}>
        <div className="form-grid">
          <label className="form-field">
            <span>Titre</span>
            <input value={form.title} onChange={updateField('title')} required />
          </label>

          <label className="form-field">
            <span>Catégorie</span>
            <select value={form.category} onChange={updateField('category')}>
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </label>

          <label className="form-field">
            <span>Photo principale</span>
            <input type="file" accept="image/*" onChange={handleImageChange} />
            {compressing ? <small>Compression de l'image en cours...</small> : null}
          </label>

          {form.imageUrl ? <img src={form.imageUrl} alt="Aperçu" className="form-image-preview" /> : null}

          <label className="form-field">
            <span>Description courte</span>
            <input value={form.shortDescription} onChange={updateField('shortDescription')} />
          </label>

          <label className="form-field form-field-full">
            <span>Description complète</span>
            <textarea rows={5} value={form.description} onChange={updateField('description')} />
          </label>

          <label className="form-field">
            <span>Objectif financier (FC)</span>
            <input type="number" min="0" value={form.goalAmount} onChange={updateField('goalAmount')} />
          </label>

          <label className="form-field">
            <span>Montant collecté (FC)</span>
            <input type="number" min="0" value={form.collectedAmount} onChange={updateField('collectedAmount')} />
          </label>

          <label className="form-field">
            <span>Localisation</span>
            <input value={form.location} onChange={updateField('location')} />
          </label>

          <label className="form-field">
            <span>Nombre de bénéficiaires</span>
            <input type="number" min="0" value={form.beneficiaires} onChange={updateField('beneficiaires')} />
          </label>

          <label className="form-field">
            <span>Date de début</span>
            <input type="date" value={form.startDate} onChange={updateField('startDate')} />
          </label>

          <label className="form-field">
            <span>Date de fin</span>
            <input type="date" value={form.endDate} onChange={updateField('endDate')} />
          </label>

          <label className="form-field">
            <span>Statut</span>
            <select value={form.status} onChange={updateField('status')}>
              <option value="brouillon">Brouillon</option>
              <option value="en_cours">En cours</option>
              <option value="termine">Terminé</option>
              <option value="archive">Archivé</option>
            </select>
          </label>
        </div>

        <div className="form-actions">
          <Link to={isEdit ? `/projets/${id}` : '/projets'} className="btn btn-ghost">
            Annuler
          </Link>
          <button type="submit" className="btn btn-ghost" disabled={saving || compressing}>
            Enregistrer
          </button>
          <button type="button" className="btn btn-primary" disabled={saving || compressing} onClick={() => persist('en_cours')}>
            {saving ? 'Enregistrement...' : 'Publier'}
          </button>
        </div>
      </form>
    </div>
  );
}
