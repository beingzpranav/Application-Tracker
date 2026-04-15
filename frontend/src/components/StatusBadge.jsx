const statusConfig = {
  Applied: { color: '#6366f1', bg: '#6366f120', label: 'Applied' },
  Interview: { color: '#f59e0b', bg: '#f59e0b20', label: 'Interview' },
  Offer: { color: '#10b981', bg: '#10b98120', label: 'Offer' },
  Rejected: { color: '#ef4444', bg: '#ef444420', label: 'Rejected' },
  'No Response': { color: '#6b7280', bg: '#6b728020', label: 'No Response' },
};

const StatusBadge = ({ status }) => {
  const config = statusConfig[status] || statusConfig['Applied'];

  return (
    <span
      className="status-badge"
      style={{
        color: config.color,
        backgroundColor: config.bg,
        borderColor: `${config.color}40`,
      }}
    >
      <span className="status-dot" style={{ backgroundColor: config.color }} />
      {config.label}
    </span>
  );
};

export default StatusBadge;
