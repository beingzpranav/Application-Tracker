import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

const StatsCard = ({ title, value, icon: Icon, color, subtitle, trend }) => {
  return (
    <div className="stats-card sleek-card" style={{ '--card-accent': color, padding: '24px', background: '#000000', border: '1px solid #333333', borderRadius: '2px', transition: 'border-color 0.2s', position: 'relative', overflow: 'hidden' }}>
      {/* Top green accent bar */}
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '2px', background: color, opacity: 0.8 }} />
      <div className="stats-card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <p className="stats-title" style={{ margin: 0, textTransform: 'uppercase', fontSize: '11px', fontWeight: '800', letterSpacing: '1.5px', color: 'var(--text-secondary)' }}>
          {title}
        </p>
        <div className="stats-card-icon" style={{ color: color, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Icon size={18} strokeWidth={2.5} />
        </div>
      </div>
      <div className="stats-card-body" style={{ display: 'flex', alignItems: 'baseline', gap: '10px' }}>
        <h3 className="stats-value" style={{ margin: 0, fontSize: '42px', fontWeight: '900', lineHeight: 1, color: '#ffffff', letterSpacing: '-1px' }}>
          {value}
        </h3>
        {subtitle && (
          <span className="stats-subtitle" style={{ fontSize: '13px', fontWeight: '500', color: 'var(--text-secondary)' }}>
            {subtitle}
          </span>
        )}
        {trend !== undefined && (
          <div className={`stats-trend ${trend > 0 ? 'up' : trend < 0 ? 'down' : ''}`} style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '13px', fontWeight: '700', color: trend > 0 ? '#76b900' : 'var(--accent-red)', marginLeft: 'auto' }}>
            {trend > 0 ? <TrendingUp size={14} strokeWidth={3} /> : trend < 0 ? <TrendingDown size={14} strokeWidth={3} /> : <Minus size={14} />}
            <span>{Math.abs(trend)}%</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default StatsCard;
