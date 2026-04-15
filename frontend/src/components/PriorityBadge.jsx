import { ArrowUp, ArrowRight, ArrowDown } from 'lucide-react';

const priorityConfig = {
  High: { color: '#ef4444', icon: ArrowUp, label: 'High' },
  Medium: { color: '#f59e0b', icon: ArrowRight, label: 'Medium' },
  Low: { color: '#10b981', icon: ArrowDown, label: 'Low' },
};

const PriorityBadge = ({ priority }) => {
  const config = priorityConfig[priority] || priorityConfig['Medium'];
  const Icon = config.icon;

  return (
    <span className="priority-badge" style={{ color: config.color }}>
      <Icon size={14} />
      {config.label}
    </span>
  );
};

export default PriorityBadge;
