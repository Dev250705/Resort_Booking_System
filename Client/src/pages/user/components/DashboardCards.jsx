import React from 'react';
import { CalendarCheck, CalendarClock, CheckCircle, MessageSquareWarning } from 'lucide-react';
import './DashboardCards.css';

const DashboardCards = ({ stats }) => {
  const cards = [
    {
      title: 'Total Bookings',
      value: stats?.total || 0,
      description: 'All-time bookings',
      icon: CalendarCheck,
      color: 'blue'
    },
    {
      title: 'Upcoming Stays',
      value: stats?.upcoming || 0,
      description: 'Next 30 days',
      icon: CalendarClock,
      color: 'purple'
    },
    {
      title: 'Completed Stays',
      value: stats?.completed || 0,
      description: 'Past stays',
      icon: CheckCircle,
      color: 'green'
    },
    {
      title: 'Reviews Pending',
      value: stats?.reviewsPending || 0,
      description: 'Action required',
      icon: MessageSquareWarning,
      color: 'orange'
    }
  ];

  return (
    <div className="dashboard-cards-grid">
      {cards.map((card, index) => {
        const Icon = card.icon;
        return (
          <div key={index} className={`dashboard-stat-card card-${card.color}`}>
            <div className="card-icon-wrapper">
              <Icon size={24} className="card-icon" />
            </div>
            <div className="card-content">
              <h3>{card.value}</h3>
              <p className="card-title">{card.title}</p>
              <span className="card-desc">{card.description}</span>
            </div>
            <div className="card-gradient-border"></div>
          </div>
        );
      })}
    </div>
  );
};

export default DashboardCards;
