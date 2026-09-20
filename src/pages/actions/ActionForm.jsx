import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { addDoc, collection, doc, getDoc, getDocs, serverTimestamp, updateDoc } from 'firebase/firestore';
import { db } from '../../firebase.js';
import { LoadingState } from '../../components/DataState.jsx';
import { compressImageToBase64, MAX_IMAGE_KB } from '../../lib/image.js';

const CATEGORIES = ['Personnes âgées', 'Veuves', 'Orphelins', 'Nourriture', 'Communautés', 'Autres'];

const EMPTY_FORM = {
  title: '',
  description: '',
  category: CATEGORIES[0],
  location: '',
  date: '',
  time: '',
  beneficiaires: '',
  projectId: '',
  imageUrl: '',
  status: 'planifiee',
};

export default function ActionForm() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const [form, setForm] = useState(EMPTY_FORM);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [compressing, setCompressing] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    (async () => {
      try {
        const snap = await getDocs(collection(db, 'projects'));
        setProjects(snap.docs.map((d) => ({ id: d.id, title: d.data().title })));
      } catch (err) {
        console.error(err);
      }
    })();
  }, []);

  useEffect(() => {
    if (!isEdit) return;
    (async () => {
      try {
        const snap = await getDoc(doc(db, 'actions', id));
        if (snap.exists()) {
          setForm({ ...EMPTY_FORM, ...snap.data() });
        } else {
          setError('Cette action est introuvable.');
        }
      } catch (err) {
        console.error(err);
        setError('Impossible de charger cette action.');
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
        beneficiaires: Number(form.beneficiaires) || 0,
        status: nextStatus || form.status,
        published: nextStatus ? true : Boolean(form.published),
        updatedAt: serverTimestamp(),
      };
      if (isEdit) {
        await updateDoc(doc(db, 'actions', id), payload);
      } else {
        payload.createdAt = serverTimestamp();
        await addDoc(collection(db, 'actions'), payload);
      }
      navigate('/actions');
    } catch (err) {
      console.error(err);
      setError("Impossible d’enregistrer cette action. " + (err.code || ''));
    } finally {
      setSaving(false);
    }
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    persist();
  };

  if (loading) return <LoadingState label="Chargement de l’action..." />;

  return (
    <div className="card form-card">
      <h2>{isEdit ? 'Modifier l’action' : 'Nouvelle action'}</h2>

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
            <span>Photo</span>
            <input type="file" accept="image/*" onChange={handleImageChange} />
            {compressing ? <small>Compression de l'image en cours...</small> : null}
          </label>

          {form.imageUrl ? <img src={form.imageUrl} alt="Aperçu" className="form-image-preview" /> : null}

          <label className="form-field form-field-full">
            <span>Description</span>
            <textarea rows={4} value={form.description} onChange={updateField('description')} />
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
            <span>Date</span>
            <input type="date" value={form.date} onChange={updateField('date')} />
          </label>

          <label className="form-field">
            <span>Heure</span>
            <input type="time" value={form.time} onChange={updateField('time')} />
          </label>

          <label className="form-field">
            <span>Projet associé</span>
            <select value={form.projectId} onChange={updateField('projectId')}>
              <option value="">Aucun</option>
              {projects.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.title}
                </option>
              ))}
            </select>
          </label>

          <label className="form-field">
            <span>Statut</span>
            <select value={form.status} onChange={updateField('status')}>
              <option value="planifiee">Planifiée</option>
              <option value="en_cours">En cours</option>
              <option value="realisee">Réalisée</option>
              <option value="annulee">Annulée</option>
            </select>
          </label>
        </div>

        <div className="form-actions">
          <Link to="/actions" className="btn btn-ghost">
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
