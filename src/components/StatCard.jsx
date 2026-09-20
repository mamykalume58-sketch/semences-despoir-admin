export default function StatCard({ icon: Icon, label, value, trend, accent = 'green' }) {
  return (
    <div className={`stat-card stat-card-${accent}`}>
      <div className="stat-card-icon">
        <Icon />
      </div>
      <div className="stat-card-body">
        <span className="stat-card-value">{value}</span>
        <span className="stat-card-label">{label}</span>
        {trend ? (
          <span className={`stat-card-trend ${trend.startsWith('-') ? 'down' : 'up'}`}>{trend}</span>
        ) : null}
      </div>
    </div>
  );
}
