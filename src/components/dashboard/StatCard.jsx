import React from "react";

export const StatCard = ({ title, value, change, isPositive, icon: Icon, color = "var(--primary-500)" }) => {
  return (
    <div className="stat-card glass-card">
      <div className="flex-between stat-header-row">
        <div className="stat-meta-block">
          <span className="stat-title">{title}</span>
          <h3 className="stat-value">{value}</h3>
        </div>
        <div className="stat-icon-wrapper flex-center" style={{ backgroundColor: `${color}15`, color: color }}>
          {Icon && <Icon size={24} />}
        </div>
      </div>
      
      {change && (
        <div className="stat-change-row">
          <span className={`stat-trend-percent ${isPositive ? "text-success" : "text-danger"}`}>
            {isPositive ? "▲" : "▼"} {change}
          </span>
          <span className="stat-change-period">vs last month</span>
        </div>
      )}

      <style>{`
        .stat-card {
          background-color: var(--bg-card);
          padding: 24px;
          border-radius: var(--radius-lg);
          display: flex;
          flex-direction: column;
          gap: 16px;
        }
        .stat-title {
          font-size: 0.85rem;
          color: var(--text-muted);
          font-weight: 700;
          text-transform: uppercase;
        }
        .stat-value {
          font-size: 1.75rem;
          font-weight: 800;
          color: var(--text-main);
          margin-top: 4px;
        }
        .stat-icon-wrapper {
          width: 52px;
          height: 52px;
          border-radius: var(--radius-md);
        }
        .stat-change-row {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 0.8rem;
          font-weight: 600;
          border-top: 1px solid var(--border-color);
          padding-top: 12px;
        }
        .stat-change-period {
          color: var(--text-muted);
        }
        .text-success {
          color: var(--success);
        }
        .text-danger {
          color: var(--danger);
        }
      `}</style>
    </div>
  );
};
export default StatCard;
