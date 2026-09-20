import { updateDoc, doc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../firebase.js';
import { useCollection, toDate } from '../../hooks/useCollection.js';
import DataTable from '../../components/DataTable.jsx';
import StatusBadge from '../../components/StatusBadge.jsx';
import { LoadingState, ErrorState } from '../../components/DataState.jsx';

const STATUS_CONFIG = {
  unread: { label: 'Non lu', class: 'badge-green' },
  read: { label: 'Lu', class: 'badge-muted' },
};

export default function MessagesList() {
  const { status, docs } = useCollection('messages', 'createdAt');

  const toggleRead = async (row) => {
    try {
      await updateDoc(doc(db, 'messages', row.id), {
        status: row.status === 'unread' ? 'read' : 'unread',
        updatedAt: serverTimestamp(),
      });
    } catch (err) {
      console.error(err);
      window.alert('Impossible de mettre à jour ce message.');
    }
  };

  if (status === 'loading') return <LoadingState label="Chargement des messages..." />;
  if (status === 'error') return <ErrorState />;

  return (
    <div className="card">
      <DataTable
        emptyLabel="Aucun message pour l'instant."
        columns={[
          { key: 'name', label: 'Nom', render: (row) => row.name || '—' },
          { key: 'subject', label: 'Sujet', render: (row) => row.subject || '—' },
          {
            key: 'message',
            label: 'Message',
            render: (row) => (
              <span style={{ maxWidth: 260, display: 'inline-block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {row.message || ''}
              </span>
            ),
          },
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
              <button type="button" className="btn btn-ghost" onClick={() => toggleRead(row)}>
                {row.status === 'unread' ? 'Marquer comme lu' : 'Marquer comme non lu'}
              </button>
            ),
          },
        ]}
        rows={docs}
      />
    </div>
  );
}
