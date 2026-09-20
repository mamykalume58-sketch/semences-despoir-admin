import { updateDoc, doc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../firebase.js';
import { useCollection, toDate } from '../../hooks/useCollection.js';
import DataTable from '../../components/DataTable.jsx';
import StatusBadge from '../../components/StatusBadge.jsx';
import { LoadingState, ErrorState } from '../../components/DataState.jsx';

const STATUS_CONFIG = {
  pending: { label: 'En attente', class: 'badge-muted' },
  confirme: { label: 'Confirmé', class: 'badge-green' },
  echoue: { label: 'Échoué', class: 'badge-red' },
  rembourse: { label: 'Remboursé', class: 'badge-muted' },
};

function formatFC(amount) {
  return `${Math.round(amount || 0).toLocaleString('fr-FR')} FC`;
}

export default function DonationsList() {
  const { status, docs } = useCollection('donations', 'createdAt');

  const changeStatus = async (id, newStatus) => {
    try {
      await updateDoc(doc(db, 'donations', id), { status: newStatus, updatedAt: serverTimestamp() });
    } catch (err) {
      console.error(err);
      window.alert('Impossible de mettre à jour ce don.');
    }
  };

  if (status === 'loading') return <LoadingState label="Chargement des dons..." />;
  if (status === 'error') return <ErrorState />;

  return (
    <div className="card">
      <DataTable
        emptyLabel="Aucun don reçu pour l'instant."
        columns={[
          { key: 'donor', label: 'Donateur', render: (row) => row.donorName || '—' },
          { key: 'amount', label: 'Montant', render: (row) => formatFC(row.amount) },
          { key: 'project', label: 'Projet', render: (row) => row.projectId || 'Général' },
          { key: 'method', label: 'Moyen', render: (row) => row.paymentMethod || '—' },
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
                value={row.status || 'pending'}
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
