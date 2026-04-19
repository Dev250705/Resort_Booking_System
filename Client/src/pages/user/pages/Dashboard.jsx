import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import DashboardCards from '../components/DashboardCards';
import BookingCard from '../components/BookingCard';
import Profile from './Profile';
import Security from './Security';
import Wishlist from './Wishlist';
import Payments from './Payments';
import MyBookings from './Bookings';
import { isStayCompleted } from '../../../utils/stayPolicy';
import { Plus, Search, Bell } from 'lucide-react';
import './Dashboard.css';

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState('Overview');
  const navigate = useNavigate();

  const [stats, setStats] = useState({ total: 0, upcoming: 0, completed: 0, reviewsPending: 0 });
  const [loading, setLoading] = useState(true);
  const [recentBookings, setRecentBookings] = useState([]);
  const [upcomingBooking, setUpcomingBooking] = useState(null);

  const [userProfile, setUserProfile] = useState({ name: 'User' });

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const token = sessionStorage.getItem('token');
        if (!token) return;

        const response = await fetch('http://localhost:5000/api/users/profile', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await response.json();
        if (response.ok && data.user) {
          setUserProfile(data.user);
          sessionStorage.setItem('user', JSON.stringify(data.user));
        }
      } catch (err) {
        console.error("Error fetching user profile", err);
      }
    };

    fetchUserProfile();

    const fetchStats = async () => {
      const token = sessionStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }
      try {
        const response = await fetch('http://localhost:5000/api/bookings/my-bookings', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await response.json();

        if (response.ok && data.bookings) {
          const bookings = data.bookings;
          const total = bookings.length;

          const upcomingBookings = bookings.filter(b =>
            (b.status === "Confirmed" || b.status === "Pending_Payment") && !isStayCompleted(b)
          );
          const upcoming = upcomingBookings.length;

          const completed = bookings.filter(b => isStayCompleted(b)).length;

          const reviewsPending = bookings.filter(b =>
            b.status === "Confirmed" && isStayCompleted(b) && !b.hasReview
          ).length;

          setStats({ total, upcoming, completed, reviewsPending });

          // Map the backend data to the UI structure for cards
          const mappedBookings = bookings.map(b => ({
            id: b._id,
            resortName: b.resort?.name || 'Resort Stay',
            location: b.resort?.address || 'Unknown Location',
            dates: `${new Date(b.checkInDate).toLocaleDateString()} - ${new Date(b.checkOutDate).toLocaleDateString()}`,
            status: b.status,
            image: b.resort?.images?.[0]?.url || "https://images.unsplash.com/photo-1499793983690-e29da59ef1c2?auto=format&fit=crop&q=80&w=800"
          }));

          setRecentBookings(mappedBookings.slice(0, 3));
          if (upcomingBookings.length > 0) {
            const nextBooking = upcomingBookings[0];
            setUpcomingBooking({
              id: nextBooking._id,
              resortName: nextBooking.resort?.name || 'Resort Stay',
              location: nextBooking.resort?.address || 'Unknown Location',
              dates: `${new Date(nextBooking.checkInDate).toLocaleDateString()} - ${new Date(nextBooking.checkOutDate).toLocaleDateString()}`,
              status: nextBooking.status,
              image: nextBooking.resort?.images?.[0]?.url || "https://images.unsplash.com/photo-1540541338287-41700207dee6?auto=format&fit=crop&q=80&w=800"
            });
          }
        }
      } catch (err) {
        console.error("Failed to fetch dashboard stats", err);
      } finally {
        setLoading(false);
      }
    };

    if (activeTab === 'Overview') {
      fetchStats();
    }
  }, [activeTab, navigate]);

  const renderContent = () => {
    switch (activeTab) {
      case 'My Profile':
        return <Profile />;
      case 'Security':
        return <Security />;
      case 'My Bookings':
        // Use the existing fully working MyBookings component and hide its navbar if possible
        return <div style={{ background: '#fff', borderRadius: '20px', padding: '20px', overflow: 'hidden' }}><MyBookings hideNavbar={true} /></div>;
      case 'Wishlist':
        return <Wishlist />;
      case 'Payments':
        return <Payments />;
      case 'Overview':
      default:
        return (
          <>
            <DashboardCards stats={stats} />

            <div className="dashboard-content-grid single-col">
              <div className="dashboard-main-col">
                <div className="section-header">
                  <h2>Recent Bookings</h2>
                  <button className="btn-text" onClick={() => setActiveTab('My Bookings')}>View All</button>
                </div>
                <div className="recent-bookings-list-horizontal">
                  {loading ? (
                    <p>Loading recent bookings...</p>
                  ) : recentBookings.length > 0 ? (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '24px' }}>
                      {recentBookings.map(booking => (
                        <BookingCard key={booking.id} booking={booking} />
                      ))}
                    </div>
                  ) : (
                    <div style={{ padding: '40px', background: '#fff', borderRadius: '20px', textAlign: 'center', color: '#64748b' }}>
                      <p>No recent bookings.</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </>
        );
    }
  };

  return (
    <div className="dashboard-layout">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />

      <main className="dashboard-main">
        <header className="dashboard-header">
          <div className="header-greeting">
            <h1>Welcome {userProfile.name},  </h1>
            <p>Manage your luxurious stays and explore new destinations.</p>
          </div>

          <div className="header-actions">
            {/* <button className="btn-icon">
              <Search size={20} />
            </button>
            <button className="btn-icon">
              <Bell size={20} />
              <span className="notification-dot"></span>
            </button> */}
            <button className="btn-primary" onClick={() => navigate('/search')}>
              <Plus size={20} />
              Book New Stay
            </button>
            {/* <div className="user-avatar" style={{ background: '#e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', color: '#475569' }}>
              {userProfile.name.charAt(0)}
            </div> */}
          </div>
        </header>

        <div className="dashboard-content">
          {renderContent()}
        </div>
      </main>
    </div>
  );
}
