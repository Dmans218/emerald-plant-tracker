import React from 'react';

const PageHeader = ({ icon: Icon, title, subtitle, badge, actions }) => (
  <header className="dashboard-header">
    <div className="header-content">
      <div className="header-text">
        <h1 className="dashboard-title">
          {Icon && <Icon className="page-title-icon" aria-hidden="true" />}
          <span className="dashboard-title-text">{title}</span>
          {badge}
        </h1>
        {subtitle && <p className="dashboard-subtitle">{subtitle}</p>}
      </div>
      {actions ? <div className="header-actions">{actions}</div> : null}
    </div>
  </header>
);

export default PageHeader;
