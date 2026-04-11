import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import './myBookings.css';

export default function MyBookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('upcoming');
  const [cancellingId, setCancellingId] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }

    try {
      const response = await fetch('http://localhost:5000/api/bookings/my-bookings', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      
      if (!response.ok) throw new Error(data.message || 'Failed to fetch bookings');
      setBookings(data.bookings);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelBooking = async (bookingId) => {
    if (!window.confirm("Are you sure you want to cancel this booking? This action cannot be undone.")) return;
    
    setCancellingId(bookingId);
    const token = localStorage.getItem('token');
    try {
      const response = await fetch(`http://localhost:5000/api/bookings/cancel/${bookingId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Failed to cancel booking');
      
      alert("Booking has been successfully cancelled.");
      fetchBookings(); // Refresh list
    } catch (err) {
      alert(err.message);
    } finally {
      setCancellingId(null);
    }
  };

  const formatDate = (dateString) => {
    const options = { day: '2-digit', month: 'long', year: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-US', options);
  };

  const now = new Date();
  const upcomingBookings = bookings.filter(b => b.status === "Confirmed" || b.status === "Pending_Payment");
  const pastBookings = bookings.filter(b => b.status === "Cancelled" || b.status === "Expired" || new Date(b.checkOutDate) < now && b.status !== "Confirmed"); // simplified logic for demo

  const displayedBookings = activeTab === 'upcoming' ? upcomingBookings : pastBookings;

  return (
    <div className="bookings-page-wrapper">
      <Navbar />
      <div className="my-bookings-ultra-container">
        <div className="bookings-hero">
          <div className="hero-content">
            <h1>My Journeys</h1>
            <p>Manage your upcoming escapes and past memories.</p>
          </div>
        </div>

        <div className="bookings-tabs">
          <button 
            className={`tab-btn ${activeTab === 'upcoming' ? 'active' : ''}`}
            onClick={() => setActiveTab('upcoming')}
          >
            Upcoming Escapes
            <span className="badge">{upcomingBookings.length}</span>
          </button>
          <button 
            className={`tab-btn ${activeTab === 'past' ? 'active' : ''}`}
            onClick={() => setActiveTab('past')}
          >
            Past & Cancelled
            <span className="badge">{pastBookings.length}</span>
          </button>
        </div>

        {loading ? (
          <div className="lux-loader-container">
            <div className="lux-spinner"></div>
          </div>
        ) : error ? (
          <div className="lux-error">
            <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
            {error}
          </div>
        ) : displayedBookings.length === 0 ? (
          <div className="lux-empty-state">
            <div className="empty-icon-ring">
              <svg viewBox="0 0 24 24" width="32" height="32" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path><polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline><line x1="12" y1="22.08" x2="12" y2="12"></line></svg>
            </div>
            <h2>No {activeTab === 'upcoming' ? 'Upcoming' : 'Past'} Journeys</h2>
            <p>Your itinerary is currently empty.</p>
            {activeTab === 'upcoming' && <Link to="/rooms" className="lux-btn-primary">Discover Resorts</Link>}
          </div>
        ) : (
          <div className="lux-booking-grid">
            {displayedBookings.map((booking) => (
              <div key={booking._id} className="lux-booking-card">
                <div className="lux-booking-image">
                  <img 
                    src={booking.resort?.images?.[0] || 'https://via.placeholder.com/600x400?text=Resort'} 
                    alt={booking.resort?.name || 'Resort'} 
                  />
                  <div className={`lux-status-badge status-${booking.status}`}>
                    {booking.status.replace('_', ' ')}
                  </div>
                </div>
                
                <div className="lux-booking-content">
                  <div className="lux-resort-title">
                    <h2>{booking.resort?.name || 'Grand Resort'}</h2>
                    <p>
                      <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
                      {booking.resort?.location?.city || 'Location unavailable'}
                    </p>
                  </div>

                  <div className="lux-stay-dates">
                    <div className="date-block">
                      <span>CHECK-IN</span>
                      <strong>{formatDate(booking.checkInDate)}</strong>
                    </div>
                    <div className="date-divider"></div>
                    <div className="date-block text-right">
                      <span>CHECK-OUT</span>
                      <strong>{formatDate(booking.checkOutDate)}</strong>
                    </div>
                  </div>

                  <div className="lux-booking-footer">
                    <div className="lux-price-info">
                      <span className="lux-price-label">Total Amount</span>
                      <strong className="lux-price-value">₹{booking.totalAmount?.toLocaleString()}</strong>
                      <span className="lux-room-type">{booking.roomTypeTitle}</span>
                    </div>

                    <div className="lux-actions">
                      {(booking.status === "Confirmed" || booking.status === "Pending_Payment") && (
                        <button 
                          className="lux-btn-cancel"
                          onClick={() => handleCancelBooking(booking._id)}
                          disabled={cancellingId === booking._id}
                        >
                          {cancellingId === booking._id ? 'Cancelling...' : 'Cancel Booking'}
                        </button>
                      )}
                      <Link to={`/resort/${booking.resort?._id}`} className="lux-btn-outline">
                        View Resort
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
