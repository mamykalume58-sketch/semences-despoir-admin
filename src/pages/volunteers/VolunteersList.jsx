import { updateDoc, doc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../firebase.js';
import { useCollection, toDate } from '../../hooks/useCollection.js';
import DataTable from '../../components/DataTable.jsx';
import StatusBadge from '../../components/StatusBadge.jsx';
import { LoadingState, ErrorState } from '../../components/DataState.jsx';

const STATUS_CONFIG = {
  new: { label: 'Nouveau', class: 'badge-muted' },
  contacte: { label: 'Contacté', class: 'badge-green' },
  accepte: { label: 'Accepté', class: 'badge-green-dark' },
  refuse: { label: 'Refusé', class: 'badge-red' },
};

export default function VolunteersList() {
  const { status, docs } = useCollection('volunteers', 'createdAt');

  const changeStatus = async (id, newStatus) => {
    try {
      await updateDoc(doc(db, 'volunteers', id), { status: newStatus, updatedAt: serverTimestamp() });
    } catch (err) {
      console.error(err);
      window.alert('Impossible de mettre à jour ce bénévole.');
    }
  };

  if (status === 'loading') return <LoadingState label="Chargement des bénévoles..." />;
  if (status === 'error') return <ErrorState />;

  return (
    <div className="card">
      <DataTable
        emptyLabel="Aucune candidature pour l'instant."
        columns={[
          { key: 'name', label: 'Nom', render: (row) => row.fullName || '—' },
          { key: 'phone', label: 'Téléphone', render: (row) => row.phone || '—' },
          { key: 'city', label: 'Ville', render: (row) => row.city || '—' },
          { key: 'skills', label: 'Compétence', render: (row) => row.skills || '—' },
          { key: 'status', label: 'Statut', render: (row) => <StatusBadge value={row.status} config={STATUS_CONFIG} /> },
          {
            key: 'date',
            label: 'Date',
            render: (row) => {
              const d = toDate(row.createdAt);
              return d ? d.toLocaleDateString('fr-FR') : '—';
            },
          },
          {
            key: 'actions',
            label: 'Actions',
            render: (row) => (
              <select
                value={row.status || 'new'}
                onChange={(e) => changeStatus(row.id, e.target.value)}
                className="search-input"
                style={{ flex: 'none' }}
              >
                {Object.entries(STATUS_CONFIG).map(([value, cfg]) => (
                  <option key={value} value={value}>{cfg.label}</option>
                ))}
              </select>
            ),
          },
        ]}
        rows={docs}
      />
    </div>
  );
}
