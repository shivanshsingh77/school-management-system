export default function StatCard({ icon: Icon, label, value, tone = "blue" }) {
  return (
    <div className={`stat-card tone-${tone}`}>
      <div className="stat-icon"><Icon size={22} /></div>
      <div>
        <div className="stat-value">{value === null || value === undefined ? "—" : value}</div>
        <div className="stat-label">{label}</div>
      </div>
    </div>
  );
}
