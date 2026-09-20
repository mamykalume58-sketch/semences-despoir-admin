import { useState } from 'react';
import { addDoc, collection, deleteDoc, doc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../firebase.js';
import { useCollection } from '../../hooks/useCollection.js';
import { LoadingState, ErrorState, EmptyState } from '../../components/DataState.jsx';
import ConfirmDialog from '../../components/ConfirmDialog.jsx';
import { compressImageToBase64, MAX_IMAGE_KB } from '../../lib/image.js';
import { IconTrash } from '../../lib/icons.jsx';

const CATEGORIES = ['actions', 'projets', 'evenements'];
const CATEGORY_LABELS = { actions: 'Actions', projets: 'Projets', evenements: 'Événements' };

export default function GalleryList() {
  const { status, docs } = useCollection('gallery', 'createdAt');
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [imageUrl, setImageUrl] = useState('');
  const [caption, setCaption] = useState('');
  const [compressing, setCompressing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [toDelete, setToDelete] = useState(null);

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
        setImageUrl(dataUrl);
      }
    } catch (err) {
      console.error(err);
      setError('Impossible de traiter cette image.');
    } finally {
      setCompressing(false);
    }
  };

  const handleAdd = async () => {
    if (!imageUrl) {
      setError('Choisissez une photo avant d\u2019ajouter.');
      return;
    }
    setSaving(true);
    setError('');
    try {
      await addDoc(collection(db, 'gallery'), {
        imageUrl,
        caption: caption || null,
        category,
        type: 'photo',
        createdAt: serverTimestamp(),
      });
      setImageUrl('');
      setCaption('');
    } catch (err) {
      console.error(err);
      setError("Impossible d'ajouter cette photo. " + (err.code || ''));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!toDelete) return;
    try {
      await deleteDoc(doc(db, 'gallery', toDelete.id));
    } catch (err) {
      console.error(err);
      window.alert('Impossible de supprimer cette photo.');
    } finally {
      setToDelete(null);
    }
  };

  if (status === 'loading') return <LoadingState label="Chargement de la galerie..." />;
  if (status === 'error') return <ErrorState />;

  return (
    <div>
      <div className="card form-card" style={{ marginBottom: 20 }}>
        <h2>Ajouter une photo</h2>
        {error ? <p className="form-error">{error}</p> : null}
        <div className="form-grid">
          <label className="form-field">
            <span>Catégorie</span>
            <select value={category} onChange={(e) => setCategory(e.target.value)}>
              {CATEGORIES.map((c) => <option key={c} value={c}>{CATEGORY_LABELS[c]}</option>)}
            </select>
          </label>
          <label className="form-field">
            <span>Légende (optionnelle)</span>
            <input value={caption} onChange={(e) => setCaption(e.target.value)} />
          </label>
          <label className="form-field">
            <span>Photo</span>
            <input type="file" accept="image/*" onChange={handleImageChange} />
            {compressing ? <small>Compression en cours...</small> : null}
          </label>
          {imageUrl ? <img src={imageUrl} alt="Aperçu" className="form-image-preview" /> : null}
        </div>
        <div className="form-actions">
          <button type="button" className="btn btn-primary" disabled={saving || compressing} onClick={handleAdd}>
            {saving ? 'Ajout...' : 'Ajouter à la galerie'}
          </button>
        </div>
      </div>

      {docs.length === 0 ? (
        <EmptyState label="Aucune photo pour l'instant." />
      ) : (
        <div className="gallery-grid">
          {docs.map((item) => (
            <div key={item.id} className="gallery-item card" style={{ padding: 0, overflow: 'hidden' }}>
              <img src={item.imageUrl} alt={item.caption || ''} style={{ width: '100%', aspectRatio: '1', objectFit: 'cover' }} />
              <div style={{ padding: 10, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span className="progress-text">{CATEGORY_LABELS[item.category] || item.category}</span>
                <button type="button" className="icon-btn icon-btn-danger" aria-label="Supprimer" onClick={() => setToDelete(item)}>
                  <IconTrash />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <ConfirmDialog
        open={Boolean(toDelete)}
        title="Supprimer cette photo ?"
        message="Cette action est irréversible."
        confirmLabel="Supprimer"
        danger
        onConfirm={handleDelete}
        onCancel={() => setToDelete(null)}
      />
    </div>
  );
}
