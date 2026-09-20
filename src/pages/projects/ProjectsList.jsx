import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { collection, deleteDoc, doc, onSnapshot, orderBy, query } from 'firebase/firestore';
import { db } from '../../firebase.js';
import DataTable from '../../components/DataTable.jsx';
import StatusBadge from '../../components/StatusBadge.jsx';
import ConfirmDialog from '../../components/ConfirmDialog.jsx';
import { LoadingState, ErrorState } from '../../components/DataState.jsx';
import { IconEye, IconEdit, IconTrash, IconPlus } from '../../lib/icons.jsx';

const STATUS_CONFIG = {
  brouillon: { label: 'Brouillon', class: 'badge-muted' },
  en_cours: { label: 'En cours', class: 'badge-green' },
  termine: { label: 'Terminé', class: 'badge-green-dark' },
  archive: { label: 'Archivé', class: 'badge-muted' },
};

const FILTERS = [
  { key: 'tous', label: 'Tous' },
  { key: 'en_cours', label: 'En cours' },
  { key: 'termine', label: 'Terminés' },
  { key: 'brouillon', label: 'Brouillons' },
];

function formatFC(amount) {
  return `${Math.round(amount || 0).toLocaleString('fr-FR')} FC`;
}

export default function ProjectsList() {
  const [status, setStatus] = useState('loading');
  const [projects, setProjects] = useState([]);
  const [filter, setFilter] = useState('tous');
  const [search, setSearch] = useState('');
  const [toDelete, setToDelete] = useState(null);

  useEffect(() => {
    const q = query(collection(db, 'projects'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(
      q,
      (snap) => {
        setProjects(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
        setStatus('ready');
      },
      (error) => {
        console.error('Erreur Firestore (projects) :', error);
        setStatus('error');
      }
    );
    return unsubscribe;
  }, []);

  const filtered = useMemo(() => {
    return projects.filter((p) => {
      const matchesFilter = filter === 'tous' || p.status === filter;
      const matchesSearch = !search || (p.title || '').toLowerCase().includes(search.toLowerCase());
      return matchesFilter && matchesSearch;
    });
  }, [projects, filter, search]);

  const handleDelete = async () => {
    if (!toDelete) return;
    try {
      await deleteDoc(doc(db, 'projects', toDelete.id));
    } catch (error) {
      console.error('Erreur lors de la suppression du projet :', error);
      window.alert('Impossible de supprimer ce projet.');
    } finally {
      setToDelete(null);
    }
  };

  if (status === 'loading') return <LoadingState label="Chargement des projets..." />;
  if (status === 'error') return <ErrorState />;

  return (
    <div>
      <div className="list-toolbar">
        <div className="list-filters">
          {FILTERS.map((f) => (
            <button
              key={f.key}
              type="button"
              className={`filter-chip ${filter === f.key ? 'filter-chip-active' : ''}`}
              onClick={() => setFilter(f.key)}
            >
              {f.label}
            </button>
          ))}
        </div>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
          <input
            className="search-input"
            placeholder="Rechercher un projet..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <Link to="/projets/nouveau" className="btn btn-primary">
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
              <IconPlus /> Nouveau projet
            </span>
          </Link>
        </div>
      </div>

      <div className="card">
        <DataTable
          emptyLabel="Aucun projet ne correspond à ces critères."
          columns={[
            {
              key: 'image',
              label: 'Image',
              render: (row) =>
                row.imageUrl ? (
                  <img src={row.imageUrl} alt="" className="table-thumb" />
                ) : (
                  <div className="table-thumb" />
                ),
            },
            {
              key: 'title',
              label: 'Projet',
              render: (row) => (
                <div>
                  <strong>{row.title || 'Sans titre'}</strong>
                  <div className="progress-text">{row.category || '—'}</div>
                </div>
              ),
            },
            {
              key: 'status',
              label: 'Statut',
              render: (row) => <StatusBadge value={row.status} config={STATUS_CONFIG} />,
            },
            {
              key: 'progress',
              label: 'Collecté / Objectif',
              render: (row) => {
                const goal = Number(row.goalAmount) || 0;
                const collected = Number(row.collectedAmount) || 0;
                const pct = goal > 0 ? Math.min(100, Math.round((collected / goal) * 100)) : 0;
                return (
                  <div style={{ minWidth: 140 }}>
                    <div className="progress-text">
                      {formatFC(collected)} / {formatFC(goal)}
                    </div>
                    <div className="progress">
                      <div className="progress-bar" style={{ width: `${pct}%` }} />
                    </div>
                    <div className="progress-text">{pct}%</div>
                  </div>
                );
              },
            },
            {
              key: 'actions',
              label: 'Actions',
              render: (row) => (
                <div className="table-actions">
                  <Link to={`/projets/${row.id}`} className="icon-btn" aria-label="Voir">
                    <IconEye />
                  </Link>
                  <Link to={`/projets/${row.id}/modifier`} className="icon-btn" aria-label="Modifier">
                    <IconEdit />
                  </Link>
                  <button
                    type="button"
                    className="icon-btn icon-btn-danger"
                    aria-label="Supprimer"
                    onClick={() => setToDelete(row)}
                  >
                    <IconTrash />
                  </button>
                </div>
              ),
            },
          ]}
          rows={filtered}
        />
      </div>

      <ConfirmDialog
        open={Boolean(toDelete)}
        title="Supprimer ce projet ?"
        message="Cette action est irréversible."
        confirmLabel="Supprimer"
        danger
        onConfirm={handleDelete}
        onCancel={() => setToDelete(null)}
      />
    </div>
  );
}
