import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { deleteDoc, doc, onSnapshot, updateDoc } from 'firebase/firestore';
import { db } from '../../firebase.js';
import { LoadingState, ErrorState } from '../../components/DataState.jsx';
import StatusBadge from '../../components/StatusBadge.jsx';
import ConfirmDialog from '../../components/ConfirmDialog.jsx';
import { IconEdit, IconTrash } from '../../lib/icons.jsx';

const STATUS_CONFIG = {
  brouillon: { label: 'Brouillon', class: 'badge-muted' },
  en_cours: { label: 'En cours', class: 'badge-green' },
  termine: { label: 'Terminé', class: 'badge-green-dark' },
  archive: { label: 'Archivé', class: 'badge-muted' },
};

function formatFC(amount) {
  return `${Math.round(amount || 0).toLocaleString('fr-FR')} FC`;
}

export default function ProjectDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState('loading');
  const [project, setProject] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(false);

  useEffect(() => {
    const unsubscribe = onSnapshot(
      doc(db, 'projects', id),
      (snap) => {
        if (!snap.exists()) {
          setStatus('notfound');
          return;
        }
        setProject({ id: snap.id, ...snap.data() });
        setStatus('ready');
      },
      (error) => {
        console.error(error);
        setStatus('error');
      }
    );
    return unsubscribe;
  }, [id]);

  const togglePublish = async () => {
    if (!project) return;
    const nextStatus = project.status === 'en_cours' ? 'brouillon' : 'en_cours';
    await updateDoc(doc(db, 'projects', id), { status: nextStatus });
  };

  const archive = async () => {
    await updateDoc(doc(db, 'projects', id), { status: 'archive' });
  };

  const handleDelete = async () => {
    try {
      await deleteDoc(doc(db, 'projects', id));
      navigate('/projets');
    } catch (error) {
      console.error(error);
      window.alert('Impossible de supprimer ce projet.');
    }
  };

  if (status === 'loading') return <LoadingState label="Chargement du projet..." />;
  if (status === 'error') return <ErrorState />;
  if (status === 'notfound') return <div className="card">Projet introuvable.</div>;

  const goal = Number(project.goalAmount) || 0;
  const collected = Number(project.collectedAmount) || 0;
  const pct = goal > 0 ? Math.min(100, Math.round((collected / goal) * 100)) : 0;

  return (
    <div className="detail-grid">
      <div className="card detail-main">
        {project.imageUrl ? <img src={project.imageUrl} alt={project.title} className="detail-image" /> : null}

        <div className="detail-header">
          <div>
            <h2>{project.title}</h2>
            <StatusBadge value={project.status} config={STATUS_CONFIG} />
          </div>
          <div className="table-actions">
            <Link to={`/projets/${id}/modifier`} className="btn btn-ghost">
              <IconEdit /> Modifier
            </Link>
            <button type="button" className="btn btn-ghost" onClick={togglePublish}>
              {project.status === 'en_cours' ? 'Dépublier' : 'Publier'}
            </button>
            <button type="button" className="btn btn-ghost" onClick={archive}>
              Archiver
            </button>
            <button type="button" className="btn btn-danger" onClick={() => setConfirmDelete(true)}>
              <IconTrash /> Supprimer
            </button>
          </div>
        </div>

        <p>{project.description || project.shortDescription}</p>

        <div className="progress-text">
          {formatFC(collected)} / {formatFC(goal)} ({pct}%)
        </div>
        <div className="progress">
          <div className="progress-bar" style={{ width: `${pct}%` }} />
        </div>
      </div>

      <div className="card detail-side">
        <h2>Informations</h2>
        <dl className="detail-list">
          <dt>Catégorie</dt>
          <dd>{project.category || '—'}</dd>
          <dt>Localisation</dt>
          <dd>{project.location || '—'}</dd>
          <dt>Bénéficiaires</dt>
          <dd>{project.beneficiaires || 0}</dd>
          <dt>Date de début</dt>
          <dd>{project.startDate || '—'}</dd>
          <dt>Date de fin</dt>
          <dd>{project.endDate || '—'}</dd>
        </dl>
      </div>

      <ConfirmDialog
        open={confirmDelete}
        title="Supprimer ce projet ?"
        message="Cette action est irréversible."
        confirmLabel="Supprimer"
        danger
        onConfirm={handleDelete}
        onCancel={() => setConfirmDelete(false)}
      />
    </div>
  );
}
