import React from 'react';
import {
  LayoutDashboard,
  User,
  Shield,
  CalendarDays,
  Heart,
  CreditCard,
  LogOut
} from 'lucide-react';
import './Sidebar.css';

const Sidebar = ({ activeTab = 'Overview', setActiveTab }) => {
  const menuItems = [
    { name: 'Overview', icon: LayoutDashboard },
    { name: 'My Profile', icon: User },
    { name: 'Security', icon: Shield },
    { name: 'My Bookings', icon: CalendarDays },
    { name: 'Wishlist', icon: Heart },
    { name: 'Payments', icon: CreditCard },
  ];

  const handleLogout = () => {
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('user');
    window.location.href = '/login';
  };

  return (
    <aside className="users-sidebar">
      <div className="users-sidebar-logo">
        <h2 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          User Dashboard
        </h2>
      </div>

      <nav className="users-sidebar-nav">
        <ul>
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <li key={item.name} className={activeTab === item.name ? 'active' : ''}>
                <button
                  className="users-sidebar-link"
                  onClick={() => setActiveTab && setActiveTab(item.name)}
                >
                  <Icon className="users-sidebar-icon" size={20} />
                  <span>{item.name}</span>
                </button>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="users-sidebar-footer">
        <button className="users-sidebar-logout" onClick={handleLogout}>
          <LogOut className="users-sidebar-icon" size={20} />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
