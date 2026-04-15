import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

const StatsCard = ({ title, value, icon: Icon, color, subtitle, trend }) => {
  return (
    <div className="stats-card" style={{ '--card-accent': color }}>
      <div className="stats-card-header">
        <div className="stats-card-icon" style={{ background: `${color}20`, color }}>
          <Icon size={22} />
        </div>
        {trend !== undefined && (
          <div className={`stats-trend ${trend > 0 ? 'up' : trend < 0 ? 'down' : ''}`}>
            {trend > 0 ? <TrendingUp size={14} /> : trend < 0 ? <TrendingDown size={14} /> : <Minus size={14} />}
            <span>{Math.abs(trend)}%</span>
          </div>
        )}
      </div>
      <div className="stats-card-body">
        <h3 className="stats-value">{value}</h3>
        <p className="stats-title">{title}</p>
        {subtitle && <span className="stats-subtitle">{subtitle}</span>}
      </div>
      <div className="stats-card-glow" style={{ background: color }} />
    </div>
  );
};

export default StatsCard;
