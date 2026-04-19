import React, { useState, useEffect } from 'react';
import BookingCard from '../components/BookingCard';

export default function Bookings({ hideNavbar = false }) {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('All Status');

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const token = sessionStorage.getItem('token');
        if (!token) return;

        const res = await fetch('http://localhost:5000/api/bookings/my-bookings', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();
        
        if (res.ok) {
          setBookings(data.bookings || []);
        }
      } catch (err) {
        console.error("Error fetching bookings", err);
      } finally {
        setLoading(false);
      }
    };
    fetchBookings();
  }, []);

  const filteredBookings = bookings.filter(booking => {
    if (filter === 'All Status') return true;
    if (filter === 'Confirmed') return booking.status === 'Confirmed' || booking.status === 'Pending_Payment';
    if (filter === 'Completed') return booking.status === 'Completed';
    if (filter === 'Cancelled') return booking.status === 'Cancelled';
    return true;
  });

  return (
    <div style={{ backgroundColor: '#fff', padding: hideNavbar ? '0' : '32px', borderRadius: hideNavbar ? '0' : '20px', boxShadow: hideNavbar ? 'none' : '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
        <div>
          <h2 style={{ marginTop: 0, marginBottom: '8px', color: '#0f172a' }}>My Bookings</h2>
          <p style={{ margin: 0, color: '#64748b' }}>A complete history of your resort stays.</p>
        </div>
        
        <div style={{ display: 'flex', gap: '12px' }}>
          <select 
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            style={{ padding: '10px 16px', borderRadius: '10px', border: '1px solid #e2e8f0', background: 'white', color: '#0f172a', fontWeight: '500', cursor: 'pointer' }}
          >
            <option>All Status</option>
            <option>Confirmed</option>
            <option>Completed</option>
            <option>Cancelled</option>
          </select>
        </div>
      </div>

      {loading ? (
        <p style={{ color: '#64748b' }}>Loading your bookings...</p>
      ) : filteredBookings.length > 0 ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '24px' }}>
          {filteredBookings.map(booking => (
            <BookingCard key={booking._id} booking={booking} />
          ))}
        </div>
      ) : (
        <div style={{ padding: '40px', background: '#f8fafc', borderRadius: '16px', textAlign: 'center' }}>
          <p style={{ color: '#64748b', margin: 0 }}>You have no bookings matching this status.</p>
        </div>
      )}
    </div>
  );
}
