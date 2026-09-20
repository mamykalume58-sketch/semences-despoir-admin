import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { deleteDoc, doc } from 'firebase/firestore';
import { db } from '../../firebase.js';
import { useCollection } from '../../hooks/useCollection.js';
import DataTable from '../../components/DataTable.jsx';
import StatusBadge from '../../components/StatusBadge.jsx';
import ConfirmDialog from '../../components/ConfirmDialog.jsx';
import { LoadingState, ErrorState } from '../../components/DataState.jsx';
import { IconEdit, IconTrash, IconPlus } from '../../lib/icons.jsx';

const STATUS_CONFIG = {
  brouillon: { label: 'Brouillon', class: 'badge-muted' },
  publie: { label: 'Publié', class: 'badge-green' },
};

export default function NewsList() {
  const { status, docs } = useCollection('news', 'createdAt');
  const [filter, setFilter] = useState('tous');
  const [toDelete, setToDelete] = useState(null);

  const filtered = useMemo(
    () => docs.filter((n) => filter === 'tous' || n.status === filter),
    [docs, filter]
  );

  const handleDelete = async () => {
    if (!toDelete) return;
    try {
      await deleteDoc(doc(db, 'news', toDelete.id));
    } catch (error) {
      console.error(error);
      window.alert('Impossible de supprimer cette actualité.');
    } finally {
      setToDelete(null);
    }
  };

  if (status === 'loading') return <LoadingState label="Chargement des actualités..." />;
  if (status === 'error') return <ErrorState />;

  return (
    <div>
      <div className="list-toolbar">
        <div className="list-filters">
          {[
            { key: 'tous', label: 'Toutes' },
            { key: 'publie', label: 'Publiées' },
            { key: 'brouillon', label: 'Brouillons' },
          ].map((f) => (
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
        <Link to="/actualites/nouveau" className="btn btn-primary">
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
            <IconPlus /> Nouvelle actualité
          </span>
        </Link>
      </div>

      <div className="card">
        <DataTable
          emptyLabel="Aucune actualité pour l'instant."
          columns={[
            {
              key: 'image',
              label: 'Image',
              render: (row) => (row.imageUrl ? <img src={row.imageUrl} alt="" className="table-thumb" /> : <div className="table-thumb" />),
            },
            {
              key: 'title',
              label: 'Titre',
              render: (row) => (
                <div>
                  <strong>{row.title || 'Sans titre'}</strong>
                  <div className="progress-text">{row.category || '—'}</div>
                </div>
              ),
            },
            { key: 'status', label: 'Statut', render: (row) => <StatusBadge value={row.status} config={STATUS_CONFIG} /> },
            {
              key: 'actions',
              label: 'Actions',
              render: (row) => (
                <div className="table-actions">
                  <Link to={`/actualites/${row.id}/modifier`} className="icon-btn" aria-label="Modifier">
                    <IconEdit />
                  </Link>
                  <button type="button" className="icon-btn icon-btn-danger" aria-label="Supprimer" onClick={() => setToDelete(row)}>
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
        title="Supprimer cette actualité ?"
        message="Cette action est irréversible."
        confirmLabel="Supprimer"
        danger
        onConfirm={handleDelete}
        onCancel={() => setToDelete(null)}
      />
    </div>
  );
}
