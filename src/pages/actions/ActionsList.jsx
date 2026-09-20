import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { collection, deleteDoc, doc, onSnapshot, orderBy, query } from 'firebase/firestore';
import { db } from '../../firebase.js';
import DataTable from '../../components/DataTable.jsx';
import StatusBadge from '../../components/StatusBadge.jsx';
import ConfirmDialog from '../../components/ConfirmDialog.jsx';
import { LoadingState, ErrorState } from '../../components/DataState.jsx';
import { IconEdit, IconTrash, IconPlus } from '../../lib/icons.jsx';

const STATUS_CONFIG = {
  planifiee: { label: 'Planifiée', class: 'badge-gold' },
  en_cours: { label: 'En cours', class: 'badge-green' },
  realisee: { label: 'Réalisée', class: 'badge-green-dark' },
  annulee: { label: 'Annulée', class: 'badge-error' },
};

const CATEGORY_FILTERS = ['Toutes', 'Personnes âgées', 'Veuves', 'Orphelins', 'Nourriture', 'Communautés', 'Autres'];

export default function ActionsList() {
  const [status, setStatus] = useState('loading');
  const [actions, setActions] = useState([]);
  const [projectsById, setProjectsById] = useState({});
  const [category, setCategory] = useState('Toutes');
  const [search, setSearch] = useState('');
  const [toDelete, setToDelete] = useState(null);

  useEffect(() => {
    const q = query(collection(db, 'actions'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(
      q,
      (snap) => {
        setActions(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
        setStatus('ready');
      },
      (error) => {
        console.error(error);
        setStatus('error');
      }
    );
    return unsubscribe;
  }, []);

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, 'projects'), (snap) => {
      const map = {};
      snap.docs.forEach((d) => {
        map[d.id] = d.data().title;
      });
      setProjectsById(map);
    });
    return unsubscribe;
  }, []);

  const filtered = useMemo(() => {
    return actions.filter((a) => {
      const matchesCategory = category === 'Toutes' || a.category === category;
      const matchesSearch = !search || (a.title || '').toLowerCase().includes(search.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [actions, category, search]);

  const handleDelete = async () => {
    if (!toDelete) return;
    try {
      await deleteDoc(doc(db, 'actions', toDelete.id));
    } catch (error) {
      console.error(error);
      window.alert('Impossible de supprimer cette action.');
    } finally {
      setToDelete(null);
    }
  };

  if (status === 'loading') return <LoadingState label="Chargement des actions..." />;
  if (status === 'error') return <ErrorState />;

  return (
    <div>
      <div className="list-toolbar">
        <div className="list-filters">
          {CATEGORY_FILTERS.map((c) => (
            <button
              key={c}
              type="button"
              className={`filter-chip ${category === c ? 'filter-chip-active' : ''}`}
              onClick={() => setCategory(c)}
            >
              {c}
            </button>
          ))}
        </div>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
          <input
            className="search-input"
            placeholder="Rechercher une action..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <Link to="/actions/nouveau" className="btn btn-primary">
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
              <IconPlus /> Nouvelle action
            </span>
          </Link>
        </div>
      </div>

      <div className="card">
        <DataTable
          emptyLabel="Aucune action ne correspond à ces critères."
          columns={[
            {
              key: 'image',
              label: 'Image',
              render: (row) =>
                row.imageUrl ? <img src={row.imageUrl} alt="" className="table-thumb" /> : <div className="table-thumb" />,
            },
            { key: 'title', label: 'Titre' },
            { key: 'location', label: 'Lieu' },
            { key: 'date', label: 'Date' },
            {
              key: 'project',
              label: 'Projet associé',
              render: (row) => projectsById[row.projectId] || '—',
            },
            {
              key: 'status',
              label: 'Statut',
              render: (row) => <StatusBadge value={row.status} config={STATUS_CONFIG} />,
            },
            {
              key: 'actions',
              label: 'Actions',
              render: (row) => (
                <div className="table-actions">
                  <Link to={`/actions/${row.id}/modifier`} className="icon-btn" aria-label="Modifier">
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
        title="Supprimer cette action ?"
        message="Cette action est irréversible."
        confirmLabel="Supprimer"
        danger
        onConfirm={handleDelete}
        onCancel={() => setToDelete(null)}
      />
    </div>
  );
}
