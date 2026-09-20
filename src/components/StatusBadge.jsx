export default function StatusBadge({ value, config }) {
  const item = config[value] || { label: value || '—', class: 'badge-muted' };
  return <span className={`badge ${item.class}`}>{item.label}</span>;
}
