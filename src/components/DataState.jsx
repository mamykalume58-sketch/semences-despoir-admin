export function LoadingState({ label = 'Chargement...' }) {
  return (
    <div className="data-state">
      <div className="spinner" />
      <p>{label}</p>
    </div>
  );
}

export function EmptyState({ label = 'Aucune donnée disponible.' }) {
  return (
    <div className="data-state">
      <p>{label}</p>
    </div>
  );
}

export function ErrorState({ label = 'Impossible de charger les données. Veuillez réessayer.' }) {
  return (
    <div className="data-state data-state-error">
      <p>{label}</p>
    </div>
  );
}
