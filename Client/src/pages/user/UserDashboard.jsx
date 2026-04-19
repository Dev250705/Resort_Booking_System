import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import MyBookings from './myBookings';
import './UserDashboard.css';
import { isStayCompleted } from '../../utils/stayPolicy';

export default function UserDashboard() {
  const [activeTab, setActiveTab] = useState('overview');
  const navigate = useNavigate();

  const [stats, setStats] = useState({ total: 0, upcoming: 0, reviewsPending: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      const token = sessionStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }
      try {
        const response = await fetch(`http://${window.location.hostname}:5000/api/bookings/my-bookings`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await response.json();
        
        if (response.ok && data.bookings) {
          const bookings = data.bookings;
          const total = bookings.length;
          
          const upcoming = bookings.filter(b => 
            (b.status === "Confirmed" || b.status === "Pending_Payment") && !isStayCompleted(b)
          ).length;

          const reviewsPending = bookings.filter(b => 
            b.status === "Confirmed" && isStayCompleted(b) && !b.hasReview
          ).length;

          setStats({ total, upcoming, reviewsPending });
        }
      } catch (err) {
        console.error("Failed to fetch dashboard stats", err);
      } finally {
        setLoading(false);
      }
    };

    if (activeTab === 'overview') {
      fetchStats();
    }
  }, [activeTab, navigate]);

  return (
    <div className="dashboard-page-container">
        <aside className="dashboard-sidebar">
          <div className="sidebar-header">
            <h3>USER PANEL</h3>
            <p>Welcome back!</p>
          </div>
          <nav className="sidebar-nav">
            <button 
              className={activeTab === 'overview' ? 'active' : ''} 
              onClick={() => setActiveTab('overview')}
            >
              <span className="icon">📊</span> Overview
            </button>
            <button 
              className={activeTab === 'profile' ? 'active' : ''} 
              onClick={() => setActiveTab('profile')}
            >
              <span className="icon">👤</span> My Profile
            </button>
            <button 
              className={activeTab === 'security' ? 'active' : ''} 
              onClick={() => setActiveTab('security')}
            >
              <span className="icon">🔒</span> Security
            </button>
            <button 
              className={activeTab === 'bookings' ? 'active' : ''} 
              onClick={() => setActiveTab('bookings')}
            >
              <span className="icon">📅</span> My Bookings
            </button>
          </nav>
          
          <div className="sidebar-footer" style={{ marginTop: 'auto', padding: '20px' }}>
            <button 
              className="lux-btn-outline" 
              onClick={() => navigate('/')} 
              style={{ width: '100%', padding: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
            >
              <span>←</span> Back to Website
            </button>
          </div>
        </aside>

        <main className="dashboard-main-content">
          {activeTab === 'overview' && (
            <div className="dashboard-section lux-overview-section">
              <h2>Dashboard Overview</h2>
              {loading ? (
                <p>Loading stats...</p>
              ) : (
                <div className="overview-cards">
                  <div className="overview-card">
                    <h4>Total Bookings</h4>
                    <p>{stats.total}</p>
                  </div>
                  <div className="overview-card">
                    <h4>Upcoming Stays</h4>
                    <p>{stats.upcoming}</p>
                  </div>
                  <div className="overview-card">
                    <h4>Reviews Left</h4>
                    <p>{stats.reviewsPending}</p>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'profile' && (
            <div className="dashboard-section lux-profile-section">
              <h2>My Profile</h2>
              <form className="lux-dashboard-form" onSubmit={(e) => e.preventDefault()}>
                <div className="form-group">
                  <label>Full Name</label>
                  <input type="text" placeholder="John Doe" />
                </div>
                <div className="form-group">
                  <label>Email Address</label>
                  <input type="email" placeholder="john@example.com" disabled />
                  <small>Email cannot be changed.</small>
                </div>
                <div className="form-group">
                  <label>Phone Number</label>
                  <input type="tel" placeholder="+91 9876543210" />
                </div>
                <button type="submit" className="lux-btn-primary">Save Changes</button>
              </form>
            </div>
          )}

          {activeTab === 'security' && (
            <div className="dashboard-section lux-security-section">
              <h2>Security Settings</h2>
              <form className="lux-dashboard-form" onSubmit={(e) => e.preventDefault()}>
                <div className="form-group">
                  <label>Current Password</label>
                  <input type="password" placeholder="Enter current password" />
                </div>
                <div className="form-group">
                  <label>New Password</label>
                  <input type="password" placeholder="Enter new password" />
                </div>
                <div className="form-group">
                  <label>Confirm New Password</label>
                  <input type="password" placeholder="Confirm new password" />
                </div>
                <button type="submit" className="lux-btn-primary">Update Password</button>
              </form>
            </div>
          )}

          {activeTab === 'bookings' && (
            <div className="dashboard-section-full">
              <MyBookings hideNavbar={true} />
            </div>
          )}
        </main>
      </div>
  );
}
